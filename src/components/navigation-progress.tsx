'use client';

import { gsap } from 'gsap';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';

const LOADING_MAX_PROGRESS = 0.96;

const NAVIGATION_PROGRESS_CSS = `
  [data-navigation-progress='container'] {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99999;
    height: 2.5px;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-1px);
  }

  [data-navigation-progress='bar'] {
    height: 100%;
    width: 100%;
    background: var(--foreground);
    transform-origin: left center;
    transform: scaleX(0) translateZ(0);
    border-radius: 0 999px 999px 0;
    box-shadow: 0 0 8px color-mix(in oklab, var(--foreground) 30%, transparent);
    will-change: transform;
    backface-visibility: hidden;
  }
`;

type ProgressState = 'idle' | 'loading' | 'complete';

function NavigationProgressStyles() {
  return <style>{NAVIGATION_PROGRESS_CSS}</style>;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const stateRef = useRef<ProgressState>('idle');
  const loadingTimelineRef = useRef<
    ReturnType<typeof gsap.timeline> | undefined
  >(undefined);
  const completionTimelineRef = useRef<
    ReturnType<typeof gsap.timeline> | undefined
  >(undefined);
  const search = searchParams.toString();
  const routeKey = search ? `${pathname}?${search}` : pathname;
  const prevRouteRef = useRef(routeKey);

  const commitState = useCallback((nextState: ProgressState) => {
    stateRef.current = nextState;
    containerRef.current?.setAttribute('data-state', nextState);
  }, []);

  const syncProgressFromBar = useCallback(() => {
    const bar = barRef.current;

    if (!bar) {
      return;
    }

    const scaleX = Number(gsap.getProperty(bar, 'scaleX'));

    if (Number.isFinite(scaleX)) {
      progressRef.current = Math.max(0, Math.min(1, scaleX));
    }
  }, []);

  const commitProgress = useCallback((nextProgress: number) => {
    const resolvedProgress = Math.max(0, Math.min(1, nextProgress));

    progressRef.current = resolvedProgress;
    gsap.set(barRef.current, {
      force3D: true,
      scaleX: resolvedProgress,
    });
  }, []);

  const clearProgressAnimation = useCallback(() => {
    syncProgressFromBar();
    loadingTimelineRef.current?.kill();
    completionTimelineRef.current?.kill();

    loadingTimelineRef.current = undefined;
    completionTimelineRef.current = undefined;

    const targets = [containerRef.current, barRef.current].filter(
      (target): target is HTMLDivElement => Boolean(target),
    );

    if (targets.length > 0) {
      gsap.killTweensOf(targets);
    }
  }, [syncProgressFromBar]);

  const start = useCallback(() => {
    const container = containerRef.current;
    const bar = barRef.current;

    if (!container || !bar) {
      return;
    }

    clearProgressAnimation();

    const shouldRestart =
      stateRef.current !== 'loading' || progressRef.current >= 0.97;

    if (shouldRestart) {
      commitProgress(0);
    }

    commitState('loading');
    gsap.set(container, {
      autoAlpha: 1,
      y: 0,
    });
    gsap.set(bar, {
      force3D: true,
      transformOrigin: 'left center',
    });

    if (prefersReducedMotion()) {
      commitProgress(Math.max(progressRef.current, 0.72));
      return;
    }

    const kickTarget = Math.min(
      LOADING_MAX_PROGRESS,
      Math.max(0.28, progressRef.current + 0.18),
    );
    const settleTarget = Math.min(
      LOADING_MAX_PROGRESS,
      Math.max(0.72, kickTarget),
    );

    loadingTimelineRef.current = gsap
      .timeline({
        defaults: {
          overwrite: 'auto',
        },
        onUpdate: syncProgressFromBar,
      })
      .to(bar, {
        duration: 0.18,
        ease: 'power4.out',
        scaleX: kickTarget,
      })
      .to(bar, {
        duration: 0.58,
        ease: 'power3.out',
        scaleX: settleTarget,
      })
      .to(bar, {
        duration: 8,
        ease: 'power1.out',
        scaleX: LOADING_MAX_PROGRESS,
      });
  }, [
    clearProgressAnimation,
    commitProgress,
    commitState,
    syncProgressFromBar,
  ]);

  const done = useCallback(() => {
    const container = containerRef.current;
    const bar = barRef.current;

    if (!container || !bar) {
      return;
    }

    if (stateRef.current === 'idle' && progressRef.current === 0) {
      return;
    }

    clearProgressAnimation();
    commitState('complete');
    gsap.set(container, {
      autoAlpha: 1,
      y: 0,
    });

    if (prefersReducedMotion()) {
      commitProgress(1);
      commitState('idle');
      commitProgress(0);
      gsap.set(container, {
        autoAlpha: 0,
        y: -1,
      });
      return;
    }

    completionTimelineRef.current = gsap
      .timeline({
        defaults: {
          overwrite: 'auto',
        },
        onComplete: () => {
          commitState('idle');
          commitProgress(0);
          gsap.set(container, {
            autoAlpha: 0,
            y: -1,
          });
          completionTimelineRef.current = undefined;
        },
        onUpdate: syncProgressFromBar,
      })
      .to(bar, {
        duration: 0.26,
        ease: 'power3.out',
        scaleX: 1,
      })
      .to(
        container,
        {
          autoAlpha: 0,
          duration: 0.18,
          ease: 'power2.out',
          y: -1,
        },
        '>-0.04',
      );
  }, [
    clearProgressAnimation,
    commitProgress,
    commitState,
    syncProgressFromBar,
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
    gsap.set(containerRef.current, {
      autoAlpha: 0,
      y: -1,
    });
    gsap.set(barRef.current, {
      force3D: true,
      scaleX: 0,
      transformOrigin: 'left center',
    });

    return () => {
      clearProgressAnimation();
    };
  }, [clearProgressAnimation]);

  return (
    <>
      <NavigationProgressStyles />
      <div
        aria-hidden="true"
        ref={containerRef}
        data-navigation-progress="container"
        data-state="idle"
      >
        <div
          ref={barRef}
          data-navigation-progress="bar"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>
    </>
  );
}
