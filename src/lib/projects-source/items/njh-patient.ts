import type { ProjectSource } from '../types';

export const doctorPatientProjectSource: ProjectSource = {
  slug: 'doctor-patient',
  name: '叮铃医生（患者端）',
  route: '/products/doctor',
  logo: 'https://img.huzhihui.com/uploads/2026/04/dling_dhxzckmr2b08.png',
  overview:
    '叮铃医生（患者端）是一个面向微信场景的患者服务 H5，与医生端共同组成统一品牌下的线上问诊与咨询入口。',
  tags: ['医疗', '患者端', '微信 H5', '在线问诊'],
  urls: {
    official: 'https://www.njhgroup.cn/',
    web: 'https://h5.51dling.com/h5',
  },
  companyName: '北京新里程叮铃科技有限公司',
  startDate: '2020-01',
  endDate: '2021-03',
  ageRating: '17+',
  category: '医疗',
  industry: '医疗',
  categories: ['患者端 H5', '微信 Web App'],
  platforms: ['微信 / H5'],
  langs: ['中文简体'],
  price: 0,
  headline:
    '本产品以微信 H5 形态承接线上咨询与问诊流程，用更低门槛的访问方式完成患者触达与服务闭环。',
  introduction: [
    '我把患者端设计成一个面向微信环境的轻量咨询入口，用来承接线上触达、问诊流程和基础服务访问。',
    '相较医生端聚焦问诊、处方和排班，患者端更强调低门槛进入、流程顺滑和访问便捷性。',
    '项目整体以单页面应用方式构建，在保证咨询流程完整性的同时，尽量降低用户访问和使用门槛。',
  ],
  summary: [
    '我把患者端设计成一个低门槛、即开即用的服务入口，所以这里最重要的不是功能堆叠，而是让线上咨询流程足够短、足够顺。相较医生端的复杂工作流，这一端更考验前端在微信场景里的触达效率和页面节奏控制。',
    '项目整体使用 `Vue 2.x` 构建单页面应用，我基于 Axios 封装了 HTTP 客户端，并用 `SCSS + PostCSS` 维护样式体系。亮点不在于技术本身，而在于把患者最常用的访问流程压缩成足够轻量的 H5 体验。',
    '为了保证页面在微信环境里打开更快、切换更顺，我用 `transition` 组件处理路由切换动画，并结合 Webpack 的 Code Split 做组件异步加载，尽量把首次访问成本压下来。',
    '这类项目的难点往往不是页面有多复杂，而是用户耐心非常有限。对我来说，患者端真正的价值是把原本容易流失的咨询入口做成“点开就能用”的形态，让线上服务链路能更自然地跑起来。',
  ],
  techStack: [
    'Vue 2.x',
    'Axios',
    'SCSS',
    'PostCSS',
    'Karma',
    'Mocha',
    'Webpack',
    'ESLint',
  ],
  resources: [
    {
      label: '新里程&智康二期改版联调问题汇总',
      url: 'https://docs.qq.com/sheet/DQVhoUXF5TmZ6cUZ1?tab=BB08J2',
    },
    {
      label: '一期优化需求问题汇总',
      url: 'https://docs.qq.com/sheet/DQVVab05SZ3VVZ0xJ?tab=BB08J2',
    },
  ],
};
