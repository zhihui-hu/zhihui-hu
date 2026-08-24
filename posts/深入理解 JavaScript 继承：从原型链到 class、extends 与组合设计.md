---
title: 深入理解 JavaScript 继承：从原型链到 class、extends 与组合设计
slug: javascript-inheritance-prototype-chain-class-extends-composition
publishedAt: 2026-08-24T10:00
updatedAt: 2026-08-24T10:00
summary: 重新梳理 JavaScript 继承，从原型链和 Object.create 讲到旧构造函数模式、class、extends、super、私有字段与静态继承，并说明现代项目何时应该优先使用组合。
keywords:
  - JavaScript 继承
  - 原型链
  - Object.create
  - prototype
  - class
  - extends
  - super
  - 私有字段
  - 组合优于继承
tags:
  - JavaScript
  - ES6
  - 原型链
  - 面向对象
  - 前端基础
---

## 前言

这篇文章最早写于 ES6 普及初期，当时学习 JavaScript 继承，常见路线是把“原型链继承、借用构造函数、组合继承、原型式继承、寄生式继承、寄生组合式继承、ES6 extends”全部背一遍。

这套分类能帮助我们理解历史代码，但放到现在已经不够用了。

首先，其中有些名称来自早期 JavaScript 设计模式，并不是 ECMAScript 规范里的正式概念。其次，`Object.create()` 经常被误解成浅拷贝，`constructor` 也常被当成类型判断和克隆工具。最后，直接把 `class extends` 说成“寄生组合继承的语法糖”，会漏掉静态继承、派生构造函数、`super`、私有字段和类字段初始化等重要语义。

所以本文重新整理这个知识点，不再把七种写法当成七个并列答案，而是按三条主线来理解：

1. 对象通过原型链委托属性访问。
2. 旧代码通过构造函数和原型对象组织实例。
3. 现代代码通过 `class`、`extends` 和 `super` 表达类型层级。

最后再回到工程实践：什么时候适合继承，什么时候组合更简单。

## JavaScript 继承的本质不是复制

先看一个配置对象的例子：

```js
const defaultRequestOptions = {
  timeout: 5000,
  retry: 1,
};

const uploadRequestOptions = Object.create(defaultRequestOptions);
uploadRequestOptions.timeout = 15000;

console.log(uploadRequestOptions.timeout); // 15000
console.log(uploadRequestOptions.retry); // 1
```

`uploadRequestOptions` 自己只有 `timeout`，并没有 `retry`。访问 `retry` 时，引擎会沿着对象的 `[[Prototype]]` 向上查找：

```text
uploadRequestOptions
  -> defaultRequestOptions
  -> Object.prototype
  -> null
```

这就是 JavaScript 原型继承的基础：

> 对象没有复制原型中的属性，而是在自身找不到属性时，把查找委托给原型。

可以用 `Object.hasOwn()` 验证：

```js
Object.hasOwn(uploadRequestOptions, 'timeout'); // true
Object.hasOwn(uploadRequestOptions, 'retry'); // false
```

给对象赋值时，通常会创建或修改自己的属性，不会直接改写原型：

```js
uploadRequestOptions.retry = 3;

console.log(uploadRequestOptions.retry); // 3
console.log(defaultRequestOptions.retry); // 1
```

但是，如果继承到的是一个引用类型，再修改引用内部的内容，仍然会影响共享对象：

```js
const defaults = {
  headers: {
    'x-client': 'web',
  },
};

const requestA = Object.create(defaults);
const requestB = Object.create(defaults);

requestA.headers.authorization = 'Bearer token';

console.log(requestB.headers.authorization); // Bearer token
```

原因不是 `Object.create()` 做了浅拷贝，而是它根本没有复制 `headers`。两个对象访问到的都是原型上的同一个对象。

## `[[Prototype]]` 和 `prototype` 不是一回事

这是理解继承时最容易混淆的两个概念。

### 对象的 `[[Prototype]]`

每个普通对象都有内部的 `[[Prototype]]` 链接。我们可以通过 `Object.getPrototypeOf()` 读取：

```js
const task = {};

Object.getPrototypeOf(task) === Object.prototype; // true
```

### 构造函数的 `prototype`

可以被 `new` 调用的普通函数，通常有一个公开的 `prototype` 属性。使用 `new` 创建实例时，这个对象会成为实例的 `[[Prototype]]`：

