'use client';

import {
  getBlogSafeInternalHref,
  isBlogDirectActionLink,
  isBlogInternalPath,
  isBlogSameSiteUrl,
  isBlogStaticAssetLink,
  isBlogTrustedExternalUrl,
  resolveBlogUrl,
} from '@/components/blog/link-safety';
import { Button } from '@/components/ui/button';
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from '@/components/ui/responsive-dialog';
import { AlertTriangleIcon, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

function ExternalLinkWarningDialog({
  href,
  open,
  onOpenChange,
}: {
  href: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const resolvedUrl = href ? resolveBlogUrl(href) : null;
  const displayHref = resolvedUrl?.toString() ?? href;

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon
              className="text-amber-600"
              data-icon="inline-start"
            />
            即将离开本站
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            这个链接会打开非信任站点。为了账号和财产安全，请先确认链接完整地址无误，再决定是否继续访问。
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="rounded-lg border border-border/70 bg-muted/35 px-3 py-2">
          <p className="text-xs text-muted-foreground">目标链接</p>
          <p className="mt-1 break-all font-mono text-sm text-foreground">
            {displayHref}
          </p>
        </div>

        <ResponsiveDialogFooter className="gap-2 sm:justify-end">
          <ResponsiveDialogClose asChild>
            <Button variant="outline">取消</Button>
          </ResponsiveDialogClose>
          <Button
            onClick={() => {
              window.open(displayHref, '_blank', 'noopener,noreferrer');
              onOpenChange(false);
            }}
          >
            <ExternalLinkIcon data-icon="inline-start" />
            继续访问
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export function useBlogExternalLinkWarning() {
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const openWarning = useCallback((href: string) => {
    setPendingHref(href);
  }, []);

  const dialog = useMemo(
    () => (
      <ExternalLinkWarningDialog
        href={pendingHref ?? ''}
        onOpenChange={(open) => {
          if (!open) {
            setPendingHref(null);
          }
        }}
        open={pendingHref !== null}
      />
    ),
    [pendingHref],
  );

  return {
    dialog,
    openWarning,
  };
}

type BlogLinkProps = React.ComponentProps<'a'> & {
  href?: string;
  transitionTypes?: string[];
};

export function BlogLink({
  href = '',
  onClick,
  rel,
  target,
  transitionTypes,
  ...props
}: BlogLinkProps) {
  const { dialog, openWarning } = useBlogExternalLinkWarning();
  const resolvedUrl = href ? resolveBlogUrl(href) : null;
  const isSameSite = resolvedUrl ? isBlogSameSiteUrl(resolvedUrl) : false;
  const isTrustedExternal = resolvedUrl
    ? isBlogTrustedExternalUrl(resolvedUrl)
    : false;

  if (!href) {
    return <a {...props} />;
  }

  if (href.startsWith('#')) {
    return <a href={href} onClick={onClick} {...props} />;
  }

  if (isBlogStaticAssetLink(href) || isBlogDirectActionLink(href)) {
    return <a href={href} onClick={onClick} {...props} />;
  }

  if (isBlogInternalPath(href)) {
    return (
      <Link
        href={href}
        onClick={onClick}
        transitionTypes={transitionTypes}
        {...props}
      >
        {props.children}
      </Link>
    );
  }

  if (resolvedUrl && isSameSite) {
    return (
      <Link
        href={getBlogSafeInternalHref(resolvedUrl)}
        onClick={onClick}
        transitionTypes={transitionTypes}
        {...props}
      >
        {props.children}
      </Link>
    );
  }

  if (resolvedUrl && isTrustedExternal) {
    return (
      <a
        href={href}
        onClick={onClick}
        rel={rel ?? 'noopener noreferrer'}
        target={target ?? '_blank'}
        {...props}
      />
    );
  }

  return (
    <>
      <a
        href={href}
        onClick={(event) => {
          onClick?.(event);

          if (event.defaultPrevented) {
            return;
          }

          event.preventDefault();
          openWarning(href);
        }}
        rel={rel ?? 'noopener noreferrer'}
        target={target ?? '_blank'}
        {...props}
      />

      {dialog}
    </>
  );
}
