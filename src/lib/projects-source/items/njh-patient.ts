import type { ProjectSource } from '../types';

export const doctorPatientProjectSource: ProjectSource = {
  slug: 'doctor-patient',
  name: '叮铃医生（患者端）',
  route: '/products/doctor',
  logo: '/assets/projects/dling.png',
  overview:
    '叮铃医生（患者端）是一个面向微信场景的患者服务 Web App，围绕电话咨询与线上问诊提供更轻量的触达入口。',
  tags: ['医疗', '患者端', '微信 H5', 'Vue 2', '在线咨询'],
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
    '患者端以微信 H5 形态承载电话咨询与线上问诊服务，主要服务关心父母健康的一二线城市白领人群。',
  introduction: [
    '患者端服务是一个面向微信端的 Web App，旨在提供电话咨询服务，让用户能够快速获得医生的建议和咨询。',
    '主要面向一二线城市的白领人群，他们关心并关怀自己父母的健康，希望通过更轻量的入口获得医疗咨询服务。',
    '项目整体以单页面应用方式构建，在保证咨询流程完整性的同时，尽量降低用户访问和使用门槛。',
  ],
  summary: [
    '患者端服务是一个面向微信端的 Web App，旨在提供电话咨询服务，让用户能够快速获得医生的建议和咨询。主要面向一二线城市的白领人群，他们关心并关怀自己的父母的健康。',
    '该项目使用 Vue 2.x 进行开发，是一个单页面应用。我们基于 Axios 对 HTTP 客户端进行了封装，使用 SCSS + PostCSS 编写样式，并使用 Karma + Mocha 进行单元测试。',
    '在构建过程中，我们使用 Webpack 进行打包，并使用 ESLint 来统一代码风格。作为该项目的一部分，我负责架构方面的工作，利用 transition 组件实现了路由切换动画，并利用 Webpack 的 Code Split 特性实现组件的异步加载，以优化页面加载时间。',
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