```js
function ExportTask(fileName) {
  this.fileName = fileName;
}

const task = new ExportTask('users.csv');

Object.getPrototypeOf(task) === ExportTask.prototype; // true
```

也就是说：

```text
ExportTask.prototype
        │
        └── new ExportTask() 创建实例时
                    │
                    ▼
          task.[[Prototype]]
```

函数的 `prototype` 是一个普通属性；对象的 `[[Prototype]]` 是属性查找使用的内部链接。二者相关，但不能混为一谈。

> 箭头函数不能作为构造函数调用，也没有默认的 `prototype` 属性。

## 以前说的七种继承，现在应该怎么理解

先把旧文章里的七种方式放回正确位置：

| 旧分类          | 实际做了什么                                    | 现在怎么看                                         |
| --------------- | ----------------------------------------------- | -------------------------------------------------- |
| 原型链继承      | 把父构造函数实例放到子构造函数原型链上          | 会执行父构造函数，还容易把实例状态放进原型，不推荐 |
| 借用构造函数    | 用 `Parent.call(this)` 初始化实例属性           | 只处理实例初始化，没有建立方法继承链               |
| 组合继承        | `call` 初始化状态，再用 `new Parent()` 建原型链 | 父构造函数执行两次，属于历史方案                   |
| 原型式继承      | 用现有对象作为新对象的原型                      | 对应 `Object.create()`，本质是对象委托，不是复制   |
| 寄生式继承      | 创建委托对象后再增加能力                        | 更接近对象工厂或装饰器                             |
| 寄生组合式继承  | `call` 加 `Object.create(Parent.prototype)`     | 旧构造函数代码中较完整的单继承方案                 |
| `class extends` | 用类语法表达原型继承和派生构造                  | 现代类型层级的首选，但不是所有场景都该继承         |

所以，七种方式并不是七套都值得在新项目中使用的最佳实践。现在真正需要掌握的是：

```text
对象委托：Object.create()
旧代码兼容：构造函数 + 原型链
现代类型层级：class + extends
能力组合：工厂函数、依赖注入、装饰器或 mixin
```

## `Object.create()`：创建委托关系，不是克隆对象

`Object.create(proto)` 会创建一个新对象，并把参数 `proto` 设置为新对象的 `[[Prototype]]`：

```js
const commonFormatter = {
  formatDate(value) {
    return new Intl.DateTimeFormat('zh-CN').format(value);
  },
};

const orderFormatter = Object.create(commonFormatter);

orderFormatter.formatAmount = function (amount) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(amount);
};

orderFormatter.formatDate(new Date());
orderFormatter.formatAmount(19900);
```

这里没有类，也没有构造函数。`orderFormatter` 只是把找不到的格式化方法委托给 `commonFormatter`。

`Object.create()` 还有第二个参数，可以在创建时定义自己的属性描述符：

```js
const formatter = Object.create(commonFormatter, {
  locale: {
    value: 'zh-CN',
    writable: false,
    enumerable: true,
    configurable: false,
  },
});
```

如果需要创建不继承 `Object.prototype` 的纯字典，可以使用：

```js
const counters = Object.create(null);

counters.success = 10;

console.log(counters.toString); // undefined
```

这种对象没有 `toString`、`constructor`、`hasOwnProperty` 等继承属性，适合用作字符串键字典。不过现代项目里，键类型复杂或需要明确迭代语义时，通常直接使用 `Map` 更清楚。

### `Object.create()` 不会执行初始化逻辑

假设有一个构造函数：

```js
function UploadSession(file) {
  this.file = file;
  this.createdAt = Date.now();
}
```

下面的代码只会建立原型关系，不会执行 `UploadSession`：

```js
const session = Object.create(UploadSession.prototype);

console.log(session.file); // undefined
```

所以 `Object.create()` 不能替代构造函数，也不是完整的实例创建过程。

## 旧项目中的构造函数继承

维护 ES5 或早期库代码时，仍然会遇到函数构造器。

假设项目里有一个基础请求客户端：

```js
function ApiClient(baseURL) {
  this.baseURL = baseURL;
}

ApiClient.prototype.buildURL = function (path) {
  return new URL(path, this.baseURL).toString();
};

ApiClient.prototype.request = function (path, init) {
  return fetch(this.buildURL(path), init);
};
```

现在需要一个自动附带令牌的客户端：

```js
function AuthenticatedApiClient(baseURL, getToken) {
  ApiClient.call(this, baseURL);
  this.getToken = getToken;
}
```

