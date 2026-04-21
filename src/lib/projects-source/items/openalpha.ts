import type { ProjectSource } from '../types';

export const openalphaProjectSource: ProjectSource = {
  slug: 'openalpha',
  name: 'OpenAlpha 开放平台',
  route: '/products/openalpha',
  logo: 'https://img.huzhihui.com/uploads/2026/04/openalpha-logo_dhxzcl4tuftc.png',
  overview:
    'OpenAlpha 是西筹科技（DatumWealth）面向基金研究、财富管理和资产配置场景打造的数据开放平台，围绕基金数据、金融数据库、智能投顾及开放接口能力展开。',
  tags: ['基金数据', '开放平台', '财富管理', 'Vue 3'],
  urls: {
    official: 'https://openalpha.cn/',
    web: 'https://openalpha.cn/',
  },
  companyName: '西筹科技 / DatumWealth',
  startDate: '2021-09',
  endDate: '2022-08',
  industry: '金融科技',
  categories: ['数据开放平台', '基金研究', '财富管理'],
  platforms: ['Web 平台', '开放接口'],
  langs: ['中文简体'],
  price: '商业化服务',
  headline:
    '本产品围绕基金研究、金融数据库、智能投顾和资产配置能力构建对外服务体系，同时提供产品页、接口页、解决方案、充值支付与用户中心等模块。',
  introduction: [
    '我在这个项目里更关注它作为数据开放平台的完整性，而不只是把它做成一个单一的基金指标 API 销售页。',
    '在产品结构上，我把基金数据、金融数据库、智能投顾、财富管理和资产配置相关能力放进统一站点中，同时配套产品页、接口详情、解决方案、充值支付、帮助中心和账户中心等模块。',
  ],
  summary: [
    '本产品的定位更接近金融数据与研究能力的开放平台，而不是单一的 API 售卖页。',
    '它覆盖公募基金、私募基金、养老金产品、银行理财、基金研究、智能投顾与资产配置等多个方向，服务范围同时延伸到数据研究与财富管理场景。',
    '站点前端采用 Vue 3 + TypeScript + Vite 构建，并结合 Vue Router、Vuex、Axios 与 Element Plus 组织产品页、接口页、用户中心和帮助中心。',
    '我主要负责订单与账号管理相关模块，并处理站点中图标资源的动态接入与页面展示。',
  ],
  techStack: [
    'Vite',
    'Vue 3',
    'Vue Router 4',
    'Vuex 4',
    'TypeScript',
    'Element Plus',
    'Axios',
  ],
  screenshots: [
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/openalpha-01_111cr0psc0pad.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/openalpha-02_2wzvdv1odsotj.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/openalpha-03_tale5ir85rmr.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/openalpha-04_3cd7vljjo3lz5.png',
    },
  ],
};
