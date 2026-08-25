---
title: 浅拷贝和深拷贝，不只是递归：从引用共享到 structuredClone 与手写实现
slug: javascript-shallow-deep-clone-structured-clone
publishedAt: 2026-08-24T16:04
summary: 从前端状态更新中的引用共享问题出发，理解赋值、浅拷贝和深拷贝的区别，对比展开语法、Object.assign、JSON 序列化与 structuredClone，并手写一个支持循环引用、属性描述符、Map、Set 和类型化数组的深拷贝函数。
keywords:
  - JavaScript 浅拷贝
  - JavaScript 深拷贝
  - 手写 deepClone
  - structuredClone
  - Object.assign
  - JSON.stringify
  - 循环引用
  - WeakMap
  - Map Set
  - 属性描述符
tags:
  - JavaScript
  - ES6
  - 浏览器
  - 手写源码
  - 前端
---

## 前言

浅拷贝和深拷贝是 JavaScript 里经常被问到的知识点。早些时候学习这部分内容，我更多是在记：展开语法是浅拷贝，`JSON.parse(JSON.stringify(value))` 可以做深拷贝，递归时用 `Map` 解决循环引用。

但放到真实项目中，只记这些结论还不够。比如更新一份页面配置时，明明已经创建了新对象，为什么修改嵌套字段还是污染了旧数据？`structuredClone()` 已经可以直接使用，为什么还要手写深拷贝？一个对象里如果包含 `Date`、`Map`、函数、访问器属性和自定义类实例，“复制成功”又应该如何定义？

本文从引用共享开始，重新梳理浅拷贝和深拷贝的区别，再逐步实现一个教学版 `deepClone`。手写的目的不是替代原生 API 或成熟工具库，而是把对象键、属性描述符、循环引用和特殊对象这些容易漏掉的地方串起来。

## 先从一个状态更新问题开始

假设页面上有一份表单配置：

```js
const formConfig = {
  title: '用户信息',
  fields: [
    {
      name: 'email',
      rules: {
        required: true,
      },
    },
  ],
};

const nextConfig = { ...formConfig };

nextConfig.title = '编辑用户';
nextConfig.fields[0].rules.required = false;

console.log(formConfig.title);
// 用户信息

console.log(formConfig.fields[0].rules.required);
// false
```

`title` 没有影响原对象，但 `rules.required` 却被一起修改了。

原因是展开语法只复制了 `formConfig` 最外层的属性值：

```text
formConfig.fields ─┐
                   ├──> 同一个数组
nextConfig.fields ─┘
```

`nextConfig` 确实是一个新对象，但它里面的 `fields` 仍然指向原来的数组。继续访问数组里的对象和 `rules`，后面几层自然也都是共享的。

这就是浅拷贝最重要的特征：

**只创建第一层的新容器，第一层属性如果是引用类型，复制的仍然是同一个引用。**

## 赋值、浅拷贝和深拷贝有什么区别

在继续写代码之前，先把三个概念分清楚。

### 赋值不是拷贝

```js
const source = {
  profile: {
    name: 'Jacky',
  },
};

const target = source;

console.log(target === source);
// true
```

这里没有创建任何新对象，只是让 `target` 和 `source` 保存了同一个对象引用。通过任意一个变量修改对象，另一个变量看到的都会改变。

### 浅拷贝只断开第一层引用

```js
const target = { ...source };

console.log(target === source);
// false

console.log(target.profile === source.profile);
// true
```

最外层对象已经分开，嵌套对象仍然共享。

### 深拷贝递归断开需要复制的引用

```js
const target = structuredClone(source);

console.log(target === source);
// false

console.log(target.profile === source.profile);
// false
```

深拷贝会继续处理嵌套值，让复制结果和原对象不再共享这些可变对象。

不过“深拷贝所有内容”并不是一句完整的需求。函数要不要复制？对象原型要不要保留？两个属性原本引用同一个对象，克隆之后还要不要继续指向同一个克隆对象？遇到不能复制的 DOM 节点、`WeakMap` 或私有字段怎么办？

所以更准确的理解是：

> 深拷贝不是唯一固定的算法，而是按照一套明确规则，重建输入值及其引用关系。

