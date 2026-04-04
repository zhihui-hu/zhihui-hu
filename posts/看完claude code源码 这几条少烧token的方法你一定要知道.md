---
title: 看完claude code源码 这几条少烧token的方法你一定要知道
slug: claude-code-token-saving-must-know
publishedAt: 2026-04-04
summary: 看完 Claude Code 源码之后，我更想聊的不是彩蛋，而是普通程序员和用户到底怎么更省钱地用它。这篇直接按方法展开，最后拿数据算账。
keywords:
  - Claude Code
  - 省钱
  - token
  - MCP
  - prompt cache
  - AI 编程
tags:
  - 省钱
  - Claude Code
  - AI 编程
  - Token
  - 工具使用
---

一句话先放前面。

Claude Code 最烧 token 的，不是你问的那一句话。

而是每一轮都会被重新带上的前缀、工具、历史消息和大结果。

源码其实已经把这件事写明了。`src/utils/queryContext.ts:30-44` 直接说明每轮请求前要先拿 `systemPrompt`、`userContext`、`systemContext`；`src/services/api/claude.ts:1405-1408` 直接写了中途切动态 header 可能打穿 `~50-70K tokens`；`src/constants/toolLimits.ts:13` 又把单个 tool result 限在 `50,000` 字符，超过就落盘，因为大结果继续留在上下文里就是持续烧。

所以这篇不聊彩蛋。

直接聊怎么省。

## 第一件事，别把一个会话用成垃圾堆

很多人用 Claude Code，有个非常常见的习惯。

一个线程从早聊到晚。

中间任务变了，继续聊。

模型想换一下，切。

thinking 想试一下，切。

工具不够了，再挂。

这个用法乍一看很顺。

细看很贵。

源码里有一行注释几乎是直接把话说完了。`src/services/api/claude.ts:1405-1408` 写着，某些动态 header 如果在 session 中途切换，会直接 “bust ~50-70K tokens”。

这不是“会不会稍微多一点”。

这是几万 token 级别的白送。

