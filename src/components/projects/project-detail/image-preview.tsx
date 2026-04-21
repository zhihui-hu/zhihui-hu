'use client';

/* eslint-disable @next/next/no-img-element -- project archives mix local and remote images */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  ImageIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

function getWrappedIndex(index: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return (index + total) % total;
}

function ProjectPreviewTriggerCard({
  alt,
  badgeLabel,
  buttonClassName,
  imageClassName,
  onOpen,
  overlayLabel = '查看大图',
  src,
}: {
  alt: string;
  badgeLabel?: string;
  buttonClassName?: string;
  imageClassName?: string;
  onOpen: () => void;
  overlayLabel?: string;
  src: string;
}) {
  return (
    <button
      aria-label={`查看大图：${alt}`}
      className={cn(
        'group relative block w-full cursor-zoom-in overflow-hidden rounded-[1.25rem] border border-border/40 bg-card/60 text-left transition-all duration-200 hover:border-border hover:bg-card/80 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        buttonClassName,
      )}
      onClick={onOpen}
      type="button"
    >
      <img
        alt={alt}
        className={cn(
          'h-auto w-full object-cover transition-transform duration-300 group-hover:scale-[1.015]',
          imageClassName,
        )}
        loading="lazy"
        src={src}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-linear-to-t from-black/78 via-black/18 to-transparent p-3">
        <Badge
          className="border-white/10 bg-black/55 text-white"
          variant="outline"
        >
          <ImageIcon data-icon="inline-start" />
          {overlayLabel}
        </Badge>
        {badgeLabel ? (
          <Badge
            className="border-white/10 bg-black/45 text-white/92"
            variant="outline"
          >
            {badgeLabel}
          </Badge>
        ) : null}
      </div>
    </button>
  );
}

function ProjectPreviewDialogContent({
  activeIndex,
  images,
  onSelect,
}: {
  activeIndex: number;
  images: ProjectPreviewImage[];
  onSelect: (index: number) => void;
}) {
  if (images.length === 0) {
    return null;
  }

  const currentIndex = getWrappedIndex(activeIndex, images.length);
  const activeImage = images[currentIndex];
  const hasMultiple = images.length > 1;
  const description =
    activeImage.caption ||
    (hasMultiple ? '支持方向键和缩略图切换预览' : '支持在新窗口中打开原图');

  return (
    <DialogContent
      className="max-h-[calc(100vh-1rem)] max-w-[calc(100vw-1rem)] overflow-hidden border-white/10 bg-black/94 p-0 text-white ring-1 ring-white/10 sm:max-w-6xl"
      showCloseButton={false}
    >
      <DialogHeader className="gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-sm font-semibold text-white sm:text-base">
              {activeImage.alt}
            </DialogTitle>
            <DialogDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/70">
              {hasMultiple ? (
                <Badge
                  className="border-white/10 bg-white/8 text-white"
                  variant="outline"
                >
                  {currentIndex + 1} / {images.length}
                </Badge>
              ) : null}
              <span>{description}</span>
            </DialogDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              asChild
              className="border-white/10 bg-white/8 text-white hover:bg-white/16 hover:text-white"
              size="sm"
              variant="outline"
            >
              <a
                href={activeImage.src}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="hidden sm:inline">新窗口打开</span>
                <ExternalLinkIcon data-icon="inline-end" />
              </a>
            </Button>
            <DialogClose asChild>
              <Button
                className="border-white/10 bg-white/8 text-white hover:bg-white/16 hover:text-white"
                size="icon-sm"
                variant="outline"
              >
                <XIcon />
                <span className="sr-only">关闭预览</span>
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogHeader>

      <div className="relative bg-black px-3 py-3 sm:px-5 sm:py-5">
        {hasMultiple ? (
          <Button
            className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full border-white/10 bg-black/65 text-white hover:bg-black/80 hover:text-white"
            onClick={() => onSelect(currentIndex - 1)}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronLeftIcon />
            <span className="sr-only">上一张</span>
          </Button>
        ) : null}

        <div className="flex min-h-[48vh] items-center justify-center sm:min-h-[65vh]">
          <img
            alt={activeImage.alt}
            className="max-h-[72vh] w-auto max-w-full rounded-xl object-contain shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
            src={activeImage.src}
          />
        </div>

        {hasMultiple ? (
          <Button
            className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full border-white/10 bg-black/65 text-white hover:bg-black/80 hover:text-white"
            onClick={() => onSelect(currentIndex + 1)}
            size="icon"
            type="button"
            variant="outline"
          >
            <ChevronRightIcon />
            <span className="sr-only">下一张</span>
          </Button>
        ) : null}
      </div>

      {hasMultiple ? (
        <div className="border-t border-white/10 bg-black/78 px-4 py-3 sm:px-5">
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {images.map((image, index) => (
                <button
                  aria-current={currentIndex === index}
                  className={cn(
                    'group relative shrink-0 overflow-hidden rounded-xl border transition-all duration-200 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                    currentIndex === index
                      ? 'border-white/40 bg-white/10'
                      : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8',
                  )}
                  key={`${image.src}-${index}`}
                  onClick={() => onSelect(index)}
                  type="button"
                >
                  <img
                    alt=""
                    aria-hidden="true"
                    className="h-14 w-14 object-cover sm:h-16 sm:w-16"
                    src={image.src}
                  />
                  <span className="pointer-events-none absolute right-1 bottom-1 rounded-full bg-black/65 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {index + 1}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      ) : null}
    </DialogContent>
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <ProjectPreviewTriggerCard
        alt={alt}
        buttonClassName={buttonClassName}
        imageClassName={imageClassName}
        onOpen={() => setOpen(true)}
        src={src}
      />
      <ProjectPreviewDialogContent
        activeIndex={0}
        images={[{ alt, caption, src }]}
        onSelect={() => {}}
      />
    </Dialog>
  );
}

export function ProjectImageGallery({
  buttonClassName,
  imageClassName,
  images,
}: ProjectImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || images.length < 2) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveIndex((current) =>
          getWrappedIndex(current - 1, images.length),
        );
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveIndex((current) =>
          getWrappedIndex(current + 1, images.length),
        );
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, open]);

  if (images.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex gap-4 snap-x snap-mandatory">
        {images.map((image, index) => (
          <ProjectPreviewTriggerCard
            alt={image.alt}
            badgeLabel={`${index + 1}/${images.length}`}
            buttonClassName={buttonClassName}
            imageClassName={imageClassName}
            key={`${image.src}-${index}`}
            onOpen={() => {
              setActiveIndex(index);
              setOpen(true);
            }}
            overlayLabel="浏览图集"
            src={image.src}
          />
        ))}
      </div>
      <ProjectPreviewDialogContent
        activeIndex={activeIndex}
        images={images}
        onSelect={setActiveIndex}
      />
    </Dialog>
  );
}
