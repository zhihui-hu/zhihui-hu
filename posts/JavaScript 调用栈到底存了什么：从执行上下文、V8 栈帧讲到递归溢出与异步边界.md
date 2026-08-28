---
title: JavaScript 调用栈到底存了什么：从执行上下文、V8 栈帧讲到递归溢出与异步边界
slug: javascript-execution-context-call-stack-v8-frame
publishedAt: 2026-08-28T16:12
summary: 从一段真实错误堆栈出发，区分 ECMAScript 执行上下文、JavaScript 调用栈、V8 栈帧和 V8 Context，逐步解释函数调用如何入栈出栈、异常如何展开栈、递归为什么溢出，以及 await、Promise 和定时器为什么会切断同步调用栈。
keywords:
  - JavaScript 执行上下文
  - JavaScript 调用栈
  - Execution Context
  - Call Stack
  - V8 Stack Frame
  - V8 Context
  - Maximum call stack size exceeded
  - JavaScript 递归
  - Async Stack Trace
  - Chrome DevTools Call Stack
tags:
  - JavaScript
  - V8
  - 浏览器
  - 源码
  - 前端
---

## 前言

以前学习 JavaScript 执行上下文时，我习惯把它记成一个对象：

```js
const executionContext = {
  VO: {},
  scopeChain: [],
  thisValue: window,
};
```

函数调用时创建执行上下文，压入执行栈；函数结束后再出栈。这个模型适合入门，但它把规范概念、引擎实现和浏览器环境揉到了一起。

继续往下看就会遇到很多问题：

1. ECMAScript 规范里的执行上下文，真的是一个可以压入机器栈的对象吗？
2. V8 `Context` 和 Execution Context 是同一个东西吗？
3. 一个函数被 TurboFan 内联以后，调用栈里还有没有对应栈帧？
4. `await` 后面的代码继续执行时，原来的同步调用栈还在吗？
5. DevTools 为什么有时能显示异步调用来源？
6. 无限递归为什么不是一直执行，而是抛出 `Maximum call stack size exceeded`？

本文从一段错误堆栈开始，逐步区分执行上下文、调用栈、V8 栈帧和 V8 `Context`，最后再回到递归、异步代码和日常调试。

文章查看的 Chromium/V8 版本固定为：

```text
Chromium: 148.0.7778.178
commit: d096af1c9e98c45c3596e59620622b1a049bfecb
```

## 先从一段错误堆栈开始

假设订单提交时缺少 `id`：

```js
function validateOrder(order) {
  if (!order.id) {
    throw new Error('order id is required');
  }
}

function submitOrder(order) {
  validateOrder(order);
  console.log('submit order');
}

function handleCheckout() {
  submitOrder({});
}

handleCheckout();
```

在 Chrome 或 Node.js 中，错误堆栈大致如下：

```text
Error: order id is required
    at validateOrder (...:3:11)
    at submitOrder (...:8:3)
    at handleCheckout (...:13:3)
    at ...:16:1
```

这几行回答了一个很重要的问题：

```text
程序是怎么走到 validateOrder 的？
```

从下往上看：

1. 顶层代码调用 `handleCheckout()`。
2. `handleCheckout()` 调用 `submitOrder()`。
3. `submitOrder()` 调用 `validateOrder()`。
4. `validateOrder()` 创建并抛出错误。

从上往下看，则是错误发生时离当前位置最近的函数，然后逐层回到调用者。

这条调用关系就是理解调用栈的入口。

## 先分清四个经常混淆的概念

执行上下文、调用栈、栈帧和 V8 `Context` 经常被当成同一件事，实际上它们属于不同层次。

| 概念              | 所在层次               | 主要解决的问题                                         |
| ----------------- | ---------------------- | ------------------------------------------------------ |
| Execution Context | ECMAScript 规范        | 当前正在求值什么代码，需要保存哪些规范状态             |
| Call Stack        | 运行时与开发者心智模型 | 函数调用的先后关系和返回位置                           |
| V8 Stack Frame    | V8 引擎实现            | 参数、返回地址、局部值、寄存器状态等如何落到运行时栈上 |
| V8 Context        | V8 堆对象              | 需要跨作用域或跨函数继续访问的变量如何保存             |

最容易混淆的是最后一个：

