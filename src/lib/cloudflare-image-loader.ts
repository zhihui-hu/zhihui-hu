import type { ImageLoaderProps } from 'next/image';

const DEFAULT_IMAGE_QUALITY = 75;

export default function cloudflareImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  const normalizedSrc = src.startsWith('/') ? src.slice(1) : src;
  const params = [
    'fit=scale-down',
    'format=auto',
    `width=${width}`,
    `quality=${quality || DEFAULT_IMAGE_QUALITY}`,
  ];

  return `/cdn-cgi/image/${params.join(',')}/${normalizedSrc}`;
}
