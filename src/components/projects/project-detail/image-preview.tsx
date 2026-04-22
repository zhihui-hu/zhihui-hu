'use client';

/* eslint-disable @next/next/no-img-element -- project archives mix local and remote images */
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
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export type ProjectPreviewImage = {
  alt: string;
  caption?: string;
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

const WATERMARK_BACKGROUND = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="180" viewBox="0 0 240 180">
    <g transform="rotate(-24 120 90)">
      <text x="34" y="94" fill="rgba(0,0,0,0.14)" font-size="20" font-family="Arial, sans-serif">huzhihui</text>
      <text x="32" y="92" fill="rgba(255,255,255,0.20)" font-size="20" font-family="Arial, sans-serif">huzhihui</text>
    </g>
  </svg>`,
)}")`;

function getWrappedIndex(index: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return (index + total) % total;
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function WatermarkOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 bg-repeat opacity-90 mix-blend-soft-light',
        className,
      )}
      style={{
        backgroundImage: WATERMARK_BACKGROUND,
        backgroundSize: '240px 180px',
      }}
    />
  );
}

function ProjectPreviewTriggerCard({
  alt,
  buttonClassName,
  imageClassName,
  onOpen,
  src,
}: {
  alt: string;
  buttonClassName?: string;
  imageClassName?: string;
  onOpen: (trigger: HTMLButtonElement) => void;
  src: string;
}) {
  return (
    <button
      aria-label={`查看大图：${alt}`}
      className={cn(
        'group relative inline-flex w-auto shrink-0 cursor-zoom-in overflow-hidden rounded-[1.6rem] bg-transparent text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        buttonClassName,
      )}
      onClick={(event) => {
        onOpen(event.currentTarget);
      }}
      type="button"
    >
      <img
        alt={alt}
        className={cn(
          'h-auto w-auto max-w-none rounded-[inherit] object-contain select-none',
          imageClassName,
        )}
        loading="lazy"
        src={src}
      />
      <WatermarkOverlay className="rounded-[inherit] opacity-65" />
    </button>
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
  const imageRef = useRef<HTMLImageElement>(null);
  const dialogOpenRef = useRef(false);
  const previousIndexRef = useRef(activeIndex);
  const directionRef = useRef(1);
  const currentIndex = getWrappedIndex(activeIndex, images.length);
  const activeImage = images[currentIndex] ?? null;
  const activeImageSrc = activeImage?.src ?? '';
  const hasMultiple = images.length > 1;

  const navigateTo = useCallback(
    (index: number, direction: -1 | 1) => {
      directionRef.current = direction;
      onSelect(getWrappedIndex(index, images.length));
    },
    [images.length, onSelect],
  );

  useEffect(() => {
    if (!open || images.length < 2) {
      return;
    }

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

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, images.length, navigateTo, open]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current || !imageRef.current) {
      dialogOpenRef.current = false;
      return;
    }

    const panelElement = panelRef.current;
    const imageElement = imageRef.current;
    const isJustOpened = !dialogOpenRef.current;

    dialogOpenRef.current = true;

    const runAnimation = () => {
      gsap.killTweensOf([panelElement, imageElement]);

      if (prefersReducedMotion()) {
        gsap.set(panelElement, { autoAlpha: 1 });
        gsap.set(imageElement, {
          autoAlpha: 1,
          clearProps: 'transform,borderRadius',
        });
        previousIndexRef.current = currentIndex;
        return;
      }

      if (isJustOpened && originRect) {
        const finalRect = imageElement.getBoundingClientRect();
        const originCenterX = originRect.left + originRect.width / 2;
        const originCenterY = originRect.top + originRect.height / 2;
        const finalCenterX = finalRect.left + finalRect.width / 2;
        const finalCenterY = finalRect.top + finalRect.height / 2;
        const scaleX = originRect.width / Math.max(finalRect.width, 1);
        const scaleY = originRect.height / Math.max(finalRect.height, 1);

        gsap.fromTo(
          panelElement,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.22,
            ease: 'power2.out',
          },
        );

        gsap.fromTo(
          imageElement,
          {
            autoAlpha: 0.78,
            borderRadius: 24,
            filter: 'blur(18px) brightness(0.9)',
            scaleX,
            scaleY,
            x: originCenterX - finalCenterX,
            y: originCenterY - finalCenterY,
          },
          {
            autoAlpha: 1,
            borderRadius: 18,
            duration: 0.78,
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
            autoAlpha: 0.35,
            x: directionRef.current * 120,
            scale: 1.01,
          },
          {
            autoAlpha: 1,
            duration: 0.54,
            ease: 'power3.out',
            clearProps: 'filter',
            scale: 1,
            x: 0,
          },
        );
      } else {
        gsap.fromTo(
          panelElement,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.2,
            ease: 'power2.out',
          },
        );
      }

      previousIndexRef.current = currentIndex;
    };

    if (imageElement.complete) {
      runAnimation();
      return;
    }

    imageElement.addEventListener('load', runAnimation, { once: true });

    return () => {
      imageElement.removeEventListener('load', runAnimation);
    };
  }, [activeImageSrc, currentIndex, open, originRect]);

  if (!activeImage) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="left-0 top-0 h-[100dvh] w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-black/96 p-0 text-white ring-0 sm:max-w-none"
        showCloseButton={false}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{activeImage.alt}</DialogTitle>
          <DialogDescription>
            全屏图片预览，支持使用方向键切换图片。
          </DialogDescription>
        </DialogHeader>

        <div
          ref={panelRef}
          className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/55 to-transparent" />

          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 sm:top-6 sm:right-6">
            <Button
              asChild
              className="border-white/12 bg-black/40 text-white hover:bg-black/65 hover:text-white"
              size="icon"
              variant="outline"
            >
              <a
                href={activeImage.src}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ExternalLinkIcon />
                <span className="sr-only">新窗口打开</span>
              </a>
            </Button>

            <DialogClose asChild>
              <Button
                className="border-white/12 bg-black/40 text-white hover:bg-black/65 hover:text-white"
                size="icon"
                variant="outline"
              >
                <XIcon />
                <span className="sr-only">关闭预览</span>
              </Button>
            </DialogClose>
          </div>

          {hasMultiple ? (
            <Button
              className="absolute left-4 z-20 rounded-full border-white/12 bg-black/40 text-white hover:bg-black/65 hover:text-white sm:left-6"
              onClick={() => navigateTo(currentIndex - 1, -1)}
              size="icon-lg"
              type="button"
              variant="outline"
            >
              <ChevronLeftIcon />
              <span className="sr-only">上一张</span>
            </Button>
          ) : null}

          <div className="flex h-full w-auto items-center justify-center p-4 sm:p-8 lg:p-12">
            <div className="relative flex h-full max-w-full items-center justify-center overflow-hidden rounded-[1.1rem]">
              <img
                key={activeImage.src}
                ref={imageRef}
                alt={activeImage.alt}
                className="max-h-full max-w-full object-contain select-none"
                src={activeImage.src}
              />
              <WatermarkOverlay />
            </div>
          </div>

          {hasMultiple ? (
            <Button
              className="absolute right-4 z-20 rounded-full border-white/12 bg-black/40 text-white hover:bg-black/65 hover:text-white sm:right-6"
              onClick={() => navigateTo(currentIndex + 1, 1)}
              size="icon-lg"
              type="button"
              variant="outline"
            >
              <ChevronRightIcon />
              <span className="sr-only">下一张</span>
            </Button>
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

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex gap-5 justify-start snap-x snap-mandatory">
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