不同方案的规则不同，最终结果也不一定相同。

## 常见的浅拷贝方式

### 对象展开语法

```js
const source = {
  name: 'Jacky',
  settings: {
    theme: 'dark',
  },
};

const target = { ...source };
```

对象展开语法会把来源对象自身可枚举的属性放进新对象，日常更新 React 状态、合并配置时很常见。

```js
const nextState = {
  ...state,
  loading: true,
};
```

如果只修改指定路径，我们也可以逐层展开：

```js
const nextConfig = {
  ...formConfig,
  fields: formConfig.fields.map((field, index) =>
    index === 0
      ? {
          ...field,
          rules: {
            ...field.rules,
            required: false,
          },
        }
      : field,
  ),
};
```

这种写法看起来比一行深拷贝长，但它只复制发生变化的路径，未变化的节点可以继续共享。在状态管理场景中，这通常比无差别复制整个对象更合适。

### Object.assign

```js
const target = Object.assign({}, source);
```

`Object.assign(target, ...sources)` 会把来源对象自身可枚举的字符串键和 `Symbol` 键复制到目标对象，并返回这个目标对象。

它有几个需要注意的地方：

1. 只处理自身可枚举属性，不处理继承属性和不可枚举属性。
2. 复制的是属性值，所以嵌套对象仍然共享。
3. 它会读取来源对象的属性，并给目标对象赋值，因此可能触发 getter 和 setter。
4. 目标对象会被直接修改。

```js
const target = { enabled: false };

const result = Object.assign(target, {
  enabled: true,
  mode: 'strict',
});

console.log(result === target);
// true
```

如果不想修改已有目标对象，通常把空对象放在第一个参数：

```js
const result = Object.assign({}, defaults, options);
```

### slice、concat 和数组展开

数组也有几种常见的浅拷贝方式：

```js
const source = [
  { id: 1, checked: false },
  { id: 2, checked: false },
];

const bySlice = source.slice();
const byConcat = source.concat();
const bySpread = [...source];
```

三个结果都是新数组，但数组元素里的对象没有被复制：

```js
console.log(bySpread === source);
// false

console.log(bySpread[0] === source[0]);
// true
```

因此，数组方法返回新数组，并不等于数组里的每一项都是新对象。

## 手写一个浅拷贝

如果目标是模拟对象展开语法最常用的行为，可以这样写：

```js
function shallowClone(target) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  const clone = Array.isArray(target) ? [] : {};

  for (const key of Reflect.ownKeys(target)) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);

    if (descriptor?.enumerable) {
      clone[key] = target[key];
    }
  }

  return clone;
}
```

这里没有使用 `for...in`，因为 `for...in` 会遍历原型链上的可枚举字符串属性，而且拿不到 `Symbol` 键。`Reflect.ownKeys()` 返回对象所有自身字符串键和 `Symbol` 键，我们再根据属性描述符筛掉不可枚举属性。

测试一下：

```js
const token = Symbol('token');

const source = {
  name: 'Jacky',
  profile: {
    age: 18,
  },
  [token]: 'abc',
};

const target = shallowClone(source);

console.log(target !== source);
// true

console.log(target.profile === source.profile);
// true

console.log(target[token]);
// abc
```

这仍然只是浅拷贝。代码写得再复杂，只要没有继续处理 `target[key]` 里的对象，就没有断开嵌套引用。

## JSON 往返为什么不等于通用深拷贝

以前最常见的一行深拷贝是：

```js
const clone = JSON.parse(JSON.stringify(source));
```

它的实际过程不是“克隆 JavaScript 对象”，而是：

```text
JavaScript 值 -> JSON 文本 -> JavaScript 值
```

如果数据本来就是准备发送给接口的普通 JSON 数据，这个方案有时可以工作。但它受 JSON 数据模型限制，很多 JavaScript 值会丢失或变化。

```js
const source = {
  missing: undefined,
  handler() {},
  token: Symbol('token'),
  createdAt: new Date('2026-08-24T08:00:00.000Z'),
  pattern: /clone/gi,
  map: new Map([['name', 'Jacky']]),
  notANumber: NaN,
  infinity: Infinity,
};

const clone = JSON.parse(JSON.stringify(source));

console.log(clone);
```

