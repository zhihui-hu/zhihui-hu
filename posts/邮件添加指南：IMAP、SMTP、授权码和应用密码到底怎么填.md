---
title: 常见个人邮箱添加指南：Gmail、QQ、网易、Outlook 等邮箱怎么配置
slug: personal-email-account-add-guide-imap-smtp-app-password
image: https://img.huzhihui.com/2026/05/14/personal-email-account-add-guide-imap-smtp-app-password-banner.webp
publishedAt: 2026-05-14T17:09
summary: 这篇按邮箱服务商逐个整理添加方法，覆盖 Gmail、Yahoo、阿里、189、搜狐、QQ/Foxmail、网易、Outlook/Hotmail、新浪、139、21CN、88、iCloud、AOL、Yandex、Mail.ru 的 IMAP/SMTP 参数、授权码或应用密码获取方式，以及客户端里应该填什么。
keywords:
  - 邮箱添加指南
  - 个人邮箱配置
  - IMAP SMTP
  - Gmail 添加邮箱
  - QQ邮箱授权码
  - 网易邮箱授权码
  - Outlook 应用密码
  - iCloud App 专用密码
tags:
  - 邮箱配置
  - 个人邮箱
  - IMAP
  - SMTP
  - 授权码
  - 应用密码
---

![常见个人邮箱添加指南：Gmail、QQ、网易、Outlook 等邮箱怎么配置头图](https://img.huzhihui.com/2026/05/14/personal-email-account-add-guide-imap-smtp-app-password-banner.webp)

## 文内导航

- [快速对照表](#快速对照表)
- [Gmail 邮箱怎么添加](#gmail-邮箱怎么添加)
- [Yahoo 邮箱怎么添加](#yahoo-邮箱怎么添加)
- [阿里邮箱怎么添加](#阿里邮箱怎么添加)
- [电信 189 邮箱怎么添加](#电信-189-邮箱怎么添加)
- [搜狐邮箱怎么添加](#搜狐邮箱怎么添加)
- [QQ / Foxmail 邮箱怎么添加](#qq-foxmail-邮箱怎么添加)
- [网易邮箱怎么添加](#网易邮箱怎么添加)
- [Outlook / Hotmail 邮箱怎么添加](#outlook-hotmail-邮箱怎么添加)
- [新浪邮箱怎么添加](#新浪邮箱怎么添加)
- [移动 139 邮箱怎么添加](#移动-139-邮箱怎么添加)
- [21CN 邮箱怎么添加](#21cn-邮箱怎么添加)
- [完美邮箱怎么添加](#完美邮箱怎么添加)
- [iCloud 邮箱怎么添加](#icloud-邮箱怎么添加)
- [AOL 邮箱怎么添加](#aol-邮箱怎么添加)
- [Yandex 邮箱怎么添加](#yandex-邮箱怎么添加)
- [Mail.ru 邮箱怎么添加](#mailru-邮箱怎么添加)
- [添加后怎么验证](#添加后怎么验证)

## 快速对照表

| 邮箱                   | 密码框填写   | IMAP                        | SMTP                              |
| ---------------------- | ------------ | --------------------------- | --------------------------------- |
| Gmail `@gmail.com`     | 应用密码     | `imap.gmail.com:993`        | `smtp.gmail.com:465`              |
| Yahoo `@yahoo.com`     | 应用程式密码 | `imap.mail.yahoo.com:993`   | `smtp.mail.yahoo.com:465`         |
| 阿里邮箱 `@aliyun.com` | 登录密码     | `imap.aliyun.com:993`       | `smtp.aliyun.com:465`             |
| 电信 189 `@189.cn`     | 登录密码     | `imap.189.cn:993`           | `smtp.189.cn:465`                 |
| 搜狐邮箱 `@sohu.com`   | 独立密码     | `imap.sohu.com:993`         | `smtp.sohu.com:465`               |
| QQ / Foxmail           | 授权码       | `imap.qq.com:993`           | `smtp.qq.com:465`                 |
| 网易邮箱               | 客户端授权码 | `imap.163.com:993`          | `smtp.163.com:465`                |
| Outlook / Hotmail      | 应用密码     | `outlook.office365.com:993` | `smtp.office365.com:587` STARTTLS |
| 新浪邮箱               | 客户端授权码 | `imap.sina.com:993`         | `smtp.sina.com:465`               |
| 移动 139 `@139.com`    | 客户端密码   | `imap.139.com:993`          | `smtp.139.com:465`                |
| 21CN `@21cn.com`       | 登录密码     | `imap.21cn.com:993`         | `smtp.21cn.com:465`               |
| 完美邮箱 `@88.com`     | 专用密码     | `imap.88.com:993`           | `smtp.88.com:465`                 |
| iCloud `@icloud.com`   | App 专用密码 | `imap.mail.me.com:993`      | `smtp.mail.me.com:587` 或 `465`   |
| AOL `@aol.com`         | 应用程序密码 | `imap.aol.com:993`          | `smtp.aol.com:465`                |
| Yandex `@yandex.com`   | 应用密码     | `imap.yandex.com:993`       | `smtp.yandex.com:465`             |
| Mail.ru `@mail.ru`     | 应用专用密码 | `imap.mail.ru:993`          | `smtp.mail.ru:465`                |

下面按服务商一个个写。

## Gmail 邮箱怎么添加

```mermaid
flowchart TD
    A[登录 Google 账号安全设置] --> B[开启两步验证]
    B --> C[创建 16 位应用密码]
    C --> D[客户端填写 Gmail 地址和应用密码]
    D --> E[配置 IMAP 和 SMTP]
    E --> F[测试收发]
```

适用邮箱：`@gmail.com`

Gmail 不能直接拿 Google 账号主密码去登录第三方客户端。正确方式是先开启两步验证，再生成应用密码。

### 服务器参数

| 类型      | 服务器           | 端口          |
| --------- | ---------------- | ------------- |
| IMAP 收信 | `imap.gmail.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.gmail.com` | `465` SSL/TLS |

### 添加步骤

1. 打开 Google 账号安全设置页面。
2. 找到“两步验证”，按页面提示开启。
3. 开启两步验证后，进入“应用密码”页面。
4. 新建一个应用密码，名称可以写成“onemail”或你正在使用的客户端名称。
5. Google 会生成一个 16 位应用密码，立即复制保存。
6. 回到邮件客户端添加 Gmail。
7. 用户名填写完整 Gmail 地址。
8. 密码填写刚刚生成的 16 位应用密码，不要填 Google 登录密码。
9. 如果客户端要求手动配置服务器，就填上面的 IMAP/SMTP 参数。

### 操作截图

![进入两步验证设置](https://img.huzhihui.com/2026/05/14/mail-guide-gmail-01-banner.webp)

![开始两步验证](https://img.huzhihui.com/2026/05/14/mail-guide-gmail-02-banner.webp)

![验证身份](https://img.huzhihui.com/2026/05/14/mail-guide-gmail-03-banner.webp)

![输入手机号码](https://img.huzhihui.com/2026/05/14/mail-guide-gmail-04-banner.webp)

![成功开启两步验证](https://img.huzhihui.com/2026/05/14/mail-guide-gmail-05-banner.webp)

![访问应用密码页面](https://img.huzhihui.com/2026/05/14/mail-guide-gmail-06-banner.webp)

![输入应用名称并创建](https://img.huzhihui.com/2026/05/14/mail-guide-gmail-07-banner.webp)

![生成并保存应用密码](https://img.huzhihui.com/2026/05/14/mail-guide-gmail-08-banner.webp)

### 容易出错的地方

如果提示 `IMAP not enabled`，说明 Gmail 的 IMAP 访问还没开。进入 Gmail 网页版的“转发和 POP/IMAP”设置，把 IMAP access 改成 Enable，然后保存。

如果你找不到“应用密码”，通常是两步验证还没开启，或者账号策略不允许创建应用密码。

## Yahoo 邮箱怎么添加

```mermaid
flowchart TD
    A[登录 Yahoo Mail] --> B[进入账户资料]
    B --> C[打开账户安全性]
    C --> D[生成应用程式密码]
    D --> E[客户端填写邮箱和应用程式密码]
    E --> F[测试收发]
```

适用邮箱：`@yahoo.com`

Yahoo 添加到第三方客户端时要使用“应用程式密码”，不是 Yahoo 登录密码。

### 服务器参数

| 类型      | 服务器                | 端口          |
| --------- | --------------------- | ------------- |
| IMAP 收信 | `imap.mail.yahoo.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.mail.yahoo.com` | `465` SSL/TLS |

### 添加步骤

1. 登录 Yahoo Mail。
2. 点击右上角头像或姓名，进入“账户资料”。
3. 进入“账户安全性”。
4. 找到“产生应用程式密码”或“管理应用程式密码”。
5. 输入应用名称，比如“onemail”。
6. 点击生成，复制 16 位应用程式密码。
7. 在邮件客户端里添加 Yahoo 邮箱。
8. 用户名填写完整邮箱地址。
9. 密码填写应用程式密码。
10. 手动配置时填写上面的 IMAP/SMTP 参数。

### 操作截图

![访问雅虎账户资料](https://img.huzhihui.com/2026/05/14/mail-guide-yahoo-01-banner.webp)

![进入账户安全性设置](https://img.huzhihui.com/2026/05/14/mail-guide-yahoo-02-banner.webp)

![输入应用名称](https://img.huzhihui.com/2026/05/14/mail-guide-yahoo-03-banner.webp)

![生成并复制密码](https://img.huzhihui.com/2026/05/14/mail-guide-yahoo-04-banner.webp)

### 容易出错的地方

如果账户安全性里找不到生成应用程式密码的入口，先检查 Yahoo 账号是否已经开启两步验证。部分账号需要先完成两步验证，才会显示应用密码入口。

## 阿里邮箱怎么添加

```mermaid
flowchart TD
    A[打开客户端添加邮箱] --> B[填写阿里邮箱地址]
    B --> C[填写网页登录密码]
    C --> D[确认 IMAP 和 SMTP 参数]
    D --> E[选择同步选项]
    E --> F[创建并测试收发]
```

适用邮箱：`@aliyun.com`

阿里邮箱的添加方式比较直接，通常使用邮箱登录密码即可。

### 服务器参数

| 类型      | 服务器            | 端口          |
| --------- | ----------------- | ------------- |
| IMAP 收信 | `imap.aliyun.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.aliyun.com` | `465` SSL/TLS |

### 添加步骤

1. 在邮件客户端里选择添加邮箱。
2. 邮箱地址填写完整的阿里邮箱地址。
3. 密码填写阿里邮箱网页登录密码。
4. 如果客户端可以自动识别服务器，确认识别结果是否为上面的 IMAP/SMTP 参数。
5. 如果不能自动识别，就手动填写 `imap.aliyun.com` 和 `smtp.aliyun.com`。
6. 保存后测试收信和发信。

### 操作截图

![输入 IMAP 和 SMTP 服务器信息](https://img.huzhihui.com/2026/05/14/mail-guide-ali-01-banner.webp)

![设置邮件同步选项](https://img.huzhihui.com/2026/05/14/mail-guide-ali-02-banner.webp)

![邮箱状态显示正常](https://img.huzhihui.com/2026/05/14/mail-guide-ali-03-banner.webp)

### 容易出错的地方

如果登录密码确认没错但仍然失败，去阿里邮箱网页版检查 IMAP/SMTP 服务是否被关闭。它通常默认可用，但也可能被手动关掉。

## 电信 189 邮箱怎么添加

```mermaid
flowchart TD
    A[登录 189 邮箱网页版] --> B[进入设置]
    B --> C[开启 IMAP/SMTP 服务]
    C --> D[客户端填写邮箱地址和登录密码]
    D --> E[配置 IMAP 和 SMTP]
    E --> F[测试收发]
```

适用邮箱：`@189.cn`

189 邮箱使用登录密码添加，但需要先在网页端开启 IMAP/SMTP 服务。

### 服务器参数

| 类型      | 服务器        | 端口          |
| --------- | ------------- | ------------- |
| IMAP 收信 | `imap.189.cn` | `993` SSL/TLS |
| SMTP 发信 | `smtp.189.cn` | `465` SSL/TLS |

### 添加步骤

1. 登录 189 邮箱网页版。
2. 点击页面右上角“设置”。
3. 进入 `IMAP/POP3/SMTP服务` 标签页。
4. 勾选 `IMAP/SMTP服务`。
5. 回到邮件客户端添加邮箱。
6. 用户名填写完整 `@189.cn` 邮箱地址。
7. 密码填写 189 邮箱网页登录密码。
8. 手动配置时填写 `imap.189.cn:993` 和 `smtp.189.cn:465`。

### 操作截图

![在 189 邮箱网页版设置中启用 IMAP/SMTP 服务](https://img.huzhihui.com/2026/05/14/mail-guide-189-01-banner.webp)

### 容易出错的地方

189 邮箱不需要授权码。你要查的是 IMAP/SMTP 服务有没有开启，以及登录密码是否能正常登录网页版。

## 搜狐邮箱怎么添加

```mermaid
flowchart TD
    A[登录搜狐邮箱网页版] --> B[进入 POP3/SMTP/IMAP 设置]
    B --> C[开启 IMAP/SMTP 服务]
    C --> D[手机验证生成独立密码]
    D --> E[客户端填写邮箱和独立密码]
    E --> F[确认是否关闭 IP 白名单]
```

适用邮箱：`@sohu.com`

搜狐邮箱需要先开启 IMAP/SMTP，再生成“独立密码”。客户端里填独立密码，不填登录密码。

### 服务器参数

| 类型      | 服务器          | 端口          |
| --------- | --------------- | ------------- |
| IMAP 收信 | `imap.sohu.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.sohu.com` | `465` SSL/TLS |

### 添加步骤

1. 登录搜狐邮箱网页版。
2. 点击页面顶部“选项”。
3. 进入“设置”。
4. 打开 `POP3/SMTP/IMAP` 标签页。
5. 勾选 `IMAP/SMTP服务`。
6. 按页面提示获取手机验证码，完成安全验证。
7. 验证成功后，系统会生成“独立密码”。
8. 立即复制独立密码并保存。
9. 回到邮件客户端添加搜狐邮箱。
10. 用户名填写完整邮箱地址。
11. 密码填写独立密码。
12. 手动配置时填写 `imap.sohu.com:993` 和 `smtp.sohu.com:465`。

### 操作截图

![导航至搜狐邮箱的 IMAP/SMTP 服务设置页面](https://img.huzhihui.com/2026/05/14/mail-guide-sohu-01-banner.webp)

![勾选以启用 IMAP/SMTP 服务](https://img.huzhihui.com/2026/05/14/mail-guide-sohu-02-banner.webp)

![通过手机验证码来授权生成独立密码](https://img.huzhihui.com/2026/05/14/mail-guide-sohu-03-banner.webp)

![成功获取用于第三方客户端登录的独立密码](https://img.huzhihui.com/2026/05/14/mail-guide-sohu-04-banner.webp)

![在客户端的密码框中填入独立密码](https://img.huzhihui.com/2026/05/14/mail-guide-sohu-05-banner.webp)

### IP 白名单要不要开

普通用户建议关闭 IP 白名单模式。

如果你没有固定公网 IP，开启白名单后，很容易因为网络变化导致客户端突然无法收发邮件。只用独立密码验证，通常更稳。

![为简化配置，建议关闭 IP 白名单功能](https://img.huzhihui.com/2026/05/14/mail-guide-sohu-06-banner.webp)

![为高级用户展示如何配置 IP 白名单](https://img.huzhihui.com/2026/05/14/mail-guide-sohu-07-banner.webp)

## QQ / Foxmail 邮箱怎么添加

```mermaid
flowchart TD
    A[登录 QQ 邮箱网页版] --> B[进入设置里的账户页]
    B --> C[开启 IMAP/SMTP 服务]
    C --> D[短信或扫码安全验证]
    D --> E[复制授权码]
    E --> F[客户端填写邮箱和授权码]
    F --> G[测试收发]
```

适用邮箱：`@qq.com`、`@foxmail.com`

QQ 邮箱和 Foxmail 邮箱走同一套腾讯邮箱后台。添加第三方客户端时必须使用授权码。

### 服务器参数

| 类型      | 服务器        | 端口          |
| --------- | ------------- | ------------- |
| IMAP 收信 | `imap.qq.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.qq.com` | `465` SSL/TLS |

### 添加步骤

1. 登录 QQ 邮箱网页版。
2. 点击顶部“设置”。
3. 切换到“账户”标签页。
4. 找到 `POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务`。
5. 如果 IMAP/SMTP 服务未开启，点击“开启”。
6. 按页面提示完成安全验证，通常需要绑定手机发送短信。
7. 某些账号还可能要求微信扫码二次验证。
8. 验证成功后，页面会显示授权码。
9. 立即复制授权码并保存。
10. 回到邮件客户端添加 QQ 或 Foxmail 邮箱。
11. 用户名填写完整邮箱地址。
12. 密码填写授权码，不要填 QQ 密码。
13. 手动配置时填写 `imap.qq.com:993` 和 `smtp.qq.com:465`。

### 操作截图

![进入 QQ 邮箱的设置到账户页面](https://img.huzhihui.com/2026/05/14/mail-guide-qq-foxmail-01-banner.webp)

![在账户设置中找到并准备开启 IMAP/SMTP 服务](https://img.huzhihui.com/2026/05/14/mail-guide-qq-foxmail-02-banner.webp)

![根据提示发送短信以完成安全验证](https://img.huzhihui.com/2026/05/14/mail-guide-qq-foxmail-03-banner.webp)

![点击我已发送按钮继续](https://img.huzhihui.com/2026/05/14/mail-guide-qq-foxmail-04-banner.webp)

![可能需要通过微信扫码进行二次验证](https://img.huzhihui.com/2026/05/14/mail-guide-qq-foxmail-05-banner.webp)

![成功生成授权码并进行复制](https://img.huzhihui.com/2026/05/14/mail-guide-qq-foxmail-06-banner.webp)

![在第三方客户端的密码栏中输入获取的授权码](https://img.huzhihui.com/2026/05/14/mail-guide-qq-foxmail-07-banner.webp)

![邮箱成功添加后显示正常状态](https://img.huzhihui.com/2026/05/14/mail-guide-qq-foxmail-08-banner.webp)

### 容易出错的地方

如果你之前开启过 IMAP 服务，但忘记了授权码，不能找回旧授权码。回到 QQ 邮箱账户设置里重新生成即可。

`@qq.com` 和 `@foxmail.com` 的配置流程一样，服务器参数也一样。

## 网易邮箱怎么添加

```mermaid
flowchart TD
    A[登录网易邮箱网页版] --> B[进入 POP3/SMTP/IMAP 设置]
    B --> C[开启 IMAP/SMTP 服务]
    C --> D[开启客户端授权密码]
    D --> E[手机短信安全验证]
    E --> F[复制客户端授权码]
    F --> G[客户端填写邮箱和授权码]
```

适用邮箱：`@163.com`、`@126.com`、`@yeah.net` 等网易个人邮箱

网易邮箱需要开启 IMAP/SMTP 服务，并生成“客户端授权码”。

### 服务器参数

| 类型      | 服务器         | 端口          |
| --------- | -------------- | ------------- |
| IMAP 收信 | `imap.163.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.163.com` | `465` SSL/TLS |

### 添加步骤

1. 登录网易邮箱网页版。
2. 点击顶部“设置”。
3. 从左侧菜单进入 `POP3/SMTP/IMAP`。
4. 确认 `IMAP/SMTP服务` 已开启。
5. 确认 `POP3/SMTP服务` 已开启。
6. 找到“客户端授权密码”，点击开启或生成。
7. 按页面提示完成手机短信等安全验证。
8. 验证成功后，系统会生成客户端授权码。
9. 立即复制授权码并保存。
10. 回到邮件客户端添加网易邮箱。
11. 用户名填写完整邮箱地址。
12. 密码填写客户端授权码，不要填网易邮箱登录密码。
13. 手动配置时填写上面的 IMAP/SMTP 参数。

### 操作截图

![导航至网易邮箱的 POP3/SMTP/IMAP 设置页面](https://img.huzhihui.com/2026/05/14/mail-guide-netease-01-banner.webp)

![开启 IMAP/SMTP 服务并准备获取授权码](https://img.huzhihui.com/2026/05/14/mail-guide-netease-02-banner.webp)

![根据页面提示发送短信以完成安全验证](https://img.huzhihui.com/2026/05/14/mail-guide-netease-03-banner.webp)

![成功生成客户端授权码并复制](https://img.huzhihui.com/2026/05/14/mail-guide-netease-04-banner.webp)

![在第三方客户端的密码栏中输入获取的客户端授权码](https://img.huzhihui.com/2026/05/14/mail-guide-netease-05-banner.webp)

![邮箱成功添加后显示正常状态](https://img.huzhihui.com/2026/05/14/mail-guide-netease-06-banner.webp)

### 多个网易后缀怎么处理

`@163.com`、`@126.com`、`@yeah.net` 的授权码流程一样。

文档里建议使用 `imap.163.com` 和 `smtp.163.com` 作为通用配置，兼容性较好。如果你的网页版后台给出了当前后缀专属服务器，也可以按后台提示填写。

## Outlook / Hotmail 邮箱怎么添加

```mermaid
flowchart TD
    A[登录微软账户安全中心] --> B[开启双重验证]
    B --> C[创建新应用密码]
    C --> D[复制应用密码]
    D --> E[客户端填写邮箱和应用密码]
    E --> F[SMTP 使用 587 STARTTLS]
    F --> G[测试收发]
```

适用邮箱：`@outlook.com`、`@hotmail.com`

微软邮箱需要开启双重验证，然后生成应用密码。这里最容易错的是 SMTP：它用 `587 + STARTTLS`。

### 服务器参数

| 类型      | 服务器                  | 端口           |
| --------- | ----------------------- | -------------- |
| IMAP 收信 | `outlook.office365.com` | `993` SSL/TLS  |
| SMTP 发信 | `smtp.office365.com`    | `587` STARTTLS |

### 添加步骤

1. 登录微软账户安全中心。
2. 找到“双重验证”，按提示开启。
3. 在同一安全设置页面找到“应用密码”。
4. 点击“创建新应用密码”。
5. 系统会生成一个应用密码。
6. 立即复制保存，因为之后通常无法再次查看。
7. 回到邮件客户端添加 Outlook 或 Hotmail。
8. 用户名填写完整邮箱地址。
9. 密码填写微软应用密码，不要填微软账号主密码。
10. 手动配置 IMAP 为 `outlook.office365.com:993`。
11. 手动配置 SMTP 为 `smtp.office365.com:587`，加密方式选择 STARTTLS。

### 操作截图

![导航至微软账户安全设置并开启双重验证](https://img.huzhihui.com/2026/05/14/mail-guide-outlook-hotmail-01-banner.webp)

![确认双重验证已成功开启](https://img.huzhihui.com/2026/05/14/mail-guide-outlook-hotmail-02-banner.webp)

![在高级安全选项中找到并点击创建新应用密码](https://img.huzhihui.com/2026/05/14/mail-guide-outlook-hotmail-03-banner.webp)

![成功生成应用密码并进行复制](https://img.huzhihui.com/2026/05/14/mail-guide-outlook-hotmail-04-banner.webp)

![在客户端密码框中输入微软应用密码](https://img.huzhihui.com/2026/05/14/mail-guide-outlook-hotmail-05-banner.webp)

![邮箱成功添加后显示正常状态](https://img.huzhihui.com/2026/05/14/mail-guide-outlook-hotmail-06-banner.webp)

### 容易出错的地方

不要把 Outlook 的 SMTP 配成 `465 + SSL/TLS`。很多邮箱都是 465，但微软这里是 `587 + STARTTLS`。

如果关闭双重验证，之前创建的应用密码会失效。

## 新浪邮箱怎么添加

```mermaid
flowchart TD
    A[登录新浪邮箱网页版] --> B[进入客户端 POP/IMAP/SMTP]
    B --> C[开启 IMAP4/SMTP 服务]
    C --> D[手机验证码安全验证]
    D --> E[复制客户端授权码]
    E --> F[客户端填写邮箱和授权码]
    F --> G[测试收发]
```

适用邮箱：`@sina.com`、`@sina.cn`

新浪邮箱不能直接用登录密码添加。要先开启 IMAP4/SMTP 服务，再获取“客户端授权码”。

### 服务器参数

| 类型      | 服务器          | 端口          |
| --------- | --------------- | ------------- |
| IMAP 收信 | `imap.sina.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.sina.com` | `465` SSL/TLS |

### 添加步骤

1. 登录新浪邮箱网页版。
2. 点击页面右上角“设置”。
3. 进入 `客户端POP/IMAP/SMTP`。
4. 找到 `IMAP4/SMTP服务`。
5. 将服务状态设置为开启。
6. 按提示输入绑定手机号并填写短信验证码。
7. 验证成功后，系统会弹出 16 位客户端授权码。
8. 立即复制并保存。
9. 回到邮件客户端添加新浪邮箱。
10. 用户名填写完整邮箱地址。
11. 密码填写客户端授权码，不要填邮箱登录密码。
12. 手动配置时填写 `imap.sina.com:993` 和 `smtp.sina.com:465`。

### 操作截图

![新浪邮箱设置界面开启 IMAP4/SMTP 服务](https://img.huzhihui.com/2026/05/14/mail-guide-sina-01-banner.webp)

![新浪邮箱手机验证以开启服务并获取授权码](https://img.huzhihui.com/2026/05/14/mail-guide-sina-02-banner.webp)

![新浪邮箱成功获取客户端授权码提示](https://img.huzhihui.com/2026/05/14/mail-guide-sina-03-banner.webp)

### 容易出错的地方

新浪授权码只显示一次。如果忘记了，只能重新走一遍开启和验证流程获取新的授权码。

如果绑定手机号已经不可用，需要先在新浪邮箱账户安全设置里更新密保手机。

## 移动 139 邮箱怎么添加

```mermaid
flowchart TD
    A[登录 139 邮箱网页版] --> B[进入账户与安全]
    B --> C[开启 IMAP/SMTP 服务]
    C --> D[设置客户端密码]
    D --> E[客户端填写邮箱和客户端密码]
    E --> F[测试收发]
```

适用邮箱：`@139.com`

139 邮箱要先开启 IMAP/SMTP，然后设置“客户端密码”。它不是随机生成，而是让你自己设置一个客户端专用密码。

### 服务器参数

| 类型      | 服务器         | 端口          |
| --------- | -------------- | ------------- |
| IMAP 收信 | `imap.139.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.139.com` | `465` SSL/TLS |

### 添加步骤

1. 登录 139 邮箱网页版。
2. 进入页面顶部“设置”。
3. 在左侧菜单选择“账户与安全”。
4. 找到“邮箱协议设置”。
5. 确认 `IMAP/SMTP服务` 已开启。
6. 回到“账户与安全”，进入“客户端密码”。
7. 按页面提示设置一个新的客户端密码。
8. 过程中可能需要短信验证码等安全验证。
9. 设置成功后保存这个客户端密码。
10. 回到邮件客户端添加 139 邮箱。
11. 用户名填写完整 `@139.com` 邮箱地址。
12. 密码填写刚刚设置的客户端密码，不要填主登录密码。
13. 手动配置时填写 `imap.139.com:993` 和 `smtp.139.com:465`。

### 操作截图

![在 139 邮箱后台开启 IMAP/SMTP 服务](https://img.huzhihui.com/2026/05/14/mail-guide-139-01-banner.webp)

### 容易出错的地方

139 邮箱的客户端密码是“设置”出来的，不是页面自动生成随机密码。忘记后可以回到“客户端密码”页面重新设置。

## 21CN 邮箱怎么添加

```mermaid
flowchart TD
    A[打开客户端添加邮箱] --> B[填写 21CN 邮箱地址]
    B --> C[填写网页登录密码]
    C --> D[配置 IMAP 和 SMTP]
    D --> E[保存并测试收发]
```

适用邮箱：`@21cn.com`

21CN 邮箱比较简单，IMAP/SMTP 默认开启，直接使用邮箱登录密码添加。

### 服务器参数

| 类型      | 服务器          | 端口          |
| --------- | --------------- | ------------- |
| IMAP 收信 | `imap.21cn.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.21cn.com` | `465` SSL/TLS |

### 添加步骤

1. 打开邮件客户端，选择添加邮箱。
2. 邮箱地址填写完整 `@21cn.com` 地址。
3. 密码填写 21CN 邮箱网页登录密码。
4. 如果需要手动配置，填写 `imap.21cn.com:993` 和 `smtp.21cn.com:465`。
5. 保存后测试收信和发信。

### 操作截图

![在第三方客户端添加 21CN 邮箱账户的界面截图](https://img.huzhihui.com/2026/05/14/mail-guide-21cn-01-banner.webp)

### 容易出错的地方

21CN 和 189 都属于电信相关邮箱，但配置策略不一样。21CN 默认允许密码直连，189 需要先在网页端开启 IMAP/SMTP。

## 完美邮箱怎么添加

```mermaid
flowchart TD
    A[登录完美邮箱网页版] --> B[进入客户端设置]
    B --> C[开启 IMAP/SMTP 服务]
    C --> D[新建专用密码]
    D --> E[复制 16 位专用密码]
    E --> F[客户端填写邮箱和专用密码]
    F --> G[按邮箱后缀选择服务器]
```

适用邮箱：`@88.com`、`@111.com`、`@email.cn`

完美邮箱需要开启客户端访问服务，并生成“专用密码”。

### 服务器参数

| 后缀        | IMAP                | SMTP                |
| ----------- | ------------------- | ------------------- |
| `@88.com`   | `imap.88.com:993`   | `smtp.88.com:465`   |
| `@111.com`  | `imap.111.com:993`  | `smtp.111.com:465`  |
| `@email.cn` | `imap.email.cn:993` | `smtp.email.cn:465` |

### 添加步骤

1. 登录完美邮箱网页版。
2. 进入“设置”。
3. 在左侧菜单选择“客户端设置”。
4. 确认 `IMAP/SMTP` 服务已开启。
5. 确认 `POP3/SMTP` 服务已开启。
6. 在同一页面下方找到“专用密码”。
7. 点击“新建专用密码”。
8. 输入一个容易识别的名称，比如“onemail客户端”。
9. 点击确定后，系统会生成 16 位专用密码。
10. 立即复制并保存。
11. 回到邮件客户端添加邮箱。
12. 用户名填写完整邮箱地址。
13. 密码填写 16 位专用密码。
14. 服务器按邮箱后缀选择上面的对应参数。

### 操作截图

![在完美邮箱后台设置中开启 IMAP/SMTP 服务](https://img.huzhihui.com/2026/05/14/mail-guide-88-01-banner.webp)

![为专用密码设置一个可识别的名称](https://img.huzhihui.com/2026/05/14/mail-guide-88-02-banner.webp)

![成功生成 16 位专用密码并复制](https://img.huzhihui.com/2026/05/14/mail-guide-88-03-banner.webp)

### 容易出错的地方

不要把 `@111.com`、`@email.cn` 都强行填成 `imap.88.com`。完美邮箱不同后缀对应不同服务器。

## iCloud 邮箱怎么添加

```mermaid
flowchart TD
    A[确认 Apple ID 开启双重认证] --> B[登录 Apple ID 管理页面]
    B --> C[进入登录与安全]
    C --> D[生成 App 专用密码]
    D --> E[客户端填写邮箱和 App 专用密码]
    E --> F[配置 iCloud IMAP 和 SMTP]
    F --> G[测试收发]
```

适用邮箱：`@icloud.com`、`@me.com`、`@mac.com`

iCloud 邮箱必须使用 Apple ID 的 App 专用密码。直接填 Apple ID 主密码无法登录。

### 服务器参数

| 类型      | 服务器             | 端口           |
| --------- | ------------------ | -------------- |
| IMAP 收信 | `imap.mail.me.com` | `993` SSL/TLS  |
| SMTP 发信 | `smtp.mail.me.com` | `587` 或 `465` |

### 添加步骤

1. 确认 Apple ID 已开启双重认证。
2. 打开 Apple ID 管理页面：`https://appleid.apple.com/`。
3. 使用 Apple ID 登录，并完成双重认证。
4. 进入“登录与安全”。
5. 找到“App 专用密码”。
6. 点击生成 App 专用密码。
7. 输入标签，比如“onemail”。
8. Apple 会生成类似 `xxxx-xxxx-xxxx-xxxx` 的专用密码。
9. 立即复制保存。
10. 回到邮件客户端添加 iCloud 邮箱。
11. 用户名填写完整邮箱地址。
12. 密码填写 App 专用密码，包括连字符。
13. 手动配置时填写 `imap.mail.me.com:993` 和 `smtp.mail.me.com:587`。

### 操作截图

![访问 Apple ID 官网并进入 App 专用密码设置](https://img.huzhihui.com/2026/05/14/mail-guide-icloud-01-banner.webp)

![输入一个便于识别的密码标签](https://img.huzhihui.com/2026/05/14/mail-guide-icloud-02-banner.webp)

![成功生成并复制 App 专用密码](https://img.huzhihui.com/2026/05/14/mail-guide-icloud-03-banner.webp)

### 容易出错的地方

App 专用密码忘记后不能查看，只能撤销旧密码后重新生成。

同一个 App 专用密码可以复用，但不建议。最好一个客户端一个密码，后续撤销时不会影响其他客户端。

## AOL 邮箱怎么添加

```mermaid
flowchart TD
    A[登录 AOL Mail] --> B[进入账户信息]
    B --> C[打开 Account security]
    C --> D[Generate app password]
    D --> E[复制 16 位应用程序密码]
    E --> F[客户端填写邮箱和应用程序密码]
    F --> G[测试收发]
```

适用邮箱：`@aol.com`

AOL Mail 要生成“应用程序密码”。它的流程和 Yahoo 很像。

### 服务器参数

| 类型      | 服务器         | 端口          |
| --------- | -------------- | ------------- |
| IMAP 收信 | `imap.aol.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.aol.com` | `465` SSL/TLS |

### 添加步骤

1. 登录 AOL Mail：`https://mail.aol.com/`。
2. 进入账户信息页面。
3. 从左侧菜单选择 `Account security`。
4. 找到 `Generate app password`。
5. 输入应用名称，比如“onemail”。
6. 点击生成。
7. 系统会显示 16 位应用程序密码。
8. 立即复制并保存。
9. 回到邮件客户端添加 AOL 邮箱。
10. 用户名填写完整邮箱地址。
11. 密码填写应用程序密码。
12. 手动配置时填写 `imap.aol.com:993` 和 `smtp.aol.com:465`。

### 操作截图

![从 AOL Mail 主界面进入账户信息](https://img.huzhihui.com/2026/05/14/mail-guide-aol-01-banner.webp)

![在账户安全页面找到并选择生成应用程序密码](https://img.huzhihui.com/2026/05/14/mail-guide-aol-02-banner.webp)

![开始生成应用程序密码流程](https://img.huzhihui.com/2026/05/14/mail-guide-aol-03-banner.webp)

![为您的应用程序密码输入一个可识别的名称](https://img.huzhihui.com/2026/05/14/mail-guide-aol-04-banner.webp)

![成功生成 16 位应用程序密码并复制](https://img.huzhihui.com/2026/05/14/mail-guide-aol-05-banner.webp)

### 容易出错的地方

AOL 的应用程序密码无法找回。忘记或泄露后，回到账户安全页面重新生成。

## Yandex 邮箱怎么添加

```mermaid
flowchart TD
    A[登录 Yandex Mail] --> B[进入 Email clients 设置]
    B --> C[开启 IMAP 客户端访问]
    C --> D[进入 Yandex ID Security]
    D --> E[创建 Mail 应用密码]
    E --> F[客户端填写邮箱和应用密码]
    F --> G[测试收发]
```

适用邮箱：`@yandex.com`

Yandex 要先开启 IMAP/POP3 客户端访问，再生成应用密码。

### 服务器参数

| 类型      | 服务器            | 端口          |
| --------- | ----------------- | ------------- |
| IMAP 收信 | `imap.yandex.com` | `993` SSL/TLS |
| SMTP 发信 | `smtp.yandex.com` | `465` SSL/TLS |

### 添加步骤

1. 登录 Yandex Mail：`https://mail.yandex.com/`。
2. 进入邮箱设置。
3. 打开 `Email clients`。
4. 勾选 `From the imap.yandex.com server via IMAP`。
5. 如有需要，也可以同时开启 POP3。
6. 点击 `Save changes` 保存。
7. 进入 Yandex ID 账户管理。
8. 打开 `Security` 标签页。
9. 找到 `App passwords`。
10. 选择为 Yandex Mail 创建新密码。
11. 输入名称，比如“onemail”。
12. 点击 `Create`。
13. 复制系统生成的应用密码。
14. 回到邮件客户端添加 Yandex 邮箱。
15. 用户名填写完整邮箱地址。
16. 密码填写应用密码。
17. 手动配置时填写 `imap.yandex.com:993` 和 `smtp.yandex.com:465`。

### 操作截图

![进入 Yandex Mail 所有设置](https://img.huzhihui.com/2026/05/14/mail-guide-yandex-01-banner.webp)

![启用 IMAP/POP3 协议并保存更改](https://img.huzhihui.com/2026/05/14/mail-guide-yandex-02-banner.webp)

![进入 Yandex 账户管理](https://img.huzhihui.com/2026/05/14/mail-guide-yandex-03-banner.webp)

![在安全设置中选择应用密码](https://img.huzhihui.com/2026/05/14/mail-guide-yandex-04-banner.webp)

![选择为 Yandex Mail 创建新密码](https://img.huzhihui.com/2026/05/14/mail-guide-yandex-05-banner.webp)

![为应用密码命名以便于识别](https://img.huzhihui.com/2026/05/14/mail-guide-yandex-06-banner.webp)

![成功生成并复制 Yandex 应用密码](https://img.huzhihui.com/2026/05/14/mail-guide-yandex-07-banner.webp)

### 容易出错的地方

Yandex 的应用密码生成前，必须先打开邮件客户端协议。只生成密码但没开 IMAP，第三方客户端仍然无法同步邮件。

## Mail.ru 邮箱怎么添加

```mermaid
flowchart TD
    A[登录 Mail.ru 账户] --> B[进入 Password & Security]
    B --> C[打开 App passwords]
    C --> D[必要时开启两步验证]
    D --> E[创建应用专用密码]
    E --> F[客户端填写邮箱和应用专用密码]
    F --> G[测试收发]
```

适用邮箱：`@mail.ru`

Mail.ru 建议开启两步验证，并使用应用专用密码登录第三方客户端。

### 服务器参数

| 类型      | 服务器         | 端口          |
| --------- | -------------- | ------------- |
| IMAP 收信 | `imap.mail.ru` | `993` SSL/TLS |
| SMTP 发信 | `smtp.mail.ru` | `465` SSL/TLS |

### 添加步骤

1. 登录 Mail.ru 账户。
2. 进入 `Password & Security`。
3. 找到 `App passwords`，部分账号可能显示为 `External application passwords`。
4. 如果页面要求先开启两步验证，先按提示完成。
5. 创建应用密码前，可能需要完成人机验证。
6. 输入一个便于识别的应用名称，比如“onemail”。
7. 点击创建。
8. 系统会生成应用专用密码。
9. 立即复制并保存。
10. 回到邮件客户端添加 Mail.ru 邮箱。
11. 用户名填写完整邮箱地址。
12. 密码填写应用专用密码。
13. 手动配置时填写 `imap.mail.ru:993` 和 `smtp.mail.ru:465`。

### 操作截图

![访问应用专用密码设置](https://img.huzhihui.com/2026/05/14/mail-guide-mailru-01-banner.webp)

![完成人机身份验证](https://img.huzhihui.com/2026/05/14/mail-guide-mailru-02-banner.webp)

![生成并复制应用专用密码](https://img.huzhihui.com/2026/05/14/mail-guide-mailru-03-banner.webp)

### 容易出错的地方

如果你所在网络访问 Mail.ru 官网不稳定，收发服务器也可能连接慢。第一次配置仍然需要进官网拿应用专用密码，之后客户端收发再看服务商连接情况。

## 添加后怎么验证

每个邮箱添加完后，最好不要只看“保存成功”。

按这个顺序测一遍：

1. 刷新收件箱，看 IMAP 是否能同步。
2. 给自己发一封测试邮件，看 SMTP 是否能发出。
3. 从网页登录邮箱，确认测试邮件是否真的进入“已发送”。
4. 如果能收不能发，优先查 SMTP 服务器、端口和加密方式。
5. 如果认证失败，优先查密码类型是不是填错了。

最常见的错误还是那几个：

| 现象                   | 优先检查                                |
| ---------------------- | --------------------------------------- |
| 一直提示密码错误       | 是否把登录密码填进了授权码/应用密码位置 |
| 能收不能发             | SMTP 服务器、端口、加密方式             |
| Gmail 提示 IMAP 未启用 | Gmail 网页版是否开启 IMAP access        |
| Outlook 发信失败       | 是否使用 `587 + STARTTLS`               |
| 搜狐换网络后不能用     | 是否开启了 IP 白名单                    |

邮件添加看起来只是填账号密码，实际每家邮箱的安全策略都不一样。

按服务商一步一步来，比盲试密码快得多。
