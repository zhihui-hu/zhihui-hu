import type { ProjectSource } from '../types';

export const doctorDoctorProjectSource: ProjectSource = {
  slug: 'njh-doctor',
  name: '叮铃医生（医生端）',
  route: '/products/doctor',
  logo: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/f9/15/c1/f915c11a-a1d1-af77-7d8d-f6f897895871/AppIcon-0-0-1x_U007emarketing-0-6-0-85-220.png/400x400ia-75.jpg',
  overview:
    '叮铃医生（医生端）是一款面向医生工作流的医疗应用，围绕问诊咨询、处方查询、日程管理、健康宣教和患者线上开药等核心场景展开。',
  tags: ['医疗', '在线问诊', 'iPhone', 'UniApp', '医生端'],
  companyName: '北京新里程叮铃科技有限公司',
  startDate: '2020-01-12',
  endDate: '至今',
  ongoing: true,
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
    '本产品面向医生端线上问诊、线上咨询和线上复诊开药场景，核心能力包括问诊咨询、查询处方、查看日程安排、健康宣教、个人排班、医生个人名片、患者线上开药，以及患者线下全息档案查询。',
    '作为医生端 App Owner，我负责 Android 和 iOS 双端开发、应用上架、证书管理与版本控制，并结合团队现有技术栈与交付周期选择 UniApp 方案落地。',
    '项目集成腾讯 TIM 实现在线问诊，配合个推完成消息触达，通过本地数据库缓存历史聊天记录，并使用 sensors.js 简化埋点接入与分析。',
    '随着移动平台政策和审核要求持续变化，我也持续跟进 iOS 与 Android 的能力适配、提审和问题修复，确保版本能够稳定上线。',
  ],
  techStack: ['UniApp', '腾讯 TIM', '个推', '本地数据库缓存', 'sensors.js'],
  screenshots: [
    {
      image:
        'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource114/v4/1f/37/8c/1f378c76-7a81-a4a5-a6ee-6681a9af55b5/434e21d7-eaa5-44b6-9419-179a94ce82b7_Simulator_Screen_Shot_-_iPhone_11_Pro_Max_-_2020-07-27_at_17.43.45.png/600x1300bb.webp',
    },
    {
      image:
        'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource114/v4/09/e1/fe/09e1fed7-15c9-d1ae-7b20-a4305bcc75de/ae1b352f-32c1-40f6-a8e2-26364cd726dd_Simulator_Screen_Shot_-_iPhone_11_Pro_Max_-_2020-07-27_at_17.44.56.png/600x1300bb.webp',
    },
    {
      image:
        'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource124/v4/71/0c/ed/710cedb4-c0df-7a60-c9a1-09265b5f6801/3a92d929-cb8a-451b-a76b-07c953027010_Simulator_Screen_Shot_-_iPhone_11_Pro_Max_-_2020-07-27_at_17.45.02.png/600x1300bb.webp',
    },
    {
      image:
        'https://is1-ssl.mzstatic.com/image/thumb/PurpleSource124/v4/0f/ec/44/0fec443b-a714-aedf-e170-ba989b09dab7/9a281a40-0328-4e50-b669-d71b63072d45_Simulator_Screen_Shot_-_iPhone_11_Pro_Max_-_2020-07-27_at_17.45.08.png/600x1300bb.webp',
    },
  ],
};