Claude Code 为什么还专门做 sticky-on latch，为什么又搞 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY`，再让 `src/utils/api.ts:321-388` 去切静态前缀和动态后缀，说白了就一件事：

它很怕你把前缀搞抖了。

别这么用：

- 一个长会话里来回切模型、thinking、fast mode。
- 已经从 A 任务聊到 B 任务了，还继续往下接。
- 跑到一半再频繁改系统角色、工具集、MCP 组合。

更省的用法：

- 一个会话只打一个主任务。
- 会话开始前把模型、thinking、工具集尽量定住。
- 任务变题了，别恋战，开新线程。

这条听起来像习惯问题。

但很多时候，最贵的就是习惯问题。

## 第二件事，长日志别整段糊进去

这个坑真的太常见了。

报错了。

复制一整段构建日志。

直接扔给 Claude Code。

然后还会补一句：“你帮我看看。”

问题是，这种东西一旦进上下文，不是只花这一次。

后面每一轮都可能继续背着跑。

Claude Code 源码在这件事上非常现实。`src/constants/toolLimits.ts:13` 把单个 tool result 的默认上限卡在了 `50,000` 字符。超过这个值，就走 `src/utils/toolResultStorage.ts:137-183` 的落盘逻辑。`src/utils/toolResultStorage.ts:108-109` 又把 preview 卡在了 `2000` byte。

再配合 `src/services/tokenEstimation.ts:203-208` 的粗估规则 `length / 4`，一段 `50,000` 字符的日志，如果换成一个 `2000` byte 左右的 preview，大概就是：

`(50,000 - 2,000) / 4 ≈ 12,000 token`

这还是单条。

`src/constants/toolLimits.ts:35-49` 还专门防了并行工具一起回大结果，单条用户消息里的聚合上限是 `200,000` 字符。注释里那个例子很直，`10 × 40K = 400K`。

也就是说，Claude Code 自己都知道，大结果这种东西不能惯着。

别这么用：

- 报错一来，整段日志直接贴。
- 明明只需要最后几百行，硬喂全文。
- 大文件、大 diff、不筛选直接全量进上下文。

更省的用法：

- 先给错误关键词。
- 先给最后 100 到 200 行。
- 先给相关文件路径、函数名、提交差异。
- 真需要全文，让 Claude Code 自己去读，不要手动整段塞进去。

不是不能给日志。

是别一上来就梭哈。

## 第三件事，MCP 和 skills 不是免费挂件

这个点很多人会低估。

因为平时感觉不到。

挂一个 MCP。

再挂一个。

反正以后可能用得到。

但模型不会因为你“以后可能用到”就少看它一眼。它每轮都得把这些工具描述、MCP instructions、skill frontmatter、agent 说明重新吞一遍。

源码里有个数字很能说明问题。

`src/tools/AgentTool/prompt.ts:48-57` 和 `src/utils/attachments.ts:1478-1485` 都写了，动态 agent list 曾经吃掉过大约 `10.2%` 的 fleet `cache_creation tokens`。就因为这个，后面才把 agent list 从 tool description 里挪去了 attachment。

你想一下。

连 agent 列表这种很多人眼里的“说明文”都能吃掉一成以上的 cache creation。

那 MCP instructions、tool schema 这些东西就更不可能是空气。

这也是为什么我看完源码后一个很强的感受是：

很多人不是在用更多功能。

是在交更多前缀税。

别这么用：

- 一个小任务也挂整套 MCP 全家桶。
- 这次根本用不到的 tools 也先开着。
- 轻任务也背着一堆 skills、agents、外部工具说明跑。

更省的用法：

- 按任务挂，不按焦虑挂。
- 查后端问题，就挂后端相关的。
- 看前端渲染，就挂前端相关的。
- 真用到了再补，不要先把 buffet 摆满。

表面上像留后手。

实际上常常是给前缀加厚。

## 第四件事，多 agent 不是多开就行，你得会 fork

很多人已经习惯多 agent 了。

这没问题。

问题是，很多人一开多 agent，就默认把上下文复制几份一起跑。

这样不一定省。

从 Claude Code 源码看，多 agent 真正值钱的地方，不是“并发”本身。

而是共享 cache，隔离噪音。

`src/utils/forkedAgent.ts:46-56` 直接把 cache key 的核心组成写出来了：`system prompt`、`tools`、`model`、`messages prefix`、`thinking config`。紧接着 `src/utils/forkedAgent.ts:96-101` 又提醒了一次，fork 一旦乱改 `maxOutputTokens`，thinking config 也可能跟着变，cache-sharing 就没了。

`src/tools/AgentTool/prompt.ts:85-91` 也写得很直白：fork 便宜，是因为它共享 prompt cache；别中途去偷看 fork 的 transcript，不然你又把工具噪音拉回主线程了。

这里面真正值钱的，不是“再开一个 agent”。

而是“别把中间过程全带回来”。

别这么用：

- 一边 fork，一边改模型。
- 一边 fork，一边追着看中间 transcript。
- 想隔离噪音，结果又亲手把噪音捞回主线程。

更省的用法：

- 研究类、搜索类、开放式排查，优先 fork。
- 边界清楚的次要任务，也适合 fork。
- fork 以后少看过程，等结果回来再接。

不然你看着像多线程。

其实是在双倍交税。

## 第五件事，`CLAUDE.md` 和记忆文件别写成项目族谱

这个也很容易越写越过头。

很多人给 Claude Code 配项目规则，写法都很像企业规章制度。

越全越好。

越细越安心。

结果就是，会话一长，token 也开始慢慢漏血。

Claude Code 在这件事上其实非常克制。`src/utils/attachments.ts:269-288` 直接把线卡死了：

- 单个 memory 文件最多 `200` 行
- 单个 memory 文件最多 `4096` 字节
- 单个 session 的相关记忆累计最多 `60 * 1024` 字节

更关键的是，源码注释里还写了，相关 memory 在生产里观察到会累到 `~26K tokens/session`。

也就是说，Anthropic 自己都不敢把记忆当免费外挂。

这其实很说明问题。

记忆当然有用。

但长记忆如果不分层、不限长、不按触发条件进来，很快就会从“帮你省事”变成“每轮重发旧事”。

别这么用：

- 一个 `CLAUDE.md` 写成百科全书。
- 高频、低频规则全塞在顶层。
- 任何任务都注入同一份超长总纲。

更省的用法：

- 按目录拆。
- 按角色拆。
- 按触发条件拆。
- 高频规则写短。
- 低频规则别老放在最上层。

你那份 3000 行项目总纲，看着像护城河。

很多时候其实是固定税。

## 第六件事，感觉会话已经养肥了，就别硬聊

很多人把开新线程理解成认输。

其实真不是。

Claude Code 自己都不相信一个超长 session 一路跑到底就是最优解。`src/services/compact/autoCompact.ts:28-30` 专门给 compact 摘要预留了 `20,000` token 输出空间，`src/services/compact/autoCompact.ts:62-65` 又留了 `13,000` 的 autocompact buffer 和 `20,000` 的 warning/error buffer。

这说明它的思路根本不是：

先堆。

堆到爆了再说。

而是：

提前治理。

很多人真实的问题，不是不会 compact。

是明明已经知道该分线程了，还舍不得。

别这么用：

- 任务目标已经变了，还继续在原线程里硬聊。
- 前面的试错已经没参考价值了，还舍不得丢。
- 会话已经明显养肥了，还想一把跑到底。

更省的用法：

- 任务变题了，就整理一个短摘要，开新线程。
- 旧线程留结论，新线程只带必要背景。
- 把“分线程”当成省 token 动作，不要当成失败动作。

这一步很多人舍不得。

但讲真，经常是最划算的一步。

## 我如果继续改这套架构，会先补这三刀

我自己的判断其实很简单。

Claude Code 在 token 这件事上的大方向，我觉得是对的。

它已经很明显在往“上下文治理系统”这个方向走，而不是单纯做一个会聊天的模型壳。

但如果让我继续补，我会先补三刀。

第一刀，把“这一轮为什么变贵”直接做成可视化。

不是只给一个总 token。

而是直接告诉用户：

- 这轮多了多少是 tools
- 多少是 MCP
- 多少是日志
- 多少是 memory
- 为什么 cache miss 了

第二刀，把按需挂载做得再激进一点。

现在它已经在想办法把动态 agent list 从 tool description 里拿出去。

那下一步很自然：更多 MCP、skills、甚至部分 tool schema，能不能真做到用到再挂，而不是先摆全家桶。

第三刀，让系统更主动地提醒用户“现在该分线程了”。

因为很多成本问题，本质不是回答太长。

是任务已经变题了，但用户还在原线程里硬撑。

这类提醒如果做得好，能帮普通用户少掉一大截无效 token。

## 最后拿一个最常见的排错场景算一笔账

比如你让 Claude Code 帮你排一次 CI 构建失败。

最贵的用法，其实很典：

- 在一个已经聊很久的会话里继续追问
- 中途切一次影响 cache key 的模式
- 直接贴一整段很长的构建日志
- 还挂着一堆这次其实用不上的 MCP 和技能

如果按源码里已经写明的数字来算，这种用法是真的烧。

先看第一刀。

`src/services/api/claude.ts:1405-1408` 写了，中途切某些动态 header，可能直接打穿 `~50-70K tokens` 的 prompt cache。

再看第二刀。

长日志如果你直接整段喂，假设是 `50,000` 字符；如果你先筛，再让 Claude Code 读一个 `2000` byte 左右的 preview，按 `src/services/tokenEstimation.ts:203-208` 的粗估规则，差不多就是：

`(50,000 - 2,000) / 4 ≈ 12,000 token`

两刀加起来，单次排错里就已经是：

`62K - 82K token`

这还没算长期记忆那笔账。

`src/utils/attachments.ts:279-288` 里写了，相关 memory 在生产里观察到能累到 `~26K tokens/session`。

更省的用法其实没那么玄：

- 模式别乱切，别把 prompt cache 打穿。对应 `src/services/api/claude.ts:1405-1408`
- 长日志先削再喂，别一上来整段糊进去。对应 `src/constants/toolLimits.ts:13`、`src/utils/toolResultStorage.ts:108-109`、`src/utils/toolResultStorage.ts:137-183`
- 无关 MCP 不要全挂，别给前缀白白加税。对应 `src/tools/AgentTool/prompt.ts:48-57`、`src/utils/attachments.ts:1478-1485`
- 会话变题就开新线程，别把一个 session 聊成垃圾堆。对应 `src/services/compact/autoCompact.ts:28-30`、`src/services/compact/autoCompact.ts:62-65`
- 记忆文件写短一点，别搞成百科全书。对应 `src/utils/attachments.ts:269-288`

那你不是省了一点点。

而是在避免那种最冤的花法。
