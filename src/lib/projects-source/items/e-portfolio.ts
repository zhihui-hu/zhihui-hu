import type { ProjectSource } from '../types';

export const ePortfolioProjectSource: ProjectSource = {
  sortOrder: 3,
  slug: 'e-portfolio',
  name: 'E-Portfolio（App）',
  route: '/products/e-portfolio',
  logo: 'https://img.huzhihui.com/uploads/2026/04/1024x1024_328cwms0xtnm2.png',
  overview:
    'E-Portfolio App 是一款面向新加坡幼儿园教师的移动数字成长档案应用。它把学生相册、课堂作品、课程记录与观察笔记整合进统一流程，并支持基于沉淀素材生成双语成长报告与可编辑的 PPT 内容，让老师在手机上就能更轻松地完成记录、整理、展示与分享。',
  tags: ['教育科技', '成长档案', 'AI 报告', 'uni-app'],
  urls: {
    official: 'https://qutke.com/',
    ios: 'https://apps.apple.com/cn/app/e-portfolio/id6741792285?l=en-GB',
    android: 'https://www.pgyer.com/XFdTFnj1',
  },
  companyName: '况客科技（北京）有限公司',
  startDate: '2025-03',
  ongoing: true,
  ageRating: '4+',
  category: '教育',
  industry: '教育科技',
  categories: ['AI 教育工具', '移动端 App', '成长档案'],
  platforms: ['iPhone', 'Android', 'H5'],
  langs: ['中文简体', '英语'],
  price: 0,
  headline:
    '把学生相册、作品记录、AI 生成报告与双语分享整合进一个轻量化移动端，帮助新加坡幼教老师把日常课堂素材更快整理成可展示、可沟通、可留档的成长内容。',
  introduction: [
    '这个项目不是传统意义上的“家园沟通”工具，而更像一套专为新加坡幼教老师设计的移动工作台。首页把 Students、Curriculum、Plan、Album、Works、Report 和 Prompt 七个模块整合进统一入口，老师可以围绕班级、学生与教学主题快速切换，减少在不同系统之间来回跳转的负担。',
    '在使用场景上，它覆盖学生资料管理、课堂素材上传、作品标签维护、班级相册归档，以及成长报告查看与编辑等高频动作。老师可以边教学边沉淀照片、作品和观察记录，把原本零散的日常素材整理成按学生、按时间线可追溯的数字成长档案。',
    '作为整个 E-Portfolio 产品矩阵里离一线老师最近的一层，这个 App 负责把素材采集与内容沉淀这件事做顺。后续无论是后台协同管理，还是进入独立 PPT 编辑器进一步精修报告，都建立在移动端随手可记、随手可传的基础上。',
  ],
  summary: [
    '工程底座采用 `uni-app + Vue 2 + Vuex + uView UI`，核心目标不是简单复用页面，而是让同一套教育业务流程稳定运行在 iOS、Android 与 H5 多端环境里。通过 `pages` 与 `subPackages` 拆分首页、学生、作品、报告、提示词等子域，页面结构在持续扩展时仍然保持清晰。',
    '我在这个项目里最重视的，是“素材采集 -> 结构化沉淀 -> AI 生成 -> 编辑导出 -> 分享留档”这条完整内容链路。老师可以先上传相册和作品素材，再为图片补充中英文标签、摘要与学生归属，随后进入报告模块，把零散记录汇总成真正可展示的成长内容。',
    '移动端并不只是一个素材上传器，它本身已经承载了班级切换、搜索筛选、图片预览、上传选择器、双语切换和内容查看等高频工作流。对一线老师来说，最重要的不是功能多，而是能不能在课堂与备课之间顺手把内容记下来，这正是我在交互上最在意的一点。',
    '在状态层，我借助 `vuex-persistedstate` 保持用户、班级与当前编辑上下文等关键信息，尽量减少老师在高频操作中的重复输入成本；而在报告链路上，则通过 Prompt 驱动内容生成、Markdown 渲染和 WebView 编辑接入，把报告初稿生成与后续精修自然串联起来。',
    '对我来说，E-Portfolio App 最有价值的地方，是它把“教学过程记录”从零散、重复、强依赖事后整理的工作，压缩成了一条随手可用的移动端工作流。老师不再只是被动地堆积照片与作品，而是能边教学边把成长内容持续沉淀下来。',
  ],
  techStack: [
    'uni-app (iOS/Android/H5)',
    'Vue 2 + Vuex',
    'uView UI',
    'Vue I18n 双语切换',
    'vuex-persistedstate',
    'Prompt 驱动内容生成',
    'Markdown-It / Marked / Turndown',
    'WebView 报告编辑接入',
    'uni-file-picker / 图片上传',
    'dayjs / lodash',
  ],
  screenshots: [
    {
      image: 'https://img.huzhihui.com/uploads/2026/04/ios-1_w8a2tfjv0doh.png',
    },
    {
      image: 'https://img.huzhihui.com/uploads/2026/04/ios-2_vlqvubgvgs3k.png',
    },
    {
      image: 'https://img.huzhihui.com/uploads/2026/04/ios-3_3n4qsxw8zsfwp.png',
    },
    {
      image: 'https://img.huzhihui.com/uploads/2026/04/ios-4_344wtkv8cwa3e.png',
    },
  ],
};
