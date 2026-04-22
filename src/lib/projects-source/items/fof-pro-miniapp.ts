import type { ProjectSource } from '../types';

export const fofProMiniappProjectSource: ProjectSource = {
  slug: 'fof-pro-miniapp',
  name: 'FOF PRO（小程序端）',
  route: '/products/fof-pro',
  logo: 'https://img.huzhihui.com/uploads/2026/04/fof-pro-logo_dhxzck5wom6g.png',
  overview:
    'FOF PRO 小程序端是产品在微信生态里的轻量触达入口，围绕基金投研、基金数据库和财富管理场景，把核心能力延伸到更高频的移动访问链路中。',
  tags: ['基金投研', '微信小程序', 'uni-app', '财富管理'],
  urls: {
    official: 'https://qutke.com/',
    mp: 'https://img.huzhihui.com/uploads/2026/04/IMG_4486_dhynvy1hhqml.jpg',
  },
  companyName: '况客科技（北京）有限公司',
  startDate: '2020-01',
  ongoing: true,
  ageRating: '18+',
  category: '财务',
  industry: '金融科技',
  categories: ['投研工具', '微信小程序'],
  platforms: ['微信小程序'],
  langs: ['中文简体'],
  price: 0,
  headline:
    '本产品更适合作为 FOF PRO 在微信场景下的轻量入口，用更低门槛的方式承接高频访问与内容触达。',
  introduction: [
    '我把小程序端理解为统一产品矩阵中的轻量入口，它不追求承载最完整的工作流，而是更适合高频查看、分享和触达。',
    '它与 Web 平台、App 端形成分工互补：Web 端承载完整业务，App 端负责移动协同，小程序端则强化微信环境下的低门槛使用。',
    '在工程落地上，小程序端同样采用 uni-app，以复用跨端交付经验和维护方式。',
  ],
  summary: [
    '小程序端最难的地方，不是把功能做出来，而是明确什么该放进微信场景、什么不该放进去。我在这里没有照搬 Web 端，而是主动做了功能裁剪，优先保证高频查看、分享和低门槛触达这些最适合微信环境的能力。',
    '技术上我仍然使用 `uni-app` 维护这一端，但真正的工作重点在于多端协同后的边界设计。Web 端负责完整流程，App 端负责移动协同，小程序端则只承接最需要快速触达的核心信息，这样整套产品矩阵才不会互相重复和内耗。',
    '这条线的亮点是“轻量入口”做得足够清晰：它不是缩水版工作台，而是更适合微信生态传播与访问习惯的产品形态。前端层面我做的是统一交付，产品层面我解决的是不同终端在同一体系里如何各司其职。',
  ],
  techStack: ['uni-app', '微信小程序'],
  screenshots: [
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/IMG_4487_dhynw0r9lbil.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/IMG_4491_dhynw42rma1z.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/IMG_4489_dhynw7i99qwf.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/IMG_4488_dhynwacucdy1.png',
    },
  ],
};
