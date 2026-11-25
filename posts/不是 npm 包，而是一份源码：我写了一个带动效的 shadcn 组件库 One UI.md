---
title: 不是 npm 包，而是一份源码：我写了一个带动效的 shadcn 组件库 One UI
slug: one-ui-animated-shadcn-registry
image: https://ui.huzhihui.com/og/zh.png
publishedAt: 2026-11-25T10:00
summary: One UI 是一个基于 shadcn registry 的动效组件库，32 个组件用一行 shadcn 命令装进项目，源码归你。本文介绍它怎么用，并拆解数字滚轮、gooey 导航、纸飞机目录、squircle 圆角这几个组件背后的实现，以及整套组件的设计风格。
keywords:
  - One UI
  - shadcn registry
  - shadcn/ui
  - React 组件库
  - Motion 动画
  - Tailwind CSS
  - squircle
  - prefers-reduced-motion
tags:
  - One UI
  - React
  - shadcn
  - 动效
  - 组件库
---

![One UI 动效组件库](https://ui.huzhihui.com/og/zh.png)

## 前言

最近把博客的顶部导航、文章目录和阅读进度换成了自己写的组件，顺手把这些组件整理成了一个独立的组件库：**One UI**。

写这篇文章有两个目的：一是介绍 One UI 怎么用、适合什么场景；二是把里面几个我觉得比较有意思的实现拆开讲一讲，比如数字滚轮怎么做到“永远往前滚”、gooey 导航的“拉丝”效果是怎么画出来的、纸飞机为什么能贴着目录的轨道转弯。

阅读本文前最好对 React、Tailwind CSS 和 shadcn/ui 有基本了解。文中涉及的版本：Next.js `16.4`、React `19.2`、Motion `12`、Tailwind CSS `v4`、shadcn CLI `v4`。

## 访问地址

- 组件预览：[ui.huzhihui.com/components](https://ui.huzhihui.com/components)
- GitHub 仓库：[zhihui-hu/one-ui](https://github.com/zhihui-hu/one-ui)

## One UI 是什么

一句话说，One UI 是一个 **shadcn registry**，不是 npm 包。

我们知道传统组件库的用法是 `npm install xxx`，然后 `import { Button } from 'xxx'`。组件在 `node_modules` 里，想改样式只能靠覆盖 className 或者等官方开放 API，改深一点就只能 fork。

shadcn/ui 换了一个思路：CLI 把组件的**源码**直接写进你的项目。One UI 沿用了这个模式，每个组件都是一份 registry JSON，里面描述了源码文件、npm 依赖和需要的其他 registry 组件。安装之后组件就落在 `components/ui` 下，代码完全归你。

目前一共 32 个组件，大致分成几类：

| 类别         | 组件                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------- |
| 导航与侧边栏 | `gooey-nav`、`bounce-sidebar`、`hook-sidebar`、`proximity-sidebar`                          |
| 阅读体验     | `rail-toc`、`scroll-progress`、`code-block`、`faq`                                          |
| 表单输入     | `otp-input`、`password-input`、`duration-picker`、`delete-button`                           |
| 通知与反馈   | `toast`、`notification-bell`、`emoji-reaction`、`animated-counter`                          |
| AI 对话界面  | `model-picker`、`prompt-box`、`streaming-response`、`web-search`、`ai-status`、`matrix-orb` |
| 展示类       | `fluid-orb`、`github-activity`、`folder-component`、`grid-reveal`、`gravity-letters` 等     |

## 使用

### 用 CLI 安装

最直接的方式是给 shadcn CLI 一个完整的 registry 地址：

```bash
npx shadcn@latest add https://ui.huzhihui.com/r/animated-counter.json
```

执行后，CLI 会做三件事：

1. 把 `animated-counter.tsx` 写到 `components/ui` 下；
2. 安装它依赖的 npm 包，这里是 `motion`；
3. 如果项目里还没有 `cn` 工具函数，顺带把 `lib/utils.ts` 也装上。

### 注册短名

每次写完整 URL 比较啰嗦，可以在 `components.json` 里注册一个命名空间：

```json
{
  "registries": {
    "@one-ui": "https://ui.huzhihui.com/r/{name}.json"
  }
}
```

之后就可以用短名安装：

```bash
npx shadcn@latest add @one-ui/gooey-nav
```

这里要注意，必须带上 `@one-ui/` 前缀。直接写 `add gooey-nav` 会去 shadcn 默认的 registry 里找，找不到的。

### 让 AI 助手帮你装

shadcn CLI 自带 MCP 服务，初始化一次：

```bash
npx shadcn@latest mcp init --client claude
```

`--client` 也可以换成 `cursor` 或 `vscode`。之后在 Claude Code 里直接说“添加 One UI 的 fluid orb”，助手就会通过 MCP 找到组件并安装。

### 在博客里的实际使用

拿本博客的文章页来说，桌面端右侧的目录用的是 `rail-toc`，移动端底部的阅读进度用的是 `scroll-progress`：

```tsx
<RailToc items={railItems} title="目录" />

<ScrollProgress
  className="bottom-[max(1.5rem,env(safe-area-inset-bottom))] xl:hidden"
  labels={{ showSections: '展开目录' }}
  sections={sections}
/>
```

开源项目卡片上的 Star 和 Fork 数字用的是 `animated-counter`，卡片滚动进视口后数字从 0 滚到真实值。因为源码在自己项目里，这些地方我都按博客的需要改过，比如目录标题过长时截断、展开菜单限制最大高度，这正是 registry 模式的好处。

## 技术要点

接下来挑几个组件，看看它们是怎么实现的。

### animated-counter：一个只会往前滚的数字滚轮

数字滚轮的思路并不复杂：每一位数字是一个竖向的 0~9 列表，外面套一个 `overflow: hidden` 的窗口，通过 `translateY` 决定露出哪个数字。

麻烦在边界上。比如从 9 变到 0，如果直接把位置从 9 设成 0，滚轮会倒着滚回去 9 格，看起来很别扭。我们希望它往前多走一格就好。

首先，列表末尾多放一个 0：

```ts
const FACES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
// the trailing 0 makes the wrap from 9 back to 0 land on an identical face
const WHEEL = [...FACES, 0];
```

然后滚轮位置用一个不断累加的数字表示，渲染时再取模：

```ts
if (mod(goal.current, 10) !== digit) {
  const at = pos.get();
  goal.current =
    heading.current < 0 ? at - mod(at - digit, 10) : at + mod(digit - at, 10);
}
const roll = animate(pos, goal.current, spring(duration));

return useTransform(pos, (p) => `${(-mod(p, 10) * 100) / WHEEL.length}%`);
```

可以看到这里有几个细节：

- `goal` 是一个只增不减（或只减不增）的位置，9 → 0 实际是 9 → 10，取模后正好落在末尾那个 0 上，视觉上就是往前滚了一格；
- 新目标是从**当前位置** `pos.get()` 算出来的，而不是从上一个目标算。也就是说数字快速变化时，滚轮不会积压一串没滚完的圈数；
- 方向 `heading` 由数值变大还是变小决定，变小时往回滚。

另外还有两个容易忽略的点：

1. 每一位的 `key` 按“距离右边第几位”来算，而不是按下标。这样数字从 999 变成 1000 时，原来的三列只是整体左移，新出现的千位从 0 滚进来，不会整行重新挂载；
2. 上下边缘用 `mask-image` 做了渐隐，而且是一条缓动曲线而不是直线渐变。源码注释里说得很直白：同样宽度的线性渐隐看起来像一条硬边。

### gooey-nav：用 SVG 画出“拉丝”

gooey 效果常见的做法是 `feGaussianBlur` 加 `feColorMatrix` 的 SVG 滤镜：先把元素模糊，再把 alpha 通道的对比度拉高，相邻的两个色块就会黏在一起。这个方法简单，但有两个问题：滤镜很吃性能，边缘也会被模糊得发软。

`gooey-nav` 没有用滤镜，而是在两个分段之间直接画一条“脖子”：

```ts
function neckPath(gap: number, span: number) {
  const waist = NECK_H * (1 - gap / (span * NECK_BREAK));
  if (waist <= 0) return '';
  const start = span - gap;
  const mid = start + gap / 2;
  return `M${start} 0 Q${mid} ${NECK_H - waist} ${span} 0 L${span} ${NECK_H} Q${mid} ${waist} ${start} ${NECK_H} Z`;
}
```

这是两条二次贝塞尔曲线围成的形状，上下两边向中间收腰。来看看它是怎么动起来的：

1. 选中项和左右邻居之间的间距 `gap` 是一个 Motion spring 值；
2. 每一帧通过 `useTransform` 把 `gap` 映射成新的 path；
3. `gap` 越大，腰越细，当 `gap` 超过宽度的 22%（`NECK_BREAK`）时，腰细到 0，路径直接返回空字符串，两块就“断开”了。

脖子的填充色用 `linearGradient` 从左边分段的颜色过渡到右边分段的颜色，所以选中项和普通项颜色不同时，连接处也不会出现色块跳变。这样效果是锐利的，也不需要任何滤镜。

### rail-toc：让纸飞机贴着轨道飞

`rail-toc` 的目录左侧有一条轨道，不同层级的标题缩进不同，所以轨道是一条折线。阅读时，一架纸飞机沿着轨道飞到当前章节，转弯时机头会跟着转向。

这里核心用到的是 SVG 的两个原生 API：`getTotalLength()` 和 `getPointAtLength()`。

首先要解决“滚动到某个标题，飞机应该在轨道的哪个长度位置”。因为轨道只会往下走，`y` 随长度单调递增，于是可以用二分查找：

```ts
// the rail only ever runs downward, so y is monotonic along its length
function lengthAtY(path: SVGPathElement, total: number, y: number) {
  let lo = 0;
  let hi = total;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (path.getPointAtLength(mid).y < y) lo = mid;
    else hi = mid;
  }
  return hi;
}
```

知道长度之后，再取前后各 1 个单位的点，用 `Math.atan2` 算出切线角度，就是机头的朝向：

```ts
const at = path.getPointAtLength(l);
const behind = path.getPointAtLength(Math.max(0, l - 1));
const ahead = path.getPointAtLength(Math.min(length, l + 1));
const angle =
  (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI + 90;
```

还有一个细节：角度直接交给 spring 的话，从 350° 转到 10° 会绕一大圈。所以源码里先把角度“展开”到离当前角度最近的那一圈，spring 就总是走短的那条路：

```ts
const prev = heading.get();
heading.set(angle + 360 * Math.round((prev - angle) / 360));
```

另外，飞机要倒着飞（往回滚动）时，必须先倒退一段距离才会掉头，避免滚动轻微抖动时飞机来回翻转。

### squircle：比 border-radius 更顺滑的圆角

如果仔细看 One UI 的卡片、Toast 和滚动进度胶囊，会发现圆角和普通的 `border-radius` 不太一样，更接近 iOS 图标那种“超椭圆”。这种形状叫 squircle，特点是直边到圆弧之间的曲率是连续变化的，没有 `border-radius` 那种“直线突然接上圆弧”的折痕感。

One UI 里用了两种实现：

1. **CSS `corner-shape`**：新的 CSS 属性，Tailwind 里可以写成任意属性 `[corner-shape:squircle]`，配合 `rounded-*` 使用。不支持的浏览器会忽略它，退回普通圆角，所以可以放心加；
2. **`figma-squircle` 生成路径**：像 `toast` 这种必须在所有浏览器都保持形状的组件，用 `getSvgPath` 按实际尺寸算出 squircle 路径，再作为 `clip-path: path(...)` 裁切。

第二种方式有个坑：`clip-path` 会把 `box-shadow` 一起裁掉。所以 `toast` 外层改用了 `filter: drop-shadow(...)`，阴影跟着裁切后的形状走。

### code-block：一个颜色生成整套主题

`code-block` 只需要传一个 `accent` 颜色，就能生成亮色和暗色两套代码高亮主题。实现上是把 hex 转成 HSL，固定色相，再在不同亮度和饱和度上取出关键字、字符串、注释、选中背景、高亮行等颜色：

```ts
function buildTheme(accent: string, mode: 'dark' | 'light' = 'dark') {
  const [h, s, l] = hexToHsl(accent);
  const tint = (lightness: number, sat = s) => hsl(h, sat, lightness);
  // ...
}
```

这样做的好处是代码块天然和站点的品牌色协调，不需要为每个主题手调一份配色。

### fluid-orb：不依赖任何库的 WebGL

`fluid-orb` 是一个会缓慢流动的发光球体，没有依赖 three.js，直接手写 WebGL 和片元着色器。值得一提的是两点：

- `devicePixelRatio` 封顶到 2，在 3 倍屏上也不会把 canvas 撑到过大的分辨率；
- 开启“减少动态效果”时，时间固定为 0，只渲染一帧静止画面，不再启动 `requestAnimationFrame` 循环。

## 设计风格

讲完实现，再来说说整套组件在设计上的取舍。

### 动画用弹簧，不用时长

One UI 几乎所有动画都是 Motion 的 spring，而不是 `duration + easing`。弹簧的好处是可以被打断：动画进行到一半目标变了，它会从当前速度自然地转向新目标，不会出现“先跳回起点再重播”的情况。这对导航切换、数字滚动这种高频交互特别重要。

参数上偏克制，比如 `gooey-nav` 的弹簧：

```ts
// the duration picker's spring, damped so nothing overshoots
const SPRING = {
  type: 'spring',
  stiffness: 200,
  damping: 28,
  mass: 1,
} as const;
```

阻尼调高到基本不回弹。动效是为了让状态变化看得清楚，而不是为了晃。

### 尊重“减少动态效果”

所有交互组件都会读 `prefers-reduced-motion`。在 React 组件里用 Motion 的 `useReducedMotion()`，开启时把过渡换成 `{ duration: 0 }`；在 WebGL 里则直接停掉动画循环。仓库里 `useReducedMotion` 出现了五十多次，这不是可选功能，而是写进规范的要求。

### 遵循 shadcn 的组件约定

每个组件都遵守同一套约定：

- 根元素带 `data-slot`，方便外部用选择器定位；
- `className` 通过 `cn()` 合并，外部传入的类名可以覆盖默认样式；
- 其余 props 透传到根元素。

这样组件装进项目后，用起来和 shadcn/ui 自带的组件没有区别。

### 细节上的克制

整体视觉偏 iOS 风格：中性灰的底色、squircle 圆角、细描边，几乎不用大面积投影。颜色只在需要强调的地方出现，比如 Star 用琥珀色，Fork 用蓝色。

无障碍也处理在了细节里。比如 `animated-counter` 视觉上是一堆滚动的 span，但实际给屏幕阅读器读的是一个 `sr-only` 的完整数字，滚轮部分整体 `aria-hidden`。

## 结语

One UI 适合这样的场景：项目已经在用 shadcn/ui 和 Tailwind，想给导航、目录、通知、AI 对话这些地方加一点有质感的动效，又不想引入一个改不动的依赖。

组件还在持续增加。可以先在 [组件预览](https://ui.huzhihui.com/components) 里挨个点一点，看中哪个就 `add` 哪个，觉得不错的话欢迎到 [GitHub](https://github.com/zhihui-hu/one-ui) 点个 star。

## 参考文章

- [shadcn/ui Registry 文档](https://ui.shadcn.com/docs/registry)
- [Motion for React](https://motion.dev/docs/react)
- [MDN: corner-shape](https://developer.mozilla.org/en-US/docs/Web/CSS/corner-shape)
- [MDN: SVGGeometryElement.getPointAtLength()](https://developer.mozilla.org/en-US/docs/Web/API/SVGGeometryElement/getPointAtLength)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
