---
title: 设计模式和管理能力，才是 AI Vibe Coding 时代真正的自救：AI 不会提醒你系统正在散架
slug: design-patterns-and-management-self-rescue-in-ai-vibe-coding-era
image: https://img.huzhihui.com/uploads/2026/04/design-patterns-and-management-self-rescue-in-ai-vibe-coding-era-banner_dhxrv0vb35q8.png
publishedAt: 2026-04-17T11:17
summary: AI Vibe Coding 最大的错觉，是把“能很快写出来”误当成“系统仍然可控”。这篇不复读 23 个模式，而是挑 8 个最适合 AI 编程场景的设计模式，说明它们如何帮你守住边界、变化点和协作关系。再往下一层，真正稀缺的是管理复杂度的能力，而这恰好最不会被 AI 主动提醒。
keywords:
  - 设计模式
  - AI 编程
  - Vibe Coding
  - 管理能力
  - 软件架构
  - 可维护性
  - 工程管理
tags:
  - 设计模式
  - AI 编程
  - Vibe Coding
  - 管理能力
  - 软件架构
  - 重构
  - 工程管理
---

![前端难点在哪头图](https://img.huzhihui.com/uploads/2026/04/design-patterns-and-management-self-rescue-in-ai-vibe-coding-era-banner_dhxrv0vb35q8.png)

我现在越来越警惕一种很顺的感觉。

你开一个新分支，丢给 AI 一个需求。

它十分钟给你补出页面，一个小时帮你串好接口，下午再顺手把测试和后台任务也补了。

整个过程几乎没有摩擦。

危险就在这里。

`AI Vibe Coding` 最容易制造的，不是明显的错代码，而是一种更麻烦的状态：**局部看着都对，整体已经开始散。**

你会慢慢看到这些症状：

- 供应商字段已经渗进业务层
- 同一条链路被写出三个入口
- 重试、日志、权限散在各个 service
- 一个流程长出五六个布尔值，谁也说不清当前状态

这时候你才会意识到，AI 真正放大的，不是“写代码”能力，而是“把局部最优快速堆成系统”的能力。

而一个仓库最难守住的，从来不是某个函数有没有写出来。

是边界、变化点、协作关系和演进节奏有没有先定住。

所以我现在的判断和很多流行叙事正好相反：

**AI 越会写代码，设计模式越重要。**

因为设计模式本质上不是八股。

它是复杂度管理的压缩语法。

它帮你提前把几件最贵的事说清楚：

- 哪里允许变化
- 哪里禁止穿透
- 哪些步骤必须统一入口
- 哪些附加能力不能污染核心逻辑

截至 `2026-04-17`，我觉得这事已经不是抽象争论了。

[Stack Overflow 2025 Developer Survey](https://survey.stackoverflow.co/2025/ai) 和它同期的官方说明里，`84%` 的受访者表示已经在用或计划使用 AI 工具做开发，`46%` 明确不信任 AI 输出的准确性，`45%` 觉得调试 AI 生成代码很耗时，接近 `77%` 的开发者则说 `vibe coding` 不属于他们的职业开发工作。这个组合放在一起，其实已经很说明问题了：大家在用，但没人真敢把结构责任一起外包出去。

[GitClear 的研究](https://www.gitclear.com/coding_on_copilot_data_shows_ais_downward_pressure_on_code_quality) 也给了一个很硬的侧面。它回看了 `2020` 到 `2023` 年间超过 `1.53` 亿行代码变更，结论是 churn 在上升、代码复用在下降，新增和复制粘贴代码的占比在变高，甚至预测 `2024` 的 churn 会比 `2021` 这个 pre-AI 基线翻倍。AI 让“先加一层”更容易了，但并不会自动帮你把重复和耦合收回来。

更有意思的是，主流工具本身也在往“补结构”这个方向收敛。

[GitHub Copilot coding agent](https://docs.github.com/en/copilot/concepts/about-copilot-coding-agent) 不是把自动改代码直接放飞，而是把它放进 GitHub Actions 驱动的临时开发环境里，最后还是回到 pull request 审查和权限治理。[Cursor Rules](https://docs.cursor.com/context/rules-for-ai) 明确把 rules 和 `AGENTS.md` 当成持久上下文，规则内容会放在模型上下文最前面。[Claude Code 的 memory 文档](https://code.claude.com/docs/en/memory) 也写得很直白：`CLAUDE.md` 和 auto memory 都会在每个会话开始时被加载。

你会发现，连这些工具自己都在补“结构层”和“治理层”。

原因很简单。

AI 最擅长的是把眼前这一段补出来。

但它不会天然替你负责：

- 长期可维护性
- 团队协作成本
- 版本演进边界
- 下次改动的爆炸半径

所以这篇我不想复读 `GoF 23` 个模式。

那样很全，但不够狠。

我只挑 `8` 个在 `AI Vibe Coding` 语境里最容易真救命的模式。你可以把它们理解成 `8` 种最常见的“失控点”。每个都给一段 `TypeScript` 例子，代码故意只保留结构，因为我要强调的不是语法，是骨架。

## 1. 适配器模式：别让供应商字段长进业务层

AI 系统现在一个很真实的日常，就是模型商、网关、Embedding 服务、审核服务都可能换。

这时候最容易烂掉的，不是 prompt，而是 response shape。

上层业务一旦直接去读 `output_text`、`content[0].text`、`candidates[0].content` 这种供应商字段，下一次接新平台时，AI 和人都会开始全仓库搜字段名。

AI 在这里最常见的偷懒，就是看见眼前 JSON 长什么样，就直接顺着往下写。

```ts
type UnifiedResult = {
  text: string;
  stopReason: 'stop' | 'tool' | 'length';
};

interface ModelAdapter<T> {
  toUnified(response: T): UnifiedResult;
}

class OpenAIAdapter implements ModelAdapter<{
  output_text?: string;
  status: string;
}> {
  toUnified(response: { output_text?: string; status: string }): UnifiedResult {
    return {
      text: response.output_text ?? '',
      stopReason: response.status === 'completed' ? 'stop' : 'length',
    };
  }
}

class ClaudeAdapter implements ModelAdapter<{
  content: Array<{ type: string; text?: string }>;
  stop_reason: string;
}> {
  toUnified(response: {
    content: Array<{ type: string; text?: string }>;
    stop_reason: string;
  }): UnifiedResult {
    const text =
      response.content.find((item) => item.type === 'text')?.text ?? '';
    return {
      text,
      stopReason: response.stop_reason === 'tool_use' ? 'tool' : 'stop',
    };
  }
}
```

适配器模式真正值钱的地方，不是“抽象得优雅”，而是它先把变化挡在边界上。

对 AI 来说，这种结构还有一个额外好处：你可以很明确地下指令，像“新增一家模型商时，只补一个 `ModelAdapter`，不要碰上层 `ReviewService` 的接口”。这种约束，模型是更容易遵守的。

## 2. 外观模式：别让一条链路被写成三个入口

很多 AI 功能表面上只有一个按钮，背后其实是五六步。

读 diff、裁上下文、拼 prompt、调模型、解析 JSON、校验结果、失败补救。你要是把这些步骤散在 controller、job 和 CLI 脚本里，后面基本一定会长出三套差不多但不完全一样的实现。

这也是 AI 很容易写坏的一层。因为模型每次都只优化当前入口，不会主动替你维护“全系统是不是只剩一个可信入口”。

```ts
type ReviewComment = {
  file: string;
  line: number;
  body: string;
};

class ReviewFacade {
  constructor(
    private readonly parser: DiffParser,
    private readonly client: ModelClient,
    private readonly validator: ReviewValidator,
  ) {}

  async reviewPullRequest(diff: string): Promise<ReviewComment[]> {
    const files = this.parser.parse(diff);
    const prompt = buildReviewPrompt(files);
    const raw = await this.client.generate(prompt);
    const comments = JSON.parse(raw) as ReviewComment[];
    return this.validator.filterInvalid(comments);
  }
}
```

外观模式就是把这类“内部很多步骤，外部只该看到一个动作”的事情收成一个门面。

这在 AI 时代尤其重要。因为模型最擅长把局部代码补出来，不擅长在多个入口里始终保持同一条处理链。你给它一个 `ReviewFacade.reviewPullRequest()`，它更容易沿着既有骨架扩展；你给它三个散落入口，它更容易继续复制。

## 3. 策略模式：别让所有任务共用同一把锤子

我现在很少相信“一把模型打天下”这种写法。

修 bug、写测试、做重构建议、跑安全审查，本来就不是同一种任务。模型、温度、超时、是否允许调用工具，很多时候都应该不同。

如果你不先把差异声明出来，AI 默认就会用“当前最顺手的那套配置”一路平推。

```ts
type CodeTask = {
  kind: 'bugfix' | 'refactor' | 'test';
  input: string;
};

type ExecutionPlan = {
  model: string;
  temperature: number;
  allowTools: boolean;
};

interface ExecutionStrategy {
  plan(task: CodeTask): ExecutionPlan;
}

class BugfixStrategy implements ExecutionStrategy {
  plan(): ExecutionPlan {
    return { model: 'sonnet', temperature: 0.1, allowTools: true };
  }
}

class RefactorStrategy implements ExecutionStrategy {
  plan(): ExecutionPlan {
    return { model: 'gpt-5.4', temperature: 0.2, allowTools: true };
  }
}

class TestStrategy implements ExecutionStrategy {
  plan(): ExecutionPlan {
    return { model: 'mini', temperature: 0, allowTools: false };
  }
}

class TaskRunner {
  constructor(
    private readonly strategies: Record<CodeTask['kind'], ExecutionStrategy>,
  ) {}

  async run(task: CodeTask) {
    const plan = this.strategies[task.kind].plan(task);
    return callModel(plan, task.input);
  }
}
```

很多 AI 生成代码的问题，本质上不是“模型太笨”，而是系统根本没把任务差异表达出来。

策略模式把这件事说清了。你不是在写一个大 if-else，而是在告诉人和 AI：变化点在这里，替换行为在这里，调用方别掺和。

## 4. 工厂模式：别让初始化逻辑在仓库里失控

AI 很喜欢的一种写法，是在每个文件里顺手 `new` 一个 client。

短期看很快。长期看，密钥读取、默认超时、重试次数、base URL、mock 实现，全都散了。

模型不会天然觉得 `new OpenAIClient()` 散在五个文件里有什么问题，因为从单次补全的视角看，那就是最快的闭环。

```ts
type Provider = 'openai' | 'anthropic';

interface ModelClient {
  generate(prompt: string): Promise<string>;
}

class ModelClientFactory {
  static create(provider: Provider): ModelClient {
    switch (provider) {
      case 'openai':
        return new OpenAIClient({
          apiKey: process.env.OPENAI_API_KEY!,
          timeoutMs: 30_000,
        });
      case 'anthropic':
        return new ClaudeClient({
          apiKey: process.env.ANTHROPIC_API_KEY!,
          timeoutMs: 30_000,
        });
    }
  }
}

const reviewClient = ModelClientFactory.create('openai');
```

工厂模式解决的不是“new 太难写”。

它解决的是初始化逻辑的统一入口。一旦创建过程被收口，切 provider、补 mock、加 tracing，影响面都会小很多。你也更容易给 AI 一个稳定约束，比如“所有模型 client 必须走 `ModelClientFactory`，不要在业务层直接实例化”。

## 5. 装饰器模式：别让横切逻辑把核心代码腌入味

AI 系统里最容易横着长出来的东西，就是这些：

- 重试
- 日志
- 指标
- 缓存
- 限流
- 成本统计

这些能力通常都很重要，但它们不该把核心业务方法污染成一锅粥。

横切逻辑是 AI 最容易写进主逻辑的地方，因为“顺手补进去”对局部任务最省 token，也最省思考。

```ts
interface ModelClient {
  generate(prompt: string): Promise<string>;
}

class MetricsClient implements ModelClient {
  constructor(
    private readonly inner: ModelClient,
    private readonly meter: Meter,
  ) {}

  async generate(prompt: string): Promise<string> {
    const start = Date.now();
    try {
      return await this.inner.generate(prompt);
    } finally {
      this.meter.observe('llm.latency_ms', Date.now() - start);
    }
  }
}

class RetryClient implements ModelClient {
  constructor(
    private readonly inner: ModelClient,
    private readonly retries: number,
  ) {}

  async generate(prompt: string): Promise<string> {
    let lastError: unknown;
    for (let i = 0; i <= this.retries; i += 1) {
      try {
        return await this.inner.generate(prompt);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  }
}

const client = new RetryClient(
  new MetricsClient(ModelClientFactory.create('openai'), meter),
  2,
);
```

装饰器模式最大的好处，是它让“额外能力”还能保持可插拔。

对 AI 来说，这种结构也更友好。因为你可以明确告诉它：“给 `ModelClient` 加指标，不要改业务服务，包一层 decorator。”这样模型更不容易把日志代码抹进 every function。

## 6. 命令模式：别让 AI 任务只剩下一段 prompt

只要系统开始有后台任务、批处理、重试、幂等，任务就不该只是一段 prompt 了。

它应该先变成一个对象。

否则系统很快会退化成另一种原始状态：谁手里有 prompt，谁先跑一下试试。

```ts
interface Command<T> {
  id: string;
  execute(): Promise<T>;
}

class GenerateTestsCommand implements Command<string> {
  readonly id: string;

  constructor(
    private readonly filePath: string,
    private readonly client: ModelClient,
  ) {
    this.id = `generate-tests:${filePath}`;
  }

  async execute(): Promise<string> {
    const source = await readFile(this.filePath);
    return this.client.generate(`为这段代码补测试：\n${source}`);
  }
}

class CommandBus {
  constructor(private readonly store: CommandStore) {}

  async dispatch<T>(command: Command<T>): Promise<T | undefined> {
    if (await this.store.has(command.id)) return;
    await this.store.markStarted(command.id);
    return command.execute();
  }
}
```

命令模式一上来，系统立刻就有了几个新能力：排队、去重、重试、审计。

这件事在 AI 时代更关键，因为 AI 任务天然带一点概率性。你总得知道哪次任务跑过、跑到哪、失败后能不能安全重来。没有命令对象，后面很多治理都挂不住。

## 7. 观察者模式：别等出问题了才发现系统一直是黑盒

很多团队做 AI 功能，前面几周都很顺。

一旦开始有异步任务、后台分析、子任务拆分、进度通知、预算告警，系统立刻变黑盒。不是功能没写，而是根本没人知道哪一步慢、哪一步贵、哪一步老失败。

如果没有事件流，很多 AI 系统其实是到了线上才第一次被“看见”。

```ts
type TaskEvent =
  | { type: 'task.started'; taskId: string }
  | { type: 'task.completed'; taskId: string; tokens: number }
  | { type: 'task.failed'; taskId: string; error: string };

class EventBus {
  private listeners: Array<(event: TaskEvent) => void> = [];

  subscribe(listener: (event: TaskEvent) => void) {
    this.listeners.push(listener);
  }

  publish(event: TaskEvent) {
    for (const listener of this.listeners) listener(event);
  }
}

const bus = new EventBus();

bus.subscribe((event) => {
  if (event.type === 'task.failed') alerting.notify(event.taskId, event.error);
});

bus.subscribe((event) => {
  if (event.type === 'task.completed')
    budgetTracker.record(event.taskId, event.tokens);
});
```

观察者模式不只是 UI 刷新时才有用。

到了 AI 系统里，它往往是日志、告警、计费、看板、埋点这些东西的总入口。没有事件流，你连“AI 到底有没有帮你省时间，还是只是把复杂度换了个地方藏起来”都很难回答。

## 8. 状态模式：别再让工作流烂成一堆布尔值

AI 工作流还有一个特别常见的坑：状态乱。

`isRunning`、`isApproved`、`hasError`、`needsRetry` 这种布尔值写到第五个时，谁都说不清一个任务现在到底处于什么阶段。

```ts
type ReviewState = 'draft' | 'reviewing' | 'needs_fix' | 'approved' | 'failed';

class ReviewJob {
  private state: ReviewState = 'draft';

  submit() {
    if (this.state !== 'draft') throw new Error('invalid transition');
    this.state = 'reviewing';
  }

  requestChanges() {
    if (this.state !== 'reviewing') throw new Error('invalid transition');
    this.state = 'needs_fix';
  }

  resubmit() {
    if (this.state !== 'needs_fix') throw new Error('invalid transition');
    this.state = 'reviewing';
  }

  approve() {
    if (this.state !== 'reviewing') throw new Error('invalid transition');
    this.state = 'approved';
  }

  fail() {
    this.state = 'failed';
  }
}
```

状态模式的好处，是把“系统允许怎么流转”这件事写成显式规则。

这对 AI 很重要。因为模型很会把一段逻辑补全，但它经常默认流程是线性的、理想的。你把状态和迁移关系明文写出来，AI 后续新增功能时，至少不容易在非法状态上乱改。

## 设计模式下面那层，其实是管理能力

写到这里，我更想把话再往前推半步。

如果说设计模式是在代码层面自救，那管理能力就是在项目层面自救。

而且后者往往更稀缺。

因为设计模式至少还能在文章、课程、代码 review 里被提到，管理复杂度的能力反而经常被 `AI coding` 的兴奋感盖过去。

AI 默认站在“把当前需求做出来”的视角。

它几乎不会主动提醒你这些事：

- 这个需求先砍半，不要一次做满
- 这个 PR 太大，先拆，不然没人 review 得动
- 这个抽象先别加，先确认它真会复用
- 这个模块 ownership 先定，不然两周后一定互相踩
- 这段兼容层该删了，别继续背历史包袱

你会发现没有，真正决定系统会不会失控的，很多时候不是“代码会不会写”。

而是下面这些管理动作会不会做：

1. 需求切分。先把问题切小，再让 AI 加速；不要反过来先让 AI 铺满，再回来收残局。
2. 边界治理。明确哪层能知道哪层，哪种调用必须走统一入口，哪类字段不能越过 adapter。
3. 评审节奏。保持小步提交、短反馈链路、清晰 checkpoint，不让 AI 一次生成的东西大到无法 review。
4. 删除能力。敢删临时抽象、重复实现和过度兼容层，这比继续往上加一层更难，也更像管理。

这也是我现在越来越在意的一点：

**AI 很会给你“继续加”的惯性，但很少给你“先停一下，先管住复杂度”的提醒。**

所以我会说，`AI Vibe Coding` 下真正的自救不是一个点，而是两层：

- 第一层是设计模式，先把结构钉住
- 第二层是管理能力，别让速度把团队和代码库一起冲散

## 真要落地，我会先做这三件事

第一，先找失控点，不要先背模式名。

比如“模型供应商会变”“审查流程会变”“日志和计费是横切逻辑”“异步任务需要重试”，这些都是真问题。模式只是给这些失控点起了一个行业里已经对齐过的名字。

第二，把模式名字写进代码，也写进规则文件。

这点在 AI coding 时代特别有用。你在 `AGENTS.md`、`CLAUDE.md`、`.cursor/rules` 里写“新增 provider 时只允许新增 adapter 和 factory 分支，不要改 facade 对外接口”，比写“请注意代码结构”有效得多。

第三，让 AI 负责扩写，让人负责管边界和节奏。

AI 非常适合补局部实现、补样板、补测试、补重复劳动；但边界该怎么切、变化点该放哪、一次改动该放多大、哪个模式真的值得引入，这些决定最好还是由人来拍板。不是因为 AI 永远做不到，而是因为一旦决定错了，后面所有自动生成都会沿着错误骨架加速。

## 最后一句

AI 会让设计模式过时吗？

我现在的答案很明确：不会。

它只会把那些原来可以拖到后面再处理的结构问题，更早、更频繁地暴露出来。

`vibe coding` 很适合把想法点亮，把第一个版本推出来，把“我脑子里大概有个东西”变成“屏幕上真的出现了点什么”。

但真要把仓库养下去，只靠“写得出来”远远不够。

你还得有两层自救。

设计模式先救结构。

管理能力再救节奏、救协作、救迭代。

AI 负责提速。

这两层能力，负责不让速度把系统甩散。

## 参考资料

- [AI | 2025 Stack Overflow Developer Survey](https://survey.stackoverflow.co/2025/ai)
- [Stack Overflow’s 2025 Developer Survey Reveals Trust in AI at an All Time Low](https://stackoverflow.co/company/press/archive/stack-overflow-2025-developer-survey/)
- [Coding on Copilot: 2023 Data Suggests Downward Pressure on Code Quality](https://www.gitclear.com/coding_on_copilot_data_shows_ais_downward_pressure_on_code_quality)
- [About GitHub Copilot coding agent - GitHub Docs](https://docs.github.com/en/copilot/concepts/about-copilot-coding-agent)
- [Cursor Rules](https://docs.cursor.com/context/rules-for-ai)
- [How Claude remembers your project - Claude Code Docs](https://code.claude.com/docs/en/memory)
