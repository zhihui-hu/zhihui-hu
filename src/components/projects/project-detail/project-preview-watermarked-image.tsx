/* eslint-disable @next/next/no-img-element */
import type { ReactEventHandler } from 'react';

import WatermarkedImageUrl from './watermark-image';

const PROJECT_PREVIEW_WATERMARK_TEXT = 'huzhihui.com';

type ProjectPreviewWatermarkedImageProps = {
  alt: string;
  className?: string;
  loading?: 'eager' | 'lazy';
  onLoad?: ReactEventHandler<HTMLImageElement>;
  showStatus?: boolean;
  src: string;
};

export function ProjectPreviewWatermarkedImage({
  alt,
  className,
  loading = 'lazy',
  onLoad,
  showStatus = false,
  src,
}: ProjectPreviewWatermarkedImageProps) {
  return (
    <WatermarkedImageUrl
      src={src}
      watermarkText={PROJECT_PREVIEW_WATERMARK_TEXT}
    >
      {(url, { error, loading: isWatermarkLoading }) =>
        showStatus ? (
          <div className="relative h-full w-full overflow-hidden rounded-[inherit]">
            {url ? (
              <img
                alt={alt}
                className={className}
                decoding="async"
                loading={loading}
                onLoad={onLoad}
                src={url}
              />
            ) : (
              <div className="h-full w-full rounded-[inherit] bg-muted/40" />
            )}

            {isWatermarkLoading && url ? (
              <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur-md">
                水印生成中
              </div>
            ) : null}

            {error ? (
              <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white/90 backdrop-blur-md">
                水印生成失败，已显示原图
              </div>
            ) : null}
          </div>
        ) : (
          <img
            alt={alt}
            className={className}
            decoding="async"
            loading={loading}
            onLoad={onLoad}
            src={url}
          />
        )
      }
    </WatermarkedImageUrl>
  );
}
