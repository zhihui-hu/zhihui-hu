import type { ProjectSource } from '../types';

export const doctorPatientProjectSource: ProjectSource = {
  sortOrder: 3,
  slug: 'doctor-patient',
  name: '叮铃医生（患者端）',
  route: '/products/doctor',
  logo: 'https://img.huzhihui.com/uploads/2026/04/dling_dhxzckmr2b08.png',
  overview:
    '叮铃医生（患者端）是一套运行在微信环境中的互联网医院患者前台，围绕导诊找医生、在线问诊、处方购药、订单管理、疾病知识和个人服务等场景组织完整患者服务链路。',
  tags: ['医疗', '患者端', 'uni-app', '微信 H5', '在线问诊'],
  urls: {
    official: 'https://www.njhgroup.cn/',
    web: 'https://h5.51dling.com/h5',
  },
  companyName: '北京新里程叮铃科技有限公司',
  startDate: '2020-01',
  endDate: '2021-03',
  ageRating: '17+',
  category: '医疗',
  industry: '医疗',
  categories: ['患者端 H5', '微信 Web App'],
  platforms: ['微信 / H5'],
  langs: ['中文简体'],
  price: 0,
  headline:
    '本产品不只是患者咨询入口，而是把导诊、医生搜索、图文问诊、IM 沟通、处方购买、订单查询、疾病知识和个人中心整合进同一套微信患者端体验里。',
  introduction: [
    '我把患者端理解成互联网医院面向用户的主入口，而不是一个只能发起咨询的单点页面，所以首页就同时承接导诊服务、在线问诊、保险服务、肿瘤专科、热门服务、健康资讯和健康小工具。',
    '用户从搜索医生、筛选科室与城市、查看医生主页，到填写问诊信息、进入问诊室、接收医生消息、查看处方和继续购药，整条路径都在这一端完成。',
    '整体工程采用 uni-app 组织患者侧 H5，多页结构配合 Vuex 状态模块，把咨询、医生、处方、个人中心和聊天会话这些相互关联的能力拆清楚后再串成统一体验。',
  ],
  summary: [
    '患者端最有挑战的地方，不是做出几个页面，而是把患者真正会走的完整链路接住。代码里能看到它同时覆盖首页导诊、医生搜索筛选、专病专科、疾病知识、我的咨询、处方订单、地址管理、问诊人管理、投诉建议和消息中心，这已经不是简单的展示型 H5，而是一套相对完整的互联网医院患者前台。',
    '工程上我用 `uni-app + Vue 2 + Vuex` 组织页面与状态，把医生、聊天、处方、用户等能力拆成独立 store 模块。像热门服务、科室列表、城市筛选、肿瘤专科轮播、就诊人和地址这些全局状态，会统一在 store 和 action 里流转，避免页面一多之后数据源变得零散。',
    '问诊链路里最重的一块是 IM 交互。我接入了腾讯云 TIM，并额外封装了 `cloudTencentIm`，去统一处理登录、会话列表、文本/图片/语音/视频消息、自定义消息、撤回、未读数和资料同步。问诊室里不只是普通聊天，还能承接历史病历、历史处方药、诊疗建议、医生开方、评价、退诊和系统通知等多种业务消息。',
    '支付与处方链路也是这个项目比较实战的一部分。患者可以在会话里接收处方消息，进入处方详情后选择配送、发起微信支付，并在订单页继续查看状态、退款或补支付。前端这边除了页面流程，还要把处方详情、订单状态、药品明细、地址编辑和支付跳转这些环节串稳定。',
    '另外我还补了微信公众号 OAuth 登录、手机号绑定、微信 JSSDK 能力、定位取城市、资讯分享、健康工具入口和文件上传等细节。对我来说，这个项目真正体现的是把“患者触达、问诊沟通、处方转化、后续服务”放进同一个前端系统里，而不是只做一个轻量落地页。',
  ],
  techStack: [
    'uni-app',
    'Vue 2',
    'Vuex',
    '@dcloudio/uni-ui',
    'whatwg-fetch',
    'js-cookie',
    'query-string',
    'SCSS',
    'jweixin-module',
    '腾讯云 TIM',
    'tim-js-sdk',
    'tim-wx-sdk',
    'cos-js-sdk-v5',
    'cos-wx-sdk-v5',
    '微信公众号 OAuth',
    '微信支付',
  ],
  resources: [
    {
      label: '新里程&智康二期改版联调问题汇总',
      url: 'https://docs.qq.com/sheet/DQVhoUXF5TmZ6cUZ1?tab=BB08J2',
    },
    {
      label: '一期优化需求问题汇总',
      url: 'https://docs.qq.com/sheet/DQVVab05SZ3VVZ0xJ?tab=BB08J2',
    },
  ],
};