`ApiClient.call(this, baseURL)` 只完成实例初始化：

```text
给当前实例写入 baseURL
```

它没有让 `AuthenticatedApiClient` 的实例继承 `ApiClient.prototype` 上的方法。还需要建立原型链：

```js
AuthenticatedApiClient.prototype = Object.create(ApiClient.prototype, {
  constructor: {
    value: AuthenticatedApiClient,
    writable: true,
    configurable: true,
  },
});

AuthenticatedApiClient.prototype.request = function (path, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${this.getToken()}`);

  return ApiClient.prototype.request.call(this, path, {
    ...init,
    headers,
  });
};
```

这样会形成：

```text
client
  -> AuthenticatedApiClient.prototype
  -> ApiClient.prototype
  -> Object.prototype
  -> null
```

这就是旧分类里的“寄生组合式继承”。它只调用一次父构造函数，同时把方法放在原型链上复用。

### 为什么不再写 `Child.prototype = new Parent()`

因为这会为了建立原型链而执行一次父构造函数：

```js
AuthenticatedApiClient.prototype = new ApiClient('/api');
```

父构造函数可能会创建数组、注册监听、读取配置，甚至发起其他副作用。这些内容不应该出现在子构造函数的原型对象上。

正确目标只是：

```text
让 Child.prototype 的 [[Prototype]] 指向 Parent.prototype
```

而不是创建一个完整的父实例。

### `constructor` 没有想象中那么重要

重新赋值 `Child.prototype` 后，默认的 `constructor` 属性会丢失，所以旧模式通常会把它补回来。

但是要注意：`constructor` 只是一个可写、可覆盖的普通属性。

```js
const values = [];
values.constructor = String;

console.log(values.constructor === String); // true
console.log(values instanceof Array); // true
```

因此：

- 不要用 `obj.constructor` 做可靠的类型判断；
- 不要假设 `new obj.constructor()` 就能正确克隆对象；
- 真正需要复制数据时，使用明确的工厂函数、序列化方案或 `structuredClone()`；
- 检查原型关系时，使用 `instanceof`、`Object.getPrototypeOf()` 或明确的品牌字段。

旧继承模式修复 `constructor`，主要是为了保持开发者预期以及兼容少量显式读取它的代码，不是因为 JavaScript 的继承机制依赖这个属性。

## 现代写法：`class` 和 `extends`

对于明确的类型层级，现代 JavaScript 直接使用 `class`。

下面还是请求客户端，但换成类来实现：

```js
class ApiClient {
  #baseURL;

  static protocol = 'https';

  constructor(baseURL) {
    this.#baseURL = new URL(baseURL);
  }

  buildURL(path) {
    return new URL(path, this.#baseURL).toString();
  }

  request(path, init) {
    return fetch(this.buildURL(path), init);
  }
}

class AuthenticatedApiClient extends ApiClient {
  #getToken;

  static clientType = 'authenticated';

  constructor(baseURL, getToken) {
    super(baseURL);
    this.#getToken = getToken;
  }

