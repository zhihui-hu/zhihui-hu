import type { ProjectSource } from '../types';

export const bigvProjectSource: ProjectSource = {
  slug: 'bigv',
  name: '笨嘴神器',
  route: '/products/bigv',
  logo: 'https://img.huzhihui.com/uploads/2026/04/bigv-logo_dhxzcjex05vs.png',
  overview:
    '笨嘴神器是一个面向投资场景的微信小程序，数有引力官网将其定位为“跨时代的 融合人工智能(AI)的 投资利器”，围绕机会发现、资金观察、宏观研判和 AI 问答提供辅助能力。',
  tags: ['AI 投资', '微信小程序', 'Vue 3', 'TypeScript'],
  urls: {
    official: 'http://www.shuyouyinli.com/',
    mp: 'https://c18e-1257416358.cos.accelerate.myqcloud.com/IMG_4492.JPG',
  },
  companyName: '成都数有引力科技有限公司',
  startDate: '2021-10',
  ongoing: true,
  industry: '金融科技',
  categories: ['AI 投资工具', '微信小程序', 'WebView 工具'],
  platforms: ['微信小程序', 'WebView'],
  langs: ['中文简体'],
  price: 0,
  headline:
    '官网重点展示机会大师、巨鲸一眼清、宏观一眼清和笨嘴Chat 四个模块，把策略发现、资金异动观察、宏观判断与 AI 投资辅助整合进一个小程序入口。',
  introduction: [
    '官网重点展示四个能力模块：机会大师、巨鲸一眼清、宏观一眼清、笨嘴Chat，分别覆盖策略发现、海外资金异动观察、宏观与行业判断，以及 AI 辅助投资问答。',
    '其中机会大师强调“板块 + 策略秘籍 + 自选，一键交火”；巨鲸一眼清聚焦海外资金短时间大规模加减仓板块排行榜；宏观一眼清主打“宏观看得懂，行业选得准”；笨嘴Chat 则突出 AI 辅助投资体验。',
    '结合项目实际落地，产品也与基金大 V 合作，通过小程序与 WebView 工具形态承载投研内容与数据能力，提升内容分发效率和用户参与度。',
  ],
  summary: [
    '官网产品页将笨嘴神器定位为 AI 投资工具，核心模块由机会大师、巨鲸一眼清、宏观一眼清和笨嘴Chat 组成。',
    '机会大师强调“板块 + 策略秘籍 + 自选，一键交火”；巨鲸一眼清聚焦海外资金短时间大规模加减仓板块排行榜；宏观一眼清主打宏观看得懂、行业选得准；笨嘴Chat 提供 AI 辅助投资体验。',
    '考虑到金融行业系统审核困难、监管严格且审核流程时间较长，为了确保企业能够灵活控制页面内容并保障用户体验，本项目采用了以下整体架构。',
    '在小程序中，使用原生 API 支持用户授权相关功能，以确保用户在使用过程中的安全和便利性。',
    '页面工具内容采用 WebView 展示的方式，使得能够灵活地发布、部署、更新和回滚页面内容。通过这种方式，能够在不影响整体应用的情况下，快速调整和优化页面内容。',
    '将 WebView 模块拆分为单一工具微服务，以便同时进行开发和部署。这种模块化的设计使得能够更加高效地开发和维护各个工具模块。',
    '在单一工具模块的页面开发中，统一采用 Vue 3 + TypeScript + Pinia 的技术栈。这样的选择不仅能够提供良好的开发体验和代码可维护性，还能够保证页面的性能和稳定性。',
    '为了实现灵活的数据通信，统一使用 URL 参数和持久化储存的方式来进行数据传递和存储。这样的设计使得页面之间的数据交互更加方便，同时也能够保证数据的安全性和一致性。',
    '根据该模式，项目在两个月内已经进行了 21 次迭代，而小程序只经历了一次审核过程。同时，还接入了 20 多家大 V 合作伙伴，日收益峰值达到了 10 万元，月收益达到了 100 万元。',
  ],
  techStack: [
    '原生小程序 API',
    '微服务',
    'Vue 3',
    'TypeScript',
    'Pinia',
    'URL 参数通信',
    '持久化存储',
  ],
  screenshots: [
    {
      image:
        'https://objectstorage.eu-marseille-1.oraclecloud.com/n/axwlydfzmjel/b/onefile/o/uploads/2026/04/b6b6ad3e7afe3ba6d65d23d6b557ec44d77bf5a32e84c6160b78085e8abd8b32.png',
    },
    {
      image:
        'https://objectstorage.eu-marseille-1.oraclecloud.com/n/axwlydfzmjel/b/onefile/o/uploads/2026/04/bb54ba066ed1d2a0791ed4d26889b5412a5e1b0e681fa1028e385d1671cf5b84.png',
    },
    {
      image:
        'https://objectstorage.eu-marseille-1.oraclecloud.com/n/axwlydfzmjel/b/onefile/o/uploads/2026/04/46c1a20a7783901e79329ea91c0328b729e231589850e77a9af415b65f3b5123.png',
    },
    {
      image:
        'https://objectstorage.eu-marseille-1.oraclecloud.com/n/axwlydfzmjel/b/onefile/o/uploads/2026/04/0a6ba1ba37f5823fc47987e35e6b3ca218c30d9aed0d7769c22b1a79804ea760.png',
    },
  ],
};
