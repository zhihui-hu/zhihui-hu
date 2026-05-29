import { cn } from '@/lib/utils';

type MarkdownBodyProps = React.PropsWithChildren<{
  className?: string;
}>;

export function MarkdownBody({ children, className }: MarkdownBodyProps) {
  return (
    <article className={cn('markdown-body', className)}>{children}</article>
  );
}
