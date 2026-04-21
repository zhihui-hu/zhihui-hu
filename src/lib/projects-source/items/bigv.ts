import type { ProjectSource } from '../types';

export const bigvProjectSource: ProjectSource = {
  slug: 'bigv',
  name: '笨嘴神器',
  route: '/products/bigv',
  logo: 'https://img.huzhihui.com/uploads/2026/04/bigv-logo_dhxzcjex05vs.png',
  overview:
    '笨嘴神器是一款融合 AI 能力的投资类微信小程序，围绕机会发现、资金观察、宏观研判和智能问答，为用户提供更轻量的投资辅助体验。',
  tags: ['AI 投资', '微信小程序', '策略研究', '宏观研判'],
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
    '本产品把机会大师、巨鲸一眼清、宏观一眼清和笨嘴Chat 四个模块整合进一个小程序入口，让策略发现、资金观察、宏观判断和 AI 问答形成一体化体验。',
  introduction: [
    '本产品主要由机会大师、巨鲸一眼清、宏观一眼清和笨嘴Chat 四个能力模块组成，分别覆盖策略发现、海外资金异动观察、宏观与行业判断，以及 AI 辅助投资问答。',
    '其中机会大师强调“板块 + 策略秘籍 + 自选，一键交火”；巨鲸一眼清聚焦海外资金短时间大规模加减仓板块排行榜；宏观一眼清主打“宏观看得懂，行业选得准”；笨嘴Chat 则突出 AI 辅助投资体验。',
    '我在项目落地过程中，也把它与基金大 V 合作场景结合起来，通过小程序与 WebView 工具形态承载投研内容与数据能力，提升内容分发效率和用户参与度。',
  ],
  summary: [
    '本产品是一款 AI 投资工具，核心模块由机会大师、巨鲸一眼清、宏观一眼清和笨嘴Chat 组成。',
    '机会大师强调“板块 + 策略秘籍 + 自选，一键交火”；巨鲸一眼清聚焦海外资金短时间大规模加减仓板块排行榜；宏观一眼清主打宏观看得懂、行业选得准；笨嘴Chat 提供 AI 辅助投资体验。',
    '考虑到金融行业审核严格、流程较长，为了让业务侧能够灵活控制页面内容并保障用户体验，我为这个项目设计了“小程序壳 + WebView 工具页”的整体架构。',
    '在小程序侧，我使用原生 API 支持用户授权相关功能；在页面内容侧，则通过 WebView 实现灵活发布、部署、更新和回滚。',
    '我还将 WebView 模块拆分为单一工具微服务，并在页面开发中统一采用 Vue 3 + TypeScript + Pinia 的技术栈，通过 URL 参数与持久化存储完成数据通信。',
    '按照这套模式，项目两个月内完成了 21 次迭代，小程序仅经历一次审核，同时接入了 20 多家大 V 合作伙伴，日收益峰值达到 10 万元，月收益达到 100 万元。',
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
