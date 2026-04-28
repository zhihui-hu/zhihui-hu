'use client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { gsap } from 'gsap';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  XIcon,
} from 'lucide-react';
import Image from 'next/image';
import {
  type ReactEventHandler,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export type ProjectPreviewImage = {
  alt: string;
  caption?: string;
  previewKind?: 'desktop' | 'mobile';
  src: string;
};

type ProjectImagePreviewProps = {
  alt: string;
  buttonClassName?: string;
  caption?: string;
  imageClassName?: string;
  src: string;
};

type ProjectImageGalleryProps = {
  buttonClassName?: string;
  imageClassName?: string;
  images: ProjectPreviewImage[];
};

function getWrappedIndex(index: number, total: number) {
  if (total <= 0) return 0;
  return (index + total) % total;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

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

const PROJECT_IMAGE_BLUR_DATA_URL = blurDataUrl(12, 26);

function ProjectPreviewOriginalImage({
  alt,
  className,
  fit,
  loading = 'lazy',
  onError,
  onLoad,
  sizes,
  src,
}: {
  alt: string;
  className?: string;
  fit: 'contain' | 'cover';
  loading?: 'eager' | 'lazy';
  onError?: ReactEventHandler<HTMLImageElement>;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  sizes: string;
  src: string;
}) {
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

  return (
    <div
      className={cn('relative overflow-hidden rounded-[inherit]', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <Image
        alt={alt}
        className={cn(
          'select-none',
          fit === 'cover' ? 'object-cover' : 'object-contain',
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
        blurDataURL={PROJECT_IMAGE_BLUR_DATA_URL}
        placeholder="blur"
        sizes={sizes}
        src={src}
        unoptimized
      />

      {!isLoaded && !hasError ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 scale-110 bg-cover bg-center blur-xl transition-opacity duration-500"
          style={{ backgroundImage: `url("${PROJECT_IMAGE_BLUR_DATA_URL}")` }}
        />
      ) : null}

      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] bg-muted/70 px-4 text-center text-xs text-muted-foreground">
          图片加载失败
        </div>
      ) : null}
    </div>
  );
}

function ProjectPreviewTriggerCard({
  alt,
  buttonClassName,
  fit,
  imageClassName,
  onOpen,
  src,
}: {
  alt: string;
  buttonClassName?: string;
  fit?: 'contain' | 'cover';
  imageClassName?: string;
  onOpen: (trigger: HTMLButtonElement) => void;
  src: string;
}) {
  const resolvedFit =
    fit || (imageClassName?.includes('object-cover') ? 'cover' : 'contain');

  return (
    <button
      aria-label={`查看大图：${alt}`}
      className={cn(
        'group relative inline-flex w-auto shrink-0 cursor-zoom-in overflow-hidden rounded-[1.6rem] bg-transparent text-left',
        'transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        buttonClassName,
      )}
      onClick={(event) => onOpen(event.currentTarget)}
      type="button"
    >
      <ProjectPreviewOriginalImage
        alt={alt}
        className={cn('block select-none', 'rounded-[inherit]', imageClassName)}
        fit={resolvedFit}
        sizes={
          resolvedFit === 'cover'
            ? '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px'
            : '(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 960px'
        }
        src={src}
      />
    </button>
  );
}

function DotIndicators({
  count,
  activeIndex,
  onSelect,
}: {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  if (count <= 1) return null;
  return (
    <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          aria-label={`切换到第 ${i + 1} 张`}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300 ease-out',
            i === activeIndex
              ? 'w-5 bg-white'
              : 'w-1.5 bg-white/40 hover:bg-white/70',
          )}
          onClick={() => onSelect(i)}
          type="button"
        />
      ))}
    </div>
  );
}

