import type { ProjectSource } from '../types';

export const openalphaProjectSource: ProjectSource = {
  slug: 'openalpha',
  name: '基金研究开放平台',
  route: '/products/openalpha',
  logo: '/assets/projects/openalpha-logo.png',
  overview:
    'OpenAlpha 开放平台销售基金指标 API，支持定制 API 和深度数据合作，支持会员充值调用和套餐两种模式。',
  tags: ['基金 API', 'Vue 3', 'Element Plus', '开放平台'],
  urls: {
    official: 'https://openalpha.cn/',
    web: 'https://openalpha.cn/',
  },
  companyName: '西筹科技',
  startDate: '2021-09',
  endDate: '2021-12',
  industry: '金融科技',
  categories: ['开放平台', 'API 服务'],
  platforms: ['Web 平台', 'API 服务'],
  langs: ['中文简体'],
  price: '商业化服务',
  introduction: [
    '平台包含会员销售、大 V 入驻支持，主要服务人群包括投顾、自媒体、机构、个人和量化用户。',
  ],
  summary: [
    '国内首家基金 API 数据销售平台。',
    'OpenAlpha 使用 Vite 打包，全面拥抱 Vue 3 + TypeScript，UI 框架基于 Element Plus。',
    '我主要负责订单模块以及账号管理模块，并通过动态引入阿里 iconfont 资源，实现图标资源动态添加到页面显示。',
  ],
  techStack: ['Vite', 'Vue 3', 'TypeScript', 'Element Plus', 'iconfont'],
  screenshots: [
    {
      image: 'src/public/images/openalpha-1.png',
    },
    {
      image: 'src/public/images/openalpha-2.png',
    },
    {
      image: 'src/public/images/openalpha-3.png',
    },
  ],
};
