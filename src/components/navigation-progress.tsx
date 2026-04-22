'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const COMPLETE_ANIMATION_MS = 320;
const RESET_DELAY_MS = 140;
const LOADING_MAX_PROGRESS = 0.96;

type ProgressState = 'idle' | 'loading' | 'complete';

function easeOutCubic(value: number) {
  return 1 - (1 - value) ** 3;
}

function easeOutQuart(value: number) {
  return 1 - (1 - value) ** 4;
}

function lerp(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

/**
 * NProgress-style navigation progress bar for Next.js App Router.
 *
 * Detects navigation start by intercepting link clicks on same-origin
 * anchors, and detects completion via `usePathname()` and
 * `useSearchParams()` changes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ProgressState>('idle');
  const barRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const stateRef = useRef<ProgressState>('idle');
  const loadingFrameRef = useRef<number | undefined>(undefined);
  const loadingStartTimeRef = useRef<number | undefined>(undefined);
  const loadingFromRef = useRef(0);
  const completeRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const resetRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const search = searchParams.toString();
  const routeKey = search ? `${pathname}?${search}` : pathname;
  const prevRouteRef = useRef(routeKey);

  const commitState = useCallback((nextState: ProgressState) => {
    stateRef.current = nextState;
    setState(nextState);
  }, []);

  const writeProgress = useCallback((nextProgress: number) => {
    progressRef.current = nextProgress;
    barRef.current?.style.setProperty(
      'transform',
      `scaleX(${nextProgress.toFixed(4)})`,
    );
  }, []);

  const commitProgress = useCallback(
    (nextProgress: number | ((currentProgress: number) => number)) => {
      const resolvedProgress = Math.max(
        0,
        Math.min(
          1,
          typeof nextProgress === 'function'
            ? nextProgress(progressRef.current)
            : nextProgress,
        ),
      );

      writeProgress(resolvedProgress);
    },
    [writeProgress],
  );

  const clearProgressAnimation = useCallback(() => {
    if (loadingFrameRef.current !== undefined) {
      cancelAnimationFrame(loadingFrameRef.current);
    }

    loadingFrameRef.current = undefined;
    loadingStartTimeRef.current = undefined;
    loadingFromRef.current = progressRef.current;
  }, []);

  const clearCompletionTimers = useCallback(() => {
    clearTimeout(completeRef.current);
    clearTimeout(resetRef.current);
  }, []);

  const start = useCallback(() => {
    clearCompletionTimers();
    clearProgressAnimation();

    const shouldRestart =
      stateRef.current !== 'loading' || progressRef.current >= 0.97;

    if (shouldRestart) {
      commitProgress(0);
    }

    loadingFromRef.current = progressRef.current;
    commitState('loading');

    function animateLoadingFrame(timestamp: number) {
      if (stateRef.current !== 'loading') {
        clearProgressAnimation();
        return;
      }

      const startTime = loadingStartTimeRef.current ?? timestamp;

      loadingStartTimeRef.current = startTime;
      const elapsed = timestamp - startTime;
      const from = loadingFromRef.current;

      let nextProgress: number;

      if (elapsed < 180) {
        nextProgress = lerp(from, 0.2, easeOutQuart(elapsed / 180));
      } else if (elapsed < 760) {
        nextProgress = lerp(0.2, 0.72, easeOutCubic((elapsed - 180) / 580));
      } else if (elapsed < 1500) {
        nextProgress = lerp(0.72, 0.88, easeOutCubic((elapsed - 760) / 740));
      } else {
        const tailElapsed = elapsed - 1500;
        nextProgress =
          0.88 + 0.08 * (1 - Math.exp(-Math.max(0, tailElapsed) / 1600));
      }

      commitProgress((currentProgress) =>
        Math.max(currentProgress, Math.min(LOADING_MAX_PROGRESS, nextProgress)),
      );

      loadingFrameRef.current = requestAnimationFrame(animateLoadingFrame);
    }

    loadingFrameRef.current = requestAnimationFrame(animateLoadingFrame);
  }, [
    clearCompletionTimers,
    clearProgressAnimation,
    commitProgress,
    commitState,
  ]);

  const done = useCallback(() => {
    if (stateRef.current === 'idle' && progressRef.current === 0) {
      return;
    }

    clearProgressAnimation();
    clearCompletionTimers();
    commitState('complete');
    commitProgress(1);

    completeRef.current = setTimeout(() => {
      commitState('idle');
      resetRef.current = setTimeout(() => {
        commitProgress(0);
      }, RESET_DELAY_MS);
    }, COMPLETE_ANIMATION_MS);
  }, [
    clearCompletionTimers,
    clearProgressAnimation,
    commitProgress,
    commitState,
  ]);

  // Complete progress when the current route changes.
  useEffect(() => {
    if (prevRouteRef.current === routeKey) {
      return;
    }

    prevRouteRef.current = routeKey;

    const routeChangeTimer = setTimeout(() => {
      done();
    }, 0);

    return () => {
      clearTimeout(routeChangeTimer);
    };
  }, [done, routeKey]);

  // Intercept link clicks to detect navigation start
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement)?.closest?.('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');

      if (!href) return;

      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);

        if (url.origin !== window.location.origin) return;

        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search
        ) {
          return;
        }

        start();
      } catch {
        // Invalid URL, ignore
      }
    }

    document.addEventListener('click', handleClick, { capture: true });

    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, [start]);

  useEffect(() => {
    return () => {
      clearProgressAnimation();
      clearCompletionTimers();
    };
  }, [clearCompletionTimers, clearProgressAnimation]);

  return (
    <div
      aria-hidden="true"
      className="nav-progress-container"
      data-state={state}
    >
      <div
        ref={barRef}
        className="nav-progress-bar"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