function ProjectPreviewDialog({
  activeIndex,
  images,
  onOpenChange,
  onSelect,
  open,
  originRect,
}: {
  activeIndex: number;
  images: ProjectPreviewImage[];
  onOpenChange: (open: boolean) => void;
  onSelect: (index: number) => void;
  open: boolean;
  originRect: DOMRect | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const imageSurfaceRef = useRef<HTMLDivElement>(null);
  const dialogOpenRef = useRef(false);
  const previousIndexRef = useRef(activeIndex);
  const directionRef = useRef(1);
  const readyImageSrcRef = useRef('');
  const [readyTick, setReadyTick] = useState(0);

  const currentIndex = getWrappedIndex(activeIndex, images.length);
  const activeImage = images[currentIndex] ?? null;
  const hasMultiple = images.length > 1;
  const activePreviewKind = activeImage?.previewKind ?? 'mobile';

  const navigateTo = useCallback(
    (index: number, direction: -1 | 1) => {
      directionRef.current = direction;
      onSelect(getWrappedIndex(index, images.length));
    },
    [images.length, onSelect],
  );

  useEffect(() => {
    if (!open || images.length < 2) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateTo(currentIndex - 1, -1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateTo(currentIndex + 1, 1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, images.length, navigateTo, open]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current || !imageSurfaceRef.current) {
      dialogOpenRef.current = false;
      return;
    }

    const activeImageSrc = activeImage?.src ?? '';
    if (readyImageSrcRef.current !== activeImageSrc) return;

    const panelElement = panelRef.current;
    const imageElement = imageSurfaceRef.current;
    const isJustOpened = !dialogOpenRef.current;

    dialogOpenRef.current = true;
    gsap.killTweensOf([panelElement, imageElement]);

    if (prefersReducedMotion()) {
      gsap.set(panelElement, { autoAlpha: 1 });
      gsap.set(imageElement, {
        autoAlpha: 1,
        clearProps: 'transform,filter,borderRadius',
      });
      previousIndexRef.current = currentIndex;
      return;
    }

    if (isJustOpened && originRect) {
      const finalRect = imageElement.getBoundingClientRect();
      const scaleX = originRect.width / Math.max(finalRect.width, 1);
      const scaleY = originRect.height / Math.max(finalRect.height, 1);
      const x =
        originRect.left +
        originRect.width / 2 -
        (finalRect.left + finalRect.width / 2);
      const y =
        originRect.top +
        originRect.height / 2 -
        (finalRect.top + finalRect.height / 2);

      gsap.fromTo(
        panelElement,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.3, ease: 'power2.out' },
      );
      gsap.fromTo(
        imageElement,
        {
          autoAlpha: 0,
          borderRadius: 28,
          filter: 'blur(12px) brightness(0.85)',
          scaleX,
          scaleY,
          x,
          y,
        },
        {
          autoAlpha: 1,
          borderRadius: 16,
          duration: 0.65,
          ease: 'expo.out',
          filter: 'blur(0px) brightness(1)',
          scaleX: 1,
          scaleY: 1,
          x: 0,
          y: 0,
        },
      );
    } else if (previousIndexRef.current !== currentIndex) {
      gsap.fromTo(
        imageElement,
        {
          autoAlpha: 0,
          filter: 'blur(6px)',
          scale: 0.94,
          x: directionRef.current * 80,
        },
        {
          autoAlpha: 1,
          clearProps: 'filter',
          duration: 0.42,
          ease: 'expo.out',
          scale: 1,
          x: 0,
        },
      );
    } else {
      gsap.fromTo(
        panelElement,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.2, ease: 'power2.out' },
      );
    }

    previousIndexRef.current = currentIndex;
  }, [activeImage?.src, currentIndex, open, originRect, readyTick]);

  if (!activeImage) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) readyImageSrcRef.current = '';
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="left-0 top-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-transparent p-0 text-white ring-0 sm:max-w-none"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{activeImage.alt}</DialogTitle>
          <DialogDescription>
            全屏图片预览，支持使用方向键切换图片。
          </DialogDescription>
        </DialogHeader>

        <div className="absolute inset-0 bg-black/92 backdrop-blur-sm" />

        <div
          ref={panelRef}
          className="relative flex h-full w-full items-center justify-center overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />

          {/* 操作按钮 */}
          <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
            <Button
              asChild
              className="border-white/10 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
              size="icon"
              variant="outline"
            >
              <a
                href={activeImage.src}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLinkIcon className="h-4 w-4" />
                <span className="sr-only">新窗口打开</span>
              </a>
            </Button>
            <DialogClose asChild>
              <Button
                className="border-white/10 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                size="icon"
                variant="outline"
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">关闭预览</span>
              </Button>
            </DialogClose>
          </div>

          {hasMultiple ? (
            <Button
              className="absolute left-4 z-20 rounded-full border-white/10 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white sm:left-6"
              onClick={() => navigateTo(currentIndex - 1, -1)}
              size="icon-lg"
              type="button"
              variant="outline"
            >
              <ChevronLeftIcon />
              <span className="sr-only">上一张</span>
            </Button>
          ) : null}

          {/* 图片区域 */}
          <div className="relative z-10 flex h-full w-full items-center justify-center p-4 py-16 sm:p-16 lg:p-20">
            <div
              ref={imageSurfaceRef}
              className="relative flex h-full max-h-full w-full max-w-5xl items-center justify-center overflow-hidden rounded-2xl"
            >
              <ProjectPreviewOriginalImage
                key={activeImage.src}
                alt={activeImage.alt}
                className={cn(
                  'block max-h-full max-w-full select-none object-contain',
                  activePreviewKind === 'desktop'
                    ? 'aspect-[16/10] h-auto w-full'
                    : 'aspect-[6/13] h-full w-auto',
                )}
                fit="contain"
                loading="eager"
                onError={() => {
                  readyImageSrcRef.current = activeImage.src;
                  setReadyTick((t) => t + 1);
                }}
                onLoad={() => {
                  readyImageSrcRef.current = activeImage.src;
                  setReadyTick((t) => t + 1);
                }}
                sizes="(max-width: 1024px) 100vw, 1024px"
                src={activeImage.src}
              />
            </div>
          </div>

          {hasMultiple ? (
            <Button
              className="absolute right-4 z-20 rounded-full border-white/10 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white sm:right-6"
              onClick={() => navigateTo(currentIndex + 1, 1)}
              size="icon-lg"
              type="button"
              variant="outline"
            >
              <ChevronRightIcon />
              <span className="sr-only">下一张</span>
            </Button>
          ) : null}

          {activeImage.caption ? (
            <div className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2 text-center">
              <p className="max-w-lg rounded-lg bg-black/40 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
                {activeImage.caption}
              </p>
            </div>
          ) : null}

          <DotIndicators
            activeIndex={currentIndex}
            count={images.length}
            onSelect={(i) => {
              directionRef.current = i > currentIndex ? 1 : -1;
              onSelect(i);
            }}
          />

          {hasMultiple ? (
            <div className="absolute top-5 left-5 z-20">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/70 backdrop-blur-md">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectImagePreview({
  alt,
  buttonClassName,
  caption,
  imageClassName,
  src,
}: ProjectImagePreviewProps) {
  const [open, setOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  return (
    <>
      <ProjectPreviewTriggerCard
        alt={alt}
        buttonClassName={buttonClassName}
        imageClassName={imageClassName}
        onOpen={(trigger) => {
          setOriginRect(trigger.getBoundingClientRect());
          setOpen(true);
        }}
        src={src}
      />
      <ProjectPreviewDialog
        activeIndex={0}
        images={[{ alt, caption, src }]}
        onOpenChange={setOpen}
        onSelect={() => {}}
        open={open}
        originRect={originRect}
      />
    </>
  );
}

export function ProjectImageGallery({
  buttonClassName,
  imageClassName,
  images,
}: ProjectImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <div className="flex justify-start gap-5 snap-x snap-mandatory">
        {images.map((image, index) => (
          <ProjectPreviewTriggerCard
            alt={image.alt}
            buttonClassName={buttonClassName}
            imageClassName={imageClassName}
            key={`${image.src}-${index}`}
            onOpen={(trigger) => {
              setActiveIndex(index);
              setOriginRect(trigger.getBoundingClientRect());
              setOpen(true);
            }}
            src={image.src}
          />
        ))}
      </div>
      <ProjectPreviewDialog
        activeIndex={activeIndex}
        images={images}
        onOpenChange={setOpen}
        onSelect={setActiveIndex}
        open={open}
        originRect={originRect}
      />
    </>
  );
}
