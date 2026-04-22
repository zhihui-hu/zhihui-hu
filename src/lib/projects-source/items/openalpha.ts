import type { ProjectSource } from '../types';

export const openalphaProjectSource: ProjectSource = {
  sortOrder: 7,
  slug: 'openalpha',
  name: 'OpenAlpha 开放平台',
  route: '/products/openalpha',
  logo: 'https://img.huzhihui.com/uploads/2026/04/openalpha-logo_dhxzcl4tuftc.png',
  overview:
    'OpenAlpha 是西筹科技（DatumWealth）面向基金研究、财富管理和资产配置场景打造的数据开放平台，围绕基金数据、金融数据库、智能投顾及开放接口能力展开。',
  tags: ['基金数据', '开放平台', '财富管理', 'Vue 3'],
  urls: {
    official: 'https://datumwealth.com/',
    web: 'https://openalpha.cn/',
  },
  companyName: '西筹科技 / DatumWealth',
  startDate: '2021-09',
  endDate: '2022-08',
  ageRating: '18+',
  category: '财务',
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
    '这个项目前端最有挑战的地方，是它看起来像一个开放平台官网，但实际上必须同时承担产品展示、接口调试、充值购买、订单管理、发票管理、账户设置、帮助中心和支付回跳等完整用户链路，复杂度远高于普通展示站。',
    '前端基础架构采用 `Vue 3 + TypeScript + Vite`，结合 `Vue Router 4` 将站点拆分为 Web 展示区、用户中心、帮助中心和关于页面等多套路由层级。我在这里重点解决的是“多个业务域共存时页面骨架怎么稳”，所以用 `Layout / UserLayout / HelpLayout` 把结构先搭清楚。',
    '状态管理层使用 `Vuex 4` 配合 `vuex-persistedstate` 处理用户与交易数据持久化；交易侧还单独抽出发票相关 store。这个设计的亮点在于，当订单、发票、认证和设置等链路逐渐变复杂时，状态没有散落到各个页面里失控。',
    '请求层我基于 Axios 抽象了统一 request 模块，并补上了 token 注入、`401` 自动清理登录态、重复请求哈希去重、任务取消与下载处理，再按 user、home、api、pay 模块拆分接口。对我来说，这种基础层的稳定性，才是后面接口调试页和支付页能否做顺的关键。',
    '在业务功能上，我把接口测试控制台、接口详情 JSON 展示、微信绑定与登录、企业转账、订单/发票管理、支付宝回跳页、账户认证与设置等模块统一纳入一套前台体系，同时配套 `vue3-json-view`、`qrcode.vue`、`vue-clipboard3`、拖拽验证和图片上传等组件能力，保证开放平台常见交互都能被前端平稳承接。',
    '构建层面我使用 Vite 插件体系接入 `unplugin-vue-components` 与 `ElementPlusResolver` 做组件按需加载，并结合 `vite-plugin-compression`、`vite-plugin-imagemin`、多环境变量与 dev proxy 处理生产压缩、图片优化和环境切换。这个项目真正的亮点，不是用了多少工具，而是我把“展示 + 交易 + 调试 + 账户体系”压进了一套仍然可维护的前端工程里。',
  ],
  techStack: [
    'Vue 3',
    'TypeScript',
    'Vite',
    'Vue Router 4',
    'Vuex 4',
    'vuex-persistedstate',
    'Element Plus',
    'Axios',
    'object-hash',
    'unplugin-vue-components',
    'vite-plugin-compression',
    'vite-plugin-imagemin',
    'vue3-json-view',
    'qrcode.vue',
    'vue-clipboard3',
    'Alipay Return Flow',
    'DragVerify',
    'ImageUpload',
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
