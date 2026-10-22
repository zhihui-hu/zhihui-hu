---
title: Node.js 2026 年 10 月安全更新回顾：排查升级、Brotli 越界与 TLS 校验绕过
slug: nodejs-october-2026-security-brotli-tls-dns
publishedAt: 2026-10-22
summary: 从实际运行的 Node.js 版本排查开始，整理 10 月 21 日安全更新的修复版本，再结合官方补丁和回归样本，分析 Brotli 解码越界、TLS 身份校验绕过、DNS 空字节截断及连接复用问题。
keywords:
  - Node.js 安全漏洞
  - CVE-2026-111497
  - Brotli 越界写入
  - TLS 证书校验
  - CVE-2026-105482
  - Node.js 24.22.1
  - Node.js 22.23.4
tags:
  - Node.js
  - 安全漏洞
  - 源码分析
  - TLS
  - Brotli
  - 工程实践
---

## 前言

2026 年 10 月 21 日，Node.js 发布了一轮安全更新。如果项目里正在用 Node.js，第一件事应该是确认线上进程有没有拿到补丁。

这次需要处理的不只是一处代码：既有 Brotli 解码器的内存安全问题，也有 TLS 身份校验、DNS 输入校验、HTTP 连接复用和启动快照中的随机数缓存问题。它们的攻击入口并不相同，不能看到“Node.js 漏洞”就理解成所有网站都能被同一种请求打穿。

我们先整理排查和升级方法，再回头看公告、源码与复现。

**资料核对截至 2026 年 10 月 22 日。** 下文代码是依据公开补丁整理的实验材料，本文未实际执行。引用的官方测试结果与本文给出的预期行为会分别说明。

## 先确认自己运行的是什么版本

### 1. 查运行环境，不只查 package.json

先在应用实际使用的环境中查看：

```bash
node -p 'JSON.stringify({ version: process.version, execPath: process.execPath, versions: process.versions }, null, 2)'
```

这里有两个特别有用的字段：

- `version`：当前执行这条命令的 Node.js 版本。
- `execPath`：使用的是哪个 Node.js 二进制。

`package.json` 中的 `engines.node` 是版本要求，`@types/node` 是类型定义，它们都不能证明生产进程已经更新。`npm audit` 可以帮助检查项目依赖，但同样不能代替 Node.js 运行时盘点。

如果服务在容器里，再去容器内查看：

```bash
docker exec YOUR_CONTAINER node -p 'process.version + " " + process.execPath'
```

需要注意，这仍然是容器中新启动进程的版本。如果容器内曾经原地替换过二进制，或者服务由另一个绝对路径启动，还要结合服务启动配置和原有进程确认。

Linux 可以先定位进程，再查看它对应的文件：

```bash
pgrep -af node
# 将 1234 换成实际业务进程 PID
NODE_PID=1234
readlink -f "/proc/$NODE_PID/exe"
```

更稳妥的做法，是在应用启动日志或受保护的诊断接口中记录 `process.version`、`process.execPath` 和发布标识。这样查到的就是处理业务请求的进程，而不是 SSH 登录后的交互式终端。

盘点时至少覆盖 Web 服务、后台任务、构建机、CI runner、容器运行层，以及桌面应用中嵌入的 Node.js。纯静态站点构建完成后，浏览器不运行构建机上的 Node.js；不过构建环境本身仍然需要维护。

### 2. 对照这一轮的修复版本

以下是 **2026 年 10 月 21 日这一轮安全更新的最低修复版本**，不是所有未来漏洞的永久安全线：

| 正在使用的分支   | 本轮修复版本               | 处理方式                                 |
| ---------------- | -------------------------- | ---------------------------------------- |
| Node.js 22.x     | 22.23.4                    | 升级到该版本或本分支更新版本             |
| Node.js 24.x     | 24.22.1                    | 升级到该版本或本分支更新版本             |
| Node.js 26.x     | 26.12.1                    | 升级到该版本或本分支更新版本             |
| 已停止维护的分支 | 本轮没有对应的官方常规更新 | 迁移到受支持分支，或核实供应商提供的补丁 |