```text
ECMAScript Execution Context ≠ V8 Context
```

规范执行上下文是一套描述语言行为的抽象机制；V8 `Context` 是引擎用来保存作用域和闭包变量的堆对象。

同样，规范明确说明：执行上下文是纯规范机制，不要求对应某个具体实现对象。JavaScript 代码也无法直接读取一个“当前执行上下文对象”。

所以我们可以用对象和栈帮助理解，但不要把示意图直接当成 V8 内存布局。

## 现代规范里的执行上下文是什么

ECMAScript 把执行上下文定义为：实现用来跟踪代码运行时求值状态的规范装置。

每个 Agent 在同一时刻最多只有一个真正执行代码的上下文，称为 running execution context。

规范中的所有执行上下文至少包含：

| 状态组件              | 作用                                            |
| --------------------- | ----------------------------------------------- |
| code evaluation state | 保存代码执行、暂停和恢复所需的状态              |
| Function              | 当前执行函数；执行 Script 或 Module 时为 `null` |
| Realm                 | 当前代码访问哪一套内建对象和全局环境            |
| ScriptOrModule        | 当前代码来自哪个 Script Record 或 Module Record |

执行 ECMAScript 代码时，还会有：

| 状态组件            | 作用                                        |
| ------------------- | ------------------------------------------- |
| LexicalEnvironment  | 解析当前标识符引用使用的 Environment Record |
| VariableEnvironment | 保存 `var` 等 VariableStatement 创建的绑定  |
| PrivateEnvironment  | 保存最近外层 class 的私有名称环境           |

这里可以看到，现代规范并不是简单写成：

```text
VO + ScopeChain + this
```

`this` 也不是所有执行上下文上一项固定的普通字段。规范会通过当前环境记录和 `ResolveThisBinding()` 等抽象操作解析它。

以前常见的 VO、AO 模型，可以帮助解释早期 `var`、函数声明和 `arguments`，但今天继续用它解释 `let`、`const`、class、Module、私有字段和闭包，就会越来越勉强。

## “创建阶段”和“执行阶段”还能不能用

旧文章常把执行上下文拆成两个阶段：

```text
创建阶段 -> 准备变量、函数、作用域和 this
执行阶段 -> 按顺序执行语句和赋值
```

这个模型仍然可以作为教学简化，但不要理解成 V8 必须严格执行两个固定步骤。

更准确的说法是，不同代码会执行不同的声明实例化算法：

- Script 有 `GlobalDeclarationInstantiation`；
- 函数有 `FunctionDeclarationInstantiation`；
- 块级代码有 `BlockDeclarationInstantiation`；
- Module 有自己的链接、实例化和求值流程。

因此：

```text
var      -> 绑定提前创建并初始化为 undefined
function -> 绑定提前创建并关联函数对象
let      -> 绑定提前创建，但声明执行前尚未初始化
const    -> 绑定提前创建，但声明执行前尚未初始化
```

访问尚未初始化的 `let` 或 `const` 不会得到 `undefined`，而是触发 TDZ：

```js
console.log(config);

let config;
// ReferenceError: Cannot access 'config' before initialization
```

只有真正执行到 `let config;` 以后，绑定才完成初始化，此时值是 `undefined`。

