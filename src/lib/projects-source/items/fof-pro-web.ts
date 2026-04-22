import type { ProjectSource } from '../types';

export const fofProWebProjectSource: ProjectSource = {
  sortOrder: 4,
  slug: 'fof-pro-web',
  name: 'FOF PRO（Web 端）',
  route: '/products/fof-pro',
  logo: 'https://img.huzhihui.com/uploads/2026/04/fof-pro-logo_dhxzck5wom6g.png',
  overview:
    'FOF PRO Web 端是况客面向基金研究、投顾协同和资产配置场景打造的核心投研工作台，从基金数据库出发，逐步扩展到组合管理、组合诊断、资配投研、超级应用、基金圈与 AI Agent 等完整能力体系。',
  tags: ['基金数据库', '组合诊断', '资配投研', 'Web 平台'],
  urls: {
    official: 'https://qutke.com/',
    web: 'https://pro.fofinvesting.com/',
  },
  companyName: '况客科技（北京）有限公司',
  startDate: '2021-06',
  ongoing: true,
  ageRating: '18+',
  category: '财务',
  industry: '金融科技',
  categories: ['基金投研投顾平台', '基金数据库', 'Web 平台'],
  platforms: ['Web 平台'],
  langs: ['中文简体', '英语'],
  price: '商业化服务',
  headline:
    '它不是一个单点基金数据库，而是一套把公募、ETF、私募、保险资管、养老、专户、资配、超级应用、模板协作和 AI 工具整合进同一工作台里的机构级投研系统。',
  introduction: [
    '我做这套系统时，并没有把它当成“基金数据网站”来做，而是把它当成研究、分析、协作和知识沉淀共用的一张工作台。',
    '从官方文档能清楚看到，它已经不只是公募数据库，而是继续延伸到 ETF、私募、保险资管、养老、专户、资配投研、超级应用、基准研究、投研模板、基金圈和 AI Agent，覆盖的是一整套机构投研工作流。',
    '所以 Web 端在整个 FOF PRO 体系里承担的职责也最重，它不是某个模块的门户，而是绝大多数复杂分析和深度操作最终落地的主战场。',
  ],
  summary: [
    '这套 Web 端真正难的地方，不是做几个图表或几个列表，而是它要把跨度非常大的投研模块装进同一套产品框架里。官方文档里能看到的能力边界就已经覆盖公募投研、ETF 投研、私募投研、保险资管、养老投研、专户投研、资配投研、超级应用、基准研究、投研模板、基金圈以及 AI Agent，这种复杂度远远超过普通金融信息站。',
    '我更看重的不是“模块多”，而是这些模块能不能共用同一套认知路径。用户今天可能在基金产品库里筛选标的，接着去做基金池、组合管理、组合诊断，再跳到超级比较、风险监测、报表中心，最后把成果沉淀进模板、笔记工具或基金圈里。如果信息架构和页面骨架不稳，整个系统很快就会碎掉。',
    '前端架构上我基于 `@umijs/max + TypeScript + Ant Design / ProComponents` 搭建整体工程，通过 Umi 的 `access`、`initialState`、`model`、`request` 和多套路由配置，去管理登录初始化、权限控制、全局状态和页面壳层。对我来说，这类系统的关键不是把页面写出来，而是让它在模块越滚越多的时候依然还能稳住。',
    '交互层最重的是高密度分析页面。像官方文档里明确列出来的快速比较、组合诊断、业绩分析、持仓分析、风格配置、相关性分析、资产配置、风险监测这些能力，都要求页面同时承载大量指标、图表、表格和状态切换。我大量使用 `ProTable`、`ProForm`、自定义 ECharts、`@dnd-kit`、`react-beautiful-dnd`、`handsontable`、`react-data-grid`、`react-photo-view` 等能力，去把这种复杂度压进还能日常使用的交互里。',
    '另一个我很看重的亮点，是它不只是“数据 + 页面”，而是把方法论和协作也一起做进系统里。投研模板把研究框架产品化，基金圈把研究成果同步和分享做成机制，AI Agent 则把基金投顾、ETF 投顾、私募投顾、投研助手、研报写手等能力继续接进来。对我来说，FOF PRO Web 端真正有价值的地方，是它最终长成了一套可以持续扩展的机构级投研基础设施，而不是一组互相孤立的功能页面。',
  ],
  techStack: [
    'React',
    '@umijs/max',
    'TypeScript',
    'Ant Design',
    'ProComponents',
    'ahooks',
    'Axios',
    'ECharts',
    '@dnd-kit',
    'react-beautiful-dnd',
    'Handsontable',
    'react-data-grid',
    'react-photo-view',
    'markdown-it',
    'react-markdown',
    'Mermaid',
    'fetch-event-source',
    'Tailwind CSS',
  ],
  resources: [
    {
      label: '官方文档',
      url: 'https://docs.fofinvesting.com/',
    },
    {
      label: 'iOS App',
      url: 'https://apps.apple.com/cn/app/fof-pro/id1633056491',
    },
    {
      label: '投研模板文档',
      url: 'https://docs.qq.com/doc/DQWRqWUpXZ2xUbnFs',
    },
    {
      label: '微信关注',
      text: 'FOF PRO',
    },
  ],
};
