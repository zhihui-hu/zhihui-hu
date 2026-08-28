---
title: 云电脑里不能直接传文件，我写了一个用剪贴板和二维码传输的 One Transfer
slug: one-transfer-restricted-environment-file-transfer
publishedAt: 2026-08-21T10:00
updatedAt: 2026-08-28T18:00
summary: 在受限云电脑、VDI 和临时隔离环境里，文件不能直接上传下载时怎么办？本文结合 One Transfer 当前源码，详细拆解 ONE_TRANSFER_V2、Base91、LT 喷泉码、四二维码并行传输、真实带宽模型，以及电脑、手机和远程桌面之间的传输优化。
keywords:
  - One Transfer
  - 云电脑文件传输
  - VDI 文件传输
  - 剪贴板传文件
  - 动画二维码
  - LT Fountain Code
  - Robust Soliton Distribution
  - 光学传输带宽
  - Base91
tags:
  - One Transfer
  - 文件传输
  - 云电脑
  - 开源项目
  - React
  - Vite
  - TypeScript
---

## 前言

最近在一些受限云电脑、VDI 和临时隔离环境里传文件，遇到一个很实际的问题：网页可以打开，文字可以复制，但是文件上传、下载、共享目录和远程磁盘都不可用。

这种环境通常不是网络断了，而是文件通道被限制了。你可以把一段文字复制进远端，却没办法把一个文件对象直接拖进去；远端屏幕可以被另一台电脑或手机看到，但没有一条稳定的回传链路。