结果大致是：

```js
{
  createdAt: '2026-08-24T08:00:00.000Z',
  pattern: {},
  map: {},
  notANumber: null,
  infinity: null,
}
```

需要记住的限制包括：

1. 对象属性中的 `undefined`、函数和 `Symbol` 值会被忽略。
2. `Date` 通常变成字符串。
3. `RegExp`、`Map`、`Set` 默认不能表达成对应类型。
4. `NaN`、`Infinity` 和 `-Infinity` 会变成 `null`。
5. `BigInt` 默认会让 `JSON.stringify()` 抛出异常。
6. 原型、属性描述符、getter、setter 都不会被保留。
7. 循环引用会让序列化直接失败。

```js
const source = {};
source.self = source;

JSON.stringify(source);
// TypeError: Converting circular structure to JSON
```

所以我更愿意把 JSON 往返叫作“按 JSON 规则重新序列化”，而不是通用深拷贝。

## 现在优先了解 structuredClone

浏览器提供了全局的 `structuredClone()`，它使用 HTML 标准中的结构化克隆算法创建深层副本。

```js
const source = {
  createdAt: new Date(),
  pattern: /clone/gi,
  map: new Map([['name', 'Jacky']]),
  set: new Set(['JavaScript', 'TypeScript']),
};

source.self = source;

const clone = structuredClone(source);

console.log(clone.createdAt instanceof Date);
// true

console.log(clone.map instanceof Map);
// true

console.log(clone.self === clone);
// true
```

和 JSON 往返相比，它可以处理更多 JavaScript 与 Web API 类型，包括常见的：

- `Array`、普通对象和基本类型；
- `Date`、`RegExp`；
- `Map`、`Set`；
- `ArrayBuffer`、`DataView`、类型化数组；
- 循环引用；
- 一部分可序列化的 Web API 对象。

### structuredClone 也不是万能的

下面这段代码仍然会失败：

```js
structuredClone({
  onClick() {
    console.log('click');
  },
});
// DataCloneError
```

函数和 DOM 节点不能被结构化克隆。它也不会完整保留对象的所有语言层细节，比如：

1. 属性描述符、getter 和 setter 不会按原样复制。
2. 自定义对象的原型链不会被完整复制。
3. class 私有字段不会被复制。
4. `RegExp.lastIndex` 不会被保留。
5. 输入中任意一部分不可序列化，都可能抛出 `DataCloneError`。

因此，`structuredClone()` 适合复制结构化数据，不代表它能制作一个行为完全相同的任意对象。

### clone 和 transfer 不是一回事

`structuredClone()` 还支持转移部分可转移对象：

```js
const bytes = new Uint8Array(1024);

const clone = structuredClone(bytes, {
  transfer: [bytes.buffer],
});

console.log(clone.byteLength);
// 1024

console.log(bytes.byteLength);
// 0
```

这里的底层 `ArrayBuffer` 不是普通复制，而是被转移到了新结果中。转移完成后，原来的缓冲区会被分离，不能再按之前的方式使用。

这在 Worker 通信或处理大块二进制数据时很有价值，但也意味着它是一种所有权转移，不能把它当成完全无副作用的复制。

## 手写深拷贝之前，先定义范围

现在开始手写 `deepClone`。为了让代码保持可读，我们先确定这版实现的范围：

1. 基本类型直接返回。
2. 函数保留原引用，不尝试克隆函数代码和闭包。
3. 支持普通对象、数组、`Date`、`RegExp`、`Map`、`Set`。
4. 支持 `ArrayBuffer`、`DataView` 和类型化数组。
5. 使用 `WeakMap` 保留循环引用和重复引用关系。
6. 普通对象尽量保留原型、字符串键、`Symbol` 键和属性描述符。
7. 不把它描述成生产环境的通用 polyfill。

为什么函数直接保留？

```js
function createCounter() {
  let count = 0;

  return () => ++count;
}
```

函数不只是源代码文本，它还可能通过闭包引用创建时的词法环境。把 `fn.toString()` 再交给 `new Function()`，既还原不了闭包，也会引入安全和语义问题。

## 第一步：处理基本类型和循环引用

先搭出递归骨架：

