'use client';

import { useBlogExternalLinkWarning } from '@/components/blog/blog-link';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { CopyCheckIcon, CopyIcon, MailIcon, Share2Icon } from 'lucide-react';
import { motion } from 'motion/react';
import { toDataURL } from 'qrcode';
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { type SimpleIcon, siSinaweibo, siWechat } from 'simple-icons';

function QrDialog({
  open,
  onOpenChange,
  url,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent
        className="sm:max-w-xs"
        drawerClassName="pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]"
      >
        <ResponsiveDialogHeader className="items-center text-center">
          <ResponsiveDialogTitle>微信扫码分享</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            打开微信扫一扫，把这篇文章发给朋友或留着稍后再读。
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="mx-auto rounded-xl border border-border/70 bg-background p-3">
          <QrCodePreview key={url} url={url} />
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function QrCodePreview({ url }: { url: string }) {
  const [qrState, setQrState] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  );
  const [qrSrc, setQrSrc] = useState('');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  useEffect(() => {
    let cancelled = false;

    void toDataURL(url, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#111827',
        light: '#FFFFFFFF',
      },
    })
      .then((nextQrSrc) => {
        if (cancelled) {
          return;
        }
        setQrSrc(nextQrSrc);
        setQrState('loaded');
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setQrState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="relative size-50">
      {qrState === 'loading' && (
        <QrCodeSkeleton prefersReducedMotion={prefersReducedMotion} />
      )}

      {qrState === 'error' ? (
        <div className="flex size-full items-center justify-center rounded-md bg-muted px-4 text-center text-sm text-muted-foreground">
          二维码加载失败，请稍后重试。
        </div>
      ) : qrSrc ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          alt="文章分享二维码"
          className="size-50 rounded-md"
          decoding="async"
          height={200}
          src={qrSrc}
          width={200}
        />
      ) : null}
    </div>
  );
}

function QrCodeSkeleton({
  prefersReducedMotion,
}: {
  prefersReducedMotion: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden rounded-md"
    >
      <Skeleton
        className="absolute inset-0 rounded-md bg-muted/80"
        style={prefersReducedMotion ? { animation: 'none' } : undefined}
      />

      {!prefersReducedMotion && (
        <motion.div
          animate={{ opacity: [0.5, 0], scale: [0.82, 1.08] }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-5 rounded-xl border border-border/55"
          transition={{
            duration: 1.7,
            ease: 'easeOut',
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
}

function BrandIcon({
  icon,
  ...props
}: ComponentProps<'svg'> & {
  icon: SimpleIcon;
}) {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d={icon.path} />
    </svg>
  );
}

function ActionButton({
  active = false,
  className,
  icon,
  iconOnly = false,
  label,
  onClick,
}: {
  active?: boolean;
  className?: string;
  icon: ReactNode;
  iconOnly?: boolean;
  label: string;
  onClick: () => void;
}) {
  const button = (
    <Button
      aria-label={label}
      className={cn(
        'rounded-full text-muted-foreground shadow-none',
        className,
        active && 'border-border/90 bg-muted text-foreground',
      )}
      onClick={onClick}
      title={label}
      type="button"
      variant="outline"
      size={iconOnly ? 'icon-sm' : 'sm'}
    >
      {icon}
      {!iconOnly && label}
    </Button>
  );

  if (!iconOnly) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="top" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

// ---------------------------------------------------------------------------
// ShareBar
// ---------------------------------------------------------------------------

interface ShareBarProps {
  className?: string;
  title: string;
  url: string;
  variant?: 'article' | 'sidebar';
}

export function ShareBar({
  className,
  title,
  url,
  variant = 'article',
}: ShareBarProps) {
  const { dialog: externalLinkDialog, openWarning } =
    useBlogExternalLinkWarning();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setHasNativeShare(!!navigator.share);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) {
        clearTimeout(copyResetTimerRef.current);
      }
    };
  }, []);

  // ── Copy URL ──────────────────────────────────────────────────────────────
  const copyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    setCopied(true);

    if (copyResetTimerRef.current) {
      clearTimeout(copyResetTimerRef.current);
    }

    copyResetTimerRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [url]);

  // ── Weibo ─────────────────────────────────────────────────────────────────
  const shareWeibo = useCallback(() => {
    const shareUrl = new URL('https://service.weibo.com/share/share.php');
    shareUrl.searchParams.set('url', url);
    shareUrl.searchParams.set('title', title);

    openWarning(shareUrl.toString());
  }, [openWarning, title, url]);

  // ── Email ────────────────────────────────────────────────────────────────
  const shareEmail = useCallback(() => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${title}\n\n${url}`);

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [title, url]);

  // ── Native share ──────────────────────────────────────────────────────────
  const nativeShare = useCallback(async () => {
    if (!navigator.share) {
      return;
    }

    try {
      await navigator.share({ title, url });
    } catch {
      // user cancelled or not supported
    }
  }, [title, url]);

  const isSidebar = variant === 'sidebar';
  const actionButtonClassName = isSidebar ? 'shrink-0' : undefined;

  return (
    <>
      {externalLinkDialog}
      <QrDialog open={showQr} onOpenChange={setShowQr} url={url} />

      <div
        className={cn(
          'share-bar border-t border-border/70',
          isSidebar ? 'pt-5' : 'mt-12 pt-8',
          className,
        )}
      >
        <div className="flex flex-wrap gap-2">
          <ActionButton
            active={copied}
            className={actionButtonClassName}
            icon={
              copied ? (
                <CopyCheckIcon data-icon="inline-start" />
              ) : (
                <CopyIcon data-icon="inline-start" />
              )
            }
            iconOnly={isSidebar}
            label={copied ? '已复制' : '复制链接'}
            onClick={copyUrl}
          />
          <ActionButton
            className={actionButtonClassName}
            icon={<BrandIcon data-icon="inline-start" icon={siSinaweibo} />}
            iconOnly={isSidebar}
            label="微博"
            onClick={shareWeibo}
          />
          <ActionButton
            className={actionButtonClassName}
            icon={<BrandIcon data-icon="inline-start" icon={siWechat} />}
            iconOnly={isSidebar}
            label="微信"
            onClick={() => setShowQr(true)}
          />
          {isSidebar ? (
            <ActionButton
              className={actionButtonClassName}
              icon={<MailIcon data-icon="inline-start" />}
              iconOnly
              label="邮件"
              onClick={shareEmail}
            />
          ) : (
            hasNativeShare && (
              <ActionButton
                icon={<Share2Icon data-icon="inline-start" />}
                label="其他方式"
                onClick={nativeShare}
              />
            )
          )}
        </div>
      </div>
    </>
  );
}
