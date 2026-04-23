import type { ProjectSource } from '../types';

export const doctorDoctorProjectSource: ProjectSource = {
  sortOrder: 1,
  slug: 'njh-doctor',
  name: '叮铃医生（医生端）',
  route: '/products/doctor',
  logo: 'https://img.huzhihui.com/uploads/2026/04/400x400ia-75_dhynwbo6t8vj.jpg',
  overview:
    '叮铃医生（医生端）是一款深度契合医生真实工作流的数字化医疗服务平台，全面覆盖在线问诊、复诊开药、患者档案管理、日程排班与健康宣教等核心诊疗场景，致力于提升医患沟通效率与线上执业体验。',
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
    '聚焦真实诊疗链路的医生数字化工作台，以稳定、顺畅的医患协同体验，重塑线上问诊与复诊开药流程。',
  introduction: [
    '在打磨这款产品时，我没有仅仅把它看作一个简单的医患沟通工具，而是真正把它定位成医生的「数字工作台」。为了匹配复杂的医疗业务流，我们将在线问诊、电子处方、排班管理、健康宣教与患者运营等能力进行了深度整合。',
    '线上医疗的痛点往往在于信息断层。为了解决这个问题，我们在核心链路中深度嵌合了患者电子档案与复诊开药系统，确保医生在远程服务时，依然能拥有不亚于线下坐诊的完整信息支持。',
    '医疗产品天然带有专业与严肃的底色，但在体验上，我始终追求一种克制与温和。通过缩短沟通链路、优化交互细节，我希望让每一次线上问诊都不仅是「可用」，更是顺畅与充满温度的。',
  ],
  summary: [
    '作为整个医生端 App 的核心开发者，我面临的最大挑战是如何在一个端内优雅地承载极其厚重的医疗业务。从问诊 IM、复诊开药到患者档案与排班系统，这些链路彼此强依赖、状态错综复杂，前端架构设计的核心诉求在于：既要保证业务的强关联性，又必须维持客户端的高响应与流畅体验。',
    '在技术选型上，项目基于 `uni-app + Vue 2 + Vuex` 构建，并在 UI 层深度定制了 ColorUI 与 uni-ui，实现了双端高度一致的交互体系与沉浸式自定义导航栏。我不仅独立负责了底层工程架构，还引入 json2service 本地 Mock 机制实现了前后端研发解耦，并打通了从自动化打包、证书管理到 App Store / 安卓各大应用市场上架的全链路交付。',
    '在线问诊的底座是极其苛刻的实时通信系统。为此，我深度封装了腾讯云 TIM 体系，构建了定制化的 `cloudTencentIm` 插件，抹平了多端 SDK 的差异。通过统一调度单群聊、自定义医疗消息体、撤回机制与离线推送，我将底层的通信逻辑抽象成了高可靠、易复用的业务基础设施。',
    '电子处方引擎是整个系统中最具挑战、也是含金量最高的模块。面对西药、中药、慢病处方等截然不同的业务流，我基于 Vuex 设计了一套严谨的单向数据流状态机。通过微服务化的接口串联，在前端实现了药品模板、诊断开单、医嘱校验与价格试算的高复杂度交互，将高风险的医疗流程转化成了健壮可维护的代码逻辑。',
    '为了提升弱网与冷启动体验，我在应用层封装了 SQLite 与多级命名空间缓存，实现了按医院、医生的强数据隔离与 IM 会话本地持久化。同时，针对医疗场景高频的影像资料流转，我结合腾讯 COS SDK 与 `plus.zip.compressImage` 重构了图片管线，不仅实现了带进度条的底层直传，还通过原生算法自动纠正 EXIF 旋转角，彻底攻克了临床大图上传导致的内存溢出与方向错乱。',
    '在原生能力的下沉与拓展上，我通过整合 Push、地图、语音识别、SQLite 等诸多 `app-plus` 模块，大幅拓宽了应用的能力边界。回顾整个历程，真正的考验往往在代码之外——如何在严苛的医疗合规要求下，同时抗住极高的业务复杂度、解决海量机型的双端适配，并一次次稳妥地通过 App Store 的严格审核，这是我认为自己在这个项目中交出的最满意答卷。',
  ],
  techStack: [
    'uni-app',
    'Vue 2',
    'Vuex',
    'ColorUI & uni-ui',
    'Tencent TIM (Web/WX)',
    'Tencent COS',
    'SQLite 持久化',
    'app-plus 原生插件',
    'UniPush',
    'CL-UpDater',
    'iFly 语音识别',
    '原生图片压缩与 EXIF 修正',
    'json2service Mock',
    '多环境 API 治理',
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
