---
title: 一句 hi，为什么让 Codex 吃掉 14770 个输入 token：逐字段拆解一次真实请求
slug: codex-hi-14770-input-tokens
publishedAt: 2026-04-10T18:28
summary: 基于真实的 request.json 和 response.txt，拆开 Codex 在收到一句 hi 后到底背了多少前缀、工具和仓库上下文，也解释为什么一轮问候看着很轻，实际并不便宜。
image: https://img.huzhihui.com/uploads/2026/04/codex-hi-14770-input-tokens-banner_dhyrddc1hkgk.png
keywords:
  - Codex
  - Token
  - Agent
  - Prompt Cache
  - Response API
  - JSON
tags:
  - Codex
  - Token
  - Agent
  - Prompt
  - 工具调用
---

我一开始真以为这是个很轻的问题。

用户只发了两个字符：

```json
{
  "role": "user",
  "content": [
    {
      "type": "input_text",
      "text": "hi"
    }
  ]
}
```

## 图 1：用户输入截图

![Codex 里真正的用户输入只有一句 hi](https://img.huzhihui.com/uploads/2026/04/b4ae77dd6dd20b071f8fdb2ef31e34c17451f60e5368a4e77676ed1a892fa4f9_dhynutpynywa.png)

上面这张图摆得很直白：聊天框里真的只有一句 `hi`。

结果这一轮最后的 usage 是：

```json
{
  "input_tokens": 14770,
  "input_tokens_details": {
    "cached_tokens": 6400
  },
  "output_tokens": 51,
  "output_tokens_details": {
    "reasoning_tokens": 35
  },
  "total_tokens": 14821
}
```

## 图 2：Charles 抓包截图

![Charles 抓到的请求样本，真正送进模型的是一整个 agent 请求包](https://img.huzhihui.com/uploads/2026/04/b4d13db4d9b4775132765c9d412b484064af86dad1da05abe89afb333c45226f_dhynuzretxs0.png)

而抓包一看，事情就完全不是“用户说了一句 hi”这么简单了。

也就是说，聊天框里你看到的是 `hi`，模型真正收到的不是。

它收到的是一整套 agent 运行时。

如果你想对着原始样本一起看，这两份文件就在这里：

- [request.json](https://img.huzhihui.com/uploads/2026/04/request_314m3e8k5myhm.json)
- [response.txt](https://img.huzhihui.com/uploads/2026/04/response_3a6bcktvk5ejm.txt)

注意第二个文件故意是 `txt`，不是 `json`。因为它本质上是一条 SSE 事件流，不是一整个干净的 JSON 对象。

## 先给结论

这 14770 个输入 token，绝大多数都不是花在那句 `hi` 上的。

真正贵的是这些东西：

1. 很长的 `instructions`
2. repo 和环境上下文
3. 工具 schema
4. 模型在决定“要不要调工具”之前那一轮隐藏推理

说白了，这一轮最贵的不是回答，而是让模型先重新进入 “Codex 模式”。

## 先看 request 顶层

这份 `request.json` 顶层 key 很短，但已经够说明问题：

```json
[
  "include",
  "input",
  "instructions",
  "model",
  "parallel_tool_calls",
  "prompt_cache_key",
  "reasoning",
  "store",
  "stream",
  "text",
  "tool_choice",
  "tools"
]
```

我把关键字段压成一个更容易读的摘要，大概是这样：

```json
{
  "model": "gpt-5.4",
  "instructions_len": 14667,
  "input_count": 3,
  "tool_count": 12,
  "reasoning": {
    "effort": "xhigh"
  },
  "text": {
    "verbosity": "low"
  },
  "tool_choice": "auto",
  "parallel_tool_calls": true,
  "include": ["reasoning.encrypted_content"],
  "stream": true,
  "prompt_cache_key": "019d6ffe-16ee-7731-a879-14646c2be93a",
  "store": false
}
```

再补三组尺寸数据，重量感会更直观一点：

```json
{
  "request_file_bytes": 66027,
  "input_json_len": 21346,
  "tools_json_len": 19099
}
```

一个 `hi` 背后，先塞进去了一个 66KB 的请求包。

这事到这已经不用猜了。

## `instructions` 才是第一层上下文税

这份请求里，`instructions` 长度是 `14667`。

而且它不是一句简单的 system prompt。里面塞的是一整套 agent 规矩：

- 你是谁
- 你怎么说话
- 什么时候要查代码
- 什么时候该调工具
- 什么命令能跑，什么命令要升级权限
- 最终回答怎么写
- 中间过程怎么同步给用户

也就是说，模型在看到 `hi` 之前，先得把这套“工作手册”读一遍。

这就是 agent 模式和普通聊天模式最不一样的地方。

普通聊天模型拿到的是一句话。  
Codex 拿到的是一句话前面先挂满一层操作系统。

## `input` 里排在 `hi` 前面的东西，才是真大头

这次 `input` 一共有 3 条消息。

结构大概是这样：

```json
[
  {
    "role": "developer",
    "content_count": 3,
    "content": [
      { "type": "input_text", "text_len": 9273 },
      { "type": "input_text", "text_len": 996 },
      { "type": "input_text", "text_len": 7456 }
    ]
  },
  {
    "role": "user",
    "content_count": 2,
    "content": [
      { "type": "input_text", "text_len": 2525 },
      { "type": "input_text", "text_len": 207 }
    ]
  },
  {
    "role": "user",
    "content_count": 1,
    "content": [{ "type": "input_text", "text_len": 2 }]
  }
]
```

关键点就一句：

`hi` 是最后才挂上去的。

前面那两条更重。

### 第一条 `developer`

第一条最厚，三段加起来已经非常夸张。

- `9273` 字符是权限、沙箱、命令执行规则
- `996` 字符是协作模式和交互限制
- `7456` 字符是 skills 说明和使用规则

这里最值得注意的是第三段。

很多人以为 skill 只是 UI 里一个开关。不是。至少在这份样本里，它就是实打实注入 prompt 的使用手册。skill 名称、描述、触发规则、路径、工作流，全都在里面。

所以“skill 越多越强”这句话，只说对了一半。

另一半是：

skill 越多，前缀越厚。

### 第二条 `user`

第二条也不是日常聊天，而是 repo context。

它里面包括：

- 仓库规则
- `AGENTS.md`
- 当前工作目录
- shell
- 日期
- 时区

也就是说，模型拿到的不是抽象的“有人跟我说 hi”，而是：

> 在一个具体仓库、具体 cwd、具体 shell、具体日期里，有人说了 hi。

这就是 repo-aware agent 的成本来源之一。

### 第三条才是真正的用户输入

最后一条才轮到：

```json
{
  "role": "user",
  "content": [
    {
      "type": "input_text",
      "text": "hi"
    }
  ]
}
```

所以这轮请求的真实顺序是：

1. 先把 Codex 的行为规则装进去
2. 再把仓库和环境塞进去
3. 最后才把 `hi` 追加进去

这样一看，14770 就不奇怪了。

## 工具没调，不代表工具没参与成本

这次请求注册了 `12` 个工具。

光列名字就能看出来，它不是轻聊天配置：

```json
[
  "exec_command",
  "write_stdin",
  "update_plan",
  "request_user_input",
  "apply_patch",
  "view_image",
  "spawn_agent",
  "send_input",
  "resume_agent",
  "wait_agent",
  "close_agent"
]
```

这里真正重的不是“工具数量”，而是“工具说明有多长”。

按 JSON 长度看，前几名是：

| 工具                 | `json_len` | `desc_len` |
| -------------------- | ---------: | ---------: |
| `spawn_agent`        |       9989 |       6187 |
| `exec_command`       |       2121 |         82 |
| `send_input`         |       1494 |        215 |
| `request_user_input` |       1355 |        120 |
| `apply_patch`        |        838 |        100 |

`spawn_agent` 这一项几乎自己就撑起了一大块。

原因也不复杂。它不只是一个函数签名，后面还跟着一整套代理协作规则：什么时候能开子代理，什么时候不能偷懒 delegation，什么时候该并行，什么时候不该等。

所以别只盯着“这轮有没有调工具”。

很多时候，贵在工具真正调用之前。  
只要 schema 已经挂进 prompt，成本就已经开始算了。

## response 也挺有意思，它不是一个整包 JSON

这次的响应文件叫 [response.txt](/assets/json/codex/response.txt)，不是 `response.json`，因为它从头到尾就是一串 SSE 事件：

```text
response.created
response.in_progress
response.output_item.added
response.output_item.done
response.output_item.added
response.content_part.added
response.output_text.delta
response.output_text.delta
response.output_text.delta
response.output_text.delta
response.output_text.delta
response.output_text.delta
response.output_text.delta
response.output_text.delta
response.output_text.delta
response.output_text.delta
response.output_text.done
response.content_part.done
response.output_item.done
response.completed
```

这条链路很值钱，因为它把一个看着很普通的回复拆开给你看了。

### 先出来的不是答案，是 `reasoning`

中间有一段 `output_item.added`，类型是 `reasoning`，里面带了 `encrypted_content`。

这说明哪怕最后只回了一句问候，模型也先过了一轮内部推理。只是客户端拿到的是密文，不是可读版。

这个点很关键。

它直接说明：

> 没有工具调用，不等于没有工具决策。

这轮只是决策结果刚好是“不需要工具”。

### 后出来的才是最终消息

真正给用户看的文本，是后面一串 `response.output_text.delta` 拼出来的：

```json
{ "delta": "Hi" }
{ "delta": "!" }
{ "delta": " What" }
{ "delta": " would" }
{ "delta": " you" }
{ "delta": " like" }
{ "delta": " to" }
{ "delta": " work" }
{ "delta": " on" }
{ "delta": "?" }
```

最后收口成一句完整的话：

```json
{
  "text": "Hi! What would you like to work on?"
}
```

也就是说，前端看到的那句问候，前面其实还有一层你没直接看到的“判断过程”。

## usage 才是最狠的证据

再看一遍结尾的 usage：

```json
{
  "input_tokens": 14770,
  "input_tokens_details": {
    "cached_tokens": 6400
  },
  "output_tokens": 51,
  "output_tokens_details": {
    "reasoning_tokens": 35
  },
  "total_tokens": 14821
}
```

这几项里最扎眼的是三处。

### `input_tokens = 14770`

这不是 `hi` 的成本。

这是：

- system / developer instructions
- repo context
- environment context
- tools schema
- 当前用户输入

一起打包之后的成本。

### `cached_tokens = 6400`

平台已经在帮你省了。

这意味着系统前缀、工具说明、固定规则里有相当一部分走了缓存。不然同样一轮问候会更贵。

从这个角度看，prompt cache 不是锦上添花，是 agent 模式里非常实际的成本开关。

### `reasoning_tokens = 35`

最后只回一句 `Hi! What would you like to work on?`，但内部还是花了 35 个 token 做推理。

这也就解释了为什么很多 agent 看起来“没干啥”，usage 却并不轻。

因为它至少先判断了一轮自己该不该干啥。

## 我最后的判断

看完这两份样本，我更确定一件事：

Codex 最贵的地方，不在回答，而在启动。

更准确一点说，不在“说了什么”，而在每一轮都要先重新完成这些事：

1. 读规则
2. 读仓库
3. 读工具
4. 判断边界
5. 再决定这轮到底要不要动手

所以你想优化 agent 成本，别只盯输入框里那句话。

真正该盯的是：

- skill 说明是不是太长
- 工具 schema 是不是太胖
- repo 注入是不是太多
- 哪些固定前缀能吃缓存
- 哪些规则其实没必要每轮都带

一句话收尾吧。

你以为你给 Codex 发的是 `hi`。  
实际上你先花了一大段上下文，把它重新变成了 Codex。
