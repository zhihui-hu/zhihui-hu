---
title: OpenClaw 教程：新 Mac 从 0 配到国产 AI、飞书微信和无人值守
slug: openclaw-wechat-config-clawhub-skills-guide
image: https://img.huzhihui.com/uploads/2026/04/openclaw-wechat-config-clawhub-skills-guide-banner_dhxrvptr4j6o.png
publishedAt: 2026-04-13T18:38
summary: 这篇默认按一台全新的 macOS 机器来写，顺着更真实的上手顺序往下走：先装 OpenClaw、跑通 Gateway，再接国产 AI 和飞书微信，然后把基础配置、记忆、ClawHub Skills、配置目录和无人值守一步步配顺。
keywords:
  - OpenClaw
  - OpenClaw 教程
  - OpenClaw macOS
  - OpenClaw 国产 AI
  - OpenClaw 飞书
  - OpenClaw 微信
  - OpenClaw ClawHub
  - OpenClaw 配置目录
  - OpenClaw 无人值守
  - OpenClaw 新手教程
  - 小龙虾
tags:
  - OpenClaw
  - macOS
  - 飞书
  - 微信
  - ClawHub
  - Agent
  - 工具使用
---

![OpenClaw 教程：新 Mac 从 0 配到国产 AI、飞书微信和无人值守头图](https://img.huzhihui.com/uploads/2026/04/openclaw-wechat-config-clawhub-skills-guide-banner_dhxrvptr4j6o.png)

我自己第一次在新 Mac 上配 OpenClaw，最容易乱的不是命令。

而是顺序。

很多人一上来就先接微信、先装一堆 skill、先改一堆配置，看起来像是进度很快，实际最容易把 Gateway、模型、渠道、workspace 全搅在一起，最后整套配置像一锅小龙虾乱炖，哪层出问题都看不出来。

这篇默认你手里这台机器就是 macOS。

后面提到的 `launchd`、Homebrew、`/opt/homebrew/bin`，也都按新 Mac 的日常环境来讲。

这次主线我只抓两件最实际的事：

- 国产 AI 怎么接
- 飞书微信怎么接

别的都往后排。

这样读起来会顺很多。

## 文内导航

- [第 0 步：拿到一台新 Mac，先准备这几个东西](#step-0)
- [第 1 步：安装 OpenClaw，并把 Gateway 跑起来](#step-1)
- [第 2 步：先接一个国产 AI，把模型链路跑通](#step-2)
- [第 3 步：再接即时交流入口，先飞书后微信](#step-3)
- [第 4 步：第一批基础配置，现在就改](#step-4)
- [第 5 步：把记忆钩上，再去 ClawHub 装常用 Skills](#step-5)
- [第 6 步：这时候再回头看配置目录](#step-6)
- [第 7 步：把国产 AI 和即时交流配成长期可用](#step-7)
- [第 8 步：换新 Mac、无人值守、定时任务怎么玩](#step-8)
- 直接逛官方 Skills 商店：[clawhub.ai/skills](https://clawhub.ai/skills?sort=downloads)

<a id="step-0"></a>

## 第 0 步：拿到一台新 Mac，先准备这几个东西

先别急着装 OpenClaw。

新 Mac 第一步，把下面这几个基础环境确认一下：

- `Node.js 24`
- `git`
- Homebrew
- 你常用的终端

OpenClaw 当前官方 Getting Started 页面写得很明确：

- 推荐 `Node 24`
- `Node 22.14+` 也还能用

先确认：

```bash
node --version
git --version
brew --version
```

这一步看起来很基础。

但后面很多“像是 OpenClaw 的问题”，其实只是环境没打平。

## 先把 4 层分清，不然后面很容易串台

你可以先粗暴地把 OpenClaw 理解成 4 层：

| 层级             | 你会在哪里碰到                                       | 它负责什么                                         |
| ---------------- | ---------------------------------------------------- | -------------------------------------------------- |
| Gateway          | `openclaw gateway status`、dashboard、channels、cron | 整个运行底座。负责模型、会话、路由、调度、配置加载 |
| Workspace        | `AGENTS.md`、`MEMORY.md`、`skills/`                  | 这个 agent 的“家”，放规则、记忆、私有技能          |
| Plugin / Channel | 飞书、微信、QQ Bot                                   | 把消息入口接进来                                   |
| Skill            | `SKILL.md`、ClawHub、`openclaw skills install`       | 教 agent 怎么做事                                  |

飞书、微信这类是渠道。

ClawHub 上那些是 skill。

这层先分清，后面所有命令都会顺很多。

<a id="step-1"></a>

## 第 1 步：安装 OpenClaw，并把 Gateway 跑起来

OpenClaw 官方当前给的最短路径还是这三步：

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
openclaw onboard --install-daemon
openclaw dashboard
```

第一天我建议你就走向导。

别上来手搓配置。

因为 `openclaw onboard --install-daemon` 会顺手帮你做掉几件最麻烦的基础事：

- 初始化 `~/.openclaw`
- 选择模型提供商
- 写入基础认证
- 安装常驻 Gateway 服务

### 跑完以后，不要凭感觉，直接验

```bash
openclaw gateway status
openclaw status
openclaw logs --follow
```

默认 dashboard 一般会在：

```text
http://127.0.0.1:18789/
```

只要你能打开 dashboard，再在里面发一条消息试一下，本体这层就算通了。

### 这一层最容易漏的细节

不是安装脚本。

而是环境变量位置。

如果 Gateway 是按 daemon / launchd 方式跑的，shell 里的环境变量不一定会被它继承。所以很多人终端里明明能看到 provider 的 key，OpenClaw 还是报未认证。

更稳的做法，是把常用 key 放进：

```text
~/.openclaw/.env
```

这个细节后面会一直用到。

<a id="step-2"></a>

## 第 2 步：先接一个国产 AI，把模型链路跑通

国内用户第一次装 OpenClaw，我更建议你先接国产 AI。

原因很简单：

- 延迟更可控
- 认证路径更直接
- 后面飞书、微信接起来以后，排错不会混到一起

### 最适合先跑通的 3 条路

| 路线                   | 适合谁                   | 你该怎么理解                                     |
| ---------------------- | ------------------------ | ------------------------------------------------ |
| 官方国内 provider 直连 | 大多数个人用户、小团队   | 直接接 Qwen、ZAI、Volcengine、StepFun、Qianfan   |
| 统一模型网关           | 公司已有统一出口         | 用 LiteLLM 或自家 OpenAI-compatible 网关做总入口 |
| 本地或机房推理         | 有 GPU、重隐私或内网环境 | 用 vLLM、SGLang、Ollama 先把模型服务化           |

### 对大多数人来说，先走官方国内 provider 就够了

OpenClaw 当前官方 provider 目录里，国内比较常见的有：

- Qwen
- Z.AI / GLM
- Volcengine / Doubao
- StepFun
- Qianfan
- Moonshot / Kimi
- MiniMax

最短路径一般就是这些：

```bash
openclaw onboard --auth-choice qwen-standard-api-key-cn
openclaw onboard --auth-choice zai-cn
openclaw onboard --auth-choice volcengine-api-key
openclaw onboard --auth-choice stepfun-standard-api-key-cn
openclaw onboard --auth-choice qianfan-api-key
```

如果你问我新 Mac 第一条模型链路该怎么选，我会建议：

- 先只接一个
- 先把它跑通
- 先别一口气配五家

说白了，你现在要的不是“模型全家桶”。

你现在要的是一条稳定能回消息的链路。

### 一个很实用的小原则

**能选 `-cn` 的 auth choice，就别去碰国际入口。**

### 配完以后，记得验

```bash
openclaw models list --provider qwen
openclaw models list --provider zai
openclaw models list --provider volcengine
```

只要你能列出模型，后面再接飞书、微信，至少不会把“模型问题”和“渠道问题”混着查。

<a id="step-3"></a>

## 第 3 步：再接即时交流入口，先飞书后微信

模型先通了，下一步再接消息入口。

这里我还是建议先飞书，再微信。

不是因为微信不重要。

而是因为飞书这条线官方文档更完整，接起来更像标准流程。

### 为什么飞书适合当第一条即时交流入口

当前官方 Feishu 页面写得很清楚：

- 当前 release 里 Feishu 是 bundled plugin
- 走 WebSocket 长连接
- 不需要公网 webhook
- DM、群聊、pairing、mention 规则都比较清楚

如果你第一次接即时交流入口，飞书真的更顺。

### 飞书最短路径

1. 去 `open.feishu.cn` 创建企业自建应用
2. 拿 `App ID` 和 `App Secret`
3. 开启 Bot 能力
4. 在事件订阅里加 `im.message.receive_v1`
5. 本地跑：

```bash
openclaw channels add
```

然后选 Feishu，把密钥填进去。

配完以后先验：

```bash
openclaw gateway status
openclaw logs --follow
openclaw pairing approve feishu <CODE>
```

如果你是国际版租户，再补：

```json5
{
  channels: {
    feishu: {
      domain: 'lark',
    },
  },
}
```

### 微信为什么我还是放第二个

微信这条线不是不能接。

而是更容易把问题混起来：

- 插件安装
- 启用状态
- 登录态
- 二维码
- Gateway 重启

而且它不像飞书那样是官方文档特别完整的组织化渠道。

### 微信按当前公开插件说明的最短路径

最省事的一条命令是：

```bash
npx -y @tencent-weixin/openclaw-weixin-cli install
```

如果你想手动走：

```bash
openclaw plugins install "@tencent-weixin/openclaw-weixin"
openclaw config set plugins.entries.openclaw-weixin.enabled true
openclaw channels login --channel openclaw-weixin
openclaw gateway restart
```

然后用手机扫码。

### 如果你还想接 QQ Bot

OpenClaw 当前频道能力页已经把 QQ Bot 列在 bundled plugin 里。

但如果你是第一次在 Mac 上配 OpenClaw，我还是建议先把飞书这条路跑顺，再去碰微信和 QQ。

这样最不容易绕。

<a id="step-4"></a>

## 第 4 步：第一批基础配置，现在就改

到这里，你已经有：

- OpenClaw 本体
- 一个可用的国产 AI provider
- 一个能测的即时交流入口

这时候再开始改基础配置，顺序就对了。

我建议第一批只改 4 个地方。

### 1. `~/.openclaw/.env`

这里放所有你希望 daemon 稳定读到的 key：

```dotenv
QWEN_API_KEY=...
ZAI_API_KEY=...
VOLCENGINE_API_KEY=...
# 其他 provider key 也放这里
```

即时交流相关的敏感信息，如果你不想写死在 JSON 里，也可以用环境变量兜底。

### 2. `~/.openclaw/openclaw.json`

这里放系统级设置。

我比较喜欢新 Mac 第一版先配成这样：

```json5
{
  logging: {
    level: 'info',
  },
  agents: {
    defaults: {
      workspace: '~/.openclaw/workspace',
      timeoutMs: 1800000,
      heartbeat: {
        every: '0m',
      },
      model: {
        primary: 'zai/glm-5.1',
      },
    },
  },
}
```

这一版先别追求花。

先求稳。

### 为什么我建议第一天先把 `heartbeat` 关掉

官方 Personal Assistant Setup 页面当前明确提醒：

- heartbeat 现在默认每 30 分钟会跑一次

这在你还没把模型、skills、渠道完全调顺之前，很容易变成：

- 平白多消耗 token
- 多出一堆你看不懂的自动行为

所以我自己的习惯是：

- 第一天先把 heartbeat 设成 `0m`
- 等你确认记忆、skills、渠道、standing orders 都顺了，再开

### 3. 先把 workspace 路径定住

如果你后面准备：

- 私有 git 备份 workspace
- 新 Mac 迁移
- 多台机器共享同一份 agent 人设

那 `agents.defaults.workspace` 最好第一天就定好。

### 4. 日志级别别一上来就调太高

大部分情况下 `info` 就够用了。

真的排障时，再临时看：

```bash
openclaw logs --follow
```

别一开始就把所有东西搞成 debug 噪音。

<a id="step-5"></a>

## 第 5 步：把记忆钩上，再去 ClawHub 装常用 Skills

这一步别颠倒。

很多人喜欢先逛 ClawHub。

但我更建议先把记忆挂起来，再装 skill。

不然你装了一堆能力，agent 还是没有“这个人平时怎么做事”的稳定感。

用起来就会很像每次都在重新认识你。

## 先把记忆钩上

在 OpenClaw 里，很多人会把 3 件事混成一件事：

- `MEMORY.md`
- `memory/YYYY-MM-DD.md`
- `HEARTBEAT.md`

它们不是一回事。

### `MEMORY.md`：长期记忆

这是最值得你第一天手动建出来的文件。

它适合放长期偏好、稳定规则、已确认的决定。

一个很实用的初版可以长这样：

```md
# MEMORY

- 我平时主要用中文交流
- 我更喜欢先给结论，再展开
- 我更习惯先接国产 AI，再考虑多模型 fallback
- 我更希望即时交流入口优先走飞书，再补微信
- 需要长期记住的偏好优先写这里，不要只靠聊天记录
```

### `memory/YYYY-MM-DD.md`：每日笔记

这个适合放当天上下文：

- 今天在做什么
- 刚做过什么决定
- 某个问题现在卡在哪

### `HEARTBEAT.md`：定时唤醒时的检查单

这个不是长期记忆。

它更像一个每隔一段时间就会读的 checklist。

比如：

```md
# Heartbeat checklist

- 看一下有没有新的飞书或微信消息
- 如果是工作时间，轻量检查今天待办
- 如果任务卡住了，记下缺什么，不要硬做
```

### 真正“把记忆钩上”的最短动作

如果你只想先把记忆体系挂起来，我建议做这 3 件事：

1. 手动创建 `MEMORY.md`
2. 保留 `memory/` 目录，让 agent 自己按天写
3. 跑一次：

```bash
openclaw memory status
```

官方当前默认的 memory plugin 是 `memory-core`。

所以大多数人这一步根本不用多折腾。

## 然后再去 ClawHub 装第一批常用 Skills

现在才是逛 ClawHub 的好时机。

直接入口：

- [ClawHub Skills 商店](https://clawhub.ai/skills?sort=downloads)

### 这一层最重要的认知

skill 不是渠道。

skill 是“怎么做事”。

飞书、微信、QQ Bot 是消息入口。

ClawHub 上的是技能包。

### 第一批 skill，我建议只装 2 到 3 个

别一口气装十几个。

第一批我建议只装最贴近日常工作的：

- Git
- 你当前项目常用的数据库 / 部署类技能
- 你确实会高频用到的那一个垂直 skill

### 常用命令先记住这几个

```bash
openclaw skills search "git"
openclaw skills search --limit 20
openclaw skills info <skill-name>
openclaw skills install <skill-slug>
openclaw skills check
openclaw skills list --eligible
```

官方 Skills 文档当前写的是：

- `openclaw skills install <slug>` 会装到当前激活 workspace 的 `skills/`
- 装完以后，下一次新的 OpenClaw 会话才会把它加载进来

所以装完 skill 如果你立刻在旧会话里试，很容易误以为没生效。

<a id="step-6"></a>

## 第 6 步：这时候再回头看配置目录

到这一步你已经不是“刚装完还没跑通”的状态了。

这时候再从技术角度看 `~/.openclaw`，很多文件就不再是抽象名词。

而是你真的知道它们在干嘛。

而且如果你的受众本来就是程序员，这一段不能只停在“这是干嘛的”。

更重要的是：

- 它是不是 source of truth
- 它在什么时机被读进来
- 它改了以后是立即生效，还是要开新会话
- 它是声明式配置，还是运行时状态
- 它适不适合进 Git

## 先分清两层

- `~/.openclaw`：状态目录
- `workspace`：agent 的工作区

一个更接近实战的目录图，大概长这样：

```text
~/.openclaw/
├── openclaw.json
├── .env
├── credentials/
├── agents/
│   └── <agentId>/
│       ├── agent/
│       │   └── auth-profiles.json
│       └── sessions/
│           ├── sessions.json
│           └── *.jsonl
├── cron/
├── skills/
└── workspace/
    ├── AGENTS.md
    ├── SOUL.md
    ├── IDENTITY.md
    ├── USER.md
    ├── TOOLS.md
    ├── BOOTSTRAP.md
    ├── MEMORY.md
    ├── HEARTBEAT.md
    ├── memory/
    └── skills/
```

### `~/.openclaw/openclaw.json`

这是系统总配置。

默认 workspace、默认模型、channels、heartbeat、cron、plugin slots 这些系统行为，基本都改这里。

从技术角度看，它更像 OpenClaw 的 control plane 配置。

你可以把它理解成：

- 决定 Gateway 怎么启动
- 决定 agent 默认怎么创建
- 决定 provider、channel、plugin、automation 的默认行为

这类配置通常有 3 个特点：

- 改它会影响后续新建 session
- 一部分改动需要重启 Gateway 才会彻底生效
- 它适合人工维护，不适合被运行时频繁改写

如果你问“这是不是 source of truth”，大多数系统级行为的答案就是：**是。**

### `~/.openclaw/.env`

这是给常驻 Gateway 读的环境变量兜底。

你通常会放：

- provider API keys
- 即时交流相关密钥
- 其他不想写死进 JSON 的敏感信息

从程序员习惯看，它和 `openclaw.json` 的分工其实很清楚：

- `openclaw.json` 放结构化配置
- `.env` 放敏感值和环境差异

所以如果你后面要做多机迁移、私有仓库管理、或者同一份配置在多台机器上复用，最省心的方式通常就是：

- 把 workspace 放 Git
- 把 `.env` 放本机或密码管理器

别反过来。

### `~/.openclaw/credentials/`

这里放运行时凭证、OAuth、登录态之类的东西。

平时尽量少手改。

这一层最重要的建议就一句：

**备份时要带上，Git 里别乱塞。**

从技术上说，这层更像 runtime cache + auth state，不是你应该频繁手写的配置文件。

如果你发现这里的内容和你“想象中的配置”不一样，优先做的不是手改它，而是：

- 重新跑 provider auth
- 重新登录渠道
- 或者重做 onboarding

因为很多时候它存的是运行结果，不是声明式配置。

### `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`

这层主要看模型认证。

如果某个 agent 能跑，另一个 agent 不能跑，或者 provider 看起来配了但 profile 老报错，这层就很值得查。

程序员视角下，可以把它理解成“按 agent 分片的认证选择器”。

也就是说：

- 它不是全局唯一认证
- 它会随着 agent/profile 变化而分叉
- 同一台机器上出现“这个 agent 能跑，那个 agent 不能跑”，优先看这里

### `~/.openclaw/agents/<agentId>/sessions/`

这里基本就是会话状态和 transcript。

- `sessions.json` 是索引
- `*.jsonl` 是实际内容

这层最值得搞清楚的一点是：它不是“记忆系统”，而是运行账本。

很多人会误把 session transcript 当成长期记忆。

其实不是。

从技术上说，它更像：

- 会话元数据索引
- 流式消息日志
- 用于恢复 UI 和会话状态的持久化层

所以如果你在排“为什么上下文还在”“为什么这一轮行为怪怪的”，可以查这里；但如果你想让 agent 长期记住一个偏好，应该改的是 `MEMORY.md`，不是这层。

### `~/.openclaw/cron/`

这是定时任务相关状态。

官方 cron 文档当前写得很清楚：

- jobs 会持久化在磁盘上
- Gateway 重启以后不会丢

这也意味着，cron 是真正的系统调度层，不是聊天窗口里一个临时提醒。

程序员更值得记住的是：

- `jobs` 是声明
- `runs` 是执行记录
- `tasks` 是更高层的后台工作视图

也就是说，cron 解决的是“什么时候触发”，不是“执行结果怎么看”。

### `~/.openclaw/skills/`

这层适合机器级共享 skills。

如果多个 agent 都想共用，而且不绑定单一项目，就放这里。

### `workspace/AGENTS.md`

这是最重要的文件之一。

它定义的是：

- 这个 agent 的工作规则
- 开场时该读什么
- 怎么做事

一句话理解：

**行为主规则改这里。**

而且从 prompt 注入顺序看，它的重要性也确实最高。

官方 Personal Assistant Setup 和 workspace 文档当前讲得很明确：新主会话最先吃进来的几层文件里，`AGENTS.md` 和 `TOOLS.md` 是核心骨架；如果是 subagent，会进一步收缩，只保留最关键那几层。

所以如果你在想：

- 哪个文件最值得写清楚约束
- 哪个文件最值得放 standing orders
- 哪个文件最适合定义“默认怎么做”

答案通常都是 `AGENTS.md`。

### `workspace/TOOLS.md`

这个文件经常被低估。

但程序员其实最该重视它。

因为它决定的不是“写什么”，而是“怎么动手”。

比如：

- 哪些命令优先
- 哪些目录不能碰
- 改文件前要不要先验证
- 哪些工具默认允许，哪些要保守

如果 `AGENTS.md` 是行为主规则，`TOOLS.md` 更像工程边界。

### 这些 workspace 文件，到底什么时候会被读进来

这是程序员最值得知道的一个点。

因为它决定了你改完文件以后，为什么有时立刻有感觉，有时又像没生效。

更实用的理解可以直接写成这样：

- `AGENTS.md`、`TOOLS.md`：主会话最核心的骨架，优先级最高
- `MEMORY.md`：更偏长期偏好，会影响正常日常会话
- `HEARTBEAT.md`：不是主会话常驻 prompt，而是周期唤醒时的额外检查单
- `BOOTSTRAP.md`：只该出现在 brand new workspace 的最早阶段

如果是 subagent 或更轻量的派生会话，通常不会把整套 workspace 文件全量吃进去。

这也是为什么：

- 规则边界写 `AGENTS.md`
- 工程限制写 `TOOLS.md`
- 长期偏好写 `MEMORY.md`

会比把一切都塞进一个文件里稳得多。

### 改完文件以后，什么时候算真的生效

这里也给一个很工程化的判断：

- 改 `openclaw.json`：更多影响后续 session 和 Gateway 行为，必要时重启 Gateway
- 改 `workspace` 里的规则文件：通常对新会话最明显
- 改 `MEMORY.md`：下一次正常会话更容易看到变化
- 改 `HEARTBEAT.md`：等下一次 heartbeat 周期触发

所以你如果改完某个文件立刻就说“没生效”，很多时候不是改错了，而是你看的不是它真正起作用的那个执行面。

### 其他几个常见文件

- `SOUL.md`：更偏 agent 的气质和做事风格
- `IDENTITY.md`：更偏“它是谁”
- `USER.md`：更偏“你是谁，你有什么偏好”
- `BOOTSTRAP.md`：只适合第一天用
- `MEMORY.md`：长期记忆
- `memory/YYYY-MM-DD.md`：日记型短期记忆
- `HEARTBEAT.md`：定时唤醒时的小 checklist
- `workspace/skills/`：当前项目专用 skill

这里再补几个程序员更关心的细节。

### `BOOTSTRAP.md` 不是常驻配置

它最大的特点不是“重要”，而是“一次性”。

如果一个 workspace 还在反复吃 `BOOTSTRAP.md`，通常说明你没有真的稳定在同一个 workspace 上。

### `MEMORY.md` 和 `memory/YYYY-MM-DD.md` 的边界要守住

一个放长期规则，一个放最近上下文。

别把 daily note 写成长期配置，也别把长期偏好写成一堆当天流水账。

### `HEARTBEAT.md` 要短

这不是写设计文档的地方。

因为它会被周期性读进来。

写太长，最直接的结果不是“更聪明”，而是：

- prompt 变胖
- 巡检变慢
- token 白白消耗

### 哪些适合进 Git，哪些不适合

如果你要把 OpenClaw 当工程资产管理，这个边界最好一开始就分清：

- 适合进 Git：`workspace/` 里的规则、记忆、项目 skill
- 不适合进 Git：`credentials/`、sessions、运行时 auth state

说白了：

- `workspace/` 更像源码
- `~/.openclaw` 里很大一部分更像状态和数据

<a id="step-7"></a>

## 第 7 步：把国产 AI 和即时交流配成长期可用

前面你做的是“先跑通”。

这一步才是“开始顺手”。

## 国产 AI 更推荐的配置思路

不是一开始就多模型大乱炖。

而是：

- 先定一个主力模型
- 再补一到两个 fallback

比如：

```json5
{
  agents: {
    defaults: {
      model: {
        primary: 'zai/glm-5.1',
        fallbacks: ['qwen/qwen3-coder-plus'],
      },
    },
  },
}
```

这样日常使用会稳很多。

哪怕某一家临时波动，也不至于整条链路全断。

### 如果你们公司已经有统一模型网关

那就别一家的 key 配一遍。

如果你们内部已经是：

- LiteLLM
- 自研 OpenAI-compatible gateway
- 把多个 provider 聚合成一个出口

那 OpenClaw 就直接接那个统一出口。

这会省很多后续维护成本。

### 如果你更看重隐私或内网

那就走本地推理：

- vLLM
- SGLang
- Ollama

思路都一样。

先把模型服务化，再让 OpenClaw 去连它。

## 即时交流入口从“能用”调到“顺手”

### 飞书

飞书更适合：

- 团队协作
- 群聊边界清楚
- 组织化使用

我建议你把这两个参数尽快想明白：

- `groupPolicy`
- `requireMention`

刚开始试，先保守一点最稳：

- 群策略别一上来就全开
- 先保留 mention 触发
- 先在一个测试群里验证

### 微信

微信更适合：

- 个人入口
- 手机上随手丢一句话
- 不想老切回 dashboard

但它不是最适合第一天就全力折腾的那条线。

### QQ Bot

如果你的实际工作流确实更依赖 QQ，再补这条也没问题。

但顺序还是一样：

先飞书。

再微信。

最后再看 QQ。

<a id="step-8"></a>

## 第 8 步：换新 Mac、无人值守、定时任务怎么玩

这一段就不是“第一天一定要做”的了。

它更像你用顺以后，下一步自然会碰到的三个问题：

- 换新 Mac 怎么办
- 怎么让它长时间在线
- 怎么让它到点自己做事

### 先说换新 Mac：不要只拷 `openclaw.json`

官方迁移文档讲得很清楚：

真正要迁的是整个状态目录。

因为你要保留的不只是配置，还有：

- 凭证
- 登录态
- sessions
- channel state
- workspace

最省心的方式是直接用官方 backup：

```bash
openclaw backup create --verify
```

如果你是从旧 Mac 迁到新 Mac，官方推荐流程大致就是：

1. 旧机器停 Gateway
2. 备份 state dir 和 workspace
3. 新 Mac 安装 OpenClaw
4. 把备份还原过去
5. 跑：

```bash
openclaw doctor
openclaw gateway restart
openclaw status
```

### 真想无人值守，先接受一个现实

**笔记本不是最理想的 always-on host。**

尤其是你合盖、睡眠、网络切换频繁时，Gateway 不会神奇地一直在线。

OpenClaw 官方 Remote Access 文档给的思路其实很清楚：

- 真正常驻的 Gateway 最好跑在一台稳定在线的主机上
- 你的 MacBook / 新 Mac 可以是控制端
- 通过 SSH tunnel 或 app 的 Remote over SSH 模式去连

所以如果你的目标是：

- 24 小时在线
- 随时从手机里给 agent 发消息
- cron 稳定触发

更适合的 host 通常是：

- Mac mini
- 家里的常开桌面机
- 一台 VPS

而不是你白天背着跑、晚上合盖睡觉的笔记本。

### 真正的无人值守，不只是“后台挂着”

在 OpenClaw 里，比较完整的无人值守至少有 4 层：

1. Gateway 常驻
2. Heartbeat 周期唤醒
3. Standing Orders 长期授权
4. Cron 定时任务

如果你是程序员，我建议把这 4 层当成一个最小执行栈来看：

- Gateway 解决的是“进程有没有活着”
- Heartbeat 解决的是“系统会不会定期醒来看看”
- Standing Orders 解决的是“醒来以后哪些事允许自己做”
- Cron 解决的是“某件事要不要在特定时间点被精确触发”

这样看会比单独记功能名顺很多。

### Gateway 常驻

这层你前面已经做过了：

```bash
openclaw onboard --install-daemon
```

平时主要看：

```bash
openclaw gateway status
openclaw gateway restart
openclaw logs --follow
```

### Heartbeat

Heartbeat 更像是轻量巡检。

比如：

- 每隔一段时间看一下飞书或微信
- 看一下有没有新待办
- 如果没事就什么都别做

它不是准点报表器。

从技术角度说，Heartbeat 更像 main session 的周期性 system tick。

它的特点是：

- 更适合低频巡检
- 更适合读取 `HEARTBEAT.md` 这种短 checklist
- 更适合“看一眼，再决定要不要做”
- 不适合承载强时效、强确定性的批处理任务

所以如果你要的是“每隔一段时间看看有没有新消息”，Heartbeat 合适。

如果你要的是“每天 9 点准时出日报”，Heartbeat 就不够准。

### Standing Orders

如果没有 Standing Orders，很多自动化最后都会退化成：

- 到点提醒你一下
- 然后还是等你手动下命令

所以一旦你真想让它自己做事，就要把长期授权写清楚。

最适合放的位置通常就是 `AGENTS.md`。

程序员最该在意的是：Standing Orders 不是提醒文案，而是权限边界。

它应该回答的是：

- 哪些动作默认允许
- 哪些动作必须升级确认
- 哪些外部写操作不能自动做
- 一旦数据源异常，任务应该停在哪一层

如果这层没写清楚，自动化越多，风险反而越高。

### Cron

OpenClaw 官方 cron 文档当前写得很清楚：

- cron 是 Gateway 内置调度器
- 任务会持久化在 `~/.openclaw/cron/`
- Gateway 重启不会把计划丢掉

但程序员更值得分清的是 cron 的执行模型。

你至少可以把它分成两种思路：

- `main session` 思路：沿用已有主会话，适合延续上下文
- `isolated session` 思路：每次单开一段干净上下文，适合日报、巡检、同步这类可重复任务

如果你问我日常该先用哪个，我会建议：

- 人设连续、上下文连续的任务，用 main session
- 定时报表、巡检、同步、批处理，用 isolated session

我这里示例故意用了 `--session isolated`，就是因为它更像程序化任务，而不是继续聊天。

一个很适合新 Mac 上第一个试的例子是：

```bash
openclaw cron add \
  --name "Morning brief" \
  --cron "0 9 * * 1-5" \
  --tz "Asia/Shanghai" \
  --session isolated \
  --message "按 standing orders 汇总今天日程、待办和重要消息。" \
  --no-deliver
```

然后查看：

```bash
openclaw cron list
openclaw cron runs --id <job-id>
```

我这里故意用了 `--no-deliver`。

原因很简单：

新 Mac 第一次配 cron，我更建议你先让它在内部跑通，再决定是不是要自动往飞书或者微信发。

这背后其实也是一个很典型的工程习惯：

1. 先把执行跑通
2. 再把产出看顺
3. 最后才把自动投递打开

不然你最先遇到的 bug，往往不是“任务没跑”，而是“错误结果已经发出去了”。

### 怎么看 cron 到底有没有按你想的跑

这一层别只看聊天窗口。

至少要同时看这三层：

- `openclaw cron list`：任务声明有没有在
- `openclaw cron runs --id <job-id>`：执行记录有没有落下来
- `openclaw logs --follow`：provider、session、delivery 有没有报错

如果你再严谨一点，还可以把它当成一个最小可观测性链路：

- 配置层：job 定义对不对
- 调度层：有没有准时触发
- 执行层：session 有没有真的跑起来
- 投递层：消息有没有被正确送出去

程序员看无人值守，最好就按这 4 层查。

### 什么时候该把 Gateway 放到远程主机

一个很实用的判断标准是：

如果你已经满足下面两条里的任意一条，就别再强撑在本机笔记本上：

- 你需要工作日持续在线
- 你开始依赖 cron、飞书、微信做稳定触达

因为到这一步，Gateway 对你来说已经不是本地工具，而是轻量服务。

这时候把它放到：

- Mac mini
- 常开主机
- VPS

通常会比继续塞在一台会合盖的 MacBook 上省心得多。

## 一条更像真实使用者的时间线

如果你懒得记全文，我建议直接照这个顺序做：

1. 新 Mac 先装 `Node 24`、`git`、Homebrew
2. 安装 OpenClaw，跑 `openclaw onboard --install-daemon`
3. 用 `openclaw gateway status` 和 dashboard 确认本体活着
4. 跑 `openclaw setup`，把 workspace 建出来
5. 先接一个国产 AI provider，把默认模型跑通
6. 先接飞书，把第一条即时交流入口跑通
7. 现在再改基础配置：`.env`、`openclaw.json`、workspace 路径、heartbeat
8. 手动创建 `MEMORY.md`，把记忆体系钩上
9. 去 ClawHub 只装第一批 2 到 3 个 skills
10. 到这一步你已经能稳定用了，再回头拆目录和每个文件职责
11. 再补微信、QQ Bot、多模型 fallback 这些扩展
12. 最后再做新 Mac 迁移、远程 host、cron、standing orders 这些进阶玩法

## 最后再收一下这篇最重要的几个判断

- 新 Mac 第一天，先追求“跑通”，不要先追求“全都配上”
- 第一个模型，优先接一个国产 AI 跑顺
- 第一个即时交流入口，优先飞书，不要上来就微信
- 记忆和 Heartbeat 不是一回事
- skill 和渠道不是一回事
- `~/.openclaw` 是状态目录，workspace 才是 agent 真正的家
- 真想无人值守，稳定在线的 host 比漂亮的 MacBook 更重要

我自己现在基本也是按这个顺序配。

先一个国产模型，先一个飞书入口，先把记忆和 skills 跑顺，最后才碰微信和自动化。

你如果也按这个顺序走，OpenClaw 就会从“看起来很多东西”变成“其实每一步都很清楚”。

## 参考资料

- [OpenClaw Getting Started](https://docs.openclaw.ai/start/getting-started)
- [OpenClaw CLI `setup`](https://docs.openclaw.ai/cli/setup)
- [OpenClaw Personal Assistant Setup](https://docs.openclaw.ai/start/openclaw)
- [OpenClaw FAQ](https://docs.openclaw.ai/help/faq)
- [OpenClaw Memory Overview](https://docs.openclaw.ai/concepts/memory)
- [OpenClaw Heartbeat](https://docs.openclaw.ai/gateway/heartbeat)
- [OpenClaw Plugins](https://docs.openclaw.ai/plugins)
- [OpenClaw Skills](https://docs.openclaw.ai/tools/skills)
- [OpenClaw ClawHub](https://docs.openclaw.ai/tools/clawhub)
- [ClawHub 官方 Skills 商店](https://clawhub.ai/skills?sort=downloads)
- [OpenClaw Feishu Channel](https://docs.openclaw.ai/channels/feishu)
- [OpenClaw Qwen Provider](https://docs.openclaw.ai/providers/qwen)
- [OpenClaw Z.AI / GLM Provider](https://docs.openclaw.ai/providers/zai)
- [OpenClaw Volcengine Provider](https://docs.openclaw.ai/providers/volcengine)
- [OpenClaw StepFun Provider](https://docs.openclaw.ai/providers/stepfun)
- [OpenClaw Qianfan Provider](https://docs.openclaw.ai/providers/qianfan)
- [OpenClaw LiteLLM Provider](https://docs.openclaw.ai/providers/litellm)
- [OpenClaw vLLM Provider](https://docs.openclaw.ai/providers/vllm)
- [OpenClaw SGLang Provider](https://docs.openclaw.ai/providers/sglang)
- [OpenClaw Scheduled Tasks](https://docs.openclaw.ai/automation/cron-jobs)
- [OpenClaw Migration Guide](https://docs.openclaw.ai/install/migrating)
- [OpenClaw Remote Access](https://docs.openclaw.ai/gateway/remote)
- [Weixin 插件 README 镜像页](https://openclawdir.com/plugins/weixin-26fk39)
