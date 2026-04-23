'use client';

/* eslint-disable @next/next/no-img-element -- the canvas renderer relies on a real img element for native lazy loading */
import { cn } from '@/lib/utils';
import { useCallback, useRef, useState } from 'react';

type WatermarkedImageProps = {
  alt: string;
  className?: string;
  fit?: 'contain' | 'cover';
  loading?: 'eager' | 'lazy';
  onLoadComplete?: (src: string) => void;
  src: string;
};

const WATERMARK_TEXT = 'huzhihui.com';
const WATERMARK_ANGLE = (-24 * Math.PI) / 180;
const WATERMARK_PATTERN = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
    <g transform="rotate(-24 120 80)">
      <text x="120" y="80" text-anchor="middle" dominant-baseline="middle" fill="rgba(0,0,0,0.12)" font-size="21" font-family="Arial, sans-serif" font-weight="700">huzhihui.com</text>
      <text x="118" y="78" text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.22)" font-size="21" font-family="Arial, sans-serif" font-weight="700">huzhihui.com</text>
    </g>
  </svg>`,
)}")`;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function drawPreviewWatermark(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const shortEdge = Math.min(width, height);
  const fontSize = clamp(shortEdge * 0.05, 16, 30);
  const tileWidth = clamp(fontSize * 7.2, 160, 280);
  const tileHeight = clamp(fontSize * 4.2, 110, 190);

  context.save();
  context.font = `700 ${fontSize}px ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.translate(width / 2, height / 2);
  context.rotate(WATERMARK_ANGLE);

  const spanX = width + tileWidth * 4;
  const spanY = height + tileHeight * 4;
  const startX = -spanX / 2;
  const startY = -spanY / 2;
  const rowCount = Math.ceil(spanY / tileHeight);
  const columnCount = Math.ceil(spanX / tileWidth);

  for (let row = 0; row <= rowCount; row += 1) {
    const y = startY + row * tileHeight;
    const rowOffset = row % 2 === 0 ? 0 : tileWidth / 2;

    for (let column = -1; column <= columnCount; column += 1) {
      const x = startX + column * tileWidth + rowOffset;

      context.fillStyle = 'rgba(0, 0, 0, 0.12)';
      context.fillText(WATERMARK_TEXT, x + 1.5, y + 1.5);

      context.fillStyle = 'rgba(255, 255, 255, 0.2)';
      context.fillText(WATERMARK_TEXT, x, y);
    }
  }

  context.restore();
}

function WatermarkPatternOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-repeat opacity-90 mix-blend-soft-light"
      style={{
        backgroundImage: WATERMARK_PATTERN,
        backgroundSize: '240px 160px',
      }}
    />
  );
}

export function WatermarkedImage({
  alt,
  className,
  fit = 'contain',
  loading = 'lazy',
  onLoadComplete,
  src,
}: WatermarkedImageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const notifiedSrcRef = useRef<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState('');
  const [canvasSrc, setCanvasSrc] = useState('');
  const imageLoaded = loadedSrc === src;
  const canvasReady = canvasSrc === src;

  const markImageLoaded = useCallback(() => {
    if (notifiedSrcRef.current === src) {
      return;
    }

    notifiedSrcRef.current = src;
    setLoadedSrc(src);
    onLoadComplete?.(src);
  }, [onLoadComplete, src]);

  const drawCanvasWatermark = useCallback(() => {
    const imageElement = imageRef.current;
    const canvasElement = canvasRef.current;

    if (
      !imageElement ||
      !canvasElement ||
      imageElement.naturalWidth === 0 ||
      imageElement.naturalHeight === 0
    ) {
      return;
    }

    const context = canvasElement.getContext('2d');

    if (!context) {
      return;
    }

    try {
      canvasElement.width = imageElement.naturalWidth;
      canvasElement.height = imageElement.naturalHeight;
      context.clearRect(0, 0, canvasElement.width, canvasElement.height);
      context.drawImage(
        imageElement,
        0,
        0,
        canvasElement.width,
        canvasElement.height,
      );
      drawPreviewWatermark(context, canvasElement.width, canvasElement.height);
      setCanvasSrc(src);
    } catch {
      setCanvasSrc((currentSrc) => (currentSrc === src ? '' : currentSrc));
    }
  }, [src]);

  const handleImageRef = useCallback(
    (node: HTMLImageElement | null) => {
      imageRef.current = node;

      if (
        !node ||
        !node.complete ||
        node.naturalWidth === 0 ||
        notifiedSrcRef.current === src
      ) {
        return;
      }

      requestAnimationFrame(() => {
        if (
          imageRef.current !== node ||
          !node.complete ||
          node.naturalWidth === 0
        ) {
          return;
        }

        markImageLoaded();
        drawCanvasWatermark();
      });
    },
    [drawCanvasWatermark, markImageLoaded, src],
  );

  return (
    <>
      <img
        alt={alt}
        className={cn(
          'h-auto w-auto max-w-none select-none transition-opacity duration-200',
          className,
          canvasReady && 'opacity-0',
        )}
        crossOrigin="anonymous"
        decoding="async"
        loading={loading}
        onError={() => {
          if (notifiedSrcRef.current === src) {
            notifiedSrcRef.current = null;
          }

          setLoadedSrc((currentSrc) => (currentSrc === src ? '' : currentSrc));
          setCanvasSrc((currentSrc) => (currentSrc === src ? '' : currentSrc));
        }}
        onLoad={() => {
          markImageLoaded();
          drawCanvasWatermark();
        }}
        ref={handleImageRef}
        src={src}
      />
      <canvas
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 size-full transition-opacity duration-200',
          fit === 'cover' ? 'object-cover' : 'object-contain',
          canvasReady ? 'opacity-100' : 'opacity-0',
        )}
        ref={canvasRef}
      />
      {imageLoaded && !canvasReady ? <WatermarkPatternOverlay /> : null}
    </>
  );
}
