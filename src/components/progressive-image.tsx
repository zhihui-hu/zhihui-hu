'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import {
  type CSSProperties,
  type ReactEventHandler,
  useMemo,
  useState,
} from 'react';

export type ProgressiveImageFit = 'contain' | 'cover';

type ProgressiveImageProps = {
  alt: string;
  className?: string;
  errorLabel?: string;
  fit?: ProgressiveImageFit;
  imageClassName?: string;
  loading?: 'eager' | 'lazy';
  maxContainHeight?: number;
  onError?: ReactEventHandler<HTMLImageElement>;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  showError?: boolean;
  sizes: string;
  src: string;
  style?: CSSProperties;
  title?: string;
  unoptimized?: boolean;
  'aria-hidden'?: boolean;
};

function blurPlaceholder(width: number, height: number) {
  return `
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <filter id="b" color-interpolation-filters="sRGB">
      <feGaussianBlur stdDeviation="18" />
    </filter>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#242424" offset="0%" />
      <stop stop-color="#3a3a3a" offset="45%" />
      <stop stop-color="#1f1f1f" offset="100%" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)" filter="url(#b)" />
</svg>`;
}

function blurDataUrl(width: number, height: number): `data:image/${string}` {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    blurPlaceholder(width, height),
  )}` as `data:image/${string}`;
}

const IMAGE_BLUR_DATA_URL = blurDataUrl(12, 26);

function cssSize(value: CSSProperties['maxWidth']) {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return value;
}

export function ProgressiveImage({
  alt,
  className,
  errorLabel = '图片加载失败',
  fit = 'contain',
  imageClassName,
  loading = 'lazy',
  maxContainHeight,
  onError,
  onLoad,
  showError = true,
  sizes,
  src,
  style,
  title,
  unoptimized = true,
  'aria-hidden': ariaHidden,
}: ProgressiveImageProps) {
  const [imageState, setImageState] = useState<{
    hasError?: boolean;
    loaded?: boolean;
    naturalRatio?: number;
    src: string;
  }>({ src });
  const hasError = imageState.src === src && imageState.hasError;
  const isLoaded = imageState.src === src && imageState.loaded;
  const naturalRatio =
    imageState.src === src ? imageState.naturalRatio : undefined;
  const hasFixedAspectRatio = className?.includes('aspect-');
  const shouldUseNaturalRatio = fit === 'contain' && !hasFixedAspectRatio;
  const aspectRatio = shouldUseNaturalRatio
    ? (naturalRatio ?? 16 / 10)
    : undefined;
  const frameStyle = useMemo(() => {
    if (!aspectRatio && !maxContainHeight) {
      return style;
    }

    const nextStyle: CSSProperties = { ...style };

    if (aspectRatio) {
      nextStyle.aspectRatio = aspectRatio;
    }

    if (naturalRatio && maxContainHeight) {
      const existingMaxWidth = cssSize(style?.maxWidth);
      const naturalMaxWidth = `${Math.round(
        maxContainHeight * naturalRatio,
      )}px`;

      nextStyle.maxWidth = existingMaxWidth
        ? `min(${existingMaxWidth}, ${naturalMaxWidth})`
        : naturalMaxWidth;
    }

    return nextStyle;
  }, [aspectRatio, maxContainHeight, naturalRatio, style]);

  return (
    <span
      className={cn(
        'relative block overflow-hidden rounded-[inherit]',
        className,
      )}
      style={frameStyle}
      title={title}
    >
      <Image
        alt={alt}
        aria-hidden={ariaHidden}
        blurDataURL={IMAGE_BLUR_DATA_URL}
        className={cn(
          'select-none transition-opacity duration-300',
          isLoaded && !hasError ? 'opacity-100' : 'opacity-0',
          fit === 'cover' ? 'object-cover' : 'object-contain',
          imageClassName,
        )}
        draggable={false}
        fill
        loading={loading}
        onError={(event) => {
          setImageState({ hasError: true, loaded: true, src });
          onError?.(event);
        }}
        onLoad={(event) => {
          const image = event.currentTarget;
          const nextNaturalRatio =
            shouldUseNaturalRatio && image.naturalHeight > 0
              ? image.naturalWidth / image.naturalHeight
              : undefined;

          setImageState({
            loaded: true,
            naturalRatio: nextNaturalRatio,
            src,
          });
          onLoad?.(event);
        }}
        placeholder="blur"
        sizes={sizes}
        src={src}
        unoptimized={unoptimized}
      />

      {!isLoaded && !hasError ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center blur-xl transition-opacity duration-500"
          style={{ backgroundImage: `url("${IMAGE_BLUR_DATA_URL}")` }}
        />
      ) : null}

      {hasError && showError ? (
        <span className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-muted/70 px-4 text-center text-xs text-muted-foreground">
          {errorLabel}
        </span>
      ) : null}
    </span>
  );
}
