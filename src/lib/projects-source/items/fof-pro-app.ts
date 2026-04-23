import type { ProjectSource } from '../types';

export const fofProAppProjectSource: ProjectSource = {
  sortOrder: 2,
  slug: 'fof-pro-app',
  name: 'FOF PRO（App 端）',
  route: '/products/fof-pro',
  logo: 'https://img.huzhihui.com/uploads/2026/04/400x400ia-75_dhynvn5kvzsx.jpg',
  overview:
    'FOF PRO 移动端是一套深度整合了公募基金数据与智能化分析的跨端投研引擎。基于 `uni-app` 单一工程基座，在 iOS、Android 与微信小程序三端，无缝承接了基金诊断、组合调仓、多维选基、ETF 投顾及 AI Copilot 等重度投研场景。',
  tags: ['uni-app', 'Vue 2', '组合诊断', '移动投研'],
  urls: {
    official: 'https://qutke.com/',
    ios: 'https://apps.apple.com/cn/app/fof-pro/id1633056491',
  },
  companyName: '况客科技（北京）有限公司',
  startDate: '2020-01',
  ongoing: true,
  ageRating: '18+',
  category: '财务',
  industry: '金融科技',
  categories: ['投研工具', '移动端 App'],
  platforms: ['iPhone', 'Android'],
  langs: ['中文简体', '英语'],
  price: 0,
  headline:
    '打破桌面投研的物理边界，将十余种高阶数据分析模型与 AI Copilot 封装进移动客户端，打造触手可及的随身投研工作台。',
  introduction: [
    '在构思 FOF PRO 移动端时，我的目标绝非简单地把 Web 端数据“塞进”手机屏幕，而是将其重塑为一个轻量、即时且极具深度的「随身投研工作台」。在这里，基金 PK、组合测算、穿透诊断等高频动作被精简为流畅的指尖交互。',
    '移动投研的核心在于“随时响应市场情绪”。因此，在架构上，我们不仅平移了基础的基金与基金经理档案，更深度融合了 ETF 投顾体系与大模型驱动的 Copilot，让行情解读、归因分析与投研笔记的分享流转，在一个原生化的体验闭环中一站式完成。',
    '相较于 Web 端的重度分析属性，移动端在交互侧全面向“信息降噪”与“快速决策”倾斜。我希望通过更清晰的卡片流、更敏捷的数据穿透以及更优雅的图表渲染，让专业投顾和研究员在碎片化时间里，依然能保持敏锐的市场判断力。',
  ],
  summary: [
    '要在移动端吃透厚重的金融业务逻辑，首先要解决工程的“熵增”。我基于 `uni-app + Vue 2 + uView` 构建了跨端底座，针对超大规模页面数量，引入了 `subPackage` 多子包架构进行路由级物理拆分。同时在 `main.js` 和 API 层做了严苛的拦截隔离，确保基金、组合、宏观、AI 等数十个业务线在并行开发时不会相互绞杀。',
    '在复杂状态管理上，面对“基金对比穿透、组合调仓回测”这种重度交互，我将 Vuex 拆解为细粒度的领域模型（Domain Driven）。从并发聚合多维度诊断数据，到独立暂存组合优化上下文（Context），前端不再只是个单薄的“渲染器”，而是实质上承担了部分 BFF 的数据编排职责。',
    '金融类 App 的体验分水岭往往在于图表与长列表的极限渲染。面对海量的净值走势和持仓明细，我结合 `qiun-data-charts` 优化了数据流转，用 `z-paging` 彻底兜底了长列表的内存激增问题；针对 AI Copilot 输出的投研报告，我又融合了 `markdown-it` 与 `highlight.js`，在移动端实现了媲美 PC 的流式富文本解析与代码高亮渲染。',
    '这不是一个套着 Web 壳的玩具，而是一个真正的原生化客户端。除了深度适配 iOS/Android 的 `app-plus` 原生能力（如 Share 插件、系统权限体系），我们还引入了自动化的 `deploy.mjs` CI 部署与 `commitizen` 规范化流水线。在保持移动端轻量敏捷的同时，成功捍卫了金融级软件的工程严谨度。',
  ],
  techStack: [
    'uni-app (iOS/Android/MP)',
    'Vue 2 + Vuex',
    'uView UI',
    'subPackage 多子包架构',
    'qiun-data-charts (高性能图表)',
    'z-paging (长列表渲染)',
    'HM-dragSorts',
    'markdown-it & highlight.js',
    'app-plus 原生能力拓展',
    'CI/CD (deploy.mjs)',
    'Commitizen 工程化规范',
  ],
  screenshots: [
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvofs5o8a.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvpzmv1n4.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvrlya5ew.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvt4kmy5r.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvufgms9k.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvvuxc1df.webp',
    },
  ],
};