版本来自 [22.23.4 发行说明](https://nodejs.org/en/blog/release/v22.23.4)、[24.22.1 发行说明](https://nodejs.org/en/blog/release/v24.22.1)和 [26.12.1 发行说明](https://nodejs.org/en/blog/release/v26.12.1)。支持状态应继续核对 [Node.js 发布计划](https://nodejs.org/en/about/previous-releases)。

如果用的是 Linux 发行版维护的软件包，供应商可能在旧的上游版本号后回移安全补丁。此时要看完整包版本和供应商公告，不能只用前三段版本号下结论。自行编译并链接系统 Brotli 的构建，还要确认实际链接的库是否包含相应补丁。

### 3. 查攻击入口是否可达

版本命中之后，可以继续搜索相关调用，帮助决定应急顺序：

```bash
rg -n 'brotliDecompress|createBrotliDecompress|checkServerIdentity|dns\.resolve|new .*Agent|startupSnapshot|build-snapshot|allow-fs' . --glob '!node_modules/**' --glob '!pnpm-lock.yaml'
```

这只是定位线索。依赖库可能封装了这些调用，动态调用也可能搜不到。需要沿着数据流继续看：

| 功能             | 需要确认的输入来源                                              |
| ---------------- | --------------------------------------------------------------- |
| Brotli 解压      | 是否解压用户上传、第三方响应或其他不可信压缩数据                |
| TLS 校验         | 是否接受外部指定的目标主机，是否自定义过证书校验                |
| DNS 解析         | 是否将外部主机名交给 `dns.resolve*()`，是否先做字符串白名单检查 |
| HTTP Agent       | 是否复用连接到可能被攻击者控制的上游                            |
| 启动快照、SEA    | 是否在打包时调用随机数 API，并把运行状态保存进产物              |
| Permission Model | 是否依赖内置权限控制限制文件系统访问                            |

例如，服务只对自己的响应做 Brotli **压缩**，并不等于已经暴露 Brotli **解压**入口。反过来，一个只做定时抓取的后台任务，也可能因为读取第三方压缩响应而接触到不可信数据。

## 当前官方方案：更新运行时，并替换实际运行的进程

应急时可以按下面的顺序处理：

1. 确认应用当前主版本以及二进制来源。
2. 使用官方发布渠道或原有供应商渠道更新到包含补丁的版本。
3. 更新容器构建阶段和最终运行阶段；重新构建包含旧运行时的分发产物。
4. 发布并替换旧进程，检查所有实例的启动版本。
5. 根据实际功能检查解压、HTTPS 出站请求、连接复用和快照启动行为。

例如，原来使用 nvm 管理 Node.js 24 的环境，可以明确安装本轮版本：

```bash
nvm install 24.22.1
nvm use 24.22.1
```

这两条命令只影响相应环境中的版本选择。systemd 的 `ExecStart`、PM2 使用的解释器路径、容器中的运行时，不会因为当前终端切换了版本就自动改变。

这轮还更新了多个依赖和根证书。只修改业务中的一个 npm 包，无法覆盖整个安全发行版；如果单独安装了 Undici，也要同时核实那个 npm 依赖自己的安全版本。[官方安全公告](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)列出了各分支涉及的依赖更新。

临时措施应该围绕入口：暂停不必要的不可信 Brotli 解码、限制外部指定目标地址、减少与不可信上游的连接复用。它们只能降低相应路径的暴露，无法替代整轮更新。关闭 TLS 证书校验尤其不能作为绕过兼容性问题的办法。

## 回顾这次安全更新：有哪些漏洞

官方在 10 月 14 日预告更新，10 月 21 日发布修复。此次公告中的最高等级是 High，并没有把全部问题统一定为 Critical。公告未提供每个漏洞的完整私下报告时间线，因此这里不推测发现与利用的先后顺序。

| CVE             | 官方等级 | 核心问题                             | 公告列出的分支 |
| --------------- | -------- | ------------------------------------ | -------------- |
| CVE-2026-111497 | High     | Brotli 解码越界写入，可能导致 RCE    | 22、24、26     |
| CVE-2026-105482 | High     | DNS 名称中的 NUL 字符被截断          | 22、24、26     |
| CVE-2026-105483 | High     | 全角数字 IP 触发 TLS 主机名校验绕过  | 24、26         |
| CVE-2026-106069 | High     | 非规范 IP 的解析与身份检查不一致     | 22、24、26     |
| CVE-2026-105481 | Medium   | 复用连接接受请求发出前已到达的响应   | 22、24、26     |
| CVE-2026-106072 | Medium   | 非规范 IPv4 错用 DNS SAN 校验        | 22、24、26     |
| CVE-2026-106074 | Medium   | 启动快照保存随机数缓存，进程重复使用 | 22、24、26     |
| CVE-2026-106070 | Low      | ZIP 头验证失败后返回攻击者控制的前缀 | 26             |
| CVE-2026-106071 | Low      | 文件权限通配符查找过度授权           | 26             |
| CVE-2026-106073 | Low      | `fs.realpathSync()` 绕过权限检查     | 22、24、26     |

这张表依据 [10 月安全公告](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)。分支命中用来指导升级；具体部署能否被利用，还取决于入口、配置和输入控制能力。

接下来重点看几条能从公开源码解释清楚的路径。

## Brotli：非法状态为何会变成内存安全问题

### 1. JavaScript 调用最终进入了原生解码器

我们平时调用的接口很简单：

```js
const { brotliDecompressSync } = require('node:zlib');
const decoded = brotliDecompressSync(compressed);
```

但压缩数据不是由 JavaScript 对象模型逐字节处理的。Node.js 通过原生绑定进入 Brotli 的 C 解码器。JavaScript 自身的内存安全，不能替这个原生依赖保证安全。[Node.js zlib 文档](https://nodejs.org/api/zlib.html)列出了这些解压接口。

需要成立的攻击路径是：攻击者控制压缩字节，应用将这些字节送入受影响的解码器，解码器在非法状态下继续处理。最终影响取决于原生内存损坏能走到哪一步。

### 2. 补丁修复的是错误状态的表达和传播

在本次 [Brotli 修复提交](https://github.com/nodejs/node/commit/a6040b50d958e489c501e9c16c60c0ce2c55ec70)中，`DecodeBlockTypeAndLength()` 原来返回布尔值。块类型切换不合法和输入暂时不足，都可能落到相同的失败表示。

补丁把它改为明确的状态码：

```c
/* 根据补丁简化，只展示状态区分。 */
if (max_block_type <= 1) {
    return BROTLI_DECODER_ERROR_FORMAT_BLOCK_SWITCH;
}

/* 输入尚不完整时，返回另一种状态。 */
return BROTLI_DECODER_NEEDS_MORE_INPUT;
```

调用方同时改用 `BROTLI_SAFE_WITH_STATUS`：无论走普通读取还是安全读取分支，只要不是成功状态，就保存状态并返回。

这背后的区别很关键：流式解析中的“等更多字节”是正常控制流，“输入已经违反格式”则必须停止。把两者混在一起，调用方就可能在状态不成立时继续使用内部数据。

根据补丁可以确认，修复加强了非法块切换的检测与错误传播。官方将漏洞影响描述为越界写入并可导致远程代码执行；不过，仅凭这段补丁，不能进一步宣称任意畸形 `.br` 文件都能稳定拿到 shell。

### 3. 使用官方回归样本做版本对照

官方另一个 [回归测试提交](https://github.com/nodejs/node/commit/03923858417da6a87670cf4c099993dbcc6d8361)提供了一个非法块切换样本。下面将它整理成独立脚本 `brotli-repro.cjs`：

```js
const zlib = require('node:zlib');

const input = Buffer.from(
  '200010414141fcffff07002228f00b60f7f41f000000',
  'hex',
);

console.log('Node.js:', process.version);

try {
  const output = zlib.brotliDecompressSync(input);
  console.log('returned bytes:', output.length);
} catch (error) {
  console.log('error:', error.code, 'errno:', error.errno);
}
```

在一次性实验环境中，分别使用官方 Node.js `24.22.0` 和 `24.22.1` 执行：

```bash
node brotli-repro.cjs
```

修复版本的**预期结果**是抛出 `ERR__ERROR_FORMAT_BLOCK_SWITCH`，`errno` 为 `-17`；这是官方测试中的断言。旧版本的具体表现需要实际记录，不能预先写成必然崩溃或执行代码。

如果继续观察流式路径，可以把同一输入逐字节交给 `createBrotliDecompress()`，这也是官方测试覆盖的场景。实验应放在独立进程或受资源限制的临时容器中：`try/catch` 能捕获 JavaScript 异常，无法保证捕获原生内存损坏引发的进程崩溃。

这个实验验证的是**非法输入的拒绝行为**。要证明特定构建发生越界写入，还需要调试构建、内存检测器及对应输入；要证明 RCE，则需要进一步的控制流证据。

## TLS：连接的地址与校验的身份必须是一回事

### 1. 问题出在不同层对主机名的理解不同

先看几种写法：

```text
127.0.0.1
127.1
2130706433
0x7f.0.0.1
１２７.0.0.1
```

它们在不同解析器、不同操作系统中的接受情况可能不同。`net.isIP()`、URL/IDNA 规范化和系统地址解析，也未必对原始字符串做出相同判断。

TLS 的证书身份又区分 DNS SAN 与 IP Address SAN。字符串看起来像地址，不代表可以随意拿 DNS 名称字段去验证实际 IP 端点。

攻击者需要利用这种差异，让连接层到达一个端点，而身份检查按另一种解释验证证书。这里仍然涉及受信任证书链等前提，并不是随便拿一张自签名证书就能通过正常 HTTPS 校验。

### 2. 最终修复选择拒绝非规范 IP 写法

在 [Node.js 24.22.1 的 `lib/tls.js`](https://github.com/nodejs/node/blob/v24.22.1/lib/tls.js)里，可以看到这样的检查：

```js
const hostnameIsIP = net.isIP(hostname);
const hostnameASCIIIsIP = net.isIP(hostnameASCIIWithoutFQDN);

if (!hostnameIsIP && hostnameASCIIIsIP) {
  return new ERR_TLS_CERT_ALTNAME_INVALID(
    'Host is a non-canonical IP address',
    hostname,
    cert,
  );
}
```

也就是说，原字符串不被识别为规范 IP，但规范化之后变成了 IP，就拒绝它。对于原本合法的 IP 字面量，则按 IP SAN 匹配；DNS 名称走 DNS 名称分支。

修复提交还解释了为何不直接信任规范化结果：平台解析器可能把原始数字主机名解释成不同的地址。统一转换看起来方便，却未必保证“验证的地址”就是“连接的地址”。[非规范 IP 修复](https://github.com/nodejs/node/commit/ad788ccd076b30e4e547910ace0beda2d063ad10)和[全角数字修复](https://github.com/nodejs/node/commit/cd4b05469c8c7abcdb6579779cb7c72e54d9f212)需要结合最终发行版源码阅读。

### 3. 不发网络请求，也能观察身份匹配差异

保存为 `tls-identity-repro.cjs`：

```js
const tls = require('node:tls');

const cert = {
  subject: {},
  subjectaltname: 'DNS:127.0.0.1',
};

for (const host of ['127.0.0.1', '127.1', '１２７.0.0.1']) {
  const error = tls.checkServerIdentity(host, cert);
  console.log(host, error ? error.code : 'ACCEPTED');
}
```

分别在修复前后的版本执行：

```bash
node tls-identity-repro.cjs
```

固定版本的预期行为，是拒绝这组不适用于该证书的身份：规范 IP 不能靠 DNS SAN 通过，两个非规范写法也应被拒绝。不同旧版本可能表现不同，应保留实际结果。

这个实验直接调用身份匹配函数，传入的是证书字段对象，**没有验证证书链，也没有完成 TLS 握手**。它适合解释失败的检查。完整连接对照还需要实验 CA、服务端证书、受控地址解析和 `rejectUnauthorized: true`；[官方连接回归测试](https://github.com/nodejs/node/blob/v24.22.1/test/parallel/test-tls-connect-non-canonical-ip.js)提供了这样的结构。

## DNS：JavaScript 看到完整字符串，C 绑定只看到前半段

### 1. 空字节把“检查对象”和“使用对象”分开了

假设业务做了这样一个过于简单的判断：

```js
const host = 'example.com\u0000.trusted.corp';
console.log(host.endsWith('.trusted.corp')); // true
```

JavaScript 字符串允许包含 `\u0000`。但如果传给以 NUL 结尾的 C 字符串接口，下层可能只处理 `example.com`。

这样，上层验证的是整个字符串，下层使用的却是另一段内容。是否进一步形成 SSRF 或其他越权，要看应用是否把这个差异用于目标地址授权以及后续连接；DNS 截断本身不能替代完整攻击链的证明。

这次 [DNS 修复](https://github.com/nodejs/node/commit/6b78ea171de305446126cb94ceb6a45b6297466c)将相关 `validateString()` 改为 `validateStringWithoutNullBytes()`，同时覆盖回调与 Promise 解析接口。

### 2. 用本机 DNS 接收器观察实际查询名

下面的实验只向 `127.0.0.1` 上的临时 UDP 端口发查询。接收器不转发请求，返回 NXDOMAIN：

```js
// dns-nul-repro.cjs
const dgram = require('node:dgram');
const { Resolver } = require('node:dns');

const server = dgram.createSocket('udp4');
const resolver = new Resolver({ timeout: 300, tries: 1 });

server.on('message', (packet, peer) => {
  let offset = 12;
  const labels = [];
  while (packet[offset] !== 0) {
    const length = packet[offset++];
    labels.push(packet.toString('ascii', offset, offset + length));
    offset += length;
  }
  console.log('wire query:', labels.join('.'));

  const reply = Buffer.from(packet);
  reply.writeUInt16BE(0x8183, 2);
  reply.fill(0, 6, 12);
  server.send(reply, peer.port, peer.address);
});

server.bind(0, '127.0.0.1', () => {
  resolver.setServers([`127.0.0.1:${server.address().port}`]);
  const host = 'example.test\u0000.trusted.corp';
  console.log('suffix accepted:', host.endsWith('.trusted.corp'));

  try {
    resolver.resolve4(host, (error) => {
      console.log('callback:', error?.code);
      server.close();
    });
  } catch (error) {
    console.log('rejected:', error.code);
    server.close();
  }
});
```

分别用 Node.js `24.22.0` 和 `24.22.1` 执行 `node dns-nul-repro.cjs`。依据补丁，旧版的预期现象是接收器看到截断后的 `example.test`；修复版应在参数检查阶段抛出 `ERR_INVALID_ARG_VALUE`，不产生这次 DNS 查询。

这里把接收器限定为该脚本自身产生的简单查询，没有实现通用 DNS 服务。实验展示的是表示差异及补丁效果，不能直接拿来判断某个线上 URL 抓取接口是否可被利用。

## HTTP 连接复用：旧连接里的数据也有时序问题

`http.Agent` 会保存空闲连接，下一次请求可以直接复用。

本轮 [HTTP 修复](https://github.com/nodejs/node/commit/0683ee5f7d512332c9701a3e06cdeec2c34bcdbf)关注的是一个更细的时序：异常上游提前向空闲连接写入响应数据，数据已经进入操作系统 socket 缓冲区，但事件循环还没有轮询到它。此时连接被交给新请求，原有 JavaScript 数据防护可能来不及识别这些字节。

```text
请求 A 完成 → 连接进入空闲池
                     ↓
上游提前写入数据 → 数据到达内核缓冲区
                     ↓
事件循环尚未交付数据事件 → 请求 B 复用连接
                     ↓
提前到达的数据可能被当成 B 的响应
```

补丁在交出连接之前增加原生层的 `hasPendingRead()` 检查。存在待读数据等状态时，丢弃连接，避免继续复用。

这条路径需要能够影响上游响应或连接行为，不能理解成任意外网请求都能污染任意 Node.js 服务。需要完整研究时，可以沿着[官方回归测试](https://github.com/nodejs/node/blob/v24.22.1/test/parallel/test-http-agent-free-socket-pending-read.js)搭建本机服务与客户端对照。

## 随机数缓存：为什么更新后还要重建快照产物

启动快照会保存部分 JavaScript 运行状态。如果制作快照时已经填充了 `randomUUID()`、`randomInt()` 的熵缓存，缓存中的未使用数据也可能被保存。多个进程从同一快照启动，就可能重复消费这些值。

这和正常进程里连续调用随机 API 是不同的使用条件。需要重点排查自定义启动快照和 Single Executable Application（SEA）。

本轮 [随机缓存修复](https://github.com/nodejs/node/commit/acffa610db2d85c81d01545194d99fb67920d309)在用户序列化回调之后、用户反序列化回调之前清理缓存。双侧处理也考虑了回调之后的微任务等继续填充缓存的情况。

因此，自包含可执行文件应使用修复后的工具链重新生成，并替换旧产物。业务在构建时主动生成并保存为常量的 token，则属于应用自己固化的数据，不能指望运行时清理缓存自动替换它。

## 排查“已受影响”和排查“已被入侵”是两件事

前面回答的是版本与入口问题。进一步调查时，可以关联这些信号：

- 解压失败、原生崩溃、进程异常退出是否集中出现在外部数据处理之后。
- HTTPS 出站请求是否存在异常数字主机名、全角字符或自定义校验逻辑。
- DNS 参数日志中是否保留了空字节的转义表示。
- 同一上游的响应与请求是否出现错配，是否伴随连接复用异常。
- 快照启动的不同实例是否出现本应独立的随机值重复。

这些都需要结合正常业务基线判断。不能把一次解压错误认定为成功 RCE，也不能因为应用日志中没有异常，就认定原生层没有出问题。

如果已经发现异常进程、陌生文件写入或凭证访问，再进入入侵处置：保留相关日志与现场，隔离受影响实例，按实际访问范围处理密钥和恢复。升级解决漏洞，入侵调查解决之前是否已发生损失。

## 结语

这轮更新可以按三步落实：先找到真正处理业务的 Node.js 进程，再升级并替换运行产物，最后沿着不可信输入确认暴露路径。

源码层面值得记住的，是几个很具体的边界：格式错误不能当成等待输入，证书校验和地址解析必须解释同一个目标，字符串白名单不能信任下层截断后的结果，复用连接和快照也不能继承不该保留的状态。

## 参考文章

- [Node.js：2026 年 10 月安全公告](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)
- [Node.js 24.22.1 发行说明](https://nodejs.org/en/blog/release/v24.22.1)
- [Brotli 解码状态修复](https://github.com/nodejs/node/commit/a6040b50d958e489c501e9c16c60c0ce2c55ec70)
- [Brotli 官方回归样本](https://github.com/nodejs/node/commit/03923858417da6a87670cf4c099993dbcc6d8361)
- [TLS 非规范 IP 修复](https://github.com/nodejs/node/commit/ad788ccd076b30e4e547910ace0beda2d063ad10)
- [DNS 空字节输入修复](https://github.com/nodejs/node/commit/6b78ea171de305446126cb94ceb6a45b6297466c)
- [HTTP Agent 空闲连接检查修复](https://github.com/nodejs/node/commit/0683ee5f7d512332c9701a3e06cdeec2c34bcdbf)
- [启动快照随机数缓存修复](https://github.com/nodejs/node/commit/acffa610db2d85c81d01545194d99fb67920d309)