所以我写了一个 [One Transfer](https://github.com/zhihui-hu/one-transfer)。

它不是网盘，也不是把文件上传到某个中转服务器，而是利用环境里还存在的两种基础通道：

- 有文本剪贴板时，把文件压缩并编码成纯文本，在 Windows 端恢复；
- 只有可见屏幕时，把文件编码成连续播放的四格二维码，由另一台设备通过屏幕捕获或相机接收。

这次我重新按当前源码梳理了文章，版本固定在：

```text
One Transfer: 0.2.0
commit: ee9c5d03c2e22c886589ce1955c15d7586000db3
date: 2026-08-25
```

接下来除了讲怎么使用，还会重点拆开 LT 喷泉码、鲁棒孤子分布、确定性随机数、Peeling 解码、二维码容量和实际带宽，以及电脑、手机、低性能设备和远程桌面之间应该怎么调参。

## 我想解决的不是“怎么上传”，而是“没有文件通道怎么办”

普通文件传输依赖的是网络和文件系统：

```text
本地文件 -> HTTP / 对象存储 / 共享目录 -> 远端文件
```

但在受限环境里，这条链路可能被直接拿掉。我们还能使用的，往往只剩下几种基础能力：

1. 浏览器能读取用户主动选择的本地文件。
2. 剪贴板可以传递纯文本。
3. 一个屏幕可以显示内容。
4. 另一台设备可以用摄像头或屏幕捕获观察内容。

这几个能力单独看都不能稳定传文件。

剪贴板只能传文本，所以要解决二进制怎样编码、文本是否被截断、文件名怎样恢复。屏幕到摄像头又是一条单向光学链路，发送端不知道接收端漏了哪一帧，不能像分片上传一样按编号重传。

One Transfer 把问题拆成了两条独立通道：

```text
文件 -> gzip -> Base91 -> 文本剪贴板 -> Windows 恢复

文件 -> 容器 -> LT 喷泉码 -> 动态二维码 -> 相机/屏幕捕获 -> 文件
```

项目服务端只提供静态页面、Worker、WASM 和还原脚本，不接收业务文件。所有编码、压缩、哈希、二维码生成和恢复都在参与传输的设备本地完成。

## One Transfer 当前的三个入口

项目是一个 Vite SPA，主要有三个页面：

| 路由         | 用途                                                  |
| ------------ | ----------------------------------------------------- |
| `/clipboard` | 把文件或文件夹编码成剪贴板文本，交给 Windows 脚本恢复 |
| `/send`      | 把文件、文件夹或文字播放成四格动态二维码              |
| `/receive`   | 通过屏幕捕获或摄像头接收二维码                        |

如果环境允许同步较长文本，优先使用剪贴板通道。它不受屏幕、相机和识别帧率影响，通常更快。

如果剪贴板容量不足，或者设备之间只有“屏幕能看见”这一条路，再使用动态二维码。

## 通道一：把文件变成可复制的文本

### ONE_TRANSFER_V2 协议

当前网页生成的是 `ONE_TRANSFER_V2`，不是旧文章里的 V1 Base64：

```text
ONE_TRANSFER_V2|<itemType>|<codec>|<compression>|<originalSize>|<sha256>|<encodedName>|<payload>
```

各字段含义如下：

| 字段              | 作用                          |
| ----------------- | ----------------------------- |
| `ONE_TRANSFER_V2` | 魔数和协议版本                |
| `itemType`        | `file` 或 `directory`         |
| `codec`           | 当前网页固定为 `base91`       |
| `compression`     | `none` 或 `gzip`              |
| `originalSize`    | 解码、解压后的精确字节数      |
| `sha256`          | 原始内容的 SHA-256            |
| `encodedName`     | 百分号编码后的 UTF-8 文件名   |
| `payload`         | Base91 编码的原始或 gzip 字节 |

协议只切前七个 `|`，第八段读取全部剩余文本。这样即使 Base91 字母表本身包含 `|`，也不会把负载误拆成更多字段。

Windows 端使用 `one-transfer-restore.bat`。当前脚本恢复 V2 Base91，同时保留对旧版 `ONE_TRANSFER_V1 + Base64` 的兼容。

### 为什么从 Base64 换成 Base91

Base64 每 3 个输入字节变成 4 个字符，理论体积增加约 33.3%：

```text
base64Length = 4 × ceil(bytes / 3)
```

Base91 使用 91 个可打印 ASCII 字符。每个字符理论上可以承载：

```text
log2(91) ≈ 6.5078 bit
```

所以它的理论编码倍率约为：

```text
8 / log2(91) ≈ 1.2297
```

也就是大约 23% 的开销，比 Base64 少约 10 个百分点，同时不依赖高位 Unicode，适合可能重编码、过滤或规范化文本的 Windows、RDP 和 VDI 剪贴板。

项目里的 Base91 编码不是简单地“每 N 位查表”。它维护一个 bit queue，每次尝试取 13 bit：

```js
let value = queue & 8191;

if (value > 88) {
  queue >>= 13;
  queuedBits -= 13;
} else {
  value = queue & 16383;
  queue >>= 14;
  queuedBits -= 14;
}

output += alphabet[value % 91];
output += alphabet[Math.floor(value / 91)];
```

为什么有时取 13 bit，有时取 14 bit？

两个 Base91 字符一共有 `91² = 8281` 种组合，能完整覆盖 13 bit 的 `8192` 种状态，还剩 89 种。如果低 13 bit 落在这 89 个特殊值里，就再多取 1 bit，提高编码密度。

这也是 Base91 比固定 6 bit 一组的 Base64 更紧凑的原因。

### gzip 为什么在编码前做

编码流程如下：

```text
原始字节
  ├─ SHA-256
  └─ gzip level 9
       ├─ gzip 更小 -> Base91(gzip)
       └─ gzip 无收益 -> Base91(raw)
```

gzip 必须在 Base91 之前做。Base91 会把二进制变成接近均匀分布的字符，再压缩几乎没有收益。

剪贴板链路当前对选择的内容尝试最高级别 gzip，只在结果确实更小时采用。源码、JSON、日志和文本目录通常能明显缩小；JPEG、MP4、ZIP 等已经压缩的内容，大多会保留原字节。

假设一个 10 MiB JSON 文件 gzip 后只剩 1.5 MiB：

```text
不压缩 Base91 ≈ 10 × 1.23 = 12.3 MiB 字符负载
压缩后 Base91 ≈ 1.5 × 1.23 = 1.85 MiB 字符负载
```

这时决定传输时间的主要因素不是 Base64 和 Base91 的差异，而是文件是否容易压缩。

### 为什么编码放进 Worker

目录 ZIP、gzip、SHA-256 和 Base91 都会完整扫描数据。大文件如果全部跑在主线程上，页面会长时间无法响应。

当前实现把剪贴板编码和目录归档放进 Worker，并用 `AbortSignal` 管理取消。用户重新选择文件时，旧任务会失效，避免上一次编码晚到后覆盖新结果。

网页现在还支持：

- 单个文件；
- 完整文件夹，先在浏览器中生成 ZIP；
- 前端或 Python 工程，先排除依赖、缓存和构建产物，再生成源码归档。

这比把目录交给外部脚本更适合第一次使用，但纯空文件夹无法通过浏览器文件选择器传输。

### Windows 端怎样保证不会写出半个文件

`one-transfer-restore.bat` 的恢复顺序是：

```text
Get-Clipboard -Raw
  -> 校验协议字段
  -> Base91 解码
  -> 有上限地 gzip 解压
  -> 精确长度校验
  -> SHA-256 校验
  -> 检查文件名和已有目标
  -> 写入文件或恢复目录
```

只有所有检查都通过，脚本才会生成目标。它拒绝 Windows 保留名称、路径穿越和覆盖已有文件，也不会把剪贴板文本当成 PowerShell 命令执行。

V2 能发现剪贴板被截断或修改，但不能提高 RDP、浏览器或安全网关本身的剪贴板容量。如果文本通道只允许几百 KB，再高效的编码也无法塞进几十 MB 文件。

## 通道二：把文件播放成四格动态二维码

剪贴板通道解决的是“二进制怎样变成文本”。光学通道面对的是另一个问题：

```text
发送端只能显示
接收端只能观察
中间没有 ACK
```

最直接的做法是把文件顺序切片：

```text
0 -> 1 -> 2 -> 3 -> 4 -> ...
```

但只要漏掉第 3 片，接收端就永远缺一块。除非再建立一条回传通道，告诉发送端重播第 3 片。

One Transfer 使用 LT 喷泉码，把“必须收到每个原始分片”改成“收到足够多的独立线性组合”。

## 文件先进入统一光学容器

文件不会直接切成喷泉码块，首先经过 `packFile()` 进入一个 DCF2 容器：

| 偏移 | 长度 | 字段                  | 作用               |
| ---: | ---: | --------------------- | ------------------ |
|    0 |    4 | Magic `DCF2`          | 识别容器版本       |
|    4 |    1 | Compression           | `0` 原始，`1` gzip |
|    5 |    2 | Name Length           | UTF-8 文件名字节数 |
|    7 |    2 | Type Length           | MIME 字节数        |
|    9 |    4 | Original Length       | 原始文件长度       |
|   13 |    4 | Transmitted Length    | 实际传输字节长度   |
|   17 |   32 | SHA-256               | 原始内容摘要       |
|   49 | 可变 | Name + Type + Payload | 文件名、类型和内容 |

文件和文字共用这个容器。文字使用专用 MIME 类型，接收端恢复后显示复制按钮；普通文件显示下载按钮。

光学链路不会对所有文件盲目 gzip：

- 小于 768 字节时跳过；
- JPEG、视频、ZIP、7z、Office Open XML 等预压缩格式跳过；
- BMP、SVG、TIFF、WAV 等仍允许尝试；
- 只有 gzip 至少节省 64 字节时才采用。

这是 CPU、内存与光学时间之间的取舍。重复压缩一个 100 MiB MP4，可能多占一份完整缓冲区，却几乎不能减少二维码数量。

## 深入理解 LT 喷泉码

### 什么是“喷泉”

普通纠删码通常先规定生成多少数据块和多少校验块。LT Code 是 rateless erasure code，也就是无固定码率的擦除码：发送端可以不断生成新的编码 Symbol，就像喷泉持续喷水。

接收者不需要从第一滴开始接，也不关心具体漏了哪一滴。只要接到足够多的独立 Symbol，就能恢复原始数据。

它很适合 One Transfer 的单向光学通道：二维码要么被完整识别，要么被当作擦除丢掉；发送端不需要知道是哪一帧没识别。

### 第一步：切成 K 个源块

假设光学容器长度为 `N`，每个 QR 帧总长度为 `frameBytes`，其中固定帧头占 20 字节：

```text
blockLen = frameBytes - 20
K = ceil(N / blockLen)
```

最后一块不足 `blockLen` 时补零，解码完成后再按 `totalLen` 截掉填充。

例如平衡档：

```text
frameBytes = 1700
blockLen = 1680
N = 10 MiB
K = ceil(10 × 1024 × 1024 / 1680)
  = 6242
```

### 第二步：从鲁棒孤子分布选择度数

每个编码 Symbol 不是简单复制一个源块，而是选择 `d` 个不同源块做 XOR。这个 `d` 就是 degree。

如果所有 Symbol 都只选一个块，随机采样会产生严重的优惠券收集问题，最后几个块很难碰到。如果 degree 都很大，接收端一开始又找不到可以直接解出的块。

理想孤子分布定义为：

```text
ρ(1) = 1 / K
ρ(d) = 1 / (d × (d - 1)), d = 2...K
```

它希望 Peeling 过程中始终维持少量 degree 1 Symbol。但有限样本下，这个“可立即解出的集合”很容易耗尽。

所以项目使用 Robust Soliton Distribution，在理想分布上加入 `τ(d)`，参数固定为：

```text
c = 0.1
δ = 0.5
R = c × ln(K / δ) × sqrt(K)
```

直观理解就是：人为增加一部分低 degree Symbol，并在 `K/R` 附近放一个 spike，降低解码 Ripple 提前归零的概率。

代码先构造归一化 CDF，再用伪随机数做逆 CDF 采样。这里的分布不只是实现细节，它直接决定某个 `seq` 会选择什么 degree，属于线协议的一部分。

### 第三步：确定性选出源块

二维码帧里不会附带一长串“本帧用了哪些块”。否则 degree 越大，索引开销越高。

发送端和接收端都根据以下信息独立计算：

```text
sessionId + seq + K + 相同的 CDF
```

项目先把 `sessionId` 和 `seq` 混成 seed，再用只包含 32 位整数运算的 `splitmix32` 生成伪随机序列。

小 degree 使用 `Set` 去重采样；当 `d > K/8` 时，改用部分 Fisher-Yates Shuffle。后者避免高 degree 情况下不断抽到重复索引，时间复杂度失控。

### 第四步：对源块做 XOR

假设选中了块 `B1`、`B4`、`B8`：

```text
encoded = B1 XOR B4 XOR B8
```

源码使用 `Uint32Array` 按 32 bit word 执行 XOR，而不是逐字节循环：

```js
for (let i = 0; i < dst.length; i++) {
  dst[i] = (dst[i] ^ src[i]) >>> 0;
}
```

一个编码 Symbol 只需要携带 `seq`。接收端使用相同 seed 和分布，就能重新得到 `[1, 4, 8]`。

### 第五步：Peeling Decoder 怎样恢复

接收端维护两类状态：

- 已经解出的源块；
- 仍包含多个未知源块的 Pending Frames。

处理一帧时：

```text
根据 seq 重建索引集合
  -> XOR 消去已经解出的块
  -> 剩 0 个未知块：冗余帧，丢弃
  -> 剩 1 个未知块：直接解出
  -> 剩多个未知块：挂到对应块的等待集合
```

一旦解出新块，就继续去所有等待它的帧中消元：

```text
解出 B4
  -> P1: B4 XOR B7 变成 B7
  -> 解出 B7
  -> P2: B2 XOR B7 变成 B2
  -> 解出 B2
  -> ...
```

这就是 Peeling Cascade。它解释了为什么 LT 接收进度不是线性的：前面可能收了很多帧却只解出少量块，某个 degree 1 帧到达后，会突然触发整串级联。

### 为什么不能直接使用 Math.log

发送端可能是 Chrome 的 V8，接收端可能是 iPhone 的 JavaScriptCore。ECMAScript 不要求不同引擎的 `Math.log()` 在最后 1 ULP 上完全一致。

如果某个 CDF 边界因此偏了一点，发送端认为 `seq=1024` 的 degree 是 3，接收端却算成 4，后面的 XOR 关系就完全错了。

项目实现了 `dlog()`：先做 2 倍范围规约，再使用 atanh 级数，只依赖明确的 IEEE-754 基本运算。它可能和 `Math.log` 相差 1 ULP，但发送端和接收端能得到相同结果。

所以 `dlog()` 看起来是数学工具，实际上和帧头一样属于线协议，源码还用 Golden Vector 测试固定其输出。

### 喷泉码开销不是永远 15%

“LT Code 大约多收 15%”只适合较大的 `K`，小文件波动明显更大。

当前进度估计使用：

```text
overhead(K) = clamp(1.1 + 2.45 / sqrt(K), 1.15, 1.6)
```

举几个计算值：

|         K | 进度模型采用的开销 |
| --------: | -----------------: |
|        25 |              1.59× |
|       100 |             1.345× |
|       400 |             1.223× |
|      1600 |             1.161× |
| 3200 以上 |       最低按 1.15× |

这只是 ETA 和进度的经验估计，不是解码保证。真实恢复帧数由 degree 序列、重复帧和具体样本决定。

## 二维码帧为什么能从中途加入

每个二维码包含 20 字节自描述帧头：

| 偏移 | 类型  | 字段          | 说明                   |
| ---: | ----- | ------------- | ---------------------- |
|    0 | `u8`  | Magic 0       | `0xD1`                 |
|    1 | `u8`  | Magic 1       | `0x0C`                 |
|    2 | `u16` | Session ID    | 每次开始发送随机生成   |
|    4 | `u32` | Sequence      | 驱动 LT 伪随机选择     |
|    8 | `u16` | K             | 源块总数               |
|   10 | `u16` | Block Length  | 每个 Symbol 的载荷长度 |
|   12 | `u32` | Total Length  | 容器精确长度           |
|   16 | `u32` | Payload FNV   | 完整容器 FNV-1a        |
|   20 | 可变  | Encoded Block | XOR 后的数据块         |

接收端即使从第 3000 个 Symbol 才加入，也能从当前帧知道怎样初始化 `LTDecoder`。

当前流身份由这些字段组成：

```text
sessionId : K : blockLen : totalLen : payloadFnv
```

`seq` 故意不参与，因为它在每一帧都会变化。任何固定字段不一致，接收端都会重建解码器，避免把两个文件的 Symbol 混在一起。

恢复后先检查 FNV-1a，再解析容器、限制 gzip 解压长度，最后计算原始内容 SHA-256。FNV 用于快速发现光学恢复错误，不是密码学认证；SHA-256 能证明内容一致，也不能证明发送者身份。

## 为什么现在同时显示四个二维码

单个 QR 每次只能携带有限字节。提高带宽有两条路：

1. 让一个 QR 更密；
2. 同一画面并行显示多个可独立识别的 QR。

One Transfer 当前使用 `2 × 2` 四格布局，每次视觉 Tick 同步替换 4 个 Symbol：

```text
稳定档：4 × 24 = 96 symbols/s
平衡档：4 × 30 = 120 symbols/s
高速档：4 × 30 = 120 symbols/s
```

四个码彼此独立。接收端一次最多识别 4 个有效 QR，任何一个失败都只相当于丢失一个喷泉 Symbol。

发送端固定使用：

- QR Byte Mode，直接写入二进制帧；
- ECC L；
- Mask Pattern 4；
- 4 module quiet zone；
- 整数像素放大，关闭图像平滑。

ECC L 看起来纠错较弱，但这是有意的。QR 层负责把一张图完整解成字节；难以识别的整帧直接丢弃，跨帧损失交给 LT Code 处理。提高 QR ECC 会减少每码有效字节，还可能把 QR version 推得更高。

固定 mask 则避免每个 Symbol 都评估 8 种掩码。动态流不需要为每一帧寻找评分最优图案，省下的 CPU 可以用于稳定生成四码队列。

## 发送端怎样避免自己卡住

四码平衡档每秒要创建 120 张二维码。发送端没有在显示瞬间同步计算，而是维护一个 8 Symbol 的 Lookahead Queue：

```text
初始生成 4 个并显示
  -> 预生成队列补到 8 个
  -> rAF 到达视觉 Tick
  -> 一次取出 4 个同步绘制
  -> setTimeout(0) 再补 4 个
```

这样视觉更新不必等待下一张 QR 生成。生成发生在绘制之后，队列又被限制为 8，避免无意义地提前生成几百帧占用内存。

如果页面一度落后超过 3 个 Tick，调度器会从当前时间重新起步，不会为了“补回历史帧”突然爆发绘制。喷泉码本来就不要求连续播放每一个计划时间点，保持当前画面稳定更重要。

## 带宽到底怎么计算

这里的带宽不是 Wi-Fi 或网卡带宽，而是从屏幕到解码器的光学有效载荷速率。

### 第一层：发送端原始载荷上限

每个 Symbol 的前 20 字节是协议头，所以：

```text
symbolsPerSecond = qrCount × ticksPerSecond
blockBytes = frameBytes - 20
rawKiB/s = symbolsPerSecond × blockBytes / 1024
```

当前三个档位为：

| 档位 | QR 数 | Tick/s | 每码总字节 | 每码载荷 | Symbol/s | 原始载荷上限 |
| ---- | ----: | -----: | ---------: | -------: | -------: | -----------: |
| 稳定 |     4 |     24 |     1465 B |   1445 B |       96 | 135.47 KiB/s |
| 平衡 |     4 |     30 |     1700 B |   1680 B |      120 | 196.88 KiB/s |
| 高速 |     4 |     30 |     2331 B |   2311 B |      120 | 270.82 KiB/s |

这也是发送页显示的“约 135/197/271 KiB/s”。它是屏幕成功显示全部 Symbol 时的数学上限，不是接收完成速度。

### 第二层：扣除识别损失与喷泉冗余

接收端真正收到的净速率近似为：

```text
netKiB/s ≈ rawKiB/s × decodeSuccessRate / fountainOverhead
```

假设不重复 Symbol 的识别成功率为 75%，LT 实际需要 1.2 倍 Symbol：

| 档位 |     原始上限 |   估算净速率 | 1 MiB 数学耗时 | 10 MiB 数学耗时 |
| ---- | -----------: | -----------: | -------------: | --------------: |
| 稳定 | 135.47 KiB/s |  84.67 KiB/s |     约 12.1 秒 |       约 121 秒 |
| 平衡 | 196.88 KiB/s | 123.05 KiB/s |      约 8.3 秒 |        约 83 秒 |
| 高速 | 270.82 KiB/s | 169.26 KiB/s |      约 6.0 秒 |        约 60 秒 |

这张表仍然不是实测 Benchmark，只是帮助理解参数关系。真实时间还会受到压缩率、重复帧、摄像头曝光、视频压缩、Worker 忙碌和 Peeling 波动影响。

如果 10 MiB 源码目录压缩后只剩 2 MiB，光学链路真正发送的是 2 MiB 左右的容器，不是原始 10 MiB。反过来，MP4、ZIP 这类不可再压缩文件就基本按原大小计算。

### 第三层：完成后的真实净速率

接收完成后，页面使用：

```text
actualNetKiB/s = containerBytes / elapsedSeconds / 1024
```

这个值最接近用户实际经历的传输速度，因为它已经包含：

- 没识别到的 QR；
- 重复读到的 QR；
- Worker 忙碌丢帧；
- LT 冗余；
- 解码等待。

接收中显示的 goodput 则是估算值：

```text
uniqueFrames × blockLen / overhead(K) / elapsed
```

它会用 `K` 相关的 overhead 修正，不再固定写死 1.18。

### 为什么提高密度反而可能更慢

从平衡档切到高速档，每个 Symbol 从 1680 B 增加到 2311 B，理论上快 37.6%。但 QR version 也会升高，相同画面面积里每个 module 更小。

如果识别成功率从 80% 掉到 50%：

```text
平衡：196.88 × 0.80 / 1.20 ≈ 131.25 KiB/s
高速：270.82 × 0.50 / 1.20 ≈ 112.84 KiB/s
```

高速档的理论带宽更高，实际却更慢。

所以优化目标不是 `frameBytes × FPS` 最大，而是：

```text
每秒成功收到的不重复有效载荷最大
```

## 文件上限为什么随档位变化

帧头中的 `K` 是 `u16`，最多表示 65535 个源块。于是一个流能描述的最大容器为：

```text
maximumPayload = 65535 × (frameBytes - 20)
```

项目还为 49 字节容器头、最长文件名和 MIME 类型预留空间，得到保守文件上限：

| 档位 | blockLen | 最大原始文件字节 |     约合 MiB |
| ---- | -------: | ---------------: | -----------: |
| 稳定 |     1445 |       94,566,956 |  约 90.2 MiB |
| 平衡 |     1680 |      109,967,681 | 约 104.9 MiB |
| 高速 |     2311 |      151,320,266 | 约 144.3 MiB |

这只是线协议和当前帧尺寸的容量上限，不代表适合用相机发送 144 MiB 文件。按照 100 KiB/s 的实际 goodput，144 MiB 需要约 25 分钟，期间任何移动、锁屏和对焦变化都会影响接收。

更大的 `frameBytes` 同时意味着：

- 单个 QR 更密，更难识别；
- `K` 更小，编码和 Pending Frame 数量下降；
- 同一个 u16 块编号空间能覆盖更大文件。

项目选择文件后会检查当前档位是否容得下。如果稳定档超过 65535 块，会建议切到更高档，而不是在接收端溢出。

## 接收端为什么要先裁剪再降采样

屏幕捕获常见是 16:9，但发送端二维码网格是居中的正方形。如果把整张 4K 画面缩到 1280 宽，左右大量空白会占掉像素预算。

当前实现先取视频帧中心正方形：

```text
sourceSize = min(videoWidth, videoHeight)
```

再缩放到配置的解码宽度。对 16:9 画面来说，这会去掉约 43.75% 注定没有二维码的左右区域，让相同解码宽度里的 QR module 更清晰。

默认选项为：

```text
解码宽度：1280，可选 960 / 1280 / 1920
捕获 FPS：60，可选 30 / 60
Worker：启动后按 CPU 自动选择 2 / 3 / 4
```

采集优先使用 `requestVideoFrameCallback()`，因为它跟随真正送到合成器的视频帧；旧浏览器回退到 `requestAnimationFrame()`。

## ZXing Worker 为什么分 Fast 和 Robust 两条路

`zxing-wasm` 底层是 ZXing-C++ 的 WebAssembly 绑定。通用扫码器通常默认尝试旋转、反色、降采样、降噪和更彻底搜索，适合偶尔扫描一张困难图片，却不适合每秒处理几十张动画帧。

One Transfer 的 Fast 路径只搜索 QR，并关闭：

```text
tryHarder
tryRotate
tryInvert
tryDownscale
tryDenoise
```

每帧最多返回 4 个 Symbol。

连续 10 次 Fast Miss 时，才稀疏执行一次 Robust 路径，临时打开困难搜索。如果识别成功，Miss 计数归零。

这相当于把大多数 CPU 用在“快速判断当前标准画面”，同时给旋转、反色和压缩严重的相机画面留一条恢复路径。

每个 Worker 有自己约 940 KB 的 ZXing WASM 实例。主线程使用 Transferable 把 `ImageData` buffer 转给 Worker，避免再复制一份像素。

当所有 Worker 都忙时，当前视频帧会直接丢弃，不进入等待队列。原因很简单：

```text
一张排队 200ms 的旧画面 < 发送端即将出现的新 Symbol
```

LT Code 能吸收丢帧，排队反而会增加延迟和重复识别。

## Worker 数量为什么不是越多越好

接收开始时会按 `navigator.hardwareConcurrency` 选择：

```text
8+ 逻辑线程 -> 4 Workers
6～7 逻辑线程 -> 3 Workers
其他 -> 2 Workers
```

每 500ms 更新统计。如果用户没有手动锁定 Worker 数，并且新的忙碌丢帧达到 5 次，池会自动增加一个 Worker，最多 4 个。

更多 Worker 能提高并行解码能力，但也会：

- 多占 WASM 和图像内存；
- 争抢 CPU；
- 在手机上增加发热和降频；
- 让主线程更频繁搬运帧。

如果“捕获 FPS 很高、有效码 FPS 很低、忙碌丢帧持续增加”，才说明解码能力是瓶颈。如果忙碌丢帧为 0，但一个 QR 都识别不到，增加 Worker 没用，问题在画面尺寸、对焦、曝光或二维码密度。

## 发送端怎样选择稳定、平衡和高速

页面会检测发送设备能够暴露的几项能力：

- `navigator.hardwareConcurrency`；
- `navigator.deviceMemory`，浏览器隐藏时不扣分；
- 用 22 次 `requestAnimationFrame` 时间戳中位数估算刷新率；
- 当前窗口短边；
- `devicePixelRatio`。

推荐逻辑如下：

| 档位 | 自动推荐条件                                                      |
| ---- | ----------------------------------------------------------------- |
| 高速 | 8+ 线程、内存未知或 ≥8 GiB、刷新率未知或 ≥55 Hz、物理短边 ≥1800px |
| 平衡 | 4+ 线程、内存未知或 ≥4 GiB、刷新率未知或 ≥45 Hz、物理短边 ≥1200px |
| 稳定 | 其他情况                                                          |

物理短边按下面计算：

```text
physicalShortEdge = CSS short edge × devicePixelRatio
```

这只是发送端建议。它看不到另一台手机的相机、远程桌面压缩、接收 CPU 和环境光，所以页面仍保留手动档位。

二维码真正生成后，发送端还会检查四格 QR 能否在当前窗口里以整数像素显示。放不下时会自动降档，避免 module 落在半像素上变灰。如果降档后的 blockLen 容不下当前文件，则不会偷偷破坏传输，而是保留能表达该文件的档位并提示调整画面。

## 不同设备之间应该怎样优化

自动推荐只能看发送电脑，真实链路至少有发送屏幕、采集方式、接收设备三个变量。下面按常见组合来讲。

### 电脑发送，电脑屏幕捕获接收

这是最稳定的组合，没有镜头、反光和摩尔纹。

建议从平衡档开始：

1. 发送窗口尽量完整显示四格二维码。
2. 接收端只共享二维码窗口，不要共享包含大量空白的整个 4K 桌面。
3. 解码宽度先用 1280，捕获 60 FPS。
4. 让 Worker 自动选择，不要一开始就手动拉到 4。
5. 如果有效码 FPS 已接近 120，再提高捕获 FPS没有意义。

高性能桌面、HiDPI 屏幕、窗口足够大时可以尝试高速档。切换后观察的是净带宽和有效码 FPS，不是发送页的 271 KiB/s 标签。

### 电脑发送，手机相机接收

这是变量最多的组合，建议先用稳定档。

优先顺序是：

1. 放大二维码网格，而不是先提高密度。
2. 保留四周 quiet zone，不要裁掉白边。
3. 手机与屏幕尽量平行，减少透视变形。
4. 避开反光，保持屏幕亮度稳定。
5. 等自动对焦稳定后再保持距离不动。
6. 识别稳定后再从稳定切到平衡。

如果相机能识别但重复帧很多，不一定是故障。相机 60 FPS 捕获稳定档 24 Tick/s，本来就会多次看到同一画面。真正应该关注的是每秒不重复 Symbol 和最终 goodput。

### 手机或平板作为发送端

移动端通常受可用画面短边、发热和浏览器内存限制，自动推荐大概率落在稳定档。

建议：

- 横屏显示，让四格二维码获得更大正方形区域；
- 关闭省电模式和自动锁屏，保持 Wake Lock；
- 不要因为设备标称高刷新率就强制高速，QR 生成也需要 CPU；
- 长时间传输注意 OLED 亮度限制和系统降频；
- 文件较大时优先换成电脑发送或剪贴板通道。

### 低性能电脑或旧手机作为接收端

接收瓶颈通常是像素处理和 WASM 解码。

可以按这个顺序调整：

1. 解码宽度从 1280 降到 960。
2. 捕获 FPS 从 60 降到 30，减少无效重复帧。
3. 先保持 2 个 Worker，观察忙碌丢帧。
4. 只有忙碌丢帧持续增长时再加 Worker。
5. 发送端切稳定档，让每个 QR module 更大。

降低解码宽度会减少每帧像素数和 WASM 工作量，但 QR 在 960 图像里过小时也会失去细节。所以不要脱离实际画面一味降到最低。

### 远程桌面、云电脑和视频压缩链路

RDP、VDI 或会议软件可能把黑白二维码当成高频纹理，进行缩放、色度处理、帧率限制和有损压缩。

这种场景建议：

- 使用稳定档的 1465 B、24 Tick/s；
- 不要让远程桌面再次缩放发送窗口；
- 保持二维码网格位于画面中心，因为接收端会裁中心正方形；
- 关闭“适应窗口”等非整数缩放；
- 优先直接捕获远程窗口，而不是拍摄显示器；
- 如果 10 秒没有任何有效帧，先降发送密度，不要先堆 Worker。

视频链路可能重复或丢弃整批四格 Symbol。LT Code 能把它们当作擦除，但无法恢复一个被压缩到无法识别的 QR。

### HiDPI 小窗口为什么也会自动降档

设备推荐使用 `CSS 像素 × DPR` 判断物理短边，所以 Retina 屏幕可能满足高速条件。但如果浏览器窗口很窄，四格 QR 仍然放不下。

因此项目还有第二道基于实际 QR module 和布局空间的检查。设备性能解决“算不算得动”，窗口尺寸解决“画不画得清”，两者缺一不可。

## 一套实用的调参判断法

### 情况一：完全没有有效码

先处理光学质量：

1. 确认捕获的是正确窗口。
2. 让四个 QR 完整进入中心画面。
3. 放大窗口并保留白边。
4. 发送端降到稳定档。
5. 相机模式改善对焦、角度、亮度和反光。

此时加 Worker 通常无效，因为 Worker 收到的是无法识别的图。

### 情况二：有有效码，但忙碌丢帧持续增加

说明接收 CPU 跟不上：

1. 让 Worker 自动扩容，或手动加 1 个。
2. 解码宽度从 1920 降到 1280/960。
3. 捕获 FPS 从 60 降到 30。
4. 发送端降档，减少 QR 密度。

### 情况三：识别率不错，但净带宽不高

查看“新帧/重复”：

- 重复很多：捕获 FPS 高于发送 Tick，或视频链路冻结/重复画面；
- 新帧正常但 K 很小：小文件的 LT overhead 本来就更高；
- solved blocks 前期增长慢：可能只是 Peeling 的后置级联，不要立即判断卡死；
- 容器很小但原文件很大：gzip 已经生效，最终耗时应按容器算。

### 情况四：高速档反而更慢

退回平衡档。如果 raw 带宽增加 37%，识别成功率却下降超过约 27%，高速档就已经没有收益。

## 发送和接收进度为什么不一样

发送端没有 ACK，不知道接收端什么时候完成。

发送进度只表示当前这一轮建议广播：

```text
targetSymbols = ceil(K × expectedOverhead(K) / 4) × 4
```

到 100% 后会开始下一轮，二维码继续播放。它不能证明接收端已经收到。

接收端进度才基于真实状态：

- 前 `K` 个不重复帧对应 0～86%；
- 预期冗余区间对应 86～96%；
- 超过预期后渐近到 99%；
- `solvedCount / K` 可以把进度推得更靠前；
- FNV、容器和 SHA-256 全部完成后才显示 100%。

这个设计避免 Peeling 前期长时间不动、最后突然跳满，也不会在完整性校验前提前宣告成功。

## 完整性和安全边界

One Transfer 有多层完整性检查：

| 层次       | 机制       | 作用                     |
| ---------- | ---------- | ------------------------ |
| 单个二维码 | QR ECC     | 修复一定范围的视觉误码   |
| 光学帧流   | LT Code    | 容忍丢帧、重复和乱序     |
| 容器集合   | FNV-1a     | 快速发现恢复结果错误     |
| 原始文件   | SHA-256    | 验证解压后的最终内容     |
| gzip       | 长度硬上限 | 防止异常压缩数据无限膨胀 |

但它不提供：

- 端到端加密；
- 发送者身份认证；
- 接收者授权；
- 防止旁观摄像头接收；
- 绕过组织安全策略或审计；
- 高带宽文件同步能力。

FNV 和 SHA-256 都随数据从同一条未认证通道到达，能验证一致性，不能证明“这个文件来自可信的人”。敏感内容应该先使用组织批准的工具加密，再交给 One Transfer。

## 第一次使用

源码要求 Node.js 24+ 和 pnpm 10：

```bash
git clone https://github.com/zhihui-hu/one-transfer.git
cd one-transfer
pnpm install
pnpm dev
```

本机打开终端给出的 HTTPS 地址。手机或局域网设备需要访问时运行：

```bash
pnpm dev:lan
```

### 先验证剪贴板通道

1. 打开 `/clipboard`。
2. 选择小文件、完整文件夹或工程目录。
3. 等待 Worker 完成 ZIP、gzip、SHA-256 和 Base91。
4. 点击复制，等待远程剪贴板同步完成。
5. 在 Windows 端下载 `one-transfer-restore.bat`，放到目标目录。
6. 双击脚本，等待长度与 SHA-256 校验通过。

第一次不要直接用大文件。先用几 KB 文本确认剪贴板、PowerShell、目标目录和字符完整性。

### 再验证同机屏幕捕获

1. 一个窗口打开 `/send`，选择小文件或文字。
2. 另一个窗口打开 `/receive`。
3. 点击“扫描电脑屏幕”。
4. 选择包含四格二维码的窗口。
5. 等待恢复和 SHA-256 校验。

这一步先排除摄像头、光线和距离，只验证协议、LT 编解码、QR 播放和 Worker。

### 最后测试手机相机

1. 电脑打开 `/send`，先选稳定档。
2. 手机通过 HTTPS 打开 `/receive`。
3. 点击“使用相机”，允许后置摄像头。
4. 让四格 QR 填满画面并保持平行、稳定。
5. 识别稳定后再尝试平衡档。

## 关键源码入口

继续读源码可以按下面顺序：

1. [`shared/clipboard-transfer.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/clipboard-transfer.ts)：V2、Base91、gzip 和 SHA-256。
2. [`shared/protocol.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/protocol.ts)：DCF2 容器、20 字节帧头和流身份。
3. [`shared/fountain.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/fountain.ts)：鲁棒孤子分布、确定性选块、LT Encoder/Decoder。
4. [`shared/send-settings.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/send-settings.ts)：三个发送档位和四码参数。
5. [`shared/device-profile.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/device-profile.ts)：设备能力与自动推荐。
6. [`shared/throughput.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/throughput.ts)：raw/net 光学吞吐模型。
7. [`send/main.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/send/main.ts)：四码生成、Lookahead Queue 和播放调度。
8. [`receive/main.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/receive/main.ts)：媒体捕获、裁剪、Worker 池、进度与最终恢复。
9. [`receive/worker.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/receive/worker.ts)：ZXing WASM Fast/Robust 双路径。
10. [`shared/progress.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/progress.ts)：K 相关喷泉冗余和 ETA。

## 结语

One Transfer 的核心不是“把二维码切得更快”，而是把两条原本不适合文件的数据通道，做成有协议、有容量模型、有纠删恢复和最终校验的传输链路。

剪贴板通道靠 gzip 和 Base91 降低文本体积；光学通道靠四码并行提高 raw 带宽，再用 LT Code 把丢帧变成时间损失，而不是内容损坏。

真正优化时也不能只盯着发送端的 271 KiB/s。二维码够不够大、摄像头能不能稳定识别、接收端 Worker 是否忙碌、喷泉码需要多少冗余，最后都会落到同一个指标：每秒恢复了多少不重复的有效载荷。

如果已经有对象存储、内网共享目录或企业文件交换系统，应该优先使用正常通道。One Transfer 的价值，恰恰在于正常文件通道不存在，但还剩下文本或可见屏幕的地方。

## 参考文章

- [One Transfer GitHub](https://github.com/zhihui-hu/one-transfer)
- [LT Codes - Michael Luby, FOCS 2002](https://www.mit.edu/~6.454/www_fall_2003/khisti/luby02lit.pdf)
- [ZXing-C++](https://github.com/zxing-cpp/zxing-cpp)
- [HTMLVideoElement.requestVideoFrameCallback - MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback)
- [MediaDevices.getDisplayMedia - MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
