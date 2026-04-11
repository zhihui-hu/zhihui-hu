'use client';

import { CodeCopyButton } from '@/components/blog/code-copy-button';
import { isSensitiveCodeSample } from '@/components/blog/code-safety';
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

export function MermaidDiagram({ chart, className }: MermaidDiagramProps) {
  const diagramId = useId().replace(/:/g, '');
  const [svg, setSvg] = useState('');
  const [error, setError] = useState<string | null>(null);
  const allowCopy = !isSensitiveCodeSample(chart);

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      if (!chart.trim()) {
        startTransition(() => {
          setSvg('');
          setError(null);
        });
        return;
      }

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
      <div className="overflow-x-auto overflow-y-visible px-4 py-4">
        {svg ? (
          <div
            aria-label="Mermaid diagram"
            className="mermaid-diagram__content [&_svg]:block [&_svg]:h-auto [&_svg]:w-full [&_svg]:min-w-0"
            dangerouslySetInnerHTML={{ __html: svg }}
            role="img"
          />
        ) : (
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-sm text-muted-foreground">
            {error || '正在渲染 Mermaid 图表...'}
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