变量声明和初始化的详细差异，我已经在[变量提升不是玄学：从业务里的 undefined 讲到 V8 执行上下文](https://huzhihui.com/blog/javascript-hoisting-declaration-instantiation-v8-context)中单独说明，这里不再重复展开。

## 调用栈是怎么工作的

对普通同步函数调用来说，可以把调用栈理解成一个后进先出的结构：

```text
Last In, First Out
最后进入的函数，最先返回
```

继续使用前面的代码：

```js
function validateOrder(order) {
  return Boolean(order.id);
}

function submitOrder(order) {
  return validateOrder(order);
}

function handleCheckout() {
  return submitOrder({ id: 1 });
}

handleCheckout();
```

调用过程可以分成四个时刻。

### 1. 执行顶层代码

```text
栈顶
┌────────────────────┐
│ Script 顶层代码     │
└────────────────────┘
栈底
```

### 2. 调用 handleCheckout

```text
栈顶
┌────────────────────┐
│ handleCheckout      │
├────────────────────┤
│ Script 顶层代码     │
└────────────────────┘
栈底
```

顶层代码需要停在 `handleCheckout()` 这行，等待函数返回后再继续。

### 3. 继续调用 submitOrder 和 validateOrder

```text
栈顶
┌────────────────────┐
│ validateOrder       │
├────────────────────┤
│ submitOrder         │
├────────────────────┤
│ handleCheckout      │
├────────────────────┤
│ Script 顶层代码     │
└────────────────────┘
栈底
```

当前真正执行的是栈顶的 `validateOrder()`。

### 4. 返回时依次出栈

```text
validateOrder 返回
  -> submitOrder 恢复执行并返回
    -> handleCheckout 恢复执行并返回
      -> 顶层代码继续
```

每一层调用都要知道：

- 返回后从哪里继续；
- 当前函数拿到了哪些参数；
- 当前有哪些局部值；
- 当前执行到什么位置；
- 异常应该交给哪一层处理。

这些运行时信息最终需要由引擎的栈帧、寄存器和其他内部结构共同承载。

## 执行上下文栈不总是普通机器栈

规范也使用 execution context stack 来跟踪执行上下文，running execution context 通常位于栈顶。

但规范专门提醒：执行上下文之间通常按后进先出切换，某些语言特性可能需要非 LIFO 转换。

比如 Generator：

```js
function* createSteps() {
  console.log('step 1');
  yield;
  console.log('step 2');
}

const steps = createSteps();

steps.next();
// step 1

steps.next();
// step 2
```

执行到 `yield` 时，Generator 的执行状态会被挂起。以后再次调用 `next()`，它可以从原位置恢复。

这不意味着一个普通机器栈帧必须从第一次 `next()` 开始一直留在 C++ 栈上。引擎会把恢复所需的状态保存在适合挂起和恢复的内部结构中。

所以：

```text
普通同步调用 -> 用 LIFO 调用栈理解很合适
可挂起计算   -> 还要考虑状态保存与恢复
```

不要用一张永远只增减栈帧的图，强行解释所有 JavaScript 特性。

## 从 V8 看：一个调用栈里不只有 JavaScript 函数

如果真正去看 V8 的 `v8/src/execution/frames.h`，会发现栈帧类型远不止一种。

`STACK_FRAME_TYPE_LIST` 中包含：

```text
ENTRY
EXIT
INTERPRETED
BASELINE
MAGLEV
TURBOFAN_JS
BUILTIN
INTERNAL
CONSTRUCT
WASM
JS_TO_WASM
WASM_TO_JS
...
```

这说明真实调用栈可能跨过多层：

```text
宿主/C++ 进入 V8
  -> JavaScript 函数
    -> V8 Builtin
      -> JavaScript 函数
        -> WebAssembly
          -> 再返回 JavaScript
```

V8 用抽象基类 `StackFrame` 表示栈帧，再继续区分 `JavaScriptFrame`、`InterpretedFrame`、`BaselineFrame`、`MaglevFrame` 和 `TurbofanJSFrame` 等类型。

同一段 JavaScript 在运行过程中，也可能经历不同执行层级：

1. 先由 Ignition 解释执行。
2. 热代码进入 Sparkplug、Maglev 或 TurboFan 的编译结果。
3. 优化假设失效时发生反优化，回到更通用的执行状态。

因此，JavaScript 源码中的“一个函数调用”，不能简单等同于永远固定的一种物理栈帧布局。

## 函数内联以后，错误堆栈为什么还能看到函数

优化编译器可能把小函数内联进调用者：

```js
function addTax(price) {
  return price * 1.06;
}

function getTotal(price) {
  return addTax(price);
}
```

优化以后，机器代码不一定真的保留一次普通的 `getTotal -> addTax` 调用。

但调试器、异常堆栈和反优化仍然需要尽可能还原 JavaScript 层的调用关系。

V8 的 `FrameSummaries` 就体现了这一点。源码注释说明：

```text
在未优化代码中，一个标准帧通常只有一个 summary；
在优化代码中，因为内联，一个物理帧可能对应多个 summary。
```

也就是说：

```text
物理栈帧数量 ≠ JavaScript 逻辑调用层数
```

我们在 DevTools 或 `Error.stack` 里看到的是经过引擎整理后的 JavaScript 调用视图，不是对机器栈内存的逐字节打印。

这也是规范执行上下文不能和 V8 栈帧画等号的另一个原因。

## 栈帧里大致保存什么

不同架构、不同编译层级的布局并不一样，但从概念上看，一个函数调用通常需要保存：

```text
返回地址
上一层帧指针或调用者信息
当前函数或代码信息
参数与 receiver
局部变量或临时值
当前执行位置
异常处理相关状态
上下文引用
```

V8 `CommonFrameWithJSLinkage` 提供了读取函数、receiver、参数数量和异常处理信息的能力；`CommonFrame` 还能遍历表达式栈、局部值以及上下文等引用。

这些信息不只服务于函数返回：

- 垃圾回收需要知道栈上哪些值可能引用堆对象；
- 调试器需要展示参数、局部变量和 Scope；
- 异常系统需要找到下一层处理器；
- 性能分析器需要还原调用关系；
- 反优化需要从优化代码恢复可继续执行的状态。

因此，栈帧不是一个只保存函数名的数组元素。

## V8 Context 为什么不一定跟着函数出栈

来看一个闭包：

```js
function createCounter() {
  let count = 0;

  return function add() {
    count++;
    return count;
  };
}

const counter = createCounter();

counter();
counter();
```

`createCounter()` 已经返回，对应的普通调用帧也已经结束，但 `count` 仍然可以被 `add()` 访问。

原因不是整个 `createCounter` 栈帧被永久保存下来，而是需要逃逸的变量会进入堆上的 V8 `Context`。闭包函数持有这个 `Context`，所以变量继续存在。

```text
普通局部值 -> 可以跟随调用帧结束
被闭包捕获 -> 进入可被闭包继续引用的 Context
```

作用域链和闭包变量的具体分配，可以继续看[从 V8 源码和 React 深入浅出理解 JavaScript 作用域链与闭包](https://huzhihui.com/blog/javascript-scope-chain-closure-lexical-environment)。

## return 时发生的是正常退栈

正常返回比较直接：

```js
function getPrice() {
  return 100;
}

function createOrder() {
  const price = getPrice();
  return { price };
}

createOrder();
```

`getPrice()` 返回时，它的调用帧结束，控制权回到 `createOrder()` 调用 `getPrice()` 之后的位置。

返回值可能通过寄存器、栈槽或引擎约定传回调用者，具体属于实现细节。JavaScript 层只观察到：

```text
被调用函数完成 -> 调用表达式得到结果 -> 调用者继续执行
```

## throw 时发生的是异常展开栈

异常的退栈路径不同。

```js
function readOrder() {
  throw new Error('order not found');
}

function loadCheckout() {
  return readOrder();
}

function bootstrap() {
  try {
    loadCheckout();
  } catch (error) {
    console.error(error.message);
  }
}

bootstrap();
```

当 `readOrder()` 抛出异常时，引擎会沿调用关系寻找可以处理这个异常的 `catch`：

```text
readOrder       -> 当前没有 catch，退出
loadCheckout    -> 当前没有 catch，退出
bootstrap       -> 找到 catch，恢复执行
```

这个过程通常叫 stack unwinding，也就是展开栈。

如果中间有 `finally`，离开对应作用域前还要执行 `finally`：

```js
function saveOrder() {
  try {
    throw new Error('save failed');
  } finally {
    console.log('release lock');
  }
}
```

无论最终由外层捕获，还是继续向外抛，`release lock` 都会先执行。

如果一直找不到处理器，异常会离开当前 JavaScript 调用链，再交给宿主环境处理，比如浏览器的错误事件或 Node.js 的未捕获异常流程。

## Error.stack 是调用栈的快照，不是活的栈

在 V8 中，错误对象通常会在创建时捕获堆栈：

```js
const error = new Error('created here');

function throwLater() {
  throw error;
}

throwLater();
```

`error.stack` 记录的重点是错误对象创建时的调用位置，而不是以后每次 `throw` 时重新生成一份完全不同的调用历史。

V8 默认保留顶部若干栈帧，可以通过下面的非标准能力调整：

```js
Error.stackTraceLimit = 30;
```

Node.js 和其他 V8 环境还常用：

```js
const target = {};

Error.captureStackTrace(target);

console.log(target.stack);
```

需要注意：

- `error.stack` 已被广泛实现，但格式并不是统一的 ECMAScript 标准格式；
- `Error.captureStackTrace()`、`Error.prepareStackTrace` 等属于 V8 API；
- 不应该用固定字符串切割规则假设所有浏览器的堆栈格式相同。

## 递归为什么会触发调用栈溢出

最简单的无限递归：

```js
function loop() {
  return loop();
}

loop();
```

每次调用 `loop()`，当前调用都还没有返回，又创建下一层调用：

```text
loop
  -> loop
    -> loop
      -> loop
        -> ...
```

调用栈空间是有限的。达到运行时允许的边界后，V8 会抛出类似错误：

```text
RangeError: Maximum call stack size exceeded
```

这个最大深度不是 ECMAScript 规定的固定数字。它会受到以下因素影响：

- JavaScript 引擎；
- 操作系统和架构；
- 当前线程栈大小；
- 函数参数和局部状态；
- 是否启用调试或插桩；
- 当前代码处于解释还是优化状态。

所以不要写这种探测结果，再把它当成跨浏览器业务限制：

```js
// 不要假设另一台机器也能递归同样层数
console.log(maximumDepth);
```

## V8 怎么检查栈溢出

V8 不会等到内存被无限写坏以后才处理。

在调用和运行时路径中，可以看到 `StackLimitCheck`、`JsHasOverflowed()`、`StackGuard` 和 `Runtime_ThrowStackOverflow` 等检查。

简化理解如下：

```text
准备继续调用或执行
  -> 检查当前 stack pointer 是否越过限制
    -> 未越界：继续
    -> 已越界：进入 StackOverflow / ThrowStackOverflow 路径
```

这类检查既要保护真实栈边界，也会和中断、调试等 Stack Guard 机制配合。

对业务开发来说不需要记住 V8 函数名，但需要知道：调用栈深度是受运行时保护的有限资源。

## 递归不是错，失控递归才是问题

下面这种树遍历非常自然：

```js
function collectNames(node, result = []) {
  result.push(node.name);

  for (const child of node.children ?? []) {
    collectNames(child, result);
  }

  return result;
}
```

如果树深度可控，递归代码通常更容易读。

真正危险的是：

1. 缺少终止条件。
2. 输入可能形成环。
3. 数据深度不受信任。
4. 递归层数可能达到几万甚至更多。

面对不可信深度，可以改成显式栈：

```js
function collectNames(root) {
  const result = [];
  const pending = [root];

  while (pending.length > 0) {
    const node = pending.pop();

    result.push(node.name);

    for (let index = (node.children?.length ?? 0) - 1; index >= 0; index--) {
      pending.push(node.children[index]);
    }
  }

  return result;
}
```

这里仍然有“栈”，只不过从引擎调用栈换成了我们可以控制大小的数组。

如果输入可能存在循环引用，还要增加 `WeakSet` 或 `Set` 做访问记录，不能只改成 `while` 就算完成。

## Promise 和定时器不会一直占着原调用栈

来看一段异步代码：

```js
function startRequest() {
  setTimeout(() => {
    console.trace('timer callback');
  }, 0);
}

function handleClick() {
  startRequest();
}

handleClick();
```

同步执行时的栈大致是：

```text
handleClick
  -> startRequest
    -> 注册 timer callback
```

`startRequest()` 返回，`handleClick()` 返回，当前同步调用栈清空。

等定时器对应的 task 真正被浏览器调度时，会重新建立一条调用链来执行回调：

```text
宿主调度 timer task
  -> timer callback
```

原来的 `handleClick -> startRequest` 不是一直以活动栈帧形式留在那里等待。

这就是调用栈和任务队列最关键的区别：

```text
调用栈：当前正在执行的同步调用
任务队列：以后有机会执行的工作
```

事件循环如何选择 task、清空 microtask 和进入渲染，可以继续看[深入浅出理解浏览器事件循环：从一道输出题讲到 Chrome 源码](https://huzhihui.com/blog/javascript-event-loop-task-microtask-rendering)。

## await 会挂起函数，但不会一直占着同步栈

```js
async function loadUser() {
  const response = await fetch('/api/user');
  return response.json();
}

function bootstrap() {
  loadUser();
}

bootstrap();
```

执行到 `await` 时，可以粗略理解为：

1. `loadUser()` 当前执行被挂起。
2. 它返回一个 Promise。
3. `bootstrap()` 可以继续并返回。
4. 等待的 Promise 完成后，`await` 后面的代码作为后续 Job 继续执行。

因此，后半段运行时原来的同步机器栈已经结束。

但 V8 和 DevTools 仍可能显示：

```text
at async loadUser (...)
```

这是 async stack trace 在帮助我们重建因果关系，不代表第一次调用时的栈帧一直活到了网络请求结束。

V8 的 zero-cost async stack traces 会为部分 `await`、`Promise.all()` 和 `Promise.any()` 场景补充异步帧。DevTools 还可以通过 Async Stack Tagging 把框架调度和真正执行的位置关联起来。

可以这样区分：

```text
同步调用栈 -> 运行时当前真正活动的调用帧
异步堆栈   -> 调试器或引擎重建的调度因果链
```

## 为什么异步错误有时看不到完整调用来源

不是所有异步 API 都能自动还原完整因果链。

```js
function scheduleTask(callback) {
  customQueue.push(callback);
}

function runTask() {
  const callback = customQueue.shift();
  callback();
}
```

如果自定义调度器只保存一个函数，真正执行时可能只看到 `runTask -> callback`，不知道最初是谁调用了 `scheduleTask()`。

复杂前端框架和任务系统经常需要自己保存：

- task id；
- 创建位置；
- 父任务；
- trace id；
- 调度时间；
- 执行时间。

Chrome 的 `console.createTask()` Async Stack Tagging API 也是同一个思路：框架明确告诉 DevTools 某个异步任务在哪里被创建，后续运行时再把两段调用关系关联起来。

所以异步调用链不是天然完整的。想让系统可调试，调度层必须主动保存因果关系。

## 在 DevTools 里怎么看调用栈

日常排查时，可以按下面的步骤来。

### 1. 在真正出问题的位置断住

比如接口被重复调用，在请求函数入口打断点：

```js
async function requestPayment(payload) {
  debugger;
  return fetch('/api/payment', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
```

也可以使用 XHR/fetch breakpoint，让 DevTools 在请求发出前暂停。

### 2. 从 Call Stack 栈顶向下看

暂停后，Call Stack 最上面是当前函数，下面依次是调用者。

```text
requestPayment
submitCheckout
handleConfirm
事件回调入口
```

如果问题是“谁调用了我”，不要只盯当前函数，往下找第一个属于业务代码的调用者。

### 3. 配合 Scope 面板看每一帧的数据

选择不同栈帧后，可以查看对应位置的：

- Local；
- Closure；
- Global；
- 当前参数和局部变量。

这也是为什么“栈帧”不仅代表函数名，它还对应一组可以调试的运行时状态。

### 4. 隐藏第三方调用噪音

如果 React、打包器运行时或监控 SDK 占满调用栈，可以使用 Ignore List 隐藏可信第三方脚本。

隐藏只是改变调试视图，不会改变真实执行过程。

### 5. 复制堆栈并保留源码映射

Call Stack 面板可以直接复制 stack trace。线上压缩代码则要配合 Source Map，才能把打包后的文件位置还原到源文件。

只上传错误消息、不上传堆栈和版本信息，通常很难定位真实调用来源。

## console.trace 适合回答“谁调用了这里”

遇到一个方法莫名执行多次，可以临时加入：

```js
function updateUserCache(user) {
  console.trace('updateUserCache called');
  cache.set(user.id, user);
}
```

它比手动在每个调用方加日志更快，因为输出会带当前同步调用关系。

不过生产代码中不要长期无节制地打印大量堆栈：

- 收集堆栈有运行成本；
- 日志体积会快速增大；
- 堆栈可能包含文件路径、内部函数和业务信息；
- 高频函数会制造大量重复日志。

定位完成后应该移除，或者只在受控调试开关下启用。

## 顶层 this 不一定是 window

旧的执行上下文文章经常写：

```text
全局执行上下文中的 this 指向 window
```

这个结论需要限定环境。

浏览器普通 classic script 中：

```html
<script>
  console.log(this === window);
  // true
</script>
```

ES Module 中：

```html
<script type="module">
  console.log(this);
  // undefined
</script>
```

Web Worker 中也没有 `window`，全局对象由对应 Worker 环境提供。

函数内部 `this` 则取决于函数类型和调用形式。严格函数、普通函数、箭头函数、class 方法和 bound function 的规则也不相同。

这部分可以继续看[深入浅出 call、apply、bind](https://huzhihui.com/blog/javascript-call-apply-bind-this-v8-source)。

所以执行上下文文章里最好不要再把 `this: window` 写成通用结构。

## 把四篇文章串起来

执行上下文是很多 JavaScript 基础知识的交叉点。可以按照下面的顺序理解：

```text
变量提升
  -> 声明绑定什么时候创建、什么时候初始化

作用域链与闭包
  -> 标识符沿什么环境查找、变量为什么还能存活

调用栈
  -> 函数调用如何进入、暂停、返回和异常退栈

事件循环
  -> 同步栈清空后，后续 task 和 microtask 如何继续执行
```

它们分别回答不同问题：

| 问题                                               | 对应主题                 |
| -------------------------------------------------- | ------------------------ |
| 为什么声明前读取是 `undefined` 或 `ReferenceError` | 声明实例化与变量提升     |
| 为什么内部函数能访问外层变量                       | 词法环境、作用域链与闭包 |
| 为什么错误堆栈显示一层层调用者                     | 执行上下文与调用栈       |
| 为什么 Promise 回调在同步代码以后执行              | 事件循环与 microtask     |

把这些概念混成一张“JavaScript 执行机制图”，看起来很完整，实际容易把规范、引擎和浏览器调度混在一起。分层理解反而更清楚。

## 总结

最后回顾一下：

1. Execution Context 是 ECMAScript 用来跟踪代码求值状态的规范机制，JavaScript 无法直接访问它。
2. 对普通同步调用，可以用后进先出的调用栈理解函数进入和返回。
3. 规范执行上下文、V8 栈帧和 V8 `Context` 属于不同层次，不能画等号。
4. V8 有解释、Baseline、Maglev、TurboFan、Builtin、Wasm 等不同栈帧类型。
5. 函数内联后，一个物理帧可能通过多个 Frame Summary 还原 JavaScript 逻辑调用。
6. 正常 `return` 会回到调用者；`throw` 会展开调用栈，直到找到异常处理器。
7. 调用栈空间有限，无限递归或不受控深递归会触发栈溢出。
8. Promise、定时器和 `await` 的后续代码不会一直占着原同步调用栈。
9. 异步堆栈是引擎或调试器重建的因果链，不代表旧机器栈帧仍然存活。
10. DevTools 的 Call Stack、Scope、Ignore List 和 async frames 是排查真实调用来源的重要工具。

可以用一句话收尾：

```text
执行上下文描述“当前求值需要什么状态”，调用栈描述“同步调用如何嵌套”，V8 栈帧负责把运行状态真正落到引擎里。
```

## 参考文章和源码

- [ECMAScript：Execution Contexts](https://tc39.es/ecma262/multipage/executable-code-and-execution-contexts.html#sec-execution-contexts)
- [V8：Stack trace API](https://v8.dev/docs/stack-trace-api)
- [Chrome DevTools：JavaScript debugging reference](https://developer.chrome.com/docs/devtools/javascript/reference)
- [Chrome DevTools：Debugging asynchronous JavaScript](https://developer.chrome.com/blog/async-call-stack/)
- Chromium/V8 源码版本：`148.0.7778.178`，commit：`d096af1c9e98c45c3596e59620622b1a049bfecb`
- [V8 frames.h](https://source.chromium.org/chromium/chromium/src/+/d096af1c9e98c45c3596e59620622b1a049bfecb:v8/src/execution/frames.h)
- [V8 frames.cc](https://source.chromium.org/chromium/chromium/src/+/d096af1c9e98c45c3596e59620622b1a049bfecb:v8/src/execution/frames.cc)
- [V8 runtime-internal.cc](https://source.chromium.org/chromium/chromium/src/+/d096af1c9e98c45c3596e59620622b1a049bfecb:v8/src/runtime/runtime-internal.cc)
