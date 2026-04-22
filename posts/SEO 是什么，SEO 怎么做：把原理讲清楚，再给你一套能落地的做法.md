---
title: SEO 是什么，SEO 怎么做：把原理讲清楚，再给你一套能落地的做法
slug: seo-what-is-seo-how-to-do-seo
image: https://img.huzhihui.com/uploads/2026/04/seo-what-is-seo-how-to-do-seo-banner_dhyssx39hp5j.png
publishedAt: 2026-04-21T19:23
summary: 很多人一提 SEO，就先想到关键词、外链和算法更新。可真到落地时，顺序往往反过来：页面得先被发现、抓到、读懂、留下，最后才轮到排名和点击。这篇我会把这条链讲清楚，再给一套新站和老站都能直接执行的优化方法。
keywords:
  - SEO是什么
  - SEO怎么做
  - SEO优化
  - 搜索引擎优化
  - 网站SEO
  - 技术SEO
tags:
  - SEO
  - 搜索引擎优化
  - 技术SEO
  - Google Search Console
  - Next.js
---

![SEO 是什么，SEO 怎么做：把原理讲清楚，再给你一套能落地的做法头图](https://img.huzhihui.com/uploads/2026/04/seo-what-is-seo-how-to-do-seo-banner_dhyssx39hp5j.png)

很多人一提 SEO，就先想到关键词、外链、算法更新。

可我真接手一个站，第一步通常不是列词库，也不是先发文章。

我先看搜索引擎第一次请求 URL 时，到底拿到了什么。

因为 SEO 这件事，主线其实没那么玄。Google 在 [How Search works](https://developers.google.com/search/docs/fundamentals/how-search-works) 里把它拆成发现、抓取、渲染和编入索引。真到拿流量这一步，其实还有两个隐藏的关键词：排名、点击。

这条链上，前面一环断了，后面就别谈了。

## SEO 到底是什么

**SEO 不是研究搜索引擎喜欢什么，而是让正确的页面更容易被发现、读懂、留下、点开。**

| 阶段 | 真正该问的问题                                                 |
| ---- | -------------------------------------------------------------- |
| 发现 | 页面有没有被 sitemap、站内链接、外链或主动提交带到搜索引擎面前 |
| 抓取 | URL 能不能正常访问，状态码、`robots.txt`、资源加载有没有挡路   |
| 渲染 | 搜索引擎第一次拿到的内容里，到底有没有可读的主文档             |
| 收录 | 这页值不值得进索引，还是太薄、太重复、太像占位页               |
| 排名 | 这页是不是刚好回答了用户这次搜索                               |
| 点击 | `title` 和 snippet 有没有让人想点                              |

Google 在上面的文档里也提醒过：就算页面符合基本规范，也不保证一定会被抓、被收、被展示。

所以 SEO 不是一组秘籍，更像一套持续清障的工作流。

很多人一上来就改关键词，顺序其实错了。先判断页面到底卡在哪，比背一堆 SEO 术语有用得多。

比如同样是“这页没流量”，背后的问题可能完全不是一回事：

| 你看到的现象                                            | 更可能的问题                         | 第一反应该做什么                           |
| ------------------------------------------------------- | ------------------------------------ | ------------------------------------------ |
| 搜索 `site:example.com/seo/how-to-do-seo` 完全没结果    | 页面可能没被发现，或者根本抓不到     | 先查 sitemap、内链、状态码                 |
| Search Console 里显示 `Crawled - currently not indexed` | 页面被抓过，但搜索引擎觉得还不值得收 | 先改内容质量和页面定位，不是先改关键词密度 |
| 已经有 impressions，但 CTR 只有 0.2%                    | 词可能打中了，可标题和摘要没人想点   | 先改 `title` 和首段承诺                    |
| 有点击，但停留很差                                      | 搜索结果承诺和正文内容对不上         | 先改正文结构和首屏内容                     |

你看，四种情况都能叫“SEO 不行”，但解决办法压根不是一套。

## 一个页面没流量，我会这样排查

真到手上有一个页面没流量，我不会一上来就改正文，也不会先去看关键词密度。

我会先把它放进这棵最小决策树里：

```txt
一个页面没流量
├─ site: 查不到
│  └─ 先查 sitemap、内链、状态码、noindex、canonical
├─ Search Console 显示 Discovered - currently not indexed
│  └─ 先查发现入口、内链、站点是否一下子放出太多低价值页
├─ Search Console 显示 Crawled - currently not indexed
│  └─ 先查内容质量、重复度、页面定位
├─ 已经有 impressions，但 clicks 很少
│  └─ 先改 title、description、首段承诺
└─ 已经有 clicks，但停留很差
   └─ 先改首屏内容、结构、是否答非所问
```

拆开看会更清楚。

- `site:` 查不到，不代表一定没被发现，也可能是状态码、`noindex`、canonical 或 robots 有问题。这个阶段先查“能不能进流程”，别先查“内容好不好”。
- `Discovered - currently not indexed`，通常说明 Google 已经知道这页，但还没正式抓。这时候更该补发现入口和内链，而不是反复点提交。
- `Crawled - currently not indexed`，说明页面已经被抓过了，但目前还不值得进索引。这个阶段最该看的是内容是不是太薄、太重复、定位太模糊。
- 有 impressions 没 clicks，问题经常不在收录，而在搜索结果页竞争力。用户已经看到你了，只是不想点。
- 有 clicks 但停留差，问题往往在正文。标题承诺和页面实际内容没对上，或者首屏太慢、太空、太绕。

很多页面不是“SEO 不好”，而是你把问题看错了。

## 如果从 0 做一个简单网页，我会这样把 SEO 一起做进去

很多人一说“做 SEO”，脑子里先出现的是关键词工具、外链平台、内容日历。

但如果你现在真的是从 0 开始做一个很简单的网页，我反而建议你先别想那么远。

先做一个能被正常访问、能被读懂、主题明确的静态页，把最基础的 SEO 一次做对。

我拿一个最简单的例子说。假设你要做一个新手入门页，目标词就是 `SEO 是什么`，那我会先把目录搭成这样：

```txt
my-first-site/
  index.html
  seo-checklist.html
  robots.txt
  sitemap.xml
```

这里的思路很简单：

- `index.html` 负责回答 `SEO 是什么`
- `seo-checklist.html` 负责承接“下一步怎么做”
- `robots.txt` 告诉爬虫别被你自己挡住
- `sitemap.xml` 告诉搜索引擎你站上至少有哪些页面

先看首页。

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <title>SEO 是什么：新手先把抓取、收录和点击分清</title>
    <meta
      name="description"
      content="这是一篇给新手看的 SEO 入门页。我会先用大白话解释 SEO 到底在做什么，再告诉你该从抓取、收录还是标题开始排查。"
    />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://example.com/" />
  </head>
  <body>
    <header>
      <nav>
        <a href="/">首页</a>
        <a href="/seo-checklist.html">SEO 检查清单</a>
      </nav>
    </header>

    <main>
      <article>
        <h1>SEO 是什么：新手先把抓取、收录和点击分清</h1>

        <p>
          很多人一提 SEO，就先想到关键词和排名。可真到做站这一步，
          我更关心的是：页面有没有被发现、能不能被抓到、收录后有没有人点。
        </p>

        <h2>SEO 到底在做什么</h2>
        <p>
          SEO 本质上是在帮搜索引擎更准确地理解你的页面，也是在帮用户更快
          地判断这页值不值得点开。
        </p>

        <h2>新手先做哪几步</h2>
        <ol>
          <li>保证页面能返回 200</li>
          <li>把标题、描述和 H1 写清楚</li>
          <li>准备 robots.txt 和 sitemap.xml</li>
          <li>把站点接进 Search Console</li>
        </ol>

        <p>
          如果你想继续往下做，可以再看
          <a href="/seo-checklist.html">SEO 检查清单</a>。
        </p>
      </article>
    </main>
  </body>
</html>
```

这页看着很普通，但已经把最核心的 SEO 基础项带上了：

- `title` 里直接命中主问题，而且是人能看的句子
- `description` 不是堆关键词，而是在说这页会解决什么
- H1 和正文首段都在正面回答搜索意图
- 页面里有真实 `<a href>` 内链，不是只有按钮和 JS 跳转
- canonical 明确告诉搜索引擎，这个 URL 才是主版本

然后把 `robots.txt` 和 `sitemap.xml` 也补上。

`robots.txt`：

```txt
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

`sitemap.xml`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
  </url>
  <url>
    <loc>https://example.com/seo-checklist.html</loc>
  </url>
</urlset>
```

到这一步，这个站虽然很小，但已经不是“只有一个能打开的 HTML 文件”，而是一个对搜索引擎足够友好的最小网站了。

如果你想先本地预览，最省事的方式甚至都不用框架：

```bash
python3 -m http.server 8080
```

然后打开 `http://localhost:8080` 看页面对不对。真要让搜索引擎抓，还是得部署到公网域名上。部署完以后，我第一反应通常是再检查一次：

```bash
curl -I https://example.com/
```

只要状态码正常，再把 `sitemap.xml` 提交进 Search Console，这个从 0 做出来的小网页就算真正具备 SEO 起步条件了。

真正容易踩坑的，反而是这些：

- `title` 写成 `SEO_SEO优化_SEO是什么`
- 页面正文第一屏只有一句空话
- canonical 没写，或者乱指到别的 URL
- 导航不是 `<a href>`，而是一堆脚本事件
- `robots.txt` 里手滑写了 `Disallow: /`

所以你问“从 0 做一个网页，SEO 该怎么做”，我不会先回答你“去研究算法”。

我会先让这个网页像一个真正的网页：有清楚标题，有能读懂的正文，有唯一 URL，有入口，有内链，有 sitemap。

## 我接手一个站，先排这 6 件事

### 1. 先接数据

Google Search Console 至少要能看这几块：

- URL Inspection
- Page indexing
- Performance
- Sitemaps

如果你做的是中文站，而且百度流量对你有意义，百度搜索资源平台也得接上。别靠“我感觉页面应该已经收录了”这种直觉做 SEO，这种直觉经常不准。

Search Console 里最常见的几个状态，我一般这样理解：

| Search Console 状态                        | 常见含义                               | 我会先做什么                                            |
| ------------------------------------------ | -------------------------------------- | ------------------------------------------------------- |
| `Discovered - currently not indexed`       | Google 知道这页，但还没抓              | 加强内链、补 sitemap、别一下子放出太多低质页            |
| `Crawled - currently not indexed`          | Google 抓过了，但现在还不想收          | 提升内容质量，解决薄内容、重复内容和定位不清            |
| `Alternate page with proper canonical tag` | 这页被当成规范页的替代页               | 先确认 canonical 是不是你故意这么配的，没问题就不用折腾 |
| 页面被 `noindex` 挡住                      | 你自己不让它收录                       | 先看是不是误配，想收录就去掉 `noindex`                  |
| `Soft 404`                                 | 页面像不存在，但状态码没返回真正的 404 | 真不存在就返回 404/410；真有价值就补足页面内容          |

这张表特别适合配着 URL Inspection 一起看。

你点进一条具体 URL 时，我通常只问三件事：

1. Google 能不能访问到这页
2. Google 把这页当正常内容页，还是当重复页、错误页、占位页
3. 这个问题是站点自己能修的，还是先等等抓取和处理

如果这三件事都没分清，后面改再多标题和正文，方向也容易偏。

### 2. 先看状态码，不要先谈内容

我会先抽样检查首页、栏目页、几篇核心内容页：

- 该 `200` 的是不是稳定 `200`
- 不存在的页面是不是明确 `404` 或 `410`
- 跳转是不是干净的 `301 / 302`

很多站表面上能打开，实际上到处是软 404、异常跳转、历史 URL 没处理干净。这个阶段不先清掉，后面做内容就是在漏水的桶里加水。

我自己最常用的检查动作其实很土，就是直接看响应头：

```bash
curl -I https://example.com/seo/how-to-do-seo
```

如果返回像这样：

```txt
HTTP/2 200
content-type: text/html; charset=utf-8
```

那至少这页还能正常谈后面的事。

但如果你看到的是这种：

```txt
HTTP/2 302
location: /login
```

或者这种：

```txt
HTTP/2 200
content-type: text/html; charset=utf-8
```

页面正文却写着“页面不存在”，那基本就要开始怀疑软 404 了。

### 3. 看 `robots.txt` 和 `sitemap.xml`，先别把自己挡住

Google 在 [sitemaps 文档](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) 里说得很直接：sitemap 可以帮助发现页面，但不保证收录。

它是路标，不是魔法按钮。

`robots.txt` 也是一样。写对了是边界，写错了就是自杀。最常见的问题就这几个：

- 把整站或关键目录挡掉
- 把 CSS、JS、图片资源一起挡掉，导致渲染异常
- 明明想收录，却把重要页面排除在 sitemap 之外

一个最小可用的 `robots.txt`，通常长这样：

```txt
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
```

而一个很危险的版本，可能只多了一行：

```txt
User-agent: *
Disallow: /
```

`sitemap.xml` 也一样，最小可用先把你真想收录的页面放进去：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
  </url>
  <url>
    <loc>https://example.com/seo/how-to-do-seo</loc>
  </url>
</urlset>
```

别一边在正文里拼命做 SEO，一边在基础设施层面把门锁上。

### 4. 查 `canonical`、`noindex` 和各种误伤

我看过不少站，内容写得不差，结果：

- `canonical` 指到了别的页
- `meta robots` 写成了 `noindex`
- sitemap 里交的是 A，页面又把 canonical 指到 B
- 首屏正文被登录弹窗、地区弹窗、订阅层盖住

Google 在 [canonical 文档](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) 里一直强调“选一个规范 URL，并持续用同一套信号表达它”。别让 redirect、canonical、sitemap 三套东西互相打架。

### 5. 看页面源代码里的 HTML，不要只看浏览器渲染后的结果

做前端的人最容易踩这个坑。

浏览器里最后能看见，不等于搜索引擎第一次就看见了。

我会直接看 `View Source`，确认这些东西是不是一开始就在 HTML 里：

- `<title>`
- `<meta name="description">`
- canonical
- H1
- 正文前几段
- JSON-LD

如果源代码里只剩一个壳，正文全靠后续 JS 补，那 SEO 的难度会立刻上去。

我自己判断一个页面有没有“最小 SEO 交付”，通常会先看它像不像这样：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <title>SEO 是什么，SEO 怎么做：新手先从这 7 件事开始</title>
    <meta
      name="description"
      content="从抓取、收录、标题、内容到技术项，按执行顺序讲清楚 SEO 怎么做。"
    />
    <link rel="canonical" href="https://example.com/seo/how-to-do-seo" />
  </head>
  <body>
    <article>
      <h1>SEO 是什么，SEO 怎么做：新手先从这 7 件事开始</h1>
      <p>如果一个网站现在几乎没自然流量，我不会先研究算法。</p>
    </article>
  </body>
</html>
```

它不一定华丽，但搜索引擎第一次拿到这页时，至少能知道这页在讲什么。

### 6. 最后才看站点主题和内链

Google 在 [Make your links crawlable](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) 里反复强调，链接既是给用户走的，也是给搜索引擎发现内容用的。

所以我会一起看两件事：

- 页面之间有没有真实可抓取的内链
- 站点主题是不是足够集中

如果一个站今天讲 SEO，明天讲装修，后天讲币圈，就算单篇文章偶尔能收录，整体主题也很难立住。

一个很典型的小案例，通常是这样的：

- 页面现象：新页面上线两周，已经进了 sitemap，但一直没收录
- 排查动作：先看 URL Inspection，再看页面源代码、canonical、内链和正文首屏
- 发现问题：正文第一屏太薄，真正的信息量要滚到很下面才出现；同时 canonical 还误指到了栏目页
- 处理动作：canonical 改回自己，首屏直接补上问题定义和核心答案，再从两篇旧文加 2 到 3 个相关内链
- 结果：过了一段时间开始进索引，先有 impressions，后面才轮到点不点的问题

这种例子最说明一件事：很多时候不是“Google 不给机会”，而是页面自己先没站稳。

## 新站和老站，别用同一套顺序

你要是刚起一个新站，和接手一个跑了两三年的老站，打法真的不一样。

新站我通常先做这几件事：

- 先把状态码、`robots.txt`、`sitemap.xml`、canonical 这些底座搭好
- 先做 5 到 10 个主题清晰的核心页面，不急着一下子铺几十篇
- 先把首页和核心页之间的内链跑顺
- 先盯“有没有被发现、有没有开始收录”，不是先盯排名

老站我会先看另外一批问题：

- 历史 URL 有没有残留
- 重复页、软 404、旧专题页有没有堆着不管
- 哪些页面已经有高 impressions 但 CTR 很差
- 有没有几篇内容在互相抢同一批 query
- 旧文章是不是值得更新，而不是盲目继续发新文

新站最怕的是底座没搭好就急着铺量。

老站最怕的是明明资产已经有了，却一直不修旧坑，只顾着继续发。

## 新手别一上来就做这 5 件事

下面这些事不是永远不能做，而是别在最开始就把精力全投进去：

- 刚上线就研究外链策略
- 盯着关键词密度来回改字
- 一次性发几十篇没有信息增量的内容
- 页面刚上线没多久就频繁改 URL
- 还没看收录状态，就断定“内容肯定不行”

我更建议的顺序一直是：先让页面能被看见，再让页面值得留下，最后才谈怎么把点击做高。

## 前端站最容易误判的地方：浏览器能看见，不等于搜索引擎第一次就看见

Google 在 [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) 里明确说过，它能处理 JavaScript 页面，但 server-side rendering 或 pre-rendering 仍然是个好主意。

原因很简单：

- 更快
- 更稳
- 不是所有机器人都像 Google 一样会跑完整 JS

所以我看前端站 SEO，第一眼不看组件树，我看部署产物。

拿一个 Next.js 静态导出站举例，上线后更像是这一堆东西在对外服务：

```txt
out/
  index.html
  blog/index.html
  projects/index.html
  robots.txt
  sitemap.xml
  index.txt
  blog.txt
```

这里我专门核对了你本地 `next@16.2.4` 的文档和导出源码，结论可以压成两句话：

1. 初次加载时，浏览器先拿到的是 HTML。
2. App Router 静态导出时额外生成的 `.txt`，本质上是给客户端导航用的 RSC payload，不是“第二份页面 HTML”。

也就是说，`out/index.html` 才是主文档，`index.txt` 更像 Next 自己的运输层数据。

这个判断很重要，因为很多前端同学会被产物名字带偏，以为搜索引擎真正该读的是那堆 `.txt`。不是。只要你是做页面 SEO，真正该优先保证的还是：

- HTML 里已经有主标题和正文骨架
- metadata 在首个响应里就齐
- JS 是增强，不是补正文

这一点一旦想通，React、Vue、Next、Nuxt 都没那么玄了。框架不是 SEO 的主语，稳定输出一份能被读懂的文档才是。

如果你用的就是 Next.js，那我更建议直接按这个最小思路落：

```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO 是什么，SEO 怎么做：新手先从这 7 件事开始',
  description:
    '从抓取、收录、标题、内容到技术项，按执行顺序讲清楚 SEO 怎么做。',
  alternates: {
    canonical: 'https://example.com/seo/how-to-do-seo',
  },
};

export default function Page() {
  return (
    <article>
      <h1>SEO 是什么，SEO 怎么做：新手先从这 7 件事开始</h1>
      <p>
        如果一个网站现在几乎没自然流量，我不会先研究算法。我会先看抓取、
        收录、展示和点击到底卡在哪。
      </p>
    </article>
  );
}
```

这段代码不复杂，但方向很对：`metadata` 负责头部信号，`page` 负责首屏正文，别把最关键的内容都拖到客户端再补。

## SEO 怎么做，先别堆词，先做关键词和页面映射

新手最容易直接去找“大词”，然后围着词写一堆文章。

结果常常是流量没起来，页面先互相抢词了。

我自己的顺序一直是：

1. 先定站点主题
2. 再找用户会搜的问题
3. 再决定每个问题该由哪个页面来回答

这里最值钱的动作，不是扩词，而是映射。

我一般会先把词粗分成 4 层：

| 词类型 | 例子                      | 更适合的页面       |
| ------ | ------------------------- | ------------------ |
| 认知词 | SEO 是什么                | 总览页、入门指南   |
| 教程词 | SEO 怎么做                | 步骤型长文、实操页 |
| 工具词 | Search Console 怎么看收录 | 工具教程、操作文   |
| 转化词 | SEO 服务报价              | 服务页、落地页     |

然后再做一张最小映射表：

| 关键词                    | 搜索意图 | 页面类型      | 处理建议                         |
| ------------------------- | -------- | ------------- | -------------------------------- |
| SEO 是什么                | 入门认知 | 总览页        | 当前这篇主打                     |
| SEO 怎么做                | 实操教程 | 长文 / 专题页 | 当前这篇覆盖，后续可再拆实操专题 |
| Search Console 怎么看收录 | 工具操作 | 教程页        | 单独做                           |
| robots.txt 怎么写         | 技术问题 | FAQ / 教程页  | 单独做                           |
| Next.js SEO               | 框架问题 | 技术专题页    | 单独做                           |

一个意图，对应一个主页面。

别拿 3 篇内容一起抢同一类词。这不叫覆盖面，这叫关键词内耗。

比如我会这样拆：

- `SEO 是什么` 这篇负责把概念、处理链和判断顺序讲明白
- `SEO 怎么做` 可以继续做成更强的执行版，把 30 天计划、排查动作、模板代码讲深
- `Search Console 怎么看收录` 单独做成工具教程，因为搜这个词的人根本不想看 SEO 大全

同样都是 SEO 主题，意图不同，页面就该分开。

## 关键词映射以后，怎么避免页面互相内耗

关键词映射不是做完表格就结束了。

真正容易出事的，是你写着写着发现两篇页面开始打架。

我通常用这几个信号判断它们是不是在互相抢词：

- 两篇页面围绕的是同一个搜索意图
- `title` 和 H1 非常接近
- Search Console 里两页对同一批 query 都有展示
- 搜目标词时，两页轮流出现，但都不稳定
- 你自己也说不清这两个页面各自到底解决什么问题

一旦出现这种情况，我一般只做 4 件事：

- 保留一篇主页面
- 把另一篇改成更细的问题页，别再打同一个意图
- 必要时做 301，或者至少用 canonical 和内链把语义指向主页面
- 把重复解释删掉，让每篇页面各自回答自己的问题

SEO 里的很多“没起量”，其实不是因为竞争太强，而是你自己先把主题打散了。

## 不同类型页面，SEO 重点不一样

很多人一说 SEO，就自动想到博客文章。

其实不同页面类型，重点根本不是一套：

| 页面类型 | SEO 重点                                 |
| -------- | ---------------------------------------- |
| 博客文章 | 搜索意图匹配、结构、标题点击率、信息增量 |
| 工具页   | 功能说明、使用场景、FAQ、结构化信息      |
| 服务页   | 转化词、案例、信任信号、地域词           |
| 分类页   | 聚合能力、内链、去重、参数控制           |
| 文档页   | 信息架构、面包屑、版本管理、站内搜索     |

所以别拿“博客页的写法”去套所有页面。

工具页更怕讲不清怎么用。

服务页更怕没有信任信号。

分类页更怕参数页乱飞和重复收录。

## 页面内优化，我只先改最值钱的 6 个点

### 1. `title`

很多人把 `title` 写成：

```txt
SEO优化_SEO是什么_SEO怎么做_网站SEO教程
```

这种标题不是“覆盖全面”，是搜索结果页噪音。

更稳的写法通常是这种：

```txt
SEO 是什么，SEO 怎么做：把原理讲清楚，再给你一套能落地的做法
```

我自己常用的标题模板，大概就这几类：

- `关键词是什么：给新手的完整说明`
- `关键词怎么做：从 0 到 1 的执行步骤`
- `关键词指南：原理、步骤和常见误区`
- `为什么你的 XXX 没效果：先查这 5 件事`

如果再往前走一步，我会把 head 里最关键的两行直接写实：

```html
<title>SEO 是什么，SEO 怎么做：把原理讲清楚，再给你一套能落地的做法</title>
<meta
  name="description"
  content="从抓取、渲染、收录到点击，先把 SEO 的处理链讲清楚，再给你一套新站和老站都能直接执行的优化方法。"
/>
```

还有个很容易忽略的事实。Google 在 [title links 文档](https://developers.google.com/search/docs/appearance/title-link) 里提到，标题链接不只参考 `<title>`，也会参考页面主标题、显著文本，甚至别的页面链过来的锚文本。

所以别让 `<title>` 讲 A，H1 讲 B，内链锚文本又讲 C。你自己先把信号写乱了，搜索引擎当然也容易改写。

### 2. `description`

Google 在 [snippets 文档](https://developers.google.com/search/docs/appearance/snippet) 里也说得很清楚，它不保证一定采用你写的 meta description，但它仍然值得写。

- 前半句说清用户的问题
- 后半句说清这页会怎么回答

别把它写成关键词垃圾桶，也别写成一句太空泛的套话。

比如：

- 差：`SEO优化教程，帮助你提升网站排名，获得更多流量，适合新手和运营人员阅读`
- 好：`先把抓取、收录、点击这几步分清，再决定该改代码、改内容，还是改标题`

我写 description 时常用的公式也很简单：

`先说问题 + 再说方法 + 最后说适合谁`

比如这篇就可以写成：

> 页面收录不上来，不一定是关键词问题。本文从抓取、渲染、收录到点击，讲清 SEO 排查顺序，适合刚开始做网站自然流量的人。

### 3. H1 到 H3 的层级

不要为了“结构化”硬套很多层小标题。

更好的标准是：只看你的小标题，读者能不能大概知道这篇文章会怎么回答问题。

如果 H2 看完还是一堆“为什么很重要”“它有哪些优势”这种大空话，那结构再整齐也没用。

### 4. URL 和 canonical

URL 要简单、稳定、可读。

别今天 `/seo-guide`，明天 `/seo-tutorial`，后天又换 `/what-is-seo`。URL 不是不能改，但每改一次都要想清楚历史收录、301 和外链成本。

canonical 也别乱指。尤其是分页、标签页、参数页多的网站，最怕的不是内容不够，而是你自己把主页面信号冲散了。

### 5. 图片和 alt

alt 不是拿来塞关键词的。

图片有信息，就把那份信息写出来。比如：

- 差：`seo-seo-optimization-image`
- 好：`Search Console 中“已编入索引”页面数量的示例截图`

### 6. 内链

内链是很多内容站最划算的 SEO 动作。

我做内链时只抓两个原则：

- 真相关再链
- 锚文本尽量说明目标页讲什么

比如这篇提到 `Search Console`，我更愿意链向“Search Console 怎么看收录”，而不是乱链一个“10 个 SEO 工具推荐”。

## 一篇 SEO 页面上线前，我至少检查这 10 项

很多问题不是上线后才出现的，而是上线前就能看出来。

1. URL 是不是稳定、简短、可读
2. 页面返回的状态码是不是 `200`
3. 有没有被 `robots.txt` 或 `noindex` 挡住
4. canonical 是不是指向自己
5. `title` 是不是清楚而且可点击
6. `description` 有没有说明这页的价值
7. H1 和页面主题是不是一致
8. 首屏有没有直接回答问题
9. 页面里有没有 2 到 5 个相关内链
10. 这页是不是已经加入 sitemap

这 10 项过完，再上线，很多低级错误都能提前拦住。

## 我自己会用的一段最小排查脚本

如果页面不多，我会手工看。

但页面一多，我就会先拿脚本批量扫一遍 `title`、`description`、canonical 和 H1，先把最明显的问题捞出来。

下面这段就够做第一轮排查了：

```ts
const urls = [
  'https://example.com/',
  'https://example.com/seo/how-to-do-seo',
  'https://example.com/blog/search-console-guide',
];

function pick(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1]?.trim() ?? '';
}

async function inspect(url: string) {
  const res = await fetch(url);
  const html = await res.text();

  return {
    url,
    status: res.status,
    title: pick(html, /<title>(.*?)<\/title>/is),
    description: pick(
      html,
      /<meta\s+name=["']description["']\s+content=["'](.*?)["']/is,
    ),
    canonical: pick(
      html,
      /<link\s+rel=["']canonical["']\s+href=["'](.*?)["']/is,
    ),
    h1: pick(html, /<h1[^>]*>(.*?)<\/h1>/is).replace(/<[^>]+>/g, ''),
  };
}

async function main() {
  const result = await Promise.all(urls.map(inspect));
  console.table(result);
}

main().catch(console.error);
```

我不是说这段能替代 Search Console。

它替代不了。

但它很适合做第一轮模板体检。尤其是你怀疑某些页面：

- 没有 `title`
- 多页共用一个 description
- canonical 指错
- 页面源代码里根本没有 H1

先用脚本把大坑扫出来，再去平台里看抓取和收录，会快很多。

## 内容怎么写，才不会写成 SEO 流水线

Google Search Central 这些年一直在推 people-first content。落到写作里，我只记 3 句话。

### 1. 开头别先下定义，先打问题

如果用户搜的是“SEO 怎么做”，那开头最好直接回答“我会先从哪里开始做”，而不是先把 Search Engine Optimization 的英文全称背一遍。

定义不是不能写。

只是别抢开头的位置。

### 2. 一篇文章里，至少给一个别人没讲透的东西

这个“东西”可以是：

- 一套判断顺序
- 一张排查表
- 一个真实案例
- 一个常见误区的纠偏

没有信息增量的内容，就算收录了，也很难长久拿到流量。

比如同样写“SEO 怎么做”，下面这两种写法差别就很大。

空讲版：

> SEO 很重要，因为它可以帮助网站提升排名，获得更多曝光和流量。

有信息增量的版本：

> 如果一个页面已经有展示却没人点，我先不改正文，我先改 `title` 和首段摘要。因为这时候问题通常不在“有没有收录”，而在“搜索结果页有没有点击欲望”。

前者谁都能写，后者才像真的做过。

### 3. 别为了“完整”硬塞废段落

SEO 内容特别容易写成这种模板：

- 什么是 XXX
- 为什么 XXX 很重要
- XXX 有哪些优势
- 如何做好 XXX
- 总结

看起来完整，实际很空。

如果删掉一段以后，读者并不会少知道什么，那这段大概率就是填充物。

## 如果只给我 30 天，我会这样排

30 天的目标，不是把一堆词硬冲到首页。

更现实的目标是：把站点的搜索链路跑顺，确认哪些页面有机会先起量。

我大概会这样排：

| 时间    | 目标                           | 我会做什么                                                                              |
| ------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| 第 1 周 | 把站点底座摸清                 | 接 Search Console，查状态码、`robots.txt`、`sitemap.xml`、canonical、软 404、页面源代码 |
| 第 2 周 | 先修最影响收录和点击的模板问题 | 改 `title`、`description`、H1、正文首屏、内链、移动端可读性                             |
| 第 3 周 | 建关键词和页面映射             | 定主题页、专题页、工具教程页，补 2 到 4 篇真正对应搜索意图的内容                        |
| 第 4 周 | 看数据回推选题和模板           | 对照 impressions、clicks、indexing 状态，决定是补内容、调标题，还是继续修技术项         |

如果一个站现在一点自然流量都没有，我不会期待 30 天直接起飞。

但 30 天完全够把方向跑出来。你会知道问题到底在发现、收录、点击，还是压根页面定位就错了。

## 最后一句大实话

SEO 从来不是和搜索引擎斗智斗勇。

它更像站点运营里的秩序感：让重要页面先被看到，再被理解，再被留下，最后才有资格竞争点击。
