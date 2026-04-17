import type { ProjectSource } from '../types';

export const fofProWebProjectSource: ProjectSource = {
  slug: 'fof-pro-web',
  name: 'FOF PRO（Web 端）',
  route: '/products/fof-pro',
  logo: '/assets/projects/fof-pro-logo.png',
  overview:
    'FOF PRO Web 端是一套面向 FOF、MOM 与委外投资场景的投研投顾平台，覆盖投前、投中和投后流程。',
  tags: ['基金投研', 'Web 平台', 'React', 'TypeScript', '投顾平台'],
  urls: {
    official: 'https://qutke.com/',
    web: 'https://pro.fofinvesting.com/',
  },
  companyName: '况客科技（北京）有限公司',
  startDate: '2021-06',
  ongoing: true,
  industry: '金融科技',
  categories: ['投研投顾', 'Web 平台'],
  platforms: ['Web 平台'],
  langs: ['中文简体'],
  price: '商业化服务',
  headline:
    '作为核心 Web 平台，FOF PRO 围绕基金分析、持仓研究、流程协同与投研模板构建完整的机构级投顾工作台。',
  introduction: [
    '它致力于为基金行业提供各种专业分析解决方案，涵盖收益和持仓等方面的需求。',
    'FOF PRO 注重用户体验和易用性。界面设计简洁直观，操作流程清晰，强大的功能和功能模块能够满足基金行业的多样化需求。',
    '无论是在投资决策阶段还是投资执行和监控阶段，系统都能提供准确、及时的数据和分析报告，帮助基金管理人和投资者进行有效的资产配置和风险管理。',
  ],
  summary: [
    'FOF PRO 基于 FOFinvesting 的升级版本，它是多年业务和经验积累的结晶。我们致力于打造行业标杆产品，以提高自身竞争力并优化用户体验。',
    'FOF PRO 2.0 在 FOFinvesting 的基础上进行了全面升级和改进。我们深入倾听用户反馈和需求，结合市场趋势和行业标准，对系统进行了全面的优化和升级，目标是提供更高效、更智能的功能，使用户能够更轻松地进行 FOF 投资和管理。',
    'FOF PRO 2.0 不仅保留了 FOFinvesting 的优点和功能，还引入了新的特性和创新。我们提升了系统的性能和稳定性，增加了更多的分析工具和数据指标，使用户能够更全面地了解 FOF 投资的情况，同时优化了用户界面和交互设计。',
    '项目一共 299 个页面、上百张图表、千余个模块。我主要负责项目前端架构搭建和投研模板模块。',
    '项目采用 React、TypeScript、Umi 和 Antd 等技术栈，完全拥抱 React 最新特性，例如使用 Hooks 进行开发，通过合理的架构和开发方式，为用户提供高质量、稳定可靠的应用。',
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