```js
function deepClone(target, seen = new WeakMap()) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  if (seen.has(target)) {
    return seen.get(target);
  }

  const clone = Array.isArray(target) ? [] : {};

  seen.set(target, clone);

  for (const key of Reflect.ownKeys(target)) {
    clone[key] = deepClone(target[key], seen);
  }

  return clone;
}
```

关键点是：**创建克隆容器后，要先写入 `WeakMap`，再递归子属性。**

假设对象引用了自己：

```js
const source = {
  name: 'Jacky',
};

source.self = source;
```

第一次处理 `source` 时，`seen` 已经记录：

```text
source -> clone
```

递归到 `self` 后再次遇到 `source`，直接返回之前的 `clone`，不再继续向下递归。

这不只解决循环引用，也能保留重复引用关系：

```js
const shared = { enabled: true };
const source = {
  left: shared,
  right: shared,
};

const clone = deepClone(source);

console.log(clone.left === clone.right);
// true

console.log(clone.left === shared);
// false
```

如果每次遇到对象都直接创建新对象，`left` 和 `right` 就会被错误地复制成两个不同对象。

## 第二步：处理 Date、RegExp、Map 和 Set

接下来加入特殊对象。它们不能只创建 `{}`，因为数据可能保存在对象内部槽中，不一定是普通可枚举属性。

```js
function deepClone(target, seen = new WeakMap()) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  if (seen.has(target)) {
    return seen.get(target);
  }

  if (target instanceof Date) {
    return new Date(target.getTime());
  }

  if (target instanceof RegExp) {
    const clone = new RegExp(target.source, target.flags);
    clone.lastIndex = target.lastIndex;
    return clone;
  }

  if (target instanceof Map) {
    const clone = new Map();
    seen.set(target, clone);

    for (const [key, value] of target) {
      clone.set(deepClone(key, seen), deepClone(value, seen));
    }

    return clone;
  }

  if (target instanceof Set) {
    const clone = new Set();
    seen.set(target, clone);

    for (const value of target) {
      clone.add(deepClone(value, seen));
    }

    return clone;
  }

  // 继续处理普通对象
}
```

`Map` 的键也可以是对象，所以键和值都需要按照当前规则递归。`Set` 里的成员同理。

注意，我们给 `Date` 和 `RegExp` 创建了真正的新实例，而不是只继承它们的原型：

```js
const fakeDate = Object.create(Date.prototype);

fakeDate.getTime();
// TypeError
```

`fakeDate` 虽然能沿着原型链找到 `getTime`，但它没有真正 `Date` 对象需要的内部数据。只复制原型，不能伪造所有内建对象。

## 第三步：处理二进制数据

`ArrayBuffer`、`DataView` 和类型化数组也有自己的内部结构：

```js
function cloneBinary(target, seen, deepClone) {
  if (target instanceof ArrayBuffer) {
    const clone = target.slice(0);
    seen.set(target, clone);
    return clone;
  }

  if (target instanceof DataView) {
    const buffer = deepClone(target.buffer, seen);
    const clone = new DataView(buffer, target.byteOffset, target.byteLength);

    seen.set(target, clone);
    return clone;
  }

  if (ArrayBuffer.isView(target)) {
    const buffer = deepClone(target.buffer, seen);
    const clone = new target.constructor(
      buffer,
      target.byteOffset,
      target.length,
    );

    seen.set(target, clone);
    return clone;
  }

  return null;
}
```

这里先复制底层 `buffer`，再使用相同的偏移量和长度创建视图。由于底层缓冲区也会被记录到 `WeakMap` 中，如果多个视图原本共享同一个 `ArrayBuffer`，克隆后仍然会共享同一个新的缓冲区。

不过这段辅助函数只处理常见 `ArrayBuffer` 视图，没有扩展 `SharedArrayBuffer` 等更复杂场景。

## 第四步：保留对象键、原型和属性描述符

旧实现中常见的写法是：

```js
const clone = Object.create(
  Object.getPrototypeOf(target),
  Object.getOwnPropertyDescriptors(target),
);

clone[key] = deepClone(target[key]);
```

这段代码有一个问题：如果描述符已经把某个属性定义成不可写，后面的直接赋值就不能再把递归结果写进去。