  request(path, init = {}) {
    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${this.#getToken()}`);

    return super.request(path, {
      ...init,
      headers,
    });
  }
}
```

调用：

```js
const client = new AuthenticatedApiClient(
  'https://api.example.com/',
  () => 'current-token',
);

client.buildURL('/orders');
client.request('/orders');
```

子类实例可以使用父类的公共方法，也可以覆盖方法，再通过 `super.method()` 复用父类实现。

## `extends` 建立了两条原型链

只看实例方法时，我们会看到：

```js
Object.getPrototypeOf(AuthenticatedApiClient.prototype) === ApiClient.prototype;
// true
```

对应：

```text
client
  -> AuthenticatedApiClient.prototype
  -> ApiClient.prototype
  -> Object.prototype
  -> null
```

但是 `extends` 还会建立构造函数之间的静态继承链：

```js
Object.getPrototypeOf(AuthenticatedApiClient) === ApiClient;
// true
```

因此父类静态属性和静态方法也能被子类访问：

```js
AuthenticatedApiClient.protocol; // 'https'
AuthenticatedApiClient.clientType; // 'authenticated'
```

完整关系是：

```text
实例侧：
client
  -> AuthenticatedApiClient.prototype
  -> ApiClient.prototype

静态侧：
AuthenticatedApiClient
  -> ApiClient
  -> Function.prototype
```

早期手写的寄生组合继承，通常只建立实例侧原型链，并不会自动补上构造函数之间的静态链。这也是不能把 `extends` 简单描述成某段 ES5 模板替换的原因之一。

## `class` 建立在原型机制上，但不只是换一种写法

JavaScript 的类没有替换原型继承。实例方法最终仍然位于类的 `prototype` 上：

```js
Object.hasOwn(ApiClient.prototype, 'request'); // true
Object.hasOwn(client, 'request'); // false
```

但类语法还带来一组明确的语言语义：

1. 类必须通过 `new` 调用，不能像普通函数一样直接执行。
2. 类体默认运行在严格模式。
3. 类方法默认不可枚举，更接近内建对象的方法。
4. `extends` 同时建立实例方法链和静态链。
5. 派生类构造函数在 `super()` 之前不能访问 `this`。
6. 公共字段、私有字段和静态初始化有明确的执行顺序。
7. `#privateField` 提供真正由语言检查的私有元素。

所以更准确的说法是：

> `class` 是建立在原型机制之上的类抽象，但它包含不能用“把几行原型代码包起来”完整解释的语义。

## `super()` 到底做了什么

派生类构造函数中的 `this` 一开始处于未初始化状态：

```js
class CachedApiClient extends ApiClient {
  constructor(baseURL) {
    this.cache = new Map();
    super(baseURL);
  }
}
```

上面会抛出错误，因为在 `super()` 之前访问了 `this`。

正确顺序是：

```js
class CachedApiClient extends ApiClient {
  constructor(baseURL) {
    super(baseURL);
    this.cache = new Map();
  }
}
```

可以把 `super()` 的作用粗略理解为：

```text
调用父类构造逻辑
  -> 按当前 new.target 创建并初始化派生实例
  -> 把得到的对象绑定为当前 this
  -> 子类继续初始化自己的字段
```

这里和 `Parent.call(this)` 不完全一样。旧构造函数模式先由 `new Child()` 创建 `this`，再把这个对象交给 `Parent.call(this)`；派生类则需要通过 `super()` 完成 `this` 的初始化。

### `super.method()` 仍然以当前实例作为 `this`

在覆盖方法里调用：

```js
super.request(path, init);
```

查找起点是父类原型，但调用时的 `this` 仍然是当前的 `AuthenticatedApiClient` 实例。因此父类方法可以读取当前实例中由父类初始化的状态。

另外，`super` 的查找位置由方法定义时所在的类决定，不会因为后续使用 `call()` 或 `bind()` 就改成另一条父类链。

## 类字段和私有字段如何参与继承

### 公共字段属于实例

```js
class RetryableTask {
  attempts = 0;

  run() {
    this.attempts += 1;
  }
}
```

`attempts` 会出现在每个实例自身，而 `run` 位于 `RetryableTask.prototype`：

```js
const task = new RetryableTask();

Object.hasOwn(task, 'attempts'); // true
Object.hasOwn(task, 'run'); // false
```

这解决了早期原型链示例中“把数组放进原型导致多个实例共享”的问题。会变化的实例状态应放在实例字段中，可复用行为放在原型方法中。

### 父类私有字段不能被子类直接访问

`ApiClient` 的 `#baseURL` 只能在 `ApiClient` 类体中访问：

```js
class BrokenClient extends ApiClient {
  printBaseURL() {
    return this.#baseURL;
  }
}
```

这段代码会在解析阶段报错。子类可以调用父类的公共方法间接使用私有状态，但不能直接读取父类私有字段。

这和一些语言里的 `protected` 不同。JavaScript 原生 `#private` 是类私有，而不是“当前类及其子类可见”。如果子类确实需要某个能力，父类应该提供受控的公共方法或访问器：

```js
class ApiClient {
  #baseURL;

  constructor(baseURL) {
    this.#baseURL = new URL(baseURL);
  }

  resolvePath(path) {
    return new URL(path, this.#baseURL);
  }
}
```

### 静态私有字段也不会变成子类的私有字段

静态公共方法和字段可以通过构造函数原型链继承，但静态私有字段受类品牌检查约束。

如果静态方法依赖私有字段，直接通过声明它的类名访问通常更稳定：

```js
class ClientRegistry {
  static #clients = new Map();

  static get(name) {
    return ClientRegistry.#clients.get(name);
  }
}
```

使用 `this.#clients` 后再让子类继承静态方法，可能因为 `this` 变成子类构造函数而触发私有品牌检查失败。

## 方法覆盖、属性遮蔽和 `super`

继承到的方法并不是复制到子类，而是在原型链上被找到。

如果子类定义同名方法，会先找到子类版本：

```js
class JsonExporter {
  serialize(value) {
    return JSON.stringify(value);
  }
}

class PrettyJsonExporter extends JsonExporter {
  serialize(value) {
    return JSON.stringify(value, null, 2);
  }
}
```

这叫方法覆盖。

实例自己的同名属性还可以遮蔽原型方法：

```js
const exporter = new PrettyJsonExporter();

exporter.serialize = () => 'mock result';

exporter.serialize({ id: 1 }); // 'mock result'
```

属性查找顺序始终是：

```text
实例自身
  -> 子类 prototype
  -> 父类 prototype
  -> Object.prototype
  -> null
```

继承只是决定“找不到时去哪里继续找”，不会让对象失去普通属性遮蔽规则。

## `instanceof` 检查的也是原型链

```js
const client = new AuthenticatedApiClient(
  'https://api.example.com/',
  () => 'token',
);

client instanceof AuthenticatedApiClient; // true
client instanceof ApiClient; // true
```

默认情况下，`instanceof` 会检查构造函数的 `prototype` 是否出现在对象的原型链上。

它不是读取 `obj.constructor`，所以改写 `constructor` 不会改变 `instanceof` 结果。

不过 `instanceof` 也不是所有场景下的通用类型判断：

- iframe 等不同 Realm 中的同名内建对象拥有不同原型；
- 原型链可以被动态修改；
- 类可以通过 `Symbol.hasInstance` 自定义判断。

跨窗口数据或接口数据，更适合检查明确字段、使用 schema 校验或定义自己的类型守卫。

## 一个实用场景：继承内建 `Error`

现代 `class extends` 的一个常见用途，是定义带业务信息的错误类型：

```js
class HttpError extends Error {
  constructor(message, { status, url, cause } = {}) {
    super(message, { cause });
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
  }
}

async function loadOrder(orderId) {
  const url = `/api/orders/${orderId}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new HttpError('订单加载失败', {
      status: response.status,
      url,
    });
  }

