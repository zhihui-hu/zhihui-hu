---
title: 云电脑里不能直接传文件，我写了一个用剪贴板和二维码传输的 One Transfer
slug: one-transfer-restricted-environment-file-transfer
publishedAt: 2026-08-21T10:00
updatedAt: 2026-08-21T10:00
summary: 在受限云电脑、VDI 和临时隔离环境里，文件不能直接上传下载时怎么办？我写了 One Transfer，用剪贴板文本和屏幕二维码两条通道，在浏览器本地完成文件、目录和文本传输。
keywords:
  - One Transfer
  - 云电脑文件传输
  - VDI 文件传输
  - 剪贴板传文件
  - 动画二维码
  - LT Fountain Code
  - 本地优先
  - 开源工具
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

这种环境通常不是网络断了，而是文件通道被限制了。你可以把一段文字复制进远端，却没办法把一个文件对象直接拖进去；远端屏幕可以被手机或另一台设备看到，但没有一个稳定的回传接口。

所以我顺手写了一个 [One Transfer](https://github.com/zhihui-hu/one-transfer)。

它不是网盘，也不是一个把文件偷偷上传到服务器的中转站，而是针对受限环境做的一个双通道传输工具：

- 有文本通道时，把文件编码成可以复制的文本，再在 Windows 端恢复；
- 只有屏幕和摄像头时，把文件或文本编码成连续播放的动画二维码，再由另一端扫描或捕获。

整个过程在参与传输的浏览器本地完成，业务文件不会上传到应用服务器。

## 我想解决的不是“怎么上传”，而是“没有文件通道怎么办”

普通文件传输默认依赖的是网络、文件系统或远程桌面协议：

```text
本地文件 -> 网络上传 -> 远端文件
```

但在受限云电脑里，这条链路可能被直接拿掉。我们还能使用的，往往只剩下几种基础能力：

1. 浏览器能读取本地文件。
2. 剪贴板可以传递文本。
3. 一个屏幕可以显示内容。
4. 另一台设备可以用摄像头或屏幕捕获观察内容。

这几个能力单独看都不能直接传文件。剪贴板只能传文本，屏幕和摄像头之间又没有可靠的确认和重传机制。

One Transfer 做的事情，就是把文件传输拆成两个问题：

```text
文件如何适配文本通道？
屏幕单向播放丢帧时，如何恢复完整内容？
```

前一个问题用版本化 Base64 文本协议解决，后一个问题用容错的数据容器、LT 喷泉码和动画二维码解决。

## One Transfer 现在有两条传输通道

项目主页：[zhihui-hu/one-transfer](https://github.com/zhihui-hu/one-transfer)

打开应用后，主要会用到三个入口：

| 路由          | 用途                                        |
| ------------- | ------------------------------------------- |
| `#/clipboard` | 把文件编码成剪贴板文本，交给 Windows 端恢复 |
| `#/send`      | 把文件或文本播放成动画二维码                |
| `#/receive`   | 通过屏幕捕获或摄像头接收动画二维码          |

如果当前环境允许剪贴板同步，优先使用 `#/clipboard`。如果没有可靠的文件或剪贴板通道，但屏幕可以被手机或另一台设备看到，就使用 `#/send` 和 `#/receive`。

## 通道一：把文件变成可以复制的文本

### 为什么需要自定义格式

文字可以跨越很多受限边界，但文件不是文字。直接把文件转成一大段 Base64 还不够，因为接收端还需要知道：

- 这是普通文件还是目录；
- 原始文件名是什么；
- Base64 内容从哪里开始、到哪里结束；
- 接收到的文本是不是完整的；
- 能不能安全地在 Windows 上创建目标文件。

所以 One Transfer 定义了一条带版本号的文本记录：

```text
ONE_TRANSFER_V1|<itemType>|<base64(UTF-8 name)>|<base64(payload)>
```

其中：

- `ONE_TRANSFER_V1` 是协议标识和版本号；
- `itemType` 用来区分 `file` 和 `directory`；
- 文件名使用 UTF-8 后再 Base64 编码，避免中文文件名在文本通道中出问题；
- 文件内容编码成 Base64，目录则先打包成 ZIP 再编码。

### 实际使用流程

在发送端打开 `#/clipboard`，选择要传输的文件。浏览器会在本地读取文件字节，生成完整的 `ONE_TRANSFER_V1` 文本，然后复制到剪贴板。

这里不会把完整 Base64 内容渲染到页面上，避免页面额外持有一份可见的大文本。现代 Clipboard API 不可用时，项目还保留了临时文本区域的兼容复制路径。

接收端是 Windows 电脑时，可以从页面下载 `restore-base64.bat`。把脚本放在目标目录下，运行它以后，脚本会：

1. 使用 PowerShell 的 `Get-Clipboard -Raw` 读取剪贴板全文。
2. 检查协议头、字段数量和项目类型。
3. 解码文件名和文件内容。
4. 检查 Windows 文件名是否合法。
5. 拒绝覆盖已有文件。
6. 普通文件直接恢复，目录则解压到临时路径后再写入。
7. 输出 MD5，方便人工做一次结果对比。

整个流程可以简单理解成：

```text
发送端浏览器读取文件
  -> 生成 ONE_TRANSFER_V1 文本
  -> 复制到剪贴板
  -> Windows 剪贴板同步
  -> restore-base64.bat 校验并恢复文件
```

### Base64 不是没有代价

Base64 大约会增加三分之一的体积：

```text
Base64 长度 = 4 × ceil(原始字节数 / 3)
```

所以这个通道适合中小文件。实际限制不由 One Transfer 单独决定，而是由浏览器、远程剪贴板实现和所在环境的文本容量共同决定。

如果传输的是目录，需要先把目录打包成 ZIP，再沿用同一套 `ONE_TRANSFER_V1` 协议。配套工作区里提供了目录准备脚本，但它不属于浏览器 SPA 的构建产物。目录不会被当成一堆互不相关的文件发送。

## 剪贴板是怎么复制和写入的

剪贴板通道看起来比较简单，实际上需要同时处理浏览器权限、二进制数据、中文文件名和旧浏览器兼容。

发送端的核心过程可以简化成下面这样：

```js
const file = input.files[0];
const bytes = new Uint8Array(await file.arrayBuffer());
const encodedName = bytesToBase64(new TextEncoder().encode(file.name));
const encodedPayload = bytesToBase64(bytes);

const transferText = [
  'ONE_TRANSFER_V1',
  'file',
  encodedName,
  encodedPayload,
].join('|');

await navigator.clipboard.writeText(transferText);
```

仓库里的实现没有直接使用一个超大的参数调用 `String.fromCharCode`，而是把字节切成固定大小的块后再转 Base64。这样做是为了避免一次性展开过大的参数列表，降低大文件在浏览器中触发调用栈或内存问题的概率。

项目实际的复制函数优先使用现代 Clipboard API：

```js
async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  textarea.remove();

  if (!copied) {
    throw new Error('浏览器未允许写入剪贴板');
  }
}
```

这里有一个容易忽略的点：写入剪贴板通常必须发生在用户点击等明确的交互链路中。项目不是在文件选择完成以后自动静默写入，而是先读取文件、准备好 payload，再由用户点击“复制到剪贴板”按钮完成写入。

### Windows 端如何读取和写入文件

`restore-base64.bat` 本身只是一个入口，真正的解析工作交给 Windows PowerShell。核心逻辑大致如下：

```powershell
$content = Get-Clipboard -Raw
$parts = $content.Trim() -split '\|', 4

if ($parts.Count -ne 4 -or $parts[0] -ne 'ONE_TRANSFER_V1') {
  throw '剪贴板内容不是文件传输数据。'
}

$itemType = $parts[1]
$name = [Text.Encoding]::UTF8.GetString(
  [Convert]::FromBase64String($parts[2])
)
$bytes = [Convert]::FromBase64String($parts[3] -replace '\s', '')

[IO.File]::WriteAllBytes($target, $bytes)
```

实际脚本还会额外检查 Windows 保留名称、非法字符、路径穿越、已有目标文件和内容类型。它不会把剪贴板文本当成命令执行，剪贴板只会被当成协议数据解析。

普通文件直接通过 `[IO.File]::WriteAllBytes` 写入；目录类型则先把 payload 写入随机临时 ZIP，再用 `Expand-Archive` 解压到临时目录，确认目录结构以后再移动到目标位置。目标文件已经存在时，脚本会拒绝覆盖。

脚本最后会计算并显示恢复数据的 MD5。这里的 MD5 主要是给人工做传输结果对照，不是认证机制，也不能代替加密。

## 通道二：把文件播放成动画二维码

剪贴板通道解决的是“文件可以变成文本”的问题，但还有一类环境连剪贴板同步都不可靠：屏幕能看见，摄像头能拍到，却没有一条稳定的双向数据链路。

这时 One Transfer 使用动画二维码。

### 为什么不能只是不断切换二维码

最简单的想法是把一个文件切成很多段，每一段生成一个二维码，然后按顺序播放：

```text
第 1 段 -> 第 2 段 -> 第 3 段 -> 第 4 段 -> ...
```

但摄像头不可能每一帧都识别成功。屏幕刷新、自动对焦、曝光、距离、反光、摩尔纹都会造成丢帧。如果每一段都必须成功接收，还需要另一条通道告诉发送端“第 17 段丢了，请重发”。而屏幕到摄像头的场景通常没有这样的回传通道。

所以 One Transfer 没有把传输设计成固定顺序的分片确认，而是采用 LT 喷泉码：

1. 先把文件或文本打包成统一容器。
2. 把容器切成若干源数据块。
3. 每一个序列号生成一个确定的数据块组合。
4. 对选中的源数据块做异或，得到一个新的编码块。
5. 编码块持续生成并播放，不要求接收端从第一帧开始。
6. 接收端收集足够多的不同帧后，通过剥离解码恢复源数据块。

这样，丢掉几帧不会让整个传输失败。接收端中途加入也可以，只要后面收集到足够的不同帧即可。

### 文件和文本使用同一套容器

One Transfer 没有为“传文件”和“传文字”维护两套完全不同的协议。文件字节和 UTF-8 文本都会先进入统一容器，容器中包含：

- 魔数和版本信息；
- 是否压缩；
- 文件名和类型；
- 原始长度和传输长度；
- 原始内容的 SHA-256；
- 最终的文件或文本字节。

对于文件，接收完成后展示下载；对于文本，接收完成后提供复制结果。

文件大小目前限制在 64 MiB，文本限制在 4 MiB。这个限制并不是为了追求理论上的最大值，而是考虑到浏览器内存、二维码识别速度和本地恢复过程后的实际使用边界。

### 接收端不是“扫到一帧就算成功”

接收端使用屏幕捕获或摄像头获取画面，再交给 Web Worker 中的 ZXing WASM 解码。解出的编码帧会先进入恢复器，完成源数据块剥离后，还要继续经过完整性检查：

```text
二维码解码
  -> LT 数据块恢复
  -> FNV-1a 快速检查
  -> 解析容器并检查长度
  -> 必要时解压
  -> SHA-256 校验原始内容
  -> 显示下载或复制按钮
```

只有全部检查通过以后，页面才会暴露最终文件或文本。也就是说，进度条到 100% 并不代表可以直接使用，最终校验才是完成条件。

如果画面识别不稳定，可以降低二维码密度和播放帧率。默认设置并不适合所有屏幕和摄像头，二维码越密、帧率越高，不一定就越快；识别成功率下降以后，整体有效吞吐反而会变低。

## 二维码到底是怎么生成的

前面说的是传输算法，接下来把它落到浏览器渲染流程里。

### 1. 先把文件装进光学容器

发送端选择文件以后，不会马上把文件切成二维码。首先会执行 `packFile`：

1. 检查空文件和 64 MiB 大小上限。
2. 把文件名和 MIME 类型编码成 UTF-8。
3. 计算原始字节的 SHA-256。
4. 对适合压缩的文件尝试 gzip。
5. 只有压缩结果至少节省一定空间时才使用 gzip。
6. 把魔数、压缩方式、文件名长度、类型长度、原始长度、传输长度、SHA-256 和 payload 写入容器。

容器头部是固定的 49 字节，文件名和 MIME 类型紧跟在头部后面。这样接收端不需要预先知道发送的到底是图片、压缩包还是文本，恢复后可以根据容器里的类型决定显示下载按钮还是复制按钮。

预压缩格式通常不会重复 gzip，例如 JPEG、MP4、ZIP、Office Open XML 等。因为对这类文件再次压缩通常收益很小，却要多占一份内存并完整扫描一次文件。

### 2. LT 编码生成可以丢帧的 payload

容器准备完成后，发送端根据当前每帧字节数计算源数据块数量 `K`，再创建 `LTEncoder`：

```text
blockLength = 每帧容量 - 20 字节帧头
K = ceil(container.length / blockLength)
```

每一个序列号 `seq` 都会通过确定性的伪随机算法生成一组源块索引，然后把这些源块逐字节异或，得到当前帧的编码块。

```text
seq = 0 -> 源块 0 XOR 源块 4
seq = 1 -> 源块 2
seq = 2 -> 源块 1 XOR 源块 3 XOR 源块 8
...
```

发送端和接收端不需要互相传递“这一帧由哪些源块组成”。只要双方拥有相同的 `sessionId`、`seq`、`K` 和分布参数，就能独立算出相同的索引集合。

### 3. 帧头如何让接收端自描述

每一个二维码里放的不是裸 payload，而是一段完整的二进制 frame：

| 偏移 | 长度 | 字段          | 作用                       |
| ---- | ---: | ------------- | -------------------------- |
| 0    |    1 | magic `0xD1`  | 判断是不是 One Transfer 帧 |
| 1    |    1 | magic `0x0C`  | 配合第一字段确认协议       |
| 2    |    2 | `sessionId`   | 标识一次发送会话           |
| 4    |    4 | `seq`         | 驱动 LT 编码的序列号       |
| 8    |    2 | `K`           | 源数据块总数               |
| 10   |    2 | `blockLen`    | 每个编码块的长度           |
| 12   |    4 | `totalLen`    | 完整容器长度               |
| 16   |    4 | `payloadFnv`  | 完整容器的 FNV-1a 快速校验 |
| 20   | 可变 | encoded block | 当前帧的异或结果           |

因此接收端即使从第 300 帧才开始识别，也能从帧头知道如何初始化解码器，不需要先拿到第 1 帧，也不需要发送端停下来等待握手。

### 4. 把二进制帧交给二维码库

仓库使用 `qrcode` 库的低层 `QRCode.create`，并指定 Byte 模式，把完整二进制帧直接编码进去：

```js
const bytes = packFrame(header, encoder.encode(seq));

const qr = QRCode.create([{ data: bytes, mode: 'byte' }], {
  errorCorrectionLevel: ecc,
  version,
  maskPattern: 4,
});
```

第一次生成时不固定 QR version，让库根据 payload 自动选择版本；拿到第一帧的版本和 module 数量以后，后续帧固定使用同一个版本，保证画面尺寸稳定。

二维码矩阵生成后，项目没有每一帧都调用高层 DOM 绘制，而是做了自己的栅格化：

1. 给二维码四周加 quiet zone，默认 margin 是 4 个 module。
2. 把黑白 module 写入一个很小的 staging canvas。
3. 再放大绘制到最终 canvas。
4. 关闭 `imageSmoothingEnabled`，避免黑白边界被插值成灰色。
5. 使用 `requestAnimationFrame` 按目标 FPS 播放。

发送端还维护一个很小的 lookahead 队列，提前生成几帧，避免真正显示时才同步计算 QR、导致画面停顿。每次只补充有限帧，防止生成队列无限占用内存。

### 5. 为什么固定 mask，又为什么不追求最高帧率

二维码库通常会尝试多个 mask，寻找评分更好的图案。One Transfer 把 mask 固定为一个确定值，减少每帧生成成本；因为光学链路有 LT 层容错，二维码帧本身只要能被完整识别即可。

发送端显示的是一张不断变化的黑白图。屏幕刷新和摄像头曝光如果撞在帧切换中间，接收端可能拍到半张旧二维码和半张新二维码。所以每帧需要在屏幕上停留足够的刷新周期，实际使用中降低帧率往往比盲目提高帧率更有效。

## 二维码是怎么被识别和恢复的

接收端支持两种来源：屏幕捕获和摄像头。

### 1. 获取视频流

扫描电脑屏幕使用 `navigator.mediaDevices.getDisplayMedia`，手机或外部摄像头使用 `getUserMedia`：

```js
const stream = await navigator.mediaDevices.getDisplayMedia({
  audio: false,
  video: { frameRate: { ideal: captureFps } },
});
```

相机模式会优先请求后置摄像头和指定尺寸。如果设备不接受精确帧率，项目会退回到 `ideal` 帧率，避免因为某个摄像头不支持固定值而完全无法启动。

这两个 API 要求安全上下文。也就是说，生产环境应该通过 HTTPS 打开；本地开发也不能简单地用 `file://` 双击 HTML 文件。

### 2. 从 video 画面提取 ImageData

接收端不会把 4K 桌面画面原尺寸直接丢给二维码解码器，而是先画到一个临时 canvas，按配置的最大宽度降采样：

```js
const scale = Math.min(1, maxWidth / video.videoWidth);
const width = Math.round(video.videoWidth * scale);
const height = Math.round(video.videoHeight * scale);

grab.width = width;
grab.height = height;
context.drawImage(video, 0, 0, width, height);
const image = context.getImageData(0, 0, width, height);
```

帧采集优先使用 `requestVideoFrameCallback`，不支持时回退到 `requestAnimationFrame`。当所有解码 Worker 都在处理上一帧时，当前帧会直接丢弃。因为发送端会持续播放新的编码帧，丢掉一张截图不会破坏整个传输。

### 3. Worker 中用 zxing-wasm 识别 QR

每个 Worker 接收一份 `ImageData` 的 `ArrayBuffer`，调用 `zxing-wasm` 只识别 QR Code：

```js
const image = new ImageData(new Uint8ClampedArray(buf), width, height);

const results = await readBarcodes(image, {
  formats: ['QRCode'],
  maxNumberOfSymbols: 1,
});

const result = results.find((item) => item.isValid && item.bytes.length > 0);
postMessage({ id, bytes: result?.bytes ?? null });
```

二维码识别属于比较重的图像计算，放到 Web Worker 可以避免主线程在扫描时卡住 UI。主线程只负责视频采集、Worker 调度和接收结果；图片 buffer 使用 transferable 转移，减少复制成本。

### 4. 从帧头判断是否属于同一次传输

Worker 返回二进制结果后，主线程先执行 `parseFrame`：

- 长度必须大于 20 字节；
- 前两个字节必须是 `0xD1`、`0x0C`；
- `K`、`blockLen`、`totalLen` 不能为 0；
- 实际 payload 长度必须等于帧头声明的 `blockLen`。

然后通过下面这些字段生成流身份：

```text
sessionId : K : blockLen : totalLen : payloadFnv
```

`seq` 不参与流身份，因为它本来就应该随帧变化。如果新的帧和当前解码器身份不一致，接收端会重新创建 `LTDecoder`，避免把两个不同文件的帧混在一起。

发送端是无限循环播放的。文件恢复完成以后，接收端会记住已经完成的 stream identity，继续看到同一条动画时不会重复下载；只有新的传输身份出现，才开始下一次恢复。

### 5. LT 剥离解码和最终校验

接收端拿到一帧以后，会根据 `sessionId + seq` 重新计算它涉及的源数据块：

```text
收到一帧
  -> 根据 seq 算出源块集合
  -> 消除已经恢复的源块
  -> 如果只剩一个未知块，立即得到它
  -> 把新恢复的块继续传播给等待中的帧
```

这就是 peeling decoder。所有 `K` 个源块恢复以后，先拼成完整容器，再检查 FNV-1a。FNV 通过以后，才解析文件头、检查长度、限制 gzip 解压输出，最后重新计算原始内容的 SHA-256。

所以二维码被识别出来，不等于文件已经可信地恢复；二维码识别、纠删恢复、容器解析和 SHA-256 校验是四个不同阶段。

## 这里最难的几个技术点

### 1. 单向通道没有 ACK，不能照搬普通分片上传

普通分片上传可以依赖请求响应：第 3 片失败就重传第 3 片。但屏幕到摄像头没有可靠的 ACK，发送端不知道接收端有没有看到某一帧。

LT 喷泉码把“重传某个编号”变成“持续生成新的线性组合”。接收端只要收集足够多的不同组合，就能解出原始块。这样才适合单向可见光通道。

### 2. 发送端和接收端必须做到跨 JavaScript 引擎确定性一致

发送端可能运行在 Chromium，接收端可能运行在 iPhone 的 JavaScriptCore。如果双方用 `Math.log` 计算 robust soliton distribution，浮点结果出现一个 ULP 的差异，就可能导致某个 CDF 边界变化，最后选出不同的 degree，整条数据流都无法解码。

所以项目在 fountain code 中实现了基于明确 IEEE-754 运算的确定性对数 `dlog`，并用 golden vector 测试固定输出。这里看起来只是一个数学函数，实际上它属于协议的一部分，不能随便换回 `Math.log`。

### 3. 二维码越密，不一定传得越快

二维码容量、屏幕显示尺寸、摄像头分辨率、曝光和解码速度之间存在取舍：

- 每帧字节数越大，理论吞吐越高；
- 但 QR version 越高，单个 module 越小，识别难度越大；
- 帧率越高，单位时间发送的帧越多；
- 但屏幕切换和摄像头曝光越容易重叠，实际成功率反而下降。

项目把每帧字节数、发送 FPS、捕获宽度、捕获 FPS 和 Worker 数量都做成了可调参数。应该以实际识别成功率计算 goodput，而不是只看发送端标出的理论 FPS。

### 4. 页面生命周期会产生“僵尸采集循环”

用户从接收页面切走以后，旧的 `requestVideoFrameCallback` 可能仍然回调；旧 Worker 也可能在稍后返回一帧。如果不处理，下一次进入接收页面时，旧帧可能污染新的 decoder，摄像头和定时器也可能一直占用。

项目使用 generation counter 让旧回调失效，路由离开时停止 MediaStream tracks、暂停 video、销毁 Worker、清除定时器，并释放上一次结果的 Blob URL。

### 5. 进度条不能只显示已解出的块数量

LT 解码存在后置级联：前面收到了很多帧，但可能暂时只解出少量源块；某一次新帧到达后，会触发一串 peeling cascade，进度突然跳很大。

如果进度条只用 `solvedCount / K`，用户会看到前面长时间不动，最后突然到 100%。项目会综合新帧数量、估计的 fountain overhead 和已解出的块计算进度，并且在最终完整性校验前不会把结果当成完成。

## 第一次使用：从安装到完成一次传输

下面按第一次使用的顺序走一遍。建议先在普通网络环境中完成一次本机测试，再放到受限云电脑里使用。

### 第一步：准备环境

源码运行需要：

- Node.js 24 或更高版本；
- pnpm 10；
- 支持 WebAssembly、Web Worker 和 Media Capture 的现代浏览器；
- 如果使用剪贴板接收，Windows 端需要 PowerShell 和 `Get-Clipboard`。

克隆并启动开发环境：

```bash
git clone https://github.com/zhihui-hu/one-transfer.git
cd one-transfer
pnpm install
pnpm dev
```

打开终端打印的 HTTPS 地址。README 当前的本地地址通常是 `https://127.0.0.1:5173`，但以终端实际输出为准。第一次打开时，浏览器可能会提示本地开发证书不受信任，需要在测试环境中手动继续访问。

如果要让手机访问电脑上的发送页面：

```bash
pnpm dev:lan
```

然后用手机访问终端打印的局域网 HTTPS 地址。手机和电脑需要在同一个局域网，且手机要能够接受该开发证书；如果手机不信任证书，摄像头和屏幕相关 API 也可能无法正常使用。

### 第二步：先测试剪贴板文件传输

这是最容易验证的一条链路。

1. 在发送端打开 `#/clipboard`。
2. 选择一个小文件，例如一张图片或一个文本文件。
3. 等待页面显示“已准备”。
4. 点击“复制文件数据到剪贴板”。
5. 确认远程环境或 Windows 端确实同步了完整剪贴板文本。
6. 下载页面提供的 `restore-base64.bat`，放到目标目录。
7. 双击运行脚本。
8. 脚本从剪贴板读取协议并把文件写入脚本所在目录。
9. 检查文件名、文件大小，并根据显示的 MD5 做人工核对。

第一次建议不要直接传大文件。先用几 KB 的文件确认权限、剪贴板同步、PowerShell 和目标目录都没有问题，再逐渐增加文件大小。

如果只是 Mac 到 Windows 的普通文件传递，剪贴板通道通常比动画二维码更省时间；如果需要传目录，先压缩成 ZIP，或者使用配套工作区的目录准备脚本生成 `directory` 类型 payload。

### 第三步：测试同一台电脑的屏幕捕获

如果想先验证二维码链路，不需要两台电脑。可以在同一台电脑打开两个浏览器窗口：

1. 第一个窗口打开 `#/send`。
2. 选择“发送文件”或“发送文字”。
3. 选择一个小文件，等待动画二维码出现。
4. 第二个窗口打开 `#/receive`。
5. 点击“扫描电脑屏幕”。
6. 在浏览器权限弹窗中选择显示发送二维码的窗口或屏幕。
7. 等待接收端识别、恢复和 SHA-256 校验。
8. 文件会出现“保存文件”按钮，文字会出现可复制结果。

同屏测试的价值是把“摄像头、距离、光线”变量先排除，只验证协议、二维码播放和屏幕捕获。确认同屏成功以后，再用手机摄像头接收。

### 第四步：使用手机摄像头接收

1. 电脑打开 `#/send` 并选择文件。
2. 调整浏览器窗口，让二维码尽量占据较大的显示区域。
3. 手机打开同一个 One Transfer 部署地址的 `#/receive`。
4. 点击“使用相机”，允许浏览器访问后置摄像头。
5. 让二维码填满画面，但不要裁掉四周的白色 quiet zone。
6. 保持手机和屏幕稳定，等待接收完成。

如果没有识别到任何帧，先把发送端每帧字节数降到 1465，再把发送帧率降到 24 FPS。二维码太小、屏幕亮度不足、摄像头自动对焦或反光，都会造成“相机打开了但一直没有进度”。

### 第五步：生产部署和离线使用

生产构建和完整检查：

```bash
pnpm build
pnpm check
```

项目是静态 SPA，可以部署到 Cloudflare Pages、GitHub Pages 或其他静态托管服务。Cloudflare Pages 的基本配置是：

```text
Framework preset: Vite
Build command: pnpm build
Build output directory: dist
Node.js: 24 或更高
```

如果要在严格隔离环境里离线使用，必须提前打开一次生产地址，让 SPA、Worker、ZXing WASM 和恢复脚本完成缓存。不能进入隔离环境后才第一次访问，因为那时应用资源本身也可能无法下载。

## 常见问题和排查顺序

### 1. 点击复制以后提示写入剪贴板失败

先检查：

1. 是否通过 HTTPS 打开页面，而不是 `file://`。
2. 是否在用户点击按钮的交互链路中触发复制。
3. 浏览器是否禁止当前站点写入剪贴板。
4. 远程浏览器是否根本没有把 Clipboard API 暴露出来。
5. 是否是超大的 payload 导致浏览器或远程剪贴板拒绝。

页面会尝试使用隐藏 `textarea` 加 `execCommand('copy')` 回退，但这个旧 API 也会受到浏览器权限和用户手势限制。复制失败时，不要手动复制页面里的一部分 Base64，必须重新点击完整复制按钮。

### 2. Windows 脚本提示剪贴板为空或格式错误

常见原因有：

- 发送端没有真正点击复制；
- 远程桌面剪贴板同步还没有完成；
- 只复制了部分文本；
- 中间软件修改了换行或截断了文本；
- 剪贴板里残留的是普通文本，不是 `ONE_TRANSFER_V1` 记录。

回到发送端重新选择文件并点击复制，等待状态变成已复制以后再运行脚本。脚本使用 `Get-Clipboard -Raw`，会按最多四段拆分协议；payload 中的空白会被去掉，但协议头和字段不能缺失。

### 3. Windows 提示文件名无法使用

脚本会拒绝路径分隔符、控制字符、Windows 保留名称 `CON`、`PRN`、`AUX`、`NUL`、`COM1`、`LPT1` 等，也会拒绝以空格或句点结尾的名称。

先在发送端把文件改成普通的 Windows 文件名，再重新生成传输数据。脚本还会拒绝覆盖目标目录中已经存在的同名文件，需要先移动旧文件或更换目标目录。

### 4. 扫描屏幕一直没有二维码

按照这个顺序排查：

1. 确认发送端确实在播放动态二维码，而不是停在文件选择状态。
2. 确认接收端共享的是正确的窗口或屏幕。
3. 放大二维码，保留四周白边，不要让浏览器 UI 遮挡。
4. 提高屏幕亮度，减少反光和摩尔纹。
5. 将发送端每帧字节数降到 1465。
6. 将发送帧率降到 24 FPS。
7. 接收端降低捕获宽度或调整 Worker 数量。
8. 确认浏览器运行在 HTTPS 安全上下文。

如果接收端 10 秒内一个有效帧都没有识别到，页面会给出类似提示。这里真正需要优先调整的往往是发送端密度和帧率，而不是一味增加接收端 Worker。

### 5. 相机能打开，但二维码很难识别

让二维码尽量填满相机画面，同时保持完整的 quiet zone。不要让摄像头离屏幕太远，也不要把二维码缩到一个小角落。

如果屏幕刷新和摄像头曝光不同步，可以降低发送帧率；如果是手机自动对焦不稳定，可以先固定手机位置和距离，等画面清晰后再开始接收。二维码越大不一定越慢，实际需要找到“单帧识别成功率”和“每帧数据量”的平衡点。

### 6. 进度接近 100%，最后却提示校验失败

这通常不是二维码库“差最后一点”，而是接收端收到的帧不属于同一条流，或者中途发送端重新开始后混入了旧帧。处理方式是：

1. 停止并重新开始发送端。
2. 重新打开或重启接收端扫描。
3. 确认发送端没有同时播放两个窗口。
4. 降低帧率，避免画面切换时捕获到过渡帧。

项目会用 `sessionId`、源块数量、块长度、容器总长度和 FNV-1a 组合成 stream identity，尽量隔离不同传输。但如果已经混入了错误数据，最终 FNV 或 SHA-256 校验失败仍然是正确结果，不能为了显示成功而跳过校验。

### 7. 报告文件超过限制或单次传输上限

光学文件目前限制 64 MiB，文字限制 4 MiB。除此之外，当前 QR version 和每帧字节数还会共同决定一次传输能容纳多少源块。

如果页面提示需要提高每帧字节数，优先按提示调整；如果调整以后二维码难以识别，再退回较小帧尺寸并接受更长的传输时间。大文件更适合使用正常的文件交换系统，One Transfer 的光学通道主要是解决“没有正常文件通道”的场景。

### 8. 页面离开以后摄像头还在工作

正常情况下，接收路由卸载时会停止视频 tracks、清理 Worker 和定时器。如果浏览器仍然显示摄像头指示灯，可以先回到接收页点击停止或刷新页面，再检查浏览器的站点权限。

如果是二次开发，注意不要只移除 video 元素，还要主动调用 `MediaStreamTrack.stop()`，并让已经排队的 `requestVideoFrameCallback` 通过 generation counter 失效。

## 为什么所有数据都在本地处理

这个项目的一个重要取舍是：不把传输内容上传到应用服务器。

浏览器本地完成文件读取、容器组装、压缩、哈希、Base64 编码、二维码播放和接收后的恢复。应用本身可以作为静态 SPA 部署，生产环境的 PWA 还会缓存页面、Worker、WASM 解码器和 Windows 恢复脚本。

这带来几个直接结果：

- 不需要额外部署上传 API、对象存储和中转服务；
- 传输内容不会因为使用工具而经过项目服务器；
- 在已经缓存完成的环境里，可以继续离线使用；
- 但两端浏览器仍然会在本地暂时持有原始文件、编码文本或恢复结果。

这里的“本地处理”不是“绝对不会被环境看到”。操作系统、远程桌面软件、浏览器策略和企业审计工具仍然可能记录剪贴板或屏幕行为。

## 这个项目不是什么

文件传输工具很容易被误解成“安全通道”，但 One Transfer 的边界需要单独说清楚。

它不提供：

- 文件加密；
- 发送者身份认证；
- 接收者授权；
- 防止剪贴板内容被读取的能力；
- 防止二维码被旁观摄像头接收的能力；
- 绕过组织网络策略、终端审计或文件检查的能力；
- 高带宽文件交换系统的能力。

Base64 和二维码里都包含原始信息，任何能读取剪贴板或看到二维码的人，都可能拿到传输内容。SHA-256 只能确认内容是否一致，不能证明内容来自某个可信发送者。

如果文件本身敏感，应该先使用组织认可的加密工具加密，再用 One Transfer 传输。One Transfer 解决的是“现有允许通道里没有文件对象”的工程问题，不应该被当成安全策略的替代品。

## 现在能做什么

目前 One Transfer 主要覆盖下面这些事情：

- 把单个文件编码成 `ONE_TRANSFER_V1` 剪贴板文本。
- 恢复文件名、文件类型和原始字节。
- 支持目录打包成 ZIP 后传输。
- 通过 Windows PowerShell 读取剪贴板并恢复文件。
- 把文件或文本编码成动画二维码。
- 通过摄像头或屏幕捕获接收二维码帧。
- 使用 LT 喷泉码容忍丢帧、重复帧和乱序帧。
- 使用 Web Worker 和 ZXing WASM 解码，避免阻塞页面主线程。
- 在恢复前检查长度、容器结构、压缩边界和 SHA-256。
- 支持离线缓存页面、Worker、WASM 和 Windows 恢复脚本。
- 在离开接收页面时关闭摄像头、屏幕捕获、Worker 和计时器。

项目的核心不是“再做一个文件分享网站”，而是把剪贴板和可见光这两种本来不适合传文件的通道，包装成一条有格式、有校验、有恢复能力的传输链路。

## 关键源码入口

如果想继续往源码里看，可以按下面的顺序阅读：

1. [`send/main.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/send/main.ts)：选择文件、生成 LT 帧、创建 QR、播放和调整发送参数。
2. [`receive/main.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/receive/main.ts)：获取屏幕或摄像头、采集视频帧、调度 Worker、恢复和校验结果。
3. [`receive/worker.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/receive/worker.ts)：在 Worker 中初始化 `zxing-wasm` 并识别 QR。
4. [`shared/protocol.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/protocol.ts)：光学容器、20 字节帧头、FNV-1a、文件解析和 SHA-256 校验。
5. [`shared/fountain.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/fountain.ts)：LT Encoder、Decoder、robust soliton distribution 和确定性 `dlog`。
6. [`clipboard/main.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/clipboard/main.ts)：文件读取、准备 payload 和写入剪贴板。
7. [`shared/clipboard-transfer.ts`](https://github.com/zhihui-hu/one-transfer/blob/main/shared/clipboard-transfer.ts)：`ONE_TRANSFER_V1` 文本格式和 Base64 编码。
8. [`public/restore-base64.bat`](https://github.com/zhihui-hu/one-transfer/blob/main/public/restore-base64.bat)：Windows 剪贴板读取、校验和文件恢复。

## 适合哪些场景

如果你遇到下面这些情况，可以试试 One Transfer：

- 受限云电脑只能复制文字，不能直接上传文件；
- VDI 或远程桌面没有开放文件共享目录；
- 临时隔离环境只允许浏览器和剪贴板；
- 两台设备之间没有方便的网络连接，但一台能显示屏幕，另一台能用摄像头观察；
- 想在本地浏览器之间离线传递小文件或文本；
- 需要把一个文件交给 Windows 端，但不想额外部署中转服务。

如果你的场景已经有稳定的对象存储、企业文件交换系统或高带宽内网，那直接使用现有方案会更合适。One Transfer 的价值，恰恰在于那些正常方案都不可用，但还剩下一条文本通道或一条屏幕通道的地方。

## 项目地址

项目已经开源：[zhihui-hu/one-transfer](https://github.com/zhihui-hu/one-transfer)

如果你也碰到过“网页能开、字能复制，但文件就是进不去”的环境，可以直接 Fork 下来试试。这个项目后面我会继续按实际使用场景补功能，但协议、校验和安全边界会尽量保持清楚，不把它扩展成一个什么都想做的网盘。

写到这里，One Transfer 大致就介绍完了。它解决的问题不算主流，却确实存在：当文件通道被拿走以后，我们还能不能只依靠文本、屏幕和浏览器，把文件可靠地交到另一端。
