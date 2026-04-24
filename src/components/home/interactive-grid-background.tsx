'use client';

import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import { useEffect, useEffectEvent, useRef } from 'react';

type InteractiveGridBackgroundProps = {
  className?: string;
};

export function InteractiveGridBackground({
  className,
}: InteractiveGridBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isCoarsePointer = useMediaQuery('(pointer: coarse)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );
  const shouldSimplify = isMobile || isCoarsePointer || prefersReducedMotion;

  const syncPointer = useEffectEvent((x: number, y: number) => {
    const node = rootRef.current;

    if (!node) {
      return;
    }

    node.style.setProperty('--mx', `${x.toFixed(2)}px`);
    node.style.setProperty('--my', `${y.toFixed(2)}px`);
  });

  const schedulePointerSync = useEffectEvent((x: number, y: number) => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      syncPointer(x, y);
    });
  });

  const centerPointer = useEffectEvent(() => {
    const anchorY = shouldSimplify
      ? window.innerHeight * 0.28
      : window.innerHeight / 2;

    syncPointer(window.innerWidth / 2, anchorY);
  });

  const movePointer = useEffectEvent((clientX: number, clientY: number) => {
    if (shouldSimplify) {
      return;
    }

    schedulePointerSync(clientX, clientY);
  });

  useEffect(() => {
    centerPointer();

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        return;
      }

      movePointer(event.clientX, event.clientY);
    };
    const handlePointerLeave = () => {
      centerPointer();
    };
    const handleResize = () => {
      centerPointer();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('blur', handlePointerLeave);

    if (!shouldSimplify) {
      window.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });
    }

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      window.removeEventListener('resize', handleResize);
      window.removeEventListener('blur', handlePointerLeave);

      if (!shouldSimplify) {
        window.removeEventListener('pointermove', handlePointerMove);
      }
    };
  }, [shouldSimplify]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        'root pointer-events-none absolute inset-0 overflow-hidden',
        shouldSimplify && 'simplified',
        className,
      )}
      ref={rootRef}
    >
      <div className="layer base" />
      <div className="layer active" />

      <style jsx>{`
        .root {
          --mx: 50%;
          --my: 50%;
          --grid-size: 10px;
          --dot-size: 0.62px;
          --mask-size: clamp(96px, 11vw, 164px);
          --dot-base: rgba(24, 24, 27, 0.11);
          --dot-active: rgba(24, 24, 27, 0.82);
          --base-opacity: 1;
          --active-opacity: 1;
          --mask-will-change: mask-image;
        }

        .root.simplified {
          --grid-size: 12px;
          --dot-size: 0.56px;
          --mask-size: clamp(80px, 24vw, 128px);
          --dot-base: rgba(24, 24, 27, 0.08);
          --dot-active: rgba(24, 24, 27, 0.64);
          --base-opacity: 0.72;
          --active-opacity: 0.52;
          --mask-will-change: auto;
        }

        :global(html.dark) .root {
          --dot-base: rgba(145, 145, 145, 0.28);
          --dot-active: rgba(255, 255, 255, 0.98);
        }

        :global(html.dark) .root.simplified {
          --dot-base: rgba(145, 145, 145, 0.2);
          --dot-active: rgba(255, 255, 255, 0.8);
          --base-opacity: 0.82;
          --active-opacity: 0.64;
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
          will-change: var(--mask-will-change);
        }

        .base {
          background-image: radial-gradient(
            circle,
            var(--dot-base) 0 var(--dot-size),
            transparent calc(var(--dot-size) + 0.2px)
          );
          opacity: var(--base-opacity);
        }

        .active {
          background-image: radial-gradient(
            circle,
            var(--dot-active) 0 var(--dot-size),
            transparent calc(var(--dot-size) + 0.2px)
          );
          opacity: var(--active-opacity);
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
