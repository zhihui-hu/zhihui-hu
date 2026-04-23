import type { ProjectSource } from '../types';

export const ePortfolioAdminProjectSource: ProjectSource = {
  sortOrder: 10,
  slug: 'e-portfolio-admin',
  name: 'E-Portfolio（Admin）',
  logo: 'https://img.huzhihui.com/uploads/2026/04/1024x1024_328cwms0xtnm2.png',
  overview:
    'E-Portfolio 管理后台是一套面向新加坡幼教场景的 Web 工作台，同时覆盖老师直接操作模式、超级管理员模式，以及内嵌并逐步独立抽离的 PPT 编辑器能力。它负责承接教师、学生、班级、课程、消息、报告与权限管理，并将 AI 生成报告、演示文稿编辑与导出完整串联进后台工作流。',
  tags: ['后台管理', 'AI PPT', '双角色权限', 'Vue 3'],
  urls: {
    official: 'https://qutke.com/',
    web: 'http://test.epf.openalpha.cn',
  },

  companyName: '况客科技（北京）有限公司',
  startDate: '2025-04',
  ongoing: true,
  ageRating: '4+',
  category: '教育',
  industry: '教育科技',
  categories: ['教师工作台', '系统管理后台', 'Web PPT 编辑器'],
  platforms: ['Web 后台', 'Web PPT 编辑器'],
  langs: ['中文简体', '英语'],
  price: '内部系统',
  headline:
    '将老师工作台、超级管理员后台、AI 报告生成与可视化 PPT 编辑整合进同一套 Web 系统，让一线教学、园所管理与成果表达在同一条业务链路里协同运转。',
  introduction: [
    '这套系统不是单纯的“配置后台”，而是 E-Portfolio 真正的桌面化操作中枢。它一方面服务老师在 Web 端完成更重度的内容整理、报告生成与演示文稿编辑，另一方面也服务园所管理者完成组织结构、人员与权限的整体配置。',
    '老师直接操作模式更像一套工作台，围绕班级、学生、相册、作品、课程、报告和 Prompt 展开。老师可以按学生和时间范围挑选素材，走简单或高级两种生成模式，先产出双语 Markdown 报告，再继续进入 PPT 编辑器完成可视化精修。',
    '超级管理员模式则更偏系统后台，负责学校、年级、班级、教师、学生、课程、消息通知、角色分配与菜单权限等组织级管理。而原本内嵌在后台中的 PPT 编辑器，也已经逐步抽离成具备独立演进潜力的模块，只是它的最佳落地场景依然和这套后台深度绑定。',
  ],
  summary: [
    '这套后台前端基于 `Vue 3 + Vite + Element Plus + Pinia + Vue Router + Vue I18n` 构建，目标不是快速堆页面，而是支撑一套可长期迭代的教育 SaaS 后台。工程里既保留了系统级的权限、菜单、路由与国际化能力，也单独划出了 `epf` 业务域承接教师和园所相关模块。',
    '角色权限体系是后台的第一根主线。项目通过动态路由、角色校验、权限指令和系统管理模块，把老师工作台与超级管理员后台收在同一个工程里。老师更关注班级、学生、内容与报告；管理员则更多处理学校、教师、课程、消息和系统配置，这让后台既统一又不会互相干扰。',
    'AI 报告链路是业务上最有辨识度的一部分。后台支持简单与高级两种生成模式，老师可以选择学生、日期范围、相册、作品和 Prompt，生成中英文报告初稿，再在 Markdown 编辑器里继续调整。这条链路把“素材筛选、变量注入、内容生成、双语维护”完整串了起来。',
    '在报告精修阶段，后台通过 `iframe + postMessage` 内嵌 PPT 编辑器，并打通了全屏编辑、保存回传、快照导出与 PDF 持久化流程。随着功能逐渐完整，这部分能力又被进一步沉淀为可独立演进的 Web PPT 模块，开始具备从业务中抽离、复用甚至开源的潜力。',
    '这个编辑器部分并不是一个轻量预览页，而是一套真正的 Web 幻灯片引擎，逐步覆盖了文本、图片、形状、图表、表格、音视频、公式、动画、移动端基础编辑以及 AI PPT 生成等能力。也正因为它和后台之间的关系既深又自然，我更倾向于把它们视作同一个项目中的两个层次，而不是完全割裂的两个产品。',
    '从工程视角看，我很喜欢这个项目的一点，是它没有停在“做一个后台”这么浅的层面，而是同时把运营后台、老师工作台、AI 内容生成和演示文稿编辑四种完全不同的交互范式揉进一套系统里，并且通过双语化与角色分层让它真正适合新加坡幼教场景。',
  ],
  techStack: [
    'Vue 3',
    'TypeScript',
    'Vite',
    'Element Plus',
    'Pinia',
    'Vue Router 4',
    'Vue I18n',
    'md-editor-v3 / Markdown 编辑',
    'Tiptap / Lexical / Quill 富文本能力',
    'iframe + postMessage',
    'html2canvas + html2pdf.js',
    'ProseMirror',
    'pptxgenjs / pptxtojson',
    'html-to-image / jsPDF',
    'ECharts',
    'vuedraggable',
    'Tailwind CSS',
  ],
  screenshots: [
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/epf-01_27cv8n4hmdh4m.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/epf-02_3v6wegxxc2b4c.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/epf-03_1h73xhtwfneox.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/epf-04_2siauzz0qg011.png',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/epf-05_2biguj7cb87jb.png',
    },
  ],
};
