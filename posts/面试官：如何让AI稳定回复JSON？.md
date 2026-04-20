---
title: 面试官：如何让AI稳定回复JSON？
slug: how-to-make-ai-return-stable-json
image: https://img.huzhihui.com/uploads/2026/04/how-to-make-ai-return-stable-json-banner_dhxrudm12vag.png
publishedAt: 2026-04-15T17:44
summary: 这题真正难的，不是说一句“请严格返回 JSON”，而是把大模型为什么天然不稳定、ChatGPT 的 `json_schema` 和 `strict: true` 底层怎么做，以及线上系统该怎么兜底，顺着一轮面试追问讲清楚。
keywords:
  - AI 输出 JSON
  - 结构化输出
  - JSON Schema
  - constrained decoding
  - ChatGPT JSON
  - OpenAI structured outputs
  - Function Calling
tags:
  - AI
  - JSON
  - 结构化输出
  - ChatGPT
  - OpenAI
  - 工程实践
---

![面试官：如何让AI稳定回复JSON？头图](https://img.huzhihui.com/uploads/2026/04/how-to-make-ai-return-stable-json-banner_dhxrudm12vag.png)

这题如果真放到面试里，难点从来不是 `prompt`。

难点是，面试官一句“如何让 AI 稳定回复 JSON”，后面其实能顺着追四五层：

- 模型原理懂不懂
- 结构化输出和普通文本生成有没有分清
- `OpenAI` 的 `json_schema`、`strict: true` 是不是只会背参数名
- 真落地时，系统该怎么设计

所以这篇不按“知识点罗列”写。

直接按一轮更像真实现场的追问来写。

## 面试官：如何让AI稳定回复JSON？

先给短答。

只靠一句“请严格返回 JSON”不够。

更稳的做法通常是四层一起上：

1. prompt 说明输出目标
2. 开启 `JSON mode` 或 `json_object`
3. 能上 `JSON Schema / Structured Outputs` 就上
4. 结果进入业务前，必须做本地校验、失败重试和日志留存

如果业务已经是生产环境，那重点通常已经不是“让它像 JSON”。

而是：

**让它返回一个能被程序安全消费的结构化结果。**

## 面试官：为什么你一上来就说 prompt 不够？

因为 prompt 本质上是软约束。

它是在提醒模型，不是在限制模型。

模型会尽量配合，但不会因为你多写了一句“严格”就从语言模型变成解析器。

这时候面试官通常还会继续追。

## 面试官：那从模型原理讲，为什么大模型天生不擅长稳定输出 JSON？

这个问题最好从神经网络的演进讲。

早期神经网络，像感知机、`MLP`、`CNN`，主要做分类和回归。
它们的输出空间是固定的。

二分类就是两个值。
回归就是一个数。

这种模型不会“多说一句废话”，因为它根本不在生成自然语言。

真正的变化从 `RNN`、`LSTM`、`Seq2Seq` 开始。

从这时候起，模型开始变成一种序列生成系统：

1. 看前文
2. 预测下一个 token 的概率分布
3. 选一个 token
4. 把这个 token 接回上下文，继续下一步

到了 `Transformer` 和今天的大语言模型，规模变大了，能力变强了，但底层目标没变：

> 根据前文，预测下一个 token。

这句话其实就是整个结构化输出问题的源头。

因为 `JSON` 在模型眼里，首先不是一棵必须合法的语法树。

它首先是一串经常一起出现的 token 模式。

所以模型当然会“像 JSON”。
但它天然不是 `JSON.stringify()`。
也不是语法解析器。

这就解释了为什么它会：

- 在前后多说一句解释
- 把 `18` 写成 `"18"`
- 漏掉必填字段
- 多生出一个字段
- 枚举值自己发挥
- 输出一半截断

不是它不认识 JSON。

而是“按概率生成下一个 token”和“严格服从结构约束”，本来就不是同一种任务。

## 面试官：那为什么 prompt 明明已经写得很细了，还是会翻车？

因为自然语言约束会和别的目标一起竞争。

模型在同一轮里，通常会同时试图满足这些事：

- 回答得像一个正常助手
- 语义上跟前文连贯
- 尽量满足你说的格式要求
- 不确定的时候补一个看起来合理的答案

所以纯 prompt 场景最常见的状态就是：

**方向对，细节总歪一点。**

这也是为什么，工程上真正有用的思路不是“把 prompt 写得更凶”，而是“逐层把软约束换成硬约束”。

## 面试官：那你怎么给这个问题分层？

可以把常见方案分成四层：

| 层级 | 机制                             | 它在解决什么          | 它还解决不了什么       |
| ---- | -------------------------------- | --------------------- | ---------------------- |
| 1    | Prompt                           | 让模型知道你想要 JSON | 不能强制合法           |
| 2    | JSON mode / `json_object`        | 让输出更像 JSON       | 不能保证 strict schema |
| 3    | JSON Schema / Structured Outputs | 约束字段、类型、枚举  | 仍然需要本地校验       |
| 4    | Tool Calling / Function Calling  | 直接输出函数参数对象  | 业务正确性还是你的责任 |

这四层里，真正的分水岭在第三层。

因为从这里开始，问题已经不是“像不像 JSON”。

而是“能不能被 schema 约束住”。

## 面试官：那 OpenAI 这条线为什么现在最常被拿出来讲？

因为截至 `2026-04-15`，OpenAI 在官方文档里把这条链路讲得最完整。

公开入口主要有两个：

- `response_format: json_schema`
- 工具定义里的 `strict: true`

如果面试只停在这里，其实还不够。

更关键的是后面这句：

**这不是简单的“返回后再校验一下”，而是在生成阶段就开始约束。**

## 面试官：具体一点，`json_schema` 和 `strict: true` 底层到底怎么做到？

可以拆成三层。

### 第一层：先让模型学会“理解 schema”

OpenAI 官方在 [Introducing Structured Outputs in the API](https://openai.com/index/introducing-structured-outputs-in-the-api/) 里明确讲过，他们先通过训练，让模型更擅长理解复杂 schema。

这意味着模型本身得先懂这些概念：

- `required`
- `enum`
- `additionalProperties`
- 对象和数组的嵌套关系

没有这层能力，后面就算加硬约束，模型也容易在边界附近乱撞。

### 第二层：真正关键的是 constrained decoding

这才是最值钱的地方。

OpenAI 在同一篇技术文里明确提到，为了提高结构化输出的可靠性，推理阶段用了 **constrained decoding**。

可以把它理解成这样：

1. 先把 `JSON Schema` 预处理成可执行的语法约束
2. 每生成一个 token，都先看“在当前前缀下，哪些 token 还是合法的”
3. 不合法的 token 直接被 mask 掉
4. 模型只能在合法 token 里继续选

写成伪代码，大概就是：

```ts
for (step of generation) {
  const logits = model.forward(context);
  const validTokens = grammar.allowedNextTokens(prefix, schema);
  const maskedLogits = maskOutInvalid(logits, validTokens);
  const nextToken = sample(maskedLogits);
  prefix += nextToken;
}
```

这和 prompt 完全不是一个层级的东西。

prompt 是“最好这样做”。
`constrained decoding` 是“不允许那样做”。

比如当前前缀已经生成到：

```json
{"status":
```

这时候下一步就不可能随便跳出一段自然语言。

如果已经生成到：

```json
{"status":"`
```

而 schema 又规定 `status` 只能是 `"ok"` 或 `"failed"`，那后面的可选路径只会沿着这两个枚举值继续收窄。

这就是为什么 `strict` 模式和普通 `json_object` 不是一个层级。

后者更像“尽量长成 JSON”。
前者是“从生成过程就把你卡在 schema 里面”。

### 第三层：为什么官方会特别提 CFG

OpenAI 技术文里还讲了一个很关键的点。

他们不是单纯拿正则去修补 JSON，而是把 schema 编译成更接近 `CFG` 的约束形式。

原因很直接。

JSON 是可以递归的：

- 对象里可以嵌对象
- 数组里可以嵌对象
- 某些 schema 允许递归引用自身

这种东西不是简单正则特别擅长描述的。

所以服务端会先把 schema 预编译成后续解码能直接使用的语法工件。

这也解释了一个工程现象：

**第一次请求一个新 schema 时，通常会更慢。**

因为服务端要先做 schema 预处理和缓存，后面同 schema 请求就会快很多。

## 面试官：那 `response_format: json_schema` 和 `strict: true` 有什么区别？

这个问题其实很适合拉开层次。

可以这么答：

- `response_format: json_schema` 更像“直接给我结构化结果”
- `tools[].function.strict = true` 更像“如果你要调用这个工具，参数必须满足 schema”

也就是说，前者偏结果输出。
后者偏动作调用。

OpenAI 官方在 [Function Calling 指南](https://platform.openai.com/docs/guides/function-calling) 里还提到，工具 schema 会被注入到模型可理解的上下文格式里。

所以 `strict: true` 不是客户端拿到结果以后才检查。

它更像这样一条链路：

1. 把函数 schema 交给模型
2. 模型决定要不要调用工具
3. 一旦进入参数生成阶段，再用受约束解码把参数锁进 schema

这里需要把边界说清楚：

**“`response_format` 和 `strict: true` 共享同一类受约束解码机制”这个说法，是根据 OpenAI 官方公开技术说明做出的工程推断，不是官方逐字原话。**

但从官方文档和技术文披露的机制看，这个推断是合理的。

## 面试官：那如果换成别的模型呢？

这时候没必要现场把每一家都展开。

更自然的回答反而是：

**面试里先拿 `ChatGPT / OpenAI` 讲透就够了，其他模型按同一个框架去类比。**

类比时就看三件事：

1. 它有没有 `JSON mode`
2. 它有没有 `JSON Schema / Structured Outputs`
3. 它的 tool calling 能不能把参数稳定锁进 schema

只要这三个层级分清，后面换成别的模型，本质上都是举一反三。

## 面试官：那真让你做一个线上功能，你怎么落地？

这时候如果还只讲原理，基本就不够了。

更完整的答案，至少要把工程闭环讲出来。

### 第一步：先定 schema，再写 prompt

很多人一上来先写一大段 prompt。

更稳的顺序其实是：

1. 先定义字段
2. 定义必填项
3. 定义枚举
4. 定义可空字段
5. 决定是否允许 `additionalProperties`

schema 一旦定清楚，后面的 prompt、tool、校验逻辑才会统一。

### 第二步：按任务选模型，不要按品牌选模型

如果是在这道题的语境里，直接围绕 `ChatGPT / OpenAI` 讲就够了。

因为面试官真正想听的，通常不是一串厂商名字。

而是你有没有把这四层关系讲清楚：

- 模型生成
- schema 约束
- 工具调用
- 工程兜底

### 第三步：能上 schema 就别只靠自然语言

如果平台已经支持：

- `response_format: json_schema`
- Structured Outputs
- Tool Calling / Function Calling

那就没必要退回到“请严格返回 JSON”这种软约束路线。

### 第四步：把思考过程和结构化结果拆开

很多线上翻车并不是模型不会结构化输出。

而是把两个目标揉在了一轮里：

- 一边要求深度分析
- 一边要求最后闭嘴只回 JSON

更稳的做法通常是：

1. 先分析
2. 再输出结构化结果

或者直接让工具调用承接结构化参数。

### 第五步：本地校验是必须项

这一步不是建议，是底线。

不管用的是：

- `zod`
- `ajv`
- `jsonschema`
- `pydantic`

都要在本地再做一次验证。

最小闭环可以长这样：

```ts
const raw = await callModel();
const parsed = tryParseJson(raw);
if (!parsed.ok) return retry('json_parse_error');

const checked = schema.safeParse(parsed.value);
if (!checked.success) return retry(checked.error.message);

return checked.data;
```

### 第六步：失败要带着错误重试

真正稳的系统从来不是“一次就对”。

而是：

- parse 失败，知道为什么失败
- validation 失败，知道哪个字段失败
- 把错误信息回传给模型，再重试 1 到 2 次

这里的关键不是“重试”两个字。

关键是：

**带着具体错误信息重试。**

### 第七步：保留原始输出和日志

这一步很多团队都容易漏。

但如果不保存：

- 原始输出
- parse error
- schema error
- 重试次数
- 成功率

后面几乎没法排查到底是哪一层出了问题。

## 面试官：那最后一句你会怎么总结？

可以收得很短。

**让 AI 稳定回复 JSON，本质上不是 prompt 工程，而是约束解码加工程兜底。**

如果还要再补半句，可以补这个：

**面试里拿 `ChatGPT / OpenAI` 当主例子讲透就够了，别急着罗列一堆模型名；真正关键的是把“能输出 JSON”和“能稳定服从 schema”这两件事分清。**

这句话基本就够收尾了。

## 参考资料

- [OpenAI Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Introducing Structured Outputs in the API](https://openai.com/index/introducing-structured-outputs-in-the-api/)
