'use client';

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
        'my-6 overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
    >
      <div className="border-b border-border bg-muted/50 px-4 py-2 font-mono text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
        mermaid
      </div>
      <div className="overflow-x-auto px-4 py-4">
        {svg ? (
          <div
            aria-label="Mermaid diagram"
            className="[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-none"
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