  return response.json();
}
```

捕获时可以区分业务错误：

```js
try {
  await loadOrder('A1001');
} catch (error) {
  if (error instanceof HttpError) {
    console.log(error.status, error.url);
  }
}
```

继承在这里有明确价值：`HttpError` 确实是一个 `Error`，需要保留错误栈、错误消息和统一捕获语义，同时增加 HTTP 相关字段。

## 什么时候不要使用继承

继承适合稳定的“是一个”关系：

```text
HttpError 是一种 Error
AuthenticatedApiClient 是一种 ApiClient
```

但真实业务中的能力经常是正交组合：

```text
请求可以重试
请求可以缓存
请求可以记录日志
请求可以限流
```

如果为这些组合不断创建子类，很快会出现：

```text
CachedApiClient
RetryableApiClient
LoggedApiClient
CachedRetryableApiClient
LoggedCachedRetryableApiClient
```

这时组合更清楚。

### 使用依赖注入组合能力

```js
class UploadService {
  constructor({ transport, retry, logger }) {
    this.transport = transport;
    this.retry = retry;
    this.logger = logger;
  }

  async upload(file) {
    return this.retry.run(async () => {
      this.logger.info('upload:start', { name: file.name });
      const result = await this.transport.send(file);
      this.logger.info('upload:done', { name: file.name });
      return result;
    });
  }
}
```

`UploadService` 不需要继承 `RetryService`、`LoggerService` 和 `TransportService`。它只需要声明自己依赖哪些能力。

组合的好处是：

- 每个能力可以独立替换和测试；
- 不需要制造很深的类型层级；
- 不会因为父类新增一个方法而影响所有子类；
- 运行时依赖关系更直接。

### mixin 是折中方案，不是默认答案

JavaScript 可以通过返回子类的函数实现 mixin：

```js
const WithRetry = (Base) =>
  class extends Base {
    async runWithRetry(task, retries = 2) {
      let lastError;

      for (let index = 0; index <= retries; index += 1) {
        try {
          return await task();
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError;
    }
  };

class BaseTask {}
class RetryableTask extends WithRetry(BaseTask) {}
```

它可以把一组方法加入类层级，但也会让调试栈、类型推断和方法来源变得更复杂。只有框架扩展点明确要求类继承时，才值得考虑 mixin；普通业务能力优先使用对象组合。

## 原型链的工程注意事项

### 不要动态修改已经投入使用的原型链

`Object.setPrototypeOf()` 可以修改已有对象的 `[[Prototype]]`，但引擎通常会根据对象结构优化属性访问。运行过程中更换原型，可能让已有优化失效，并影响相关对象的属性读取性能。

如果确实需要原型关系，尽量在对象或类创建阶段一次确定：

```js
const child = Object.create(parent);
```

而不是对象使用一段时间后再修改：

```js
Object.setPrototypeOf(child, parent);
```

### 不要扩展原生对象原型

除非是在实现标准兼容补丁，否则不要随意写：

```js
Array.prototype.first = function () {
  return this[0];
};
```

这会影响整个运行环境中的数组，可能与未来标准、第三方库和枚举逻辑冲突。普通工具函数、独立模块或子类通常更安全。

### 避免过深的继承层级

原型链过深不只是性能问题，更主要的是维护成本：一个方法可能来自四层父类，父类又依赖受保护状态，修改时很难判断影响范围。

如果需要频繁回答“这个方法到底从哪来的”，通常说明继承层级已经过深，应该考虑把能力拆成组合对象。

## ES5 和 ES6 继承的差异，应该这样理解

旧文章常用下面两句话概括：

```text
ES5 先创建子类 this，再调用父类修改 this。
ES6 先由父类创建 this，再由子类继续初始化。
```

这个方向大体正确，但可以说得更准确。

### 函数构造器模式

```js
function Child() {
  Parent.call(this);
}
```

`new Child()` 已经创建了一个以 `Child.prototype` 为原型的对象，并把它作为 `this` 传入 `Child`。`Parent.call(this)` 只是把普通函数 `Parent` 的初始化逻辑应用到现有对象上。

### 派生类模式

```js
class Child extends Parent {
  constructor() {
    super();
  }
}
```

派生构造函数在进入时没有可用的 `this`。`super()` 会按构造调用语义调用父类，并结合当前 `new.target` 得到正确的派生实例，然后初始化 `this`。

这个差异让内建对象继承、返回对象的构造函数以及类字段初始化能够按统一规则工作。它不只是“把 `Parent.call(this)` 换成 `super()`”。

## 总结

现在再看 JavaScript 继承，不需要继续死记七套模板。

可以把核心收敛成下面几点：

1. JavaScript 继承的基础是原型链，属性查找是委托，不是复制。
2. `Object.create(proto)` 创建一个以 `proto` 为原型的新对象，不是浅拷贝，也不会执行构造函数。
3. `Parent.call(this)` 只复用初始化逻辑，不会自动继承 `Parent.prototype` 上的方法。
4. 旧构造函数项目中，`call` 加 `Object.create(Parent.prototype)` 是较完整的继承方案。
5. `constructor` 是可覆盖的普通属性，不适合作为可靠类型判断或通用克隆入口。
6. `class` 建立在原型机制上，但还定义了严格模式、不可枚举方法、派生构造、静态继承、类字段和私有字段等语义。
7. `extends` 同时建立实例侧和静态侧两条原型链。
8. 派生类必须先通过 `super()` 初始化 `this`，`super.method()` 调用时的 `this` 仍是当前实例。
9. 父类的 `#private` 字段对子类也不可见；JavaScript 原生没有同等语义的 `protected` 字段。
10. 继承适合稳定的“是一个”关系，缓存、重试、日志、权限等正交能力通常更适合组合。

写到这里，所谓七种继承方式就不再是七道背诵题了。它们更像 JavaScript 从对象委托、函数构造器走到现代类语法的一条演进路线。新项目优先使用清晰的 `class` 或对象组合；读懂旧代码时，再回到构造函数和原型链分析即可。

## 参考文章

- [ECMAScript Language Specification：Class Definitions](https://tc39.es/ecma262/multipage/ecmascript-language-functions-and-classes.html#sec-class-definitions)
- [ECMAScript Language Specification：Object.create](https://tc39.es/ecma262/multipage/fundamental-objects.html#sec-object.create)
- [MDN：Inheritance and the prototype chain](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain)
- [MDN：Using classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes)
- [MDN：super](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super)
- [MDN：Private elements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_elements)
- [MDN：Object.prototype.constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor)
