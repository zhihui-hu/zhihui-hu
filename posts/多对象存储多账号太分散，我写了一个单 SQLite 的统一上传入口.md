---
title: '多对象存储多账号太分散，我写了一个单 SQLite 的统一上传入口'
slug: 'onefile-nextjs-sqlite-image-hosting'
image: 'https://img.huzhihui.com/uploads/2026/05/onefile-02.png'
publishedAt: 2026-05-03T15:44
summary: '最近整理公司对象存储上传流程，真正麻烦的不是上传文件，而是多家对象存储、多账号、多 bucket 分散管理。于是顺手写了 OneFile，用一个单容器、单 SQLite 的后台接住 S3、R2、B2、OCI、OSS、COS。'
keywords:
  - 图床
  - 对象存储
  - 上传管理后台
  - 大文件分片上传
  - 文件夹上传
  - 阿里云 OSS
  - 腾讯云 COS
  - S3 兼容存储
  - SQLite
tags:
  - 开源图床
  - 对象存储
  - 文件上传
  - 大文件分片上传
  - 独立开发
  - Next.js
  - Docker部署
---

![OneFile](https://img.huzhihui.com/uploads/2026/05/onefile-1.png)

最近在整理公司对象存储上传流程。

一开始只是想把流程理顺一点。结果越整理越发现，麻烦的不是上传文件，而是账号太散。

阿里云 OSS 一套账号和 bucket，腾讯云 COS 又一套，后面再接 S3 兼容服务，又是 endpoint、region、access key、secret key、bucket、公开域名。公司项目、个人博客、临时文件、归档附件还不一定放在同一个账号里。

多云、多账号、多 bucket 一叠上来，就变成了一个很碎的管理问题。每次上传前都要想：这次用哪个客户端，哪个账号，哪个 bucket，哪套密钥，公开链接又是哪一个域名。

这个就很烦。

所以我顺手写了 [OneFile](https://github.com/zhihui-hu/onefile)。

它的目的不是再做一个网盘，也不是单纯做图床。我真正想解决的是：把多家对象存储、多套账号、多组 bucket 收进同一个后台，再对外暴露一个统一上传入口。

前面只有一套网页和 API，后面可以接 AWS S3、Cloudflare R2、Backblaze B2、Oracle Object Storage、阿里云 OSS、腾讯云 COS。文件最终落到哪个账号、哪个 bucket，由服务端配置和调度决定。外部工具只管上传，不碰云厂商密钥。

后来我又顺手把大文件分片上传和选择文件夹也补上了。因为真实使用里不可能只传几张图片，有时候是一整个素材目录，有时候是一个比较大的归档包。如果这个入口只能传小文件，那后面还是得切回各家客户端。

## 为什么只用 SQLite

做这个东西的时候，我先排除了重型数据库。

OneFile 要存的东西其实很少：用户、对象存储账号、bucket、API Key、上传记录、公开上传链接。就这些数据，单机跑一个 MySQL 或 PostgreSQL 有点没必要，再加 Redis 就更夸张了。

所以我直接用 `better-sqlite3` 加 Drizzle ORM，所有数据放在一个 `.sqlite` 文件里。

现在部署就是一个 Docker 容器，一个数据卷。不需要数据库初始化，不需要额外服务。迁移的时候后台导出 SQL，换机器再导入，存储凭证也能继续解密。

对这种辅助工具来说，这个复杂度刚好。

## 上传链路怎么收口

OneFile 的核心逻辑放在服务端。

我先在后台添加对象存储账号，同步 bucket，配置公开访问域名。一个用户下面可以挂多套账号，多家云也可以混在一起管。

后面不管是网页端、脚本、Markdown 编辑器，还是第三方系统，都统一走 OneFile 的接口。

API Key 塞到 Header 里就行：

```text
Authorization: Bearer ofk_xxxxxx_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

小文件和图片走 `/api/uploads/direct`。大文件走 multipart 分片上传，先创建上传会话，再按片上传，最后完成或中止。终端里一行 `curl` 也能传。

网页端也支持直接选择文件夹。比如一整个素材目录、构建产物目录、归档附件目录，都可以一次性选进去上传，不用一个文件一个文件点。

图片上传我顺手加了 WebP 压缩。这个配置跟 API Key 绑定，客户端不用关心压缩逻辑。传上来以后，服务端负责认证、压缩、选择账号和 bucket、写对象存储。

公开上传链接也是同一套思路。后台生成一个链接，可以顺手带二维码发给别人。对方不需要登录，也看不到 raw API key，打开页面就能传文件。

## 后台不能是黑盒

![管理后台](https://img.huzhihui.com/uploads/2026/05/onefile-02.png)

很多图床工具的问题是传完就结束了。文件到底在哪、链接是什么、要不要删，后面还得自己找。

OneFile 这里保留了一个管理后台。上传记录可以搜索，文件可以复制链接、生成二维码、删除对象。它不追求做成完整网盘，但至少不能让上传记录变成黑盒。

还有一个实际需求是多账号、多 bucket 分散。

如果 API Key 没有固定 `bucket_id`，服务端会从当前用户可用 bucket 里自动挑一个。这样多个项目或者多人共用的时候，不需要每个外部工具都写死 bucket，也能把文件分散到不同对象存储账号里。

## 界面截图

![OneFile 上传入口](https://img.huzhihui.com/uploads/2026/05/onefile-1.png)

![OneFile 管理后台](https://img.huzhihui.com/uploads/2026/05/onefile-2.png)

![OneFile 存储配置](https://img.huzhihui.com/uploads/2026/05/onefile-3.png)

![OneFile 上传记录](https://img.huzhihui.com/uploads/2026/05/onefile-4.png)

## 现在能做什么

目前 OneFile 主要解决这几件事：

- 统一管理 S3、R2、B2、OCI、OSS、COS。
- 同一个后台挂多套对象存储账号和多组 bucket。
- 自动从可用 bucket 里选择目标，分散上传压力和存储位置。
- 支持大文件 multipart 分片上传。
- 支持选择文件夹批量上传。
- 给 Markdown 编辑器、脚本、CI、第三方系统发 API Key。
- 自建图床，图片上传后直接拿公开链接。
- 生成公开上传页面，临时收文件。
- 图片上传时按配置压成 WebP。
- 后台查看、搜索、复制链接、删除对象。
- 导出 SQL 备份，迁移容器时直接恢复。

代码已经开源。如果你也在多个对象存储账号、多个 bucket、多个上传入口之间来回切，可以直接用 GHCR 镜像跑：

```bash
docker run -d --name onefile \
  --restart unless-stopped \
  -p 27507:27507 \
  -e GITHUB_CLIENT_ID=your_github_client_id \
  -e GITHUB_CLIENT_SECRET=your_github_client_secret \
  -v onefile-data:/app/data \
  ghcr.io/zhihui-hu/onefile:latest
```

目前 GitHub 已经完全开源：[zhihui-hu/onefile](https://github.com/zhihui-hu/onefile)

这个项目后面我会继续按自己的使用场景慢慢补。能保持单容器、单 SQLite 的部分，我尽量不加重。

如果刚好也解决你的问题，可以给个 Star，或者直接 Fork 改。
