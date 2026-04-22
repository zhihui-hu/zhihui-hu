import type { ProjectSource } from '../types';

export const bigvProjectSource: ProjectSource = {
  sortOrder: 3,
  slug: 'bigv',
  name: '笨嘴神器',
  route: '/products/bigv',
  logo: 'https://img.huzhihui.com/uploads/2026/04/bigv-logo_dhxzcjex05vs.png',
  overview:
    '笨嘴神器是一款融合 AI 能力的投资类微信小程序，围绕机会发现、资金观察、宏观研判和智能问答，为用户提供更轻量的投资辅助体验。',
  tags: ['AI 投资', '微信小程序', '策略研究', '宏观研判'],
  urls: {
    official: 'http://www.shuyouyinli.com/',
    mp: 'https://img.huzhihui.com/uploads/2026/04/IMG_4492_dhynv2i8brmo.jpg',
  },
  companyName: '成都数有引力科技有限公司',
  startDate: '2021-10',
  ongoing: true,
  ageRating: '18+',
  category: '财务',
  industry: '金融科技',
  categories: ['AI 投资工具', '微信小程序', 'WebView 工具'],
  platforms: ['微信小程序'],
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
    '这个项目真正的难点，不是把四个功能模块塞进一个小程序里，而是要在金融审核严格、发布节奏受限的前提下，依然让业务侧保持高频迭代能力。我最后把它拆成“小程序壳 + WebView 工具页”的架构，把审核成本和页面更新节奏分离开。',
    '我在小程序层只保留必须依赖原生能力的登录授权与容器逻辑，把高频变化的投研页面全部放到 WebView 中承载。这样业务内容可以独立发布、回滚和灰度，前端也不用每次改文案或策略页都重新走小程序审核。',
    '为了让 WebView 这条链路不只是“嵌网页”，我把各个工具模块继续拆成独立服务，并统一用 `Vue 3 + TypeScript + Pinia` 组织状态、URL 参数和持久化通信逻辑，保证页面之间切换和数据透传足够稳定。',
    '这个方案的亮点在于工程结构直接服务业务效率。两个月内完成 21 次迭代，小程序主体只经历一次审核，但产品侧依然能快速接入新模块、合作方内容和运营活动，前端交付节奏没有被平台限制卡死。',
    '对我来说，这个项目最有价值的地方，是我用架构设计把“审核慢、改动快”这个天然矛盾拆开了，让 AI 投资工具既能保持金融场景要求的合规性，也能维持互联网产品所需要的快速迭代能力。',
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
        'https://img.huzhihui.com/uploads/2026/04/bigv-01_local1117bigv01.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/bigv-02_local1117bigv02.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/bigv-03_local1117bigv03.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/bigv-04_local1117bigv04.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/bigv-05_local1117bigv05.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/bigv-06_local1117bigv06.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/bigv-07_local1117bigv07.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/bigv-08_local1117bigv08.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/bigv-09_local1117bigv09.png',
    },
  ],
};