```js
const source = {};

Object.defineProperty(source, 'settings', {
  value: {
    theme: 'dark',
  },
  writable: false,
  enumerable: false,
});
```

正确的顺序应该是：先拿到属性描述符；如果它是数据描述符，递归复制 `descriptor.value`；最后用新的描述符定义到克隆对象上。

```js
function cloneProperties(source, target, seen, deepClone) {
  for (const key of Reflect.ownKeys(source)) {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);

    if (!descriptor) {
      continue;
    }

    if ('value' in descriptor) {
      descriptor.value = deepClone(descriptor.value, seen);
    }

    Object.defineProperty(target, key, descriptor);
  }

  return target;
}
```

访问器描述符里没有 `value`，只有 `get` 和 `set`。这里会保留原 getter、setter 函数引用，不主动调用 getter。这和 `Object.assign()`、对象展开读取属性值的行为并不相同。

## 完整的教学版 deepClone

把上面的处理合并起来：

```js
function deepClone(target, seen = new WeakMap()) {
  if (typeof target !== 'object' || target === null) {
    return target;
  }

  if (seen.has(target)) {
    return seen.get(target);
  }

  if (target instanceof Date) {
    const clone = new Date(target.getTime());
    seen.set(target, clone);
    return clone;
  }

  if (target instanceof RegExp) {
    const clone = new RegExp(target.source, target.flags);
    clone.lastIndex = target.lastIndex;
    seen.set(target, clone);
    return clone;
  }

  if (target instanceof Map) {
    const clone = new Map();
    seen.set(target, clone);

    for (const [key, value] of target) {
      clone.set(deepClone(key, seen), deepClone(value, seen));
    }

    return clone;
  }

  if (target instanceof Set) {
    const clone = new Set();
    seen.set(target, clone);

    for (const value of target) {
      clone.add(deepClone(value, seen));
    }

    return clone;
  }

  if (target instanceof ArrayBuffer) {
    const clone = target.slice(0);
    seen.set(target, clone);
    return clone;
  }

  if (target instanceof DataView) {
    const buffer = deepClone(target.buffer, seen);
    const clone = new DataView(buffer, target.byteOffset, target.byteLength);

    seen.set(target, clone);
    return clone;
  }

  if (ArrayBuffer.isView(target)) {
    const buffer = deepClone(target.buffer, seen);
    const clone = new target.constructor(
      buffer,
      target.byteOffset,
      target.length,
    );

    seen.set(target, clone);
    return clone;
  }

  const clone = Array.isArray(target)
    ? new Array(target.length)
    : Object.create(Object.getPrototypeOf(target));

  seen.set(target, clone);

  for (const key of Reflect.ownKeys(target)) {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);

    if (!descriptor) {
      continue;
    }

    if ('value' in descriptor) {
      descriptor.value = deepClone(descriptor.value, seen);
    }

    Object.defineProperty(clone, key, descriptor);
  }

  return clone;
}
```

测试普通对象、循环引用和重复引用：

```js
const shared = {
  enabled: true,
};

const source = {
  name: 'Jacky',
  settings: shared,
  backupSettings: shared,
  createdAt: new Date('2026-08-24T08:00:00.000Z'),
  pattern: /clone/gi,
  map: new Map(),
  set: new Set(),
};

source.self = source;
source.map.set(source, shared);
source.set.add(shared);

const clone = deepClone(source);

console.log(clone !== source);
// true

console.log(clone.settings !== source.settings);
// true

console.log(clone.settings === clone.backupSettings);
// true

console.log(clone.self === clone);
// true

console.log(clone.createdAt instanceof Date);
// true

console.log(clone.map.get(clone) === clone.settings);
// true
```

再测试不可枚举属性和 `Symbol` 键：

```js
const privateKey = Symbol('private');
const source = {};

Object.defineProperty(source, 'settings', {
  value: {
    theme: 'dark',
  },
  writable: false,
  enumerable: false,
  configurable: false,
});

source[privateKey] = {
  token: 'abc',
};

const clone = deepClone(source);
const descriptor = Object.getOwnPropertyDescriptor(clone, 'settings');

console.log(descriptor.enumerable);
// false

console.log(descriptor.writable);
// false

console.log(clone.settings !== source.settings);
// true

console.log(clone[privateKey] !== source[privateKey]);
// true
```

