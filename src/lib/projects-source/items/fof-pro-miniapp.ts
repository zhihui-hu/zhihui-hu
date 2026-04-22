import type { ProjectSource } from '../types';

export const fofProMiniappProjectSource: ProjectSource = {
  sortOrder: 6,
  slug: 'fof-pro-miniapp',
  name: 'FOF PRO（小程序端）',
  route: '/products/fof-pro',
  logo: 'https://img.huzhihui.com/uploads/2026/04/fof-pro-logo_dhxzck5wom6g.png',
  overview:
    'FOF PRO 小程序端和 App 端共用一套 `uni-app` 工程，在微信生态里承接基金研究、组合诊断、基金圈卡片分享、ETF 投顾与 Copilot 内容的轻量访问链路。',
  tags: ['微信小程序', 'uni-app', '基金圈分享', 'Copilot'],
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
    '它不只是一个轻量入口，而是靠分包、懒加载、分享卡片落地页和 WebView 承接，把基金圈、组合、诊断和 AI 内容用更低门槛的方式接进微信场景。',
  introduction: [
    '我没有给小程序单独再做一套业务仓库，而是直接在同一个 `uni-app` 项目里同时维护 App 和 `mp-weixin` 端，让基金、组合、诊断、分享、Copilot 这些核心模块尽可能共用一套业务实现。',
    '不过小程序端的定位跟 App 也不一样。我更把它当成微信场景里的高频触达层，所以重点不在“做全”，而在于把分享、查看、快速跳转和低门槛登录这些链路打顺。',
    '从仓库里也能看出来这条线已经做了比较明确的微信化适配：首页、基金圈、我的之外，又拆了基金、组合、自选、宏观情绪、Copilot、分享页等多个子包，既保留核心能力，又避免一次把全部代码压进主包里。',
  ],
  summary: [
    '小程序端最难的地方，不是页面数量，而是微信链路本身。用户可能从好友转发、基金圈分享卡片、朋友圈、模板消息或者扫码直接进入，如果分享态、登录态、跳转参数和页面恢复没处理好，再完整的业务能力也会断在入口上。所以我单独做了 `shareKey/shareInfo` 的状态模型，配合 `getShareKey`、`shareClick`、`getShareInfoFromkey` 这套接口，把分享点击、内容恢复、权限判断和落地页串成完整链路。',
    '微信场景下还需要更多平台化处理。`manifest.json` 里我给 `mp-weixin` 开了 `subPackages: true` 和 `lazyCodeLoading: requiredComponents`，用来控制小程序包体和首屏加载压力；`pages.json` 则把基金、组合、自选、宏观、用户等能力拆进多个分包，让核心路径留在主包，高频但非首屏的功能延后加载。',
    '登录和审核链路我也没有偷懒。`pages/login/check.vue` 里专门做了图形验证码、账号登录和版本检查逻辑，根据审核状态决定直接进首页还是走授权/审核页，这类细节虽然不显眼，但对小程序发布和审核阶段非常关键。',
    '小程序端还有一个我比较看重的点，是它不只展示静态内容，而是继续承接了基金圈、ETF 投顾和 Copilot 这类动态内容分发能力。像 `subPackageF/share` 和 `subPackageF/copilot` 里，既要支持卡片分享、朋友圈单页模式识别，也要通过 `web-view` 把外部内容、安全参数和登录态稳稳带进去，这比普通信息流小程序更像一个业务容器。',
    '对我来说，这条线最有价值的地方，是我没有把小程序做成 Web 的缩水版，而是把它变成了一个真正适合微信传播和轻量访问的投研前台。用户既可以快速打开基金、组合、诊断和圈子内容，也可以通过分享链路把 FOF PRO 的研究资产在微信环境里持续扩散出去。',
  ],
  techStack: [
    'uni-app',
    'Vue 2',
    'Vuex',
    'uView UI',
    '微信小程序',
    'subPackages',
    'lazyCodeLoading',
    'web-view',
    'qiun-data-charts',
    'z-paging',
    'HM-dragSorts',
    '分享卡片链路',
  ],
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
