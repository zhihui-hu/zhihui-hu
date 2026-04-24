import React, { ReactNode, useEffect, useRef, useState } from 'react';

type WatermarkedImageUrlState = {
  /** 当前给 children 使用的 url。loading 时默认先返回原 src，成功后替换为 blob url。 */
  url: string;
  /** 是否正在生成水印图 */
  loading: boolean;
  /** 生成水印时的错误信息。常见原因是图片跨域未允许 CORS。 */
  error: Error | null;
};

type WatermarkedImageUrlProps = {
  src: string;
  /** 水印文字，例如：昵称:微信用户小程序·笨嘴神器 */
  watermarkText: string;
  /** 水印字体大小，单位 px */
  watermarkFontSize?: number;
  /** 水印字体 */
  watermarkFontFamily?: string;
  /** 水印字重 */
  watermarkFontWeight?: number | string;
  /** 水印透明度，0 - 1 */
  watermarkOpacity?: number;
  /** 水印旋转角度，单位 deg */
  watermarkRotate?: number;
  /** 单个水印块的横向间距 */
  watermarkGapX?: number;
  /** 单个水印块的纵向间距 */
  watermarkGapY?: number;
  /** 水印颜色 */
  watermarkColor?: string;
  /** canvas 输出格式 */
  outputType?: 'image/png' | 'image/jpeg' | 'image/webp';
  /** jpeg / webp 输出质量，0 - 1 */
  outputQuality?: number;
  /** 生成失败时是否回退返回原图 src */
  fallbackToOriginal?: boolean;
  /** 不渲染 img，只把处理后的 url 交给外部渲染 */
  children: (url: string, state: WatermarkedImageUrlState) => ReactNode;
};

function isCrossOriginImageSource(src: string) {
  if (typeof window === 'undefined' || !src) {
    return false;
  }

  try {
    const resolvedUrl = new URL(src, window.location.href);
    return resolvedUrl.origin !== window.location.origin;
  } catch {
    return false;
  }
}

export default function WatermarkedImageUrl({
  src,
  watermarkText,
  watermarkFontSize = 26,
  watermarkFontFamily = 'sans-serif',
  watermarkFontWeight = 400,
  watermarkOpacity = 0.1,
  watermarkRotate = -18,
  watermarkGapX = 360,
  watermarkGapY = 180,
  watermarkColor = '#9ca3af',
  outputType = 'image/png',
  outputQuality,
  fallbackToOriginal = true,
  children,
}: WatermarkedImageUrlProps) {
  const [url, setUrl] = useState<string>(() => (fallbackToOriginal ? src : ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const revokeBlobUrl = () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };

    const createWatermarkedUrl = async () => {
      setLoading(true);
      setError(null);
      setUrl(fallbackToOriginal ? src : '');
      revokeBlobUrl();

      if (!src) {
        setLoading(false);
        return;
      }

      try {
        const image = new Image();

        // 不做代理，只用原 src 加载图片。
        // 跨域图片必须允许 CORS，否则 drawImage 后 canvas 会被污染，无法 toBlob。
        image.crossOrigin = 'anonymous';
        image.decoding = 'async';
        image.src = src;

        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error('图片加载失败'));
        });

        if (cancelled) return;

        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;

        if (!width || !height) {
          throw new Error('无法读取图片尺寸');
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('当前浏览器不支持 canvas');
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(image, 0, 0, width, height);

        const diagonal = Math.sqrt(width * width + height * height);
        const rotate = (watermarkRotate * Math.PI) / 180;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, watermarkOpacity));
        ctx.fillStyle = watermarkColor;
        ctx.font = `${watermarkFontWeight} ${watermarkFontSize}px ${watermarkFontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 以图片中心为旋转中心，向四周平铺水印，保证边缘也能覆盖到。
        ctx.translate(width / 2, height / 2);
        ctx.rotate(rotate);

        for (let x = -diagonal; x <= diagonal; x += watermarkGapX) {
          for (let y = -diagonal; y <= diagonal; y += watermarkGapY) {
            ctx.fillText(watermarkText, x, y);
          }
        }

        ctx.restore();

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (result) => {
              if (result) resolve(result);
              else reject(new Error('canvas.toBlob 失败'));
            },
            outputType,
            outputQuality,
          );
        });

        if (cancelled) return;

        const nextUrl = URL.createObjectURL(blob);
        blobUrlRef.current = nextUrl;
        setUrl(nextUrl);
      } catch (err) {
        const nextError = err instanceof Error ? err : new Error(String(err));
        const isCrossOrigin = isCrossOriginImageSource(src);

        if (!isCrossOrigin) {
          console.warn('[WatermarkedImageUrl] 生成水印失败:', nextError);
        }

        if (!cancelled) {
          setError(nextError);
          setUrl(fallbackToOriginal ? src : '');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    createWatermarkedUrl();

    return () => {
      cancelled = true;
      revokeBlobUrl();
    };
  }, [
    src,
    watermarkText,
    watermarkFontSize,
    watermarkFontFamily,
    watermarkFontWeight,
    watermarkOpacity,
    watermarkRotate,
    watermarkGapX,
    watermarkGapY,
    watermarkColor,
    outputType,
    outputQuality,
    fallbackToOriginal,
  ]);

  return <>{children(url, { url, loading, error })}</>;
}

/*
基础用法：

<WatermarkedImageUrl
  src={src}
  watermarkText="昵称:微信用户小程序·笨嘴神器"
>
  {(url) => (
    <img
      alt={alt}
      className={cn(
        'block select-none',
        resolvedFit === 'cover' ? 'object-cover' : 'object-contain',
        'rounded-[inherit]',
        imageClassName,
      )}
      decoding="async"
      loading="lazy"
      src={url}
    />
  )}
</WatermarkedImageUrl>

带 loading / error 的用法：

<WatermarkedImageUrl
  src={src}
  watermarkText="昵称:微信用户小程序·笨嘴神器"
>
  {(url, { loading, error }) => (
    <div className="relative overflow-hidden rounded-[inherit]">
      {url ? (
        <img
          alt={alt}
          className={cn(
            'block select-none',
            resolvedFit === 'cover' ? 'object-cover' : 'object-contain',
            'rounded-[inherit]',
            imageClassName,
          )}
          decoding="async"
          loading="lazy"
          src={url}
        />
      ) : (
        <div className="h-full w-full rounded-[inherit] bg-gray-100" />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 text-xs text-gray-500">
          水印生成中...
        </div>
      )}

      {error && (
        <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          水印生成失败，已显示原图
        </div>
      )}
    </div>
  )}
</WatermarkedImageUrl>
*/
