---
title: m3u8 视频怎么下载？为什么 B 站只给你一个 blob：把 HLS、DASH、MSE 这条前端链路讲透
slug: how-to-download-m3u8-video-bilibili-blob-dash-mse
publishedAt: 2026-04-17T18:20
image: /assets/imgs/how-to-download-m3u8-video-bilibili-blob-dash-mse-banner.png
summary: 真把“怎么下载 m3u8 视频”讲深，第一步不是写脚本，而是先承认不是所有网页视频都在用 `m3u8`。我在 2026-04-17 抓了一条 B 站公开页，页面里给出的已经是 `dash.video[]` 和 `dash.audio[]`，再加 `SegmentBase.Initialization`、`indexRange` 和签名 URL，最后播放器才通过 `MediaSource` 生成一个 `blob:` 地址挂到 `<video>` 上。也就是说，`blob:` 往往是最后一步，不是第一步。
keywords:
  - m3u8 下载
  - B站 blob 链接
  - DASH
  - MediaSource
  - HLS
tags:
  - m3u8
  - B站
  - blob URL
  - DASH
  - MediaSource
  - 前端
---

![m3u8 视频怎么下载？为什么 B 站只给你一个 blob：把 HLS、DASH、MSE 这条前端链路讲透](https://img.huzhihui.com/uploads/2026/04/how-to-download-m3u8-video-bilibili-blob-dash-mse_dhxrvi10qh8o.png)

写“怎么下载 m3u8 视频”最容易犯的错，就是把所有网页视频都当成同一种东西。

这也是为什么很多教程看着有用，一到真实站点就突然失灵。

尤其你拿 B 站做例子的时候，这个错会暴露得特别明显。你在 DOM 里看到的是：

```html
<video src="blob:https://www.bilibili.com/..."></video>
```

然后第一反应通常是两种：

- 视频源地址被藏在 `blob:` 里了。
- 只要想办法把这个 `blob:` 复制出来，我就能把视频下走。

这两个判断，基本都不对。

## 先把结论说死一点

如果你只记一句，我希望是这句：

**`blob:` 通常不是视频源地址，而是播放器把内存里的 `Blob` 或 `MediaSource` 挂到 `<video>` 之后生成的本地对象 URL。**

更进一步：

- 普通 `m3u8/HLS` 场景，核心难点是拿到 playlist、分片、密钥，然后按顺序拉流。
- 像 B 站这种网页播放场景，你看到 `blob:` 时，背后常常已经不是单纯的 `m3u8`，而是 `DASH + MSE + 音视频分离 + Range 请求 + 索引解析`。

这两类问题，不是一个难度。

## 我为什么说 B 站这个例子更能说明问题

为了不空讲，我在 `2026-04-17` 直接抓了一条公开的 B 站视频页：`https://www.bilibili.com/video/BV1xx411c7mD/`。

这条页里最关键的东西不是 `<video src>`。

而是页面内嵌的：

```js
window.__playinfo__;
```

我实际拿到的数据里，有几个信息特别关键：

- `window.__playinfo__.data.dash.video[]`
- `window.__playinfo__.data.dash.audio[]`
- `videoCount = 6`
- `audioCount = 2`
- 第一条视频轨是 `video/mp4`
- 第一条音频轨是 `audio/mp4`
- 每条轨道都有 `SegmentBase.Initialization`
- 每条轨道都有 `indexRange`

我把其中一部分精简成这样：

```json
{
  "format": "flv480",
  "quality": 32,
  "duration": 2056,
  "videoCount": 6,
  "audioCount": 2,
  "firstVideo": {
    "mimeType": "video/mp4",
    "codecs": "hev1.1.6.L120.90",
    "width": 512,
    "height": 384,
    "init": "0-1021",
    "indexRange": "1022-5985"
  },
  "firstAudio": {
    "mimeType": "audio/mp4",
    "codecs": "mp4a.40.2",
    "bandwidth": 68646,
    "init": "0-932",
    "indexRange": "933-5908"
  }
}
```

这串信息已经够把问题讲透了。

它说明至少 4 件事：

1. 这不是“一个 mp4 链接”的故事。
2. 这也不是“一个 m3u8 里面列一串 ts 分片”的最简单故事。
3. 视频和音频是分开的。
4. 页面里给你的不只是资源地址，还有初始化区间和索引区间，后面明显还有一层调度逻辑。

所以你在 B 站页面上看到 `blob:`，不该问“blob 怎么下载”。

你真正该问的是：

**这个播放器到底在把什么东西拼成 `blob:`。**

## `blob:` 到底是什么，为什么它一眼就把人带偏

MDN 对 `blob:` URL 的定义很直接：它是浏览器给 `Blob` 或 `MediaSource` 生成的对象 URL。

语法一般像这样：

```txt
blob:<origin>/<uuid>
```

这类 URL 有几个容易被忽略的特点：

- 它依赖当前页面里的 JS 对象存在。
- 它不是公开 CDN 资源地址。
- 它通常只能在当前上下文里被消费。
- 它生成得很晚，往往已经是播放器装配完成之后的最后一跳。

所以你复制一个 B 站 `blob:` 地址去新标签页，很多时候没有意义。那不是“站点藏起来的原始文件”，而是“当前页面这个播放器实例手里握着的一块对象引用”。

说得再直白一点：

`blob:` 比较像门牌号，不像仓库地址。

## 真正的链路，从来不是 `<video src>` 开始的

拿 B 站这类网页播放器来说，一条更接近真实的前端链路，通常是这样：

```txt
HTML / SSR 页面
  -> window.__playinfo__ 或 /x/player/wbi/playurl
  -> dash.video[] / dash.audio[]
  -> 选择一组可播放的音视频轨道
  -> 按 Initialization / indexRange 先拿初始化数据和索引
  -> 再按 Range 请求拿媒体片段
  -> 通过 MediaSource / SourceBuffer 追加
  -> 最后 video.src = URL.createObjectURL(mediaSource)
```

我抓到的 B 站播放器脚本里，也能看到这些关键词：

- `/x/player/wbi/playurl`
- `dash.mediaplayer.min.js`
- `MediaSource`
- `sourceopen`
- `SourceBuffer`

这已经足够说明：网页端的真正工作重心，是播放内核和片段调度，不是把一个现成 mp4 直接塞给 `<video>`。

## 为什么很多 m3u8 教程一到 B 站就不够用了

因为很多教程讲的是 `HLS`，但 B 站这个例子明显更接近 `DASH + MSE`。

两者都属于分片流媒体，但落到前端实现，差别不小。

| 维度              | `HLS / m3u8`                     | `DASH / B站这类网页链路`                                |
| ----------------- | -------------------------------- | ------------------------------------------------------- |
| 播放入口          | `m3u8` playlist                  | `mpd` 或页面返回的 `dash` 信息                          |
| 分片描述方式      | 清单里显式列片段                 | 可能是 `SegmentTemplate`，也可能是 `SegmentBase + sidx` |
| 容器常见形态      | `ts`、`m4s`                      | `fMP4 / .m4s` 更常见                                    |
| 音视频关系        | 有时合在一起                     | 经常分轨                                                |
| 浏览器表现        | 可原生播，也可走 hls.js          | 大多走 `MediaSource`                                    |
| 你在 DOM 里看到的 | 可能是原始 URL，也可能是 `blob:` | 很容易就是 `blob:`                                      |

也就是说，你如果只是学会了：

1. 找 `m3u8`
2. 解析 `#EXTINF`
3. 拉 `.ts`
4. 拼文件

这套方法处理普通 HLS 没问题。

但碰到 B 站这种页面，你会突然发现根本没有一个现成的 `m3u8` 在那里等你。

它给你的，是另一套描述播放资产的方式。

## B 站这个例子真正复杂在哪

我觉得至少有 6 层。

### 1. 你拿到的不是一个文件，而是一组轨道候选

同一条视频页里，我实际抓到的是多条 `video[]` 和多条 `audio[]`。

这代表播放器在做的不只是“取视频”，而是“选轨道”：

- 选哪个分辨率
- 选哪个编码
- 选哪条音频
- 当前浏览器是否支持这条编码

所以你不能再把“下载视频”理解成“抓一个链接”。

你先得决定抓哪一组。

### 2. 签名 URL 本身就是临时资产

抓到的 B 站资源 URL 里，明显带着这些参数：

- `deadline`
- `upsig`
- `uparams`
- `platform`
- `mid`

这说明它们不是长期裸链，更像带有效期的播放令牌。

你今天抓到的地址，过一会儿可能就过期了。

这也是为什么很多人保存链接到第二天再跑，直接 403。

### 3. 音视频分离，意味着“下完一个链接”根本还没结束

你只拉视频轨，通常没有音频。
你只拉音频轨，也不会变成完整视频。

播放器播放时，是两个 `SourceBuffer` 同时在喂：

- 一个给 video track
- 一个给 audio track

这件事在在线播放时很自然，到了“我要导出成一个完整文件”，难度就突然上来了。

因为播放不等于封装。

浏览器会播，不代表浏览器已经顺手帮你 mux 成一个标准 MP4。

### 4. `SegmentBase` 说明后面还有一层索引解析

这是很多人第一次碰到会卡住的点。

我抓到的 B 站数据里，每条轨道都有：

```json
"SegmentBase": {
  "Initialization": "0-1021",
  "indexRange": "1022-5985"
}
```

这意味着什么？

意味着播放器并不是拿到一张清单，里面已经把所有分片 URL 全列出来了。

它拿到的是：

- 初始化区间
- 索引区间

然后还要继续解析索引，才能知道真正的媒体片段边界。

这个索引，在 `fMP4` 里通常对应 `sidx` box。

也就是说，B 站这种链路不是：

```txt
m3u8 -> 分片 URL 列表 -> 下载
```

而更像：

```txt
playinfo -> representation -> init range -> sidx/index range -> 计算媒体 range -> Range 请求 -> appendBuffer
```

这就比“解析 m3u8”多了一层盒子结构理解。

### 5. 浏览器里真正做事的是 MSE，不是 `blob:`

网页播放器的核心不是“我拿到了一个 blob 文件”。

而是：

```js
const mediaSource = new MediaSource();
video.src = URL.createObjectURL(mediaSource);
```

然后在 `sourceopen` 之后：

- 创建 `SourceBuffer`
- 逐段 `appendBuffer`
- 维护 readyState、buffered、seeking、waiting

所以 `blob:` 只是最后对 `<video>` 暴露出来的消费接口。

你抓到它的时候，真正复杂的事情其实已经在前面做完了。

### 6. 这还是没把解码和自定义播放内核全算进去

我抓到的 B 站播放器脚本里，除了 `dash` 相关逻辑，还能看到 `bwphevc` 和 wasm 相关资源。

这说明有些路径里，站点甚至不只是“调浏览器原生视频能力”，还可能上了自己的播放内核、worker、offscreen canvas 或额外解码链路。

所以别把“网页视频播放”想得太轻。

很多时候它根本不是一个原生 `<video src="xxx.mp4">` 的故事。

## 那普通的 m3u8 下载，到底简单在哪

反过来讲，普通 HLS 的最小模型其实挺朴素：

1. 找到 `m3u8`
2. 如果是 master playlist，选一个 media playlist
3. 把清单里的片段 URL 解析出来
4. 如果没加密，就顺序取回
5. 拼接或交给转封装工具

它最大的好处，就是“清单本身已经把故事讲得比较明白了”。

你大多不需要再去理解 `sidx`。
也不一定需要自己实现 `Range` 级别的索引调度。

所以如果你的目标真的是：

- 自家站点
- 测试环境
- 内网课件
- 明确授权的 HLS 流

那从 `m3u8` 下手是对的。

但如果你拿 B 站网页端去套这套心智模型，你会一直觉得奇怪：

为什么我没找到 m3u8？
为什么 DOM 里只有 blob？
为什么分离流这么多？

因为那本来就不是一条单纯的 m3u8 教程能讲完的链路。

## 这种方案的优点和缺点，别只盯着“能不能下载”

很多人一提分片流媒体，就只剩“是不是在防下载”这个视角。

其实站在平台和播放器一侧，这套方案很现实。

### 优点

- 支持自适应码率，网络波动时不至于整段卡死。
- 首屏启动更快，不用先等一个完整大文件。
- 失败重试颗粒度小，坏一个片段不等于整条流都重来。
- 能把音频、视频、字幕、不同编码策略拆开做更细的选择。
- 方便播放器内核自己控缓冲区、seek、恢复和 ABR 策略。

### 缺点

- 你在 DOM 里看到的 `blob:` 非常迷惑人。
- 前端排查门槛高，不懂 `MSE`、`DASH`、`Range`、`fMP4` 很容易卡住。
- 音视频分轨后，离线导出变复杂。
- 浏览器能播放，不代表浏览器天然会帮你封成单文件。
- 一旦叠加签名 URL、鉴权、跨域、加密甚至 DRM，脚本复杂度会暴涨。

说白了：

**它是一套很好的在线播放方案，不一定是一套很友好的“我要另存为单文件”方案。**

## 真要自己实现，应该怎么拆

到这里再写代码，才不算飘。

但我先把边界说清楚：

- 下面代码只讨论你有权访问和保存的资源。
- 我不写指向 B 站内容的专用抓取脚本。
- 代码展示的是“同类前端链路怎么实现”，不是“帮你绕过站点授权”。

先分两条线。

### 路线 A：普通 HLS / m3u8，最小实现其实不难

这个版本只处理：

- 非 DRM
- 可 `fetch`
- 可直接列出片段的 HLS

```ts
function parseAttributeList(raw: string) {
  const result: Record<string, string> = {};
  const regex = /([A-Z0-9-]+)=("(?:[^"]*)"|[^,]*)/g;

  for (const match of raw.matchAll(regex)) {
    result[match[1]] = match[2].replace(/^"|"$/g, '');
  }

  return result;
}

function toAbsoluteUrl(baseUrl: string, maybeRelativeUrl: string) {
  return new URL(maybeRelativeUrl, baseUrl).toString();
}

function parseHlsPlaylist(text: string, playlistUrl: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const variants: Array<{ url: string; BANDWIDTH?: string }> = [];
  const segments: string[] = [];
  let mapUrl = '';
  let encrypted = false;
  let pendingVariant: Record<string, string> | null = null;

  for (const line of lines) {
    if (line.startsWith('#EXT-X-STREAM-INF:')) {
      pendingVariant = parseAttributeList(
        line.slice('#EXT-X-STREAM-INF:'.length),
      );
      continue;
    }

    if (pendingVariant && !line.startsWith('#')) {
      variants.push({
        ...pendingVariant,
        url: toAbsoluteUrl(playlistUrl, line),
      });
      pendingVariant = null;
      continue;
    }

    if (line.startsWith('#EXT-X-MAP:')) {
      const attrs = parseAttributeList(line.slice('#EXT-X-MAP:'.length));
      if (attrs.URI) {
        mapUrl = toAbsoluteUrl(playlistUrl, attrs.URI);
      }
      continue;
    }

    if (line.startsWith('#EXT-X-KEY:')) {
      const attrs = parseAttributeList(line.slice('#EXT-X-KEY:'.length));
      if ((attrs.METHOD || 'NONE') !== 'NONE') {
        encrypted = true;
      }
      continue;
    }

    if (!line.startsWith('#')) {
      segments.push(toAbsoluteUrl(playlistUrl, line));
    }
  }

  return { variants, segments, mapUrl, encrypted };
}

async function fetchText(
  url: string,
  credentials: RequestCredentials = 'include',
) {
  const response = await fetch(url, { mode: 'cors', credentials });
  if (!response.ok) {
    throw new Error(`读取清单失败: ${response.status} ${url}`);
  }
  return response.text();
}

async function fetchBuffer(
  url: string,
  credentials: RequestCredentials = 'include',
) {
  const response = await fetch(url, { mode: 'cors', credentials });
  if (!response.ok) {
    throw new Error(`读取分片失败: ${response.status} ${url}`);
  }
  return response.arrayBuffer();
}

export async function downloadHlsAsBlob(m3u8Url: string) {
  const firstText = await fetchText(m3u8Url);
  let playlist = parseHlsPlaylist(firstText, m3u8Url);
  let finalPlaylistUrl = m3u8Url;

  if (playlist.variants.length > 0) {
    const selected = [...playlist.variants].sort(
      (a, b) => Number(b.BANDWIDTH || 0) - Number(a.BANDWIDTH || 0),
    )[0];

    finalPlaylistUrl = selected.url;
    const mediaText = await fetchText(selected.url);
    playlist = parseHlsPlaylist(mediaText, selected.url);
  }

  if (playlist.encrypted) {
    throw new Error('这个最小示例不处理加密 HLS。');
  }

  const buffers: ArrayBuffer[] = [];

  if (playlist.mapUrl) {
    buffers.push(await fetchBuffer(playlist.mapUrl));
  }

  for (const segmentUrl of playlist.segments) {
    buffers.push(await fetchBuffer(segmentUrl));
  }

  const type = playlist.mapUrl ? 'video/mp4' : 'video/mp2t';
  const ext = playlist.mapUrl ? 'mp4' : 'ts';
  const blob = new Blob(buffers, { type });
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `video.${ext}`;
  link.click();

  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
}
```

这段代码的主线很清楚：

- 找清单
- 选变体
- 拉分片
- 拼成 `Blob`
- 触发保存

如果你的目标真是普通 `m3u8`，这就是正确思路。

### 路线 B：像 B 站这种 `blob + DASH + MSE`，重点反而是“复刻播放器”

到了这一步，你的心智得变一下。

你不再是在“下载一个文件”。
你是在“自己拼一个最小播放器链路”。

关键步骤一般是：

1. 先拿到 `dash.video[]` / `dash.audio[]`
2. 选一条视频轨和一条音频轨
3. 读取 `Initialization`
4. 读取 `indexRange`
5. 解析 `sidx`
6. 算出媒体 byte range
7. 用 `MediaSource` 和 `SourceBuffer` 追加

下面这段代码，展示的就是这个过程。

它不依赖 B 站专用字段，只依赖：

- `baseUrl`
- `mimeType`
- `codecs`
- `SegmentBase.Initialization`
- `SegmentBase.indexRange`

```ts
type DashTrack = {
  baseUrl: string;
  mimeType: string;
  codecs: string;
  SegmentBase: {
    Initialization: string;
    indexRange: string;
  };
};

function parseByteRange(spec: string) {
  const [start, end] = spec.split('-').map(Number);
  return { start, end };
}

function readUint64(view: DataView, offset: number) {
  return Number(
    (BigInt(view.getUint32(offset)) << 32n) |
      BigInt(view.getUint32(offset + 4)),
  );
}

async function fetchRange(
  url: string,
  range: { start: number; end: number },
  credentials: RequestCredentials = 'include',
) {
  const response = await fetch(url, {
    mode: 'cors',
    credentials,
    headers: {
      Range: `bytes=${range.start}-${range.end}`,
    },
  });

  if (!response.ok && response.status !== 206) {
    throw new Error(`Range 请求失败: ${response.status} ${url}`);
  }

  return response.arrayBuffer();
}

function parseSidx(buffer: ArrayBuffer, absoluteOffset: number) {
  const view = new DataView(buffer);
  let offset = 0;

  while (offset + 8 <= view.byteLength) {
    const size = view.getUint32(offset);
    const type = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7),
    );

    if (!size) {
      break;
    }

    if (type === 'sidx') {
      const version = view.getUint8(offset + 8);
      const timescale = view.getUint32(offset + 16);
      let cursor = offset + 20;
      let earliestPresentationTime = 0;
      let firstOffset = 0;

      if (version === 0) {
        earliestPresentationTime = view.getUint32(cursor);
        firstOffset = view.getUint32(cursor + 4);
        cursor += 8;
      } else {
        earliestPresentationTime = readUint64(view, cursor);
        firstOffset = readUint64(view, cursor + 8);
        cursor += 16;
      }

      cursor += 2; // reserved
      const referenceCount = view.getUint16(cursor);
      cursor += 2;

      let currentOffset = absoluteOffset + offset + size + firstOffset;
      const references: Array<{
        referenceType: number;
        referencedSize: number;
        duration: number;
        start: number;
        end: number;
      }> = [];

      for (let i = 0; i < referenceCount; i += 1) {
        const referenceInfo = view.getUint32(cursor);
        const referenceType = referenceInfo >>> 31;
        const referencedSize = referenceInfo & 0x7fffffff;
        const subsegmentDuration = view.getUint32(cursor + 4);

        references.push({
          referenceType,
          referencedSize,
          duration: subsegmentDuration,
          start: currentOffset,
          end: currentOffset + referencedSize - 1,
        });

        currentOffset += referencedSize;
        cursor += 12;
      }

      return {
        timescale,
        earliestPresentationTime,
        firstOffset,
        references,
      };
    }

    offset += size;
  }

  throw new Error('没有在 indexRange 里解析到 sidx box。');
}

function appendBuffer(sourceBuffer: SourceBuffer, buffer: ArrayBuffer) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      sourceBuffer.removeEventListener('updateend', handleUpdateEnd);
      sourceBuffer.removeEventListener('error', handleError);
    };

    const handleUpdateEnd = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error('SourceBuffer append 失败'));
    };

    sourceBuffer.addEventListener('updateend', handleUpdateEnd, { once: true });
    sourceBuffer.addEventListener('error', handleError, { once: true });
    sourceBuffer.appendBuffer(buffer);
  });
}

async function appendDashTrack(
  mediaSource: MediaSource,
  track: DashTrack,
  credentials: RequestCredentials = 'include',
) {
  const mimeCodec = `${track.mimeType}; codecs="${track.codecs}"`;

  if (!MediaSource.isTypeSupported(mimeCodec)) {
    throw new Error(`浏览器不支持 ${mimeCodec}`);
  }

  const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

  const initRange = parseByteRange(track.SegmentBase.Initialization);
  const indexRange = parseByteRange(track.SegmentBase.indexRange);

  const initBuffer = await fetchRange(track.baseUrl, initRange, credentials);
  await appendBuffer(sourceBuffer, initBuffer);

  const indexBuffer = await fetchRange(track.baseUrl, indexRange, credentials);
  const sidx = parseSidx(indexBuffer, indexRange.start);

  for (const ref of sidx.references) {
    if (ref.referenceType !== 0) {
      throw new Error('这个最小示例不处理层级 sidx。');
    }

    const mediaBuffer = await fetchRange(
      track.baseUrl,
      { start: ref.start, end: ref.end },
      credentials,
    );

    await appendBuffer(sourceBuffer, mediaBuffer);
  }

  return sourceBuffer;
}

function pickBestTrack<T extends DashTrack & { bandwidth?: number }>(
  tracks: T[],
) {
  return [...tracks].sort(
    (a, b) => Number(b.bandwidth || 0) - Number(a.bandwidth || 0),
  )[0];
}

export async function playDashFromPlayinfo(
  videoElement: HTMLVideoElement,
  dash: {
    video: Array<DashTrack & { bandwidth?: number }>;
    audio: Array<DashTrack & { bandwidth?: number }>;
  },
) {
  const videoTrack = pickBestTrack(dash.video);
  const audioTrack = pickBestTrack(dash.audio);

  if (!videoTrack || !audioTrack) {
    throw new Error('缺少可用的音频或视频轨道');
  }

  const mediaSource = new MediaSource();
  const blobUrl = URL.createObjectURL(mediaSource);
  videoElement.src = blobUrl;

  await new Promise<void>((resolve, reject) => {
    mediaSource.addEventListener(
      'sourceopen',
      async () => {
        try {
          await Promise.all([
            appendDashTrack(mediaSource, videoTrack),
            appendDashTrack(mediaSource, audioTrack),
          ]);

          mediaSource.endOfStream();
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      { once: true },
    );
  });

  return () => URL.revokeObjectURL(blobUrl);
}
```

这段代码真正有价值的地方，不是“马上拿来跑 B 站”。

而是它把 `blob:` 背后的前端过程拆开了：

- 为什么要 `Range`
- 为什么要 `Initialization`
- 为什么要 `indexRange`
- 为什么要 `sidx`
- 为什么要两个 `SourceBuffer`

你把这些串起来，再回头看 B 站网页里的 `blob:`，就不会再觉得神秘。

## 这段 DASH 代码为什么比 HLS 难这么多

因为它面对的是两个完全不同的世界：

### HLS 的世界

清单已经把“去哪拿片段”讲得很明白。

你大部分时间只是在处理：

- URL 解析
- 分片顺序
- 可能的 AES-128

### DASH + MSE 的世界

你在自己接近播放器内核。

你要面对的是：

- representation 选择
- 音视频分离
- 初始化段
- 索引段
- `sidx` 解析
- `Range` 调度
- `SourceBuffer` 状态机

所以很多人会误以为“B 站只是把链接藏起来了”。

其实不是。

它是整条播放链路本来就更复杂。

## 那离线导出怎么办

这里再补一个经常被混在一起的概念：

**能播放，和能导出成单一 MP4，不是一回事。**

像上面这段 `DASH + MSE` 代码，能把播放过程复刻出来。
但它不等于自动帮你做音视频封装。

如果你真要落成一个标准单文件，通常要再做一层“离线导出”：

- 把视频轨和音频轨各自保存下来。
- 把 `init` 和媒体片段按顺序还原成完整轨道。
- 再走一次 `mux / remux`，把两条轨道装进一个 `mp4` 容器里。

先把边界写死一点：

- 我不写指向 B 站内容的专用导出脚本。
- 下面这段 Node 代码只适用于你已经合法拿到的、自有或已授权的 `fMP4` 分片资源。
- 如果你的资源来源还是“网页里现抓”，那一步本身就已经是另一道题了，这里不展开。

### 离线导出真正分成 3 步

#### 1. 物化片段

先把资源变成你自己能稳定管理的本地文件。

最理想的输入不是一个网页里的 `blob:`，而是这种明确的片段目录：

```txt
input/
  video-init.mp4
  video-0001.m4s
  video-0002.m4s
  video-0003.m4s
  audio-init.mp4
  audio-0001.m4s
  audio-0002.m4s
  audio-0003.m4s
```

如果你手里拿到的是：

- 一个大文件 + 多段 byte range
- 或者一组已经下载好的 `m4s`

都可以先整理成这个目录结构。

#### 2. 还原轨道

对 `fMP4` 来说，一条完整轨道通常就是：

```txt
init.mp4 + fragment-1.m4s + fragment-2.m4s + fragment-3.m4s + ...
```

这一步不需要浏览器。
用 Node 在磁盘上按顺序拼起来就行。

#### 3. 封装输出

当你得到：

- 一条完整的视频轨
- 一条完整的音频轨

最后再交给 `ffmpeg` 做容器封装：

```bash
ffmpeg -i video-track.mp4 -i audio-track.mp4 -c copy output.mp4
```

为什么我更推荐这一步放到 Node + `ffmpeg`？

- 浏览器里做大文件离线拼接，内存压力很大。
- 文件系统、重试、临时目录、失败恢复，这些都是 Node 更擅长的事。
- `ffmpeg` 对时间戳、容器和轨道兼容性处理明显更稳。

### 一份够用的 Node 脚本

下面这份脚本做的事很克制：

- 从本地目录读取已经整理好的 `init + .m4s`
- 先拼出 `video-track.mp4`
- 再拼出 `audio-track.mp4`
- 最后调用 `ffmpeg` 输出 `output.mp4`

假设目录结构是：

```txt
input/
  video-init.mp4
  video-0001.m4s
  video-0002.m4s
  audio-init.mp4
  audio-0001.m4s
  audio-0002.m4s
```

文件名最好零填充，比如 `0001`、`0002`。因为脚本是按字典序排序的。

```js
#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

function fail(message) {
  throw new Error(message);
}

async function ensureDir(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function collectTrackFiles(inputDir, prefix) {
  const files = await fsp.readdir(inputDir);
  const initFile = `${prefix}-init.mp4`;
  const initPath = path.join(inputDir, initFile);

  if (!files.includes(initFile)) {
    fail(`缺少 ${initFile}`);
  }

  const mediaFiles = files
    .filter((fileName) => {
      return (
        fileName.startsWith(`${prefix}-`) &&
        fileName.endsWith('.m4s') &&
        fileName !== initFile
      );
    })
    .sort((left, right) => left.localeCompare(right, 'en'));

  if (mediaFiles.length === 0) {
    fail(`没有找到 ${prefix} 的媒体片段`);
  }

  return {
    initPath,
    mediaPaths: mediaFiles.map((fileName) => path.join(inputDir, fileName)),
  };
}

async function appendFileToWriteStream(writeStream, filePath) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(filePath);

    const cleanup = () => {
      readStream.removeAllListeners();
      writeStream.removeListener('error', handleError);
    };

    const handleError = (error) => {
      cleanup();
      reject(error);
    };

    readStream.on('error', handleError);
    writeStream.on('error', handleError);
    readStream.on('end', () => {
      cleanup();
      resolve();
    });

    readStream.pipe(writeStream, { end: false });
  });
}

async function stitchTrack(outputPath, initPath, mediaPaths) {
  await ensureDir(path.dirname(outputPath));

  const writeStream = fs.createWriteStream(outputPath);

  try {
    await appendFileToWriteStream(writeStream, initPath);

    for (const mediaPath of mediaPaths) {
      await appendFileToWriteStream(writeStream, mediaPath);
    }
  } finally {
    writeStream.end();
    await once(writeStream, 'close');
  }
}

async function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn('ffmpeg', args, {
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`ffmpeg 退出码异常: ${code}`));
    });
  });
}

async function muxToMp4(videoTrackPath, audioTrackPath, outputPath) {
  try {
    await runFfmpeg([
      '-y',
      '-fflags',
      '+genpts',
      '-i',
      videoTrackPath,
      '-i',
      audioTrackPath,
      '-c',
      'copy',
      '-movflags',
      '+faststart',
      outputPath,
    ]);
  } catch (error) {
    console.warn('[warn] 直接 copy 失败，尝试只重编码音频一次...');

    await runFfmpeg([
      '-y',
      '-fflags',
      '+genpts',
      '-i',
      videoTrackPath,
      '-i',
      audioTrackPath,
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-b:a',
      '192k',
      '-movflags',
      '+faststart',
      outputPath,
    ]);
  }
}

async function main() {
  const inputDir = process.argv[2];
  const outputDir = process.argv[3] || path.resolve('dist-offline-export');

  if (!inputDir) {
    fail('用法: node authorized-offline-export.mjs <inputDir> [outputDir]');
  }

  const absInputDir = path.resolve(inputDir);
  const absOutputDir = path.resolve(outputDir);

  const video = await collectTrackFiles(absInputDir, 'video');
  const audio = await collectTrackFiles(absInputDir, 'audio');

  const videoTrackPath = path.join(absOutputDir, 'video-track.mp4');
  const audioTrackPath = path.join(absOutputDir, 'audio-track.mp4');
  const finalOutputPath = path.join(absOutputDir, 'output.mp4');

  console.log('[1/3] 还原视频轨...');
  await stitchTrack(videoTrackPath, video.initPath, video.mediaPaths);

  console.log('[2/3] 还原音频轨...');
  await stitchTrack(audioTrackPath, audio.initPath, audio.mediaPaths);

  console.log('[3/3] 封装 mp4...');
  await muxToMp4(videoTrackPath, audioTrackPath, finalOutputPath);

  console.log(`完成: ${finalOutputPath}`);
}

main().catch((error) => {
  console.error('[error]', error.message);
  process.exitCode = 1;
});
```

运行方式：

```bash
node authorized-offline-export.mjs ./input ./dist-offline-export
```

前提：

- 机器上已经安装 `ffmpeg`
- 片段顺序是正确的
- 视频轨和音频轨来自同一个时间轴
- 这些资源是你有权离线导出的

### 这段代码为什么够用

因为它把离线导出最容易混淆的两件事拆开了：

- `stitchTrack()` 只负责“把同一轨的 init 和媒体片段按顺序拼回去”
- `muxToMp4()` 只负责“把音频轨和视频轨装进一个容器”

这两个步骤不要混在一起。

很多人一上来就试图“边下载边生成 mp4”，最后代码会非常乱。因为你同时在处理：

- 网络
- 顺序
- 轨道
- 时间戳
- 容器

而离线导出的工程做法通常是：

```txt
先把字节拿准
再把轨道还原
最后再封装
```

这样哪一步坏了都容易排查。

### 真正容易翻车的地方

这部分我建议你第一次就注意，不然脚本看着跑完了，文件还是可能不对。

#### 1. 片段顺序错了

如果文件名不是 `0001`、`0002` 这种零填充，字典序会把：

```txt
video-1.m4s
video-10.m4s
video-2.m4s
```

排成错误顺序。

这个坑特别常见。

#### 2. 音频轨和视频轨不是同一套 representation

如果它们不是同一时间轴，最后即使 `ffmpeg` 能出文件，也可能音画不同步。

#### 3. 不是所有 `m4s` 都能“裸拼完就直接 copy”

有些片段时间戳比较乱，`-c copy` 会失败。

所以上面的代码才会多一个兜底：

- 先尝试 `copy`
- 不行就只重编码音频一次

这是个很实用的折中。

#### 4. 大文件不要全读进内存

这也是为什么我这里写的是 stream 版本，而不是：

```js
const buf = Buffer.concat(allBuffers);
```

几十 MB 你还能扛。
几百 MB 往上，这种写法就开始不舒服了。

### 如果你的输入不是 `.m4s` 文件，而是 byte range

那就先把 byte range 物化成文件，再走上面这套。

顺序不要反。

也就是说，别直接把“range 请求逻辑”和“封装逻辑”耦在一起。

更稳妥的流程是：

```txt
range 清单
  -> 导出本地片段
  -> 还原单轨
  -> ffmpeg mux
```

你会发现，一旦拆成这 3 层，离线导出这件事就不神秘了。

它难的地方从来不是 `blob:`。
而是你有没有把“资产获取”“轨道还原”“容器封装”三件事拆开。

## 最后

所以回到最开始那个问题。

“m3u8 视频怎么下载”，如果只是写成“找到 `m3u8` 然后拉分片”，其实只讲对了一半。

另一半是：

很多真实网页视频，根本不在那条最短路径上。

以 B 站为例，你在页面里看到 `blob:`，真正该想到的不是“这个 blob 怎么扒”。

你该想到的是：

- 页面是不是已经拿到 `playinfo`
- 背后是不是 `dash.video[]` / `audio[]`
- 资源是不是签名 URL
- 是不是音视频分离
- 有没有 `Initialization` 和 `indexRange`
- 这是不是一条需要 `MediaSource` 和 `SourceBuffer` 才能拼起来的链路

把这些问题问对之后，很多“为什么看着能播却找不到文件”的困惑，基本都会自己散开。

说到底，`blob:` 不是谜底。

它只是播放器把所有复杂度吃进去之后，留在 DOM 里的那个结果。

## 参考资料

- [B 站公开视频页示例](https://www.bilibili.com/video/BV1xx411c7mD/)
- [B 站嵌入式播放器页](https://player.bilibili.com/player.html?bvid=BV1xx411c7mD)
- [MDN: `blob:` URLs](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/blob)
- [MDN: `MediaSource`](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource)
- [MDN: `SourceBuffer`](https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer)
- [RFC 8216: HTTP Live Streaming](https://datatracker.ietf.org/doc/html/rfc8216)
