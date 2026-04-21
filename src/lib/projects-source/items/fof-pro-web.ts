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
  industry: '金融科技',
  categories: ['基金投研投顾平台', '基金数据库', 'Web 平台'],
  platforms: ['Web 平台'],
  langs: ['中文简体'],
  price: '商业化服务',
  headline:
    '本产品是 FOF PRO 体系中的核心 Web 工作台，重点服务企业和专业客户的基金研究、投顾分析与协同工作流。',
  introduction: [
    '这套系统的目标不是做一个单点工具，而是把基金数据库、研究分析、投顾协作和流程承载整合进同一套 Web 平台中。',
    '在产品设计上，我更关注它作为机构级工作台的完整性，因此除了基金分析本身，也会把研究模板、协同流程和图表化展示一并纳入体系。',
    '在实际落地中，Web 端承担了最完整的模块承载职责，是整套产品里信息密度最高、业务链路最完整的一端。',
  ],
  summary: [
    '本产品主要服务财富管理和资产管理领域，为企业和专业客户提供基金投资研究与投顾辅助能力。',
    '项目一共覆盖 299 个页面、上百张图表和千余个模块，我主要负责前端架构搭建和投研模板模块落地。',
    '前端采用 React、TypeScript、Umi 和 Ant Design，围绕复杂表单、图表和高密度投研页面构建稳定的机构级工作台体验。',
    '在这类高复杂度系统里，我特别关注的是模块边界、状态管理和可维护性，让业务持续迭代时仍然能保持开发效率。',
  ],
  techStack: ['React', 'TypeScript', 'Umi', 'Antd', 'Hooks'],
  resources: [
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
