import type { ProjectSource } from '../types';

export const fofProAppProjectSource: ProjectSource = {
  slug: 'fof-pro-app',
  name: 'FOF PRO（App 端）',
  route: '/products/fof-pro',
  logo: 'https://img.huzhihui.com/uploads/2026/04/400x400ia-75_dhynvn5kvzsx.jpg',
  overview:
    'FOF PRO App 端是面向企业和高净值客户的移动投研工具，把理财、基金投资和研究咨询能力延伸到移动端场景中。',
  tags: ['基金投资', '投研工具', 'App', 'uni-app'],
  urls: {
    official: 'https://qutke.com/',
    ios: 'https://apps.apple.com/cn/app/fof-pro/id1633056491',
  },
  companyName: '况客科技（北京）有限公司',
  startDate: '2020-01',
  ongoing: true,
  ageRating: '18+',
  category: '财务',
  industry: '金融科技',
  categories: ['投研工具', '移动端 App'],
  platforms: ['iPhone', 'Android'],
  langs: ['中文简体', '英语'],
  price: 0,
  headline:
    '本产品强调随时可用和轻量触达，让基金研究与理财分析能力不只停留在桌面端。',
  introduction: [
    '我把 App 端定位成 Web 平台的移动延伸，不只是信息查看器，而是要在移动场景下继续承接基金投资与研究咨询相关能力。',
    '相比 Web 端，这一端更强调便携性、即时性和低学习成本，让用户在移动环境里也能快速获取投研信息。',
    '项目最终采用 uni-app 进行跨端开发，以兼顾 iPhone 和 Android 两侧的交付效率。',
  ],
  summary: [
    '我没有把 App 端当成 Web 的简单附属页来看，而是把它当成投研工作台的移动延伸来设计。真正的难点在于，桌面端那套高信息密度的能力，到了手机上不能只是缩小显示，而要重新组织成适合移动场景的访问路径。',
    '为了同时覆盖 iOS 和 Android，我采用 `uni-app` 做双端交付，但在实现上我更关注的是“跨端一致”和“移动端可用”之间的平衡，避免为了复用代码牺牲触达效率和页面节奏。',
    '这类项目的亮点不在于用了跨端框架，而在于我把 Web 端的投研体系拆成适合手机使用的信息层级，让用户在移动环境下依然能完成查阅、协同和基础操作，而不是只能看一个阉割版信息流。',
    '对我来说，App 端的价值是把 FOF PRO 从“桌面工具”扩展成“随时可访问的工作系统”。技术上我做的是跨端交付，业务上我解决的是投研能力能不能真正跟着用户走到移动端。',
  ],
  techStack: ['uni-app', 'iOS', 'Android'],
  screenshots: [
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvofs5o8a.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvpzmv1n4.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvrlya5ew.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvt4kmy5r.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvufgms9k.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynvvuxc1df.webp',
    },
  ],
};
