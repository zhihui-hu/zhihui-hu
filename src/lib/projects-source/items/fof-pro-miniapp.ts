import type { ProjectSource } from '../types';

export const fofProMiniappProjectSource: ProjectSource = {
  sortOrder: 6,
  slug: 'fof-pro-miniapp',
  name: 'FOF PRO（小程序端）',
  route: '/products/fof-pro',
  logo: 'https://img.huzhihui.com/uploads/2026/04/fof-pro-logo_dhxzck5wom6g.png',
  overview:
    'FOF PRO 微信小程序端与 App 端共用同一套 `uni-app` 核心代码资产。它深度植根于微信生态，不仅承接了重度基金投研与组合诊断功能，更构建了一条以“基金圈社交分享”、“投研卡片裂变”与“Copilot 动态触达”为核心的轻量化业务链路。',
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
    '突破微信小程序的性能桎梏，通过极限分包与按需加载机制，将重度金融诊断与 AI 投研转化为轻量、易分享的微信社交裂变卡片。',
  introduction: [
    '在多端架构设计中，我拒绝了为小程序单独拉分支的“低效解法”，而是通过条件编译与环境解耦，在同一个 `uni-app` 仓库内实现了 App 与 `mp-weixin` 端的完美共生。这确保了组合诊断、AI Copilot 等核心投研引擎在双端的高度一致性。',
    '但小程序绝非 App 的粗暴阉割版。在定位上，我将其重塑为“高频社交触达层”。它的使命不是让用户在微信里做重度数据清洗，而是打通“一键拉起小程序 -> 免密登录 -> 消费诊断卡片 -> 再次分享”的无阻力裂变链路。',
    '为此，我主导了极端的包体优化战役：将主包剥离至只保留骨架与核心入口，把基金详情、宏观情绪、Copilot 等厚重业务物理拆分为近 10 个独立子包。这不仅避开了 2MB 主包红线，更换来了微信端秒开的极致体验。',
  ],
  summary: [
    '小程序生态最艰险的暗礁在于“碎片化入口闭环”。用户可能从单聊卡片、朋友圈扫码甚至模板消息空降到任何一个深度子页面。为此，我设计了一套高容错的 `shareKey/shareInfo` 状态机拦截器：它能接管分享来源、动态还原路由上下文、处理无痕登录并精确越权拦截，确保用户不论从哪种姿势进入，都能享受到完整的沉浸式投研链路。',
    '在性能压榨方面，微信给的枷锁极重。我在 `manifest.json` 中强启了 `lazyCodeLoading: requiredComponents` 组件按需注入，配合 `pages.json` 中极度克制的 `subPackages` 路由映射，将首屏加载时间大幅压缩。主包只管骨架，重业务全部延后懒加载。',
    '针对金融小程序极其严苛的上架审核机制，我独立封装了一套隐式审核态网关 (`login/check.vue`)。它能通过后端下发的动态版本标识，智能调度验证码校验、账号体系鉴权与安全兜底逻辑，这套“马甲机制”大幅降低了版本迭代时的被拒风险。',
    '为了将大型 AI Copilot 与 ETF 投顾系统塞进微信环境，我将其重构为一个“原生壳 + web-view 容器”的混合架构。难点在于跨端通信：我打通了双向消息桥接，确保了外部系统的单点登录态 (SSO) 与微信原生分享机制的无缝融合，甚至兼容了微信极难处理的“朋友圈单页模式”。',
    '这套工程的最终形态，不再是一个依附于 Web 端的只读工具。它化身为一台精密的“社交投研发动机”，让基金组合、大模型报告这些厚重的金融资产，能够以一种极其优雅、顺滑的卡片姿态，在微信的社交洪流里快速裂变与沉淀。',
  ],
  techStack: [
    'uni-app (跨端共生)',
    'Vue 2 & Vuex',
    '极限分包 (subPackages)',
    '组件按需加载 (lazyCodeLoading)',
    'WebView 双向桥接通信',
    '动态分享态闭环 (ShareKey)',
    '朋友圈单页模式适配',
    '智能审核态网关 (版本控制)',
    'uView UI',
    'qiun-data-charts',
    'z-paging (虚拟长列表)',
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
