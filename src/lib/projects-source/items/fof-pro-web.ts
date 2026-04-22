import type { ProjectSource } from '../types';

export const fofProWebProjectSource: ProjectSource = {
  slug: 'fof-pro-web',
  name: 'FOF PRO（Web 端）',
  route: '/products/fof-pro',
  logo: 'https://img.huzhihui.com/uploads/2026/04/fof-pro-logo_dhxzck5wom6g.png',
  overview:
    'FOF PRO Web 端是一套面向基金投研、财富管理和资产管理场景的专业工作台，围绕基金数据库、研究分析和投顾协同构建核心产品能力。',
  tags: ['基金数据库', '基金投研', 'Web 平台', '财富管理'],
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
    '本产品是 FOF PRO 体系中的核心 Web 工作台，围绕公募、私募、ETF、专户、资配、基金圈与投研模板等模块，服务企业与高净值客户的基金研究和资产配置工作流。',
  introduction: [
    '这套系统的目标不是做一个单点工具，而是把基金数据库、研究分析、投顾协作、资配工具和知识沉淀整合进同一套 Web 工作台中。',
    '从官方文档和实际代码都能看出，平台已经不只覆盖公募投研，还延伸到了 ETF、私募、保险资管、养老投研、专户投研、超级应用、笔记工具、基准研究、投研模板和基金圈等多个模块。',
    '在实际落地中，Web 端承担了 FOF PRO 最完整的模块承载职责，是整套产品里信息密度最高、功能最重、最接近机构级投研工作台的一端。',
  ],
  summary: [
    '我把这套 Web 端当作机构级投研工作台来设计，真正的难点从来不是单个页面实现，而是要同时承接基金池、组合管理、资配投研、基金圈、基准研究、超级应用和 AI 入口等复杂模块，并让它们在同一套信息架构里长期稳定共存。',
    '前端架构上，我基于 `@umijs/max + TypeScript + Ant Design / ProComponents` 搭建整体工程，通过 Umi 的 `access`、`initialState`、`model`、`request` 和多套路由配置管理登录初始化、权限控制、全局状态与页面骨架。这个项目的亮点就在于模块扩张很快，但工程结构没有因此失控。',
    '交互层最有挑战的是高密度数据页面的可读性与操作效率。我大量使用 `ProTable`、`ProForm`、自定义 ECharts 组件、`@dnd-kit`、`react-beautiful-dnd`、`handsontable`、`react-data-grid`、`react-photo-view` 等能力，去承接复杂表格、组合拖拽、图表分析和多视图联动场景。',
    '内容与智能能力接入也是这套系统比较有代表性的亮点。我把 `markdown-it`、`react-markdown`、`mermaid`、`fetch-event-source` 等能力整合进页面体系，用来承接投研内容、图表说明和流式 AI 返回，让“工具 + 内容 + 智能分析”可以在同一套工作台里顺滑串起来。',
    '对我来说，这个项目真正体现价值的地方，不是堆了多少技术栈，而是我把庞杂的投研流程抽象成了一套可持续演进的前端工程结构。这样新模块接入时不用反复推倒重来，旧模块迭代时也不会轻易牵一发而动全身。',
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
    {
      label: '开发日志',
      url: '/log/FOF-PRO.html',
    },
  ],
};
