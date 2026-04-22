import type { ProjectSource } from '../types';

export const fofProAppProjectSource: ProjectSource = {
  sortOrder: 2,
  slug: 'fof-pro-app',
  name: 'FOF PRO（App 端）',
  route: '/products/fof-pro',
  logo: 'https://img.huzhihui.com/uploads/2026/04/400x400ia-75_dhynvn5kvzsx.jpg',
  overview:
    'FOF PRO App 端和小程序端共用一套 `uni-app` 工程，在 iOS 与 Android 上承接基金研究、基金诊断、组合管理、自选基金、基金圈、ETF 投顾和 Copilot 等移动投研能力。',
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
    '这不是一个只做基金查看的移动壳，而是把基金详情、基金 PK、基金定投、组合诊断、条件选基、基金圈分享和 AI 入口一起搬进手机端的一套跨端投研客户端。',
  introduction: [
    '我把 FOF PRO App 端定位成一套可以随身访问的基金投研工作台，而不是桌面端的附属页面。用户在手机上就能快速查看基金、基金经理、基金公司和组合信息，并继续完成基金诊断、基金 PK、定投测算、相似基金和股票选基等高频动作。',
    '这条线的价值不只是把数据搬到移动端，而是把“看什么、怎么判断、怎么继续跟进”一起串起来。除了基金详情和组合管理之外，App 里还承接了自选基金、市场解读、情绪洞察、基金圈、ETF 投顾和 Copilot 等内容，让研究、观察、分享和轻量协同能在同一个入口里完成。',
    '相比 Web 端更强调深度分析和复杂操作，App 端更关注高频访问、碎片化查看和即时反馈。我希望它在移动场景下依然保留 FOF PRO 的核心判断力，同时把重要信息和常用动作整理得更轻、更快，也更适合用户在日常节奏里持续使用。',
  ],
  summary: [
    'App 端最核心的技术取舍，是先把跨端底座做稳，再谈业务扩展。我用 `uni-app + Vue 2 + Vuex + uView` 搭起统一客户端框架，`main.js` 里把全局 HTTP 拦截器和 API 注册挂到 Vue 实例上，接口层集中收口到 `common/http.api.js`，这样新增基金、组合、分享、Copilot、宏观、情绪这些业务模块时，不会把端侧工程拖散。',
    '状态层我按业务拆了 `fundDiagnosis`、`portfolio`、`fundFilter`、`fundInfo`、`similarFunds`、`share`、`user`、`question` 等多个 Vuex 模块。像基金诊断模块会并发拉整体评价、稳定性、标签、基金经理评价和风险提示，再组合成统一展示数据；组合模块会单独暂存选中基金、测算结果、调仓记录、诊断结果和组合优化上下文，这些都是偏业务系统化的状态，而不是页面级临时变量。',
    '移动端交互里我补了不少对复杂金融页面有用的基础能力。图表统一走 `qiun-data-charts`，长列表走 `z-paging`，拖动排序用 `HM-dragSorts`，再结合 `dayjs`、`lodash`、`markdown-it`、`highlight.js` 这些工具，把收益走势、资产配置、基金圈内容、Copilot 内容和卡片化模块在移动端整理成可持续迭代的 UI 结构。',
    'App 本身也不是单纯 WebView 封装。从 `manifest.json` 可以看到我同时维护了 `app-plus` 和 `mp-weixin` 配置，App 侧单独接入了原生 `Share` 模块、微信分享 SDK、Android 权限和 iOS/Android 打包资源，这意味着它在工程上确实被当成独立客户端交付，而不是只靠 H5 勉强跑通。',
    '在业务能力上，首页已经把公募基金、基金经理、基金公司、自选基金、组合、定投专区、基金对比、股票选基、相似基金、市场解读、情绪洞察和 Agent 入口组织成统一导航；基金圈又继续承接超级组合、基金池、笔记、私募策略、ETF 投顾、报表和 Copilot 内容。对我来说，这条线真正有价值的地方，是我把一套复杂投研系统压缩进了一个仍然能在手机上持续演进的 App 工程里。',
  ],
  techStack: [
    'uni-app',
    'Vue 2',
    'Vuex',
    'uView UI',
    'iOS',
    'Android',
    'qiun-data-charts',
    'z-paging',
    'HM-dragSorts',
    'dayjs',
    'lodash',
    'markdown-it',
    'highlight.js',
    'app-plus Share',
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
