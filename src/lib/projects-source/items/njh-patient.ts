import type { ProjectSource } from '../types';

export const doctorPatientProjectSource: ProjectSource = {
  sortOrder: 9,
  slug: 'doctor-patient',
  name: '叮铃医生（患者端）',
  route: '/products/doctor',
  logo: 'https://img.huzhihui.com/uploads/2026/04/dling_dhxzckmr2b08.png',
  overview:
    '叮铃医生（患者端）是一款深度植根于微信生态的互联网医院全链路前台，全面涵盖智能导诊、专家问诊、电子处方流转、在线购药、疾病科普与个人健康档案管理，为患者提供一站式、闭环的数字医疗服务。',
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
    '超越单一问诊入口，打造覆盖“寻医、问诊、开方、购药”全生命周期的微信端互联网医院闭环体验。',
  introduction: [
    '在架构设计之初，我就明确了患者端的定位：它绝不是一个简单的“在线客服”入口，而是整座互联网医院的数字大门。因此，在首屏架构上，我们前置了智能导诊、专科挂号、健康资讯与保险服务，以满足不同层次患者的诉求。',
    '医疗服务的核心在于“信任与连贯”。为了保障这种连贯性，我主导设计了一条极简的用户主路径：从多维度搜索医生、浏览履历，到结构化病情采集、沉浸式 IM 问诊，再到一键流转处方与在线支付购药，让原本割裂的线下就医环节在微信端丝滑流转。',
    '技术选型上，我们基于 uni-app 搭建了这套 H5 体系。面对错综复杂的医疗业务，我通过 Vuex 对全局状态进行了深度的领域驱动拆分，将问诊引擎、处方订单、用户档案等核心模块解耦，确保底层的稳定支撑力。',
  ],
  summary: [
    '这套患者端系统真正的挑战在于“业务纵深”。它远超常规的展示型 H5，实质上承担了完整的互联网医院前台职能。代码架构中同时承载了科室导诊、结构化病情采集、高并发问诊大厅、处方流转与电商化的订单结算，这对前端工程的模块化管理提出了极高要求。',
    '在工程化落地层面，我基于 `uni-app + Vue 2` 并引入 `uni-ui` 构建视觉规范，核心亮点是对 Vuex 进行了领域划分。面对就诊人档案、科室级联字典、全国城市映射以及购物车级别的处方管理，我通过严格的 Store & Action 分层流转，彻底避免了随着页面激增带来的数据源污染和状态失控。',
    'IM 问诊室是整个系统的流量与技术中枢。针对医疗场景，我深度二次封装了腾讯云 TIM SDK，构建了 `cloudTencentIm` 中间件。它不仅抹平了多端差异，更重要的是，它能对结构化病历、电子处方、诊疗建议、病情追问等数十种高复杂度的“自定义业务消息”进行统一编排与渲染，让聊天窗口真正变成了诊疗操作台。',
    '在商业转化的最后一环——处方与支付链路，我结合微信生态完成了深度的闭环设计。通过接入微信公众号 OAuth 与微信支付 API，实现了从“会话内点击处方 -> 选择收货地址 -> 调起原生支付 -> 订单状态轮询”的无缝衔接。此外，还配合 Node.js (Express + http-proxy-middleware) 搭建了本地联调代理机制，大幅提升了接口联调与支付测试的效率。',
    '除此之外，为了压榨微信生态的红利，我还全面集成了微信 JSSDK，实现了精准定位、朋友圈二次分享卡片、以及基于腾讯 COS 的直传影像资料上传。回顾这个项目，我最满意的是通过扎实的前端架构，将“患者触达、问诊沟通、处方转化、健康随访”这四条极度复杂的长链路，优雅地捏合成了一个高性能、高体验的系统。',
  ],
  techStack: [
    'uni-app (H5)',
    'Vue 2 + Vuex',
    'uni-ui & SCSS',
    'Tencent TIM (Web/WX)',
    'Tencent COS 直传',
    'WeChat JS-SDK',
    '微信公众号 OAuth',
    '微信支付原生接入',
    'Node.js 联调代理 (Express)',
    'whatwg-fetch 网络层封装',
    '全局状态与领域模型拆分',
  ],
  // resources: [
  //   {
  //     label: '新里程&智康二期改版联调问题汇总',
  //     url: 'https://docs.qq.com/sheet/DQVhoUXF5TmZ6cUZ1?tab=BB08J2',
  //   },
  //   {
  //     label: '一期优化需求问题汇总',
  //     url: 'https://docs.qq.com/sheet/DQVVab05SZ3VVZ0xJ?tab=BB08J2',
  //   },
  // ],
};
