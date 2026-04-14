'use client';

import { CodeCopyButton } from '@/components/blog/code-copy-button';
import { isSensitiveCodeSample } from '@/components/blog/code-safety';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { startTransition, useEffect, useId, useState } from 'react';

function getMermaidTheme() {
  return document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'neutral';
}

type MermaidDiagramProps = {
  chart: string;
  className?: string;
};

function MermaidSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="mermaid-skeleton flex min-h-52 flex-col gap-5 rounded-xl border border-dashed border-border/70 bg-muted/15 p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-3 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] md:items-center">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded-full" />
        </div>
        <Skeleton className="mx-auto h-1 w-full rounded-full" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-4 w-2/3 rounded-full" />
        </div>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-1 w-10 rounded-full" />
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="hidden h-1 w-10 rounded-full sm:block" />
        <Skeleton className="hidden h-10 w-10 rounded-full sm:block" />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Mermaid 图表加载中...
      </p>
    </div>
  );
}

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const diagramId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(Boolean(chart.trim()));
  const allowCopy = !isSensitiveCodeSample(chart);

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      if (!chart.trim()) {
        startTransition(() => {
          setSvg('');
          setError(null);
          setIsRendering(false);
        });
        return;
      }

      startTransition(() => {
        setSvg('');
        setError(null);
        setIsRendering(true);
      });

      try {
        const mermaid = (await import('mermaid')).default;

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: getMermaidTheme(),
        });

        const { svg: output } = await mermaid.render(
          `mermaid-${diagramId}`,
          chart,
        );

        if (cancelled) {
          return;
        }

        startTransition(() => {
          setSvg(output);
          setError(null);
          setIsRendering(false);
        });
      } catch (renderError) {
        if (cancelled) {
          return;
        }

        startTransition(() => {
          setSvg('');
          setError(
            renderError instanceof Error
              ? renderError.message
              : 'Mermaid 渲染失败',
          );
          setIsRendering(false);
        });
      }
    }

    void renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart, diagramId]);

  return (
    <div
      className={cn(
        'mermaid-diagram my-6 overflow-hidden rounded-md border border-border/70 bg-background',
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-3 py-1.5">
        <span className="font-mono text-[10px] font-medium tracking-wide text-muted-foreground/80">
          mermaid
        </span>
        {allowCopy ? <CodeCopyButton value={chart} /> : null}
      </div>
      <div
        aria-busy={isRendering}
        className="overflow-x-auto overflow-y-visible px-4 py-4"
      >
        {svg ? (
          <div
            aria-label="Mermaid diagram"
            className="mermaid-diagram__content [&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:min-w-0"
            dangerouslySetInnerHTML={{ __html: svg }}
            role="img"
          />
        ) : isRendering ? (
          <MermaidSkeleton />
        ) : (
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-sm text-muted-foreground">
            {error || 'Mermaid 图表暂时无法显示'}
          </div>
        )}
      </div>
      {error ? (
        <pre className="overflow-x-auto border-t border-border bg-muted/30 px-4 py-4 text-sm leading-7 text-foreground">
          <code>{chart}</code>
        </pre>
      ) : null}
    </div>
  );
}
