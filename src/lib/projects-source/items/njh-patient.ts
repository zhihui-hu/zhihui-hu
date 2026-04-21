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
    '本产品延续了“叮铃医生”的统一品牌与服务入口定位，更适合作为患者服务 Web 端来理解。',
    '它以微信 H5 形态承载线上咨询与问诊流程，相比原生 App 更强调即开即用和低门槛触达。',
    '该项目使用 Vue 2.x 进行开发，是一个单页面应用。我基于 Axios 对 HTTP 客户端进行了封装，使用 SCSS + PostCSS 编写样式，并引入 Karma + Mocha 做单元测试。',
    '在构建过程中，我使用 Webpack 进行打包，并使用 ESLint 统一代码风格；在架构层面，我通过 transition 组件实现路由切换动画，并利用 Webpack 的 Code Split 特性实现组件异步加载，以优化页面加载时间。',
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