## 这版手写实现仍然有哪些边界

代码已经比简单递归完整很多，但依然不能把它当成“复制任意 JavaScript 对象”的最终答案。

### 1. 函数仍然共享

函数被当成非对象值直接返回，因此克隆结果和来源对象里的函数是同一个引用。这是有意选择的语义。

### 2. 私有字段和内部槽不能靠遍历复制

```js
class Session {
  #token = 'abc';

  getToken() {
    return this.#token;
  }
}
```

即使通过 `Object.create(Session.prototype)` 保留原型，`#token` 也不是普通属性。克隆出来的对象调用 `getToken()` 时会失败，因为它不是经过构造器初始化的真正 `Session` 实例。

`WeakMap`、`WeakSet`、`Promise`、DOM 节点以及很多宿主对象也有类似问题，不能只靠 `Reflect.ownKeys()` 完整重建。

### 3. Proxy 可能产生副作用

读取原型、枚举键、获取描述符都可能触发 Proxy 的 trap。深拷贝不是天然无副作用的操作。

### 4. 跨 realm 的 instanceof 可能失效

来自 iframe 等其他 realm 的对象，可能无法通过当前 realm 的 `instanceof Date`、`instanceof Map` 判断。生产级实现通常需要更完整的类型识别和测试。

### 5. 大对象递归有栈和性能成本

对象层级特别深时，递归可能遇到调用栈限制；对象图特别大时，完整深拷贝也会带来明显的时间和内存开销。

深拷贝能写出来，不代表每次状态更新都应该深拷贝整个对象。

## 项目中到底应该怎么选

最后把常见场景放在一起：

| 场景                     | 更合适的方式                                         |
| ------------------------ | ---------------------------------------------------- |
| 只更新对象第一层字段     | 对象展开或 `Object.assign()`                         |
| 更新已知的嵌套状态       | 只复制发生变化的路径                                 |
| 复制普通结构化数据       | `structuredClone()`                                  |
| 数据本来就要按 JSON 传输 | 明确接受类型损失后使用 JSON 序列化                   |
| 需要特殊业务规则         | 写针对数据模型的复制函数                             |
| 需要兼容复杂类型和旧环境 | 评估成熟工具库并补充测试                             |
| 只是为了防止修改         | 考虑只读类型、冻结或不可变数据方案，而不是盲目深拷贝 |

我的建议是，先问清楚为什么要复制：

1. 是为了更新状态时保持引用可比较？
2. 是为了隔离第三方代码可能产生的修改？
3. 是为了跨线程传递数据？
4. 是为了序列化、缓存或持久化？
5. 还是为了得到一个行为完全相同的实例？

这几个目标看起来都叫“复制”，需要的方案却不一样。

## 总结

浅拷贝只创建第一层新容器，嵌套引用仍然共享；深拷贝则按照明确规则重建对象图，并尽量断开需要隔离的可变引用。

回顾下来，有几个重点：

1. `=` 只是复制引用，不会创建新对象。
2. 展开语法、`Object.assign()`、`slice()`、`concat()` 都是常见浅拷贝方式。
3. JSON 往返遵循 JSON 数据模型，不是通用深拷贝。
4. `structuredClone()` 适合复制结构化数据，支持循环引用和多种内建类型，但也有不能复制的值。
5. 手写深拷贝时，`WeakMap` 不只解决循环引用，也用于保留重复引用关系。
6. 特殊对象、属性描述符、原型、内部槽和私有字段决定了深拷贝不可能只靠一段递归覆盖所有语义。

写到这里，浅拷贝和深拷贝大致就梳理完了。真正放进项目时，最重要的不是选一段看起来最完整的 `deepClone`，而是先定义数据范围和复制目的，再选择足够简单的方案。

## 参考文章

1. [MDN：Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
2. [MDN：structuredClone()](https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone)
3. [MDN：结构化克隆算法](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm)
4. [HTML Standard：Safe passing of structured data](https://html.spec.whatwg.org/multipage/structured-data.html#safe-passing-of-structured-data)
