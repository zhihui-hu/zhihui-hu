'use client';

import { useActiveTheme } from '@/components/theme/use-active-theme';
import { cn } from '@/lib/utils';

type MarkdownBodyProps = React.PropsWithChildren<{
  className?: string;
}>;

export function MarkdownBody({ children, className }: MarkdownBodyProps) {
  const theme = useActiveTheme();

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
