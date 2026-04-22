import type { ProjectSource } from '../types';

export const doctorDoctorProjectSource: ProjectSource = {
  slug: 'njh-doctor',
  name: '叮铃医生（医生端）',
  route: '/products/doctor',
  logo: 'https://img.huzhihui.com/uploads/2026/04/400x400ia-75_dhynwbo6t8vj.jpg',
  overview:
    '叮铃医生（医生端）是一款面向医生工作流的医疗应用，围绕问诊咨询、处方查询、日程管理、健康宣教和患者线上开药等核心场景展开。',
  tags: ['医疗', '在线问诊', 'iPhone', 'UniApp', '医生端'],
  companyName: '北京新里程叮铃科技有限公司',
  startDate: '2020-01-12',
  endDate: '至今',
  ongoing: true,
  ageRating: '17+',
  category: '医疗',
  industry: '医疗',
  categories: ['医生端 App', 'iPhone 应用'],
  platforms: ['iPhone', 'Android'],
  langs: ['中文简体', '英语'],
  price: 0,
  urls: {
    official: 'https://www.njhgroup.cn/',
    ios: 'https://apps.apple.com/cn/app/%E5%8F%AE%E9%93%83%E5%8C%BB%E7%94%9F-%E5%8C%BB%E7%94%9F%E7%89%88/id1475864364',
    android: 'https://sj.qq.com/appdetail/com.zhicall.xinlicheng',
  },
  headline:
    '本产品聚焦医生端线上问诊与复诊开药流程，同时通过档案查询、工作安排和消息协同能力提升医生日常效率。',
  introduction: [
    '我把这款产品定位成医生的线上工作台，而不是单一的即时沟通工具，因此在功能设计上会同时覆盖问诊咨询、处方查询、日程安排、健康宣教、个人排班、医生名片和患者线上开药等能力。',
    '除了线上咨询本身，这个项目还承接了复诊开药和患者档案查看等需求，让医生在远程服务场景下也能获得更完整的信息支持。',
    '整体体验上，我更希望它缩短医患沟通链路，让线上咨询不仅可用，而且足够顺畅、温和。',
  ],
  summary: [
    '我把医生端定位成医生的线上工作台，而不是一个单纯的 IM 工具，所以前端实现上必须同时承接问诊、复诊开药、历史处方、患者档案、排班和健康宣教等多条业务链路。真正的难点在于，这些链路彼此强相关，但又不能互相拖垮体验。',
    '客户端基于 `uni-app + Vue 2 + Vuex` 组织双端工程，我负责 Android 与 iOS 的整体交付、上架提审、证书与版本管理。对我来说，这个项目的亮点不是“跨端”，而是我在跨端前提下依然把问诊与处方场景的操作节奏做顺了。',
    '实时通信部分我通过自定义 `cloudTencentIm` 插件封装腾讯云 TIM，分别接入 `tim-wx-sdk`、`tim-js-sdk` 和 COS SDK，统一处理单聊/群聊、自定义消息、消息撤回、未读数、会话列表同步与推送桥接逻辑，让问诊消息链路可以被业务稳定复用。',
    '电子处方是这套系统里最有技术含量的一块。我把西药、中药和慢病处方拆成独立状态流，用 Vuex 管理药品模板、诊断、医嘱、药品明细与价格计算，并串联 `doctor-api`、`pres-api`、`im-api` 等多组接口，把复诊开药这种高风险流程做成可维护的前端实现。',
    '本地能力层面我接入了 SQLite、命名空间缓存和会话持久化，用于首开状态管理、按医院与医生隔离缓存数据，以及 IM 会话本地恢复；图片上传链路还额外封装了 `plus.zip.compressImage` 与 EXIF 方向修正，保证医生日常上传资料时更稳定。',
    '工程与原生能力方面，项目配置了 Push、SQLite、Maps、Speech、Share 等 `app-plus` 模块，并引入 `CL-UpDater` 原生升级插件、UniPush、微信分享与 iFly 语音能力。对我来说，这个项目真正的难点，是在医疗场景里同时扛住业务复杂度、双端适配和上架审核三件事。',
  ],
  techStack: [
    'uni-app',
    'Vue 2',
    'Vuex',
    'ColorUI',
    '腾讯云 TIM',
    'TIM Web SDK',
    'TIM WX SDK',
    'COS SDK',
    'SQLite',
    'UniPush',
    'CL-UpDater',
    'iFly Speech',
    'plus.zip.compressImage',
    '多环境 API 封装',
  ],
  screenshots: [
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynwczaru9x.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynwej2akaw.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynwg9q2fgn.webp',
    },
    {
      image:
        'https://img.huzhihui.com/uploads/2026/04/600x1300bb_dhynwhi89130.webp',
    },
  ],
};
