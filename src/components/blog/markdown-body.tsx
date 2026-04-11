'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type MarkdownBodyProps = React.PropsWithChildren<{
  className?: string;
}>;

export function MarkdownBody({ children, className }: MarkdownBodyProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const syncTheme = () => {
      setTheme(
        root.classList.contains('dark') || media.matches ? 'dark' : 'light',
      );
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class'],
    });

    media.addEventListener('change', syncTheme);

    return () => {
      observer.disconnect();
      media.removeEventListener('change', syncTheme);
    };
  }, []);

  return (
    <article
      className={cn('markdown-body', className)}
      data-theme={theme}
      suppressHydrationWarning
    >
      {children}
    </article>
  );
}
