'use client';

import { useActiveTheme } from '@/components/theme/use-active-theme';
import { cn } from '@/lib/utils';
import { type CSSProperties, useEffect, useEffectEvent, useRef } from 'react';

type InteractiveGridBackgroundProps = {
  className?: string;
};

export function InteractiveGridBackground({
  className,
}: InteractiveGridBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const theme = useActiveTheme();

  const syncPointer = useEffectEvent((x: number, y: number) => {
    const node = rootRef.current;

    if (!node) {
      return;
    }

    node.style.setProperty('--mx', `${x.toFixed(2)}px`);
    node.style.setProperty('--my', `${y.toFixed(2)}px`);
  });

  const centerPointer = useEffectEvent(() => {
    syncPointer(window.innerWidth / 2, window.innerHeight / 2);
  });

  const movePointer = useEffectEvent((clientX: number, clientY: number) => {
    syncPointer(clientX, clientY);
  });

  useEffect(() => {
    centerPointer();

    const handlePointerMove = (event: PointerEvent) => {
      movePointer(event.clientX, event.clientY);
    };
    const handlePointerLeave = () => {
      centerPointer();
    };
    const handleResize = () => {
      centerPointer();
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    window.addEventListener('blur', handlePointerLeave);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('blur', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const style = (
    theme === 'dark'
      ? {
          '--grid-size': '10px',
          '--dot-size': '0.62px',
          '--mask-size': 'clamp(96px, 11vw, 164px)',
          '--dot-base': 'rgba(145, 145, 145, 0.28)',
          '--dot-active': 'rgba(255, 255, 255, 0.98)',
        }
      : {
          '--grid-size': '10px',
          '--dot-size': '0.62px',
          '--mask-size': 'clamp(96px, 11vw, 164px)',
          '--dot-base': 'rgba(24, 24, 27, 0.11)',
          '--dot-active': 'rgba(24, 24, 27, 0.82)',
        }
  ) as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={cn(
        'root pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
      ref={rootRef}
      style={style}
    >
      <div className="layer base" />
      <div className="layer active" />

      <style jsx>{`
        .root {
          --mx: 50%;
          --my: 50%;
        }

        .layer {
          position: absolute;
          inset: 0;
        }

        .base,
        .active {
          background-position: calc(var(--grid-size) / 2)
            calc(var(--grid-size) / 2);
          background-size: var(--grid-size) var(--grid-size);
          will-change: mask-image;
        }

        .base {
          background-image: radial-gradient(
            circle,
            var(--dot-base) 0 var(--dot-size),
            transparent calc(var(--dot-size) + 0.2px)
          );
          opacity: 1;
        }

        .active {
          background-image: radial-gradient(
            circle,
            var(--dot-active) 0 var(--dot-size),
            transparent calc(var(--dot-size) + 0.2px)
          );
          opacity: 1;
          -webkit-mask-image: radial-gradient(
            circle var(--mask-size) at var(--mx) var(--my),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 1) 14%,
            rgba(0, 0, 0, 0.96) 28%,
            rgba(0, 0, 0, 0.52) 44%,
            rgba(0, 0, 0, 0.12) 62%,
            transparent 100%
          );
          mask-image: radial-gradient(
            circle var(--mask-size) at var(--mx) var(--my),
            rgba(0, 0, 0, 1) 0%,
            rgba(0, 0, 0, 1) 14%,
            rgba(0, 0, 0, 0.96) 28%,
            rgba(0, 0, 0, 0.52) 44%,
            rgba(0, 0, 0, 0.12) 62%,
            transparent 100%
          );
        }
      `}</style>
    </div>
  );
}
