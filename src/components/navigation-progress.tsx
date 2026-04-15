'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * NProgress-style navigation progress bar for Next.js App Router.
 *
 * Detects navigation start by intercepting link clicks on same-origin
 * anchors, and detects completion via `usePathname()` changes.
 * Pure CSS animation — no external dependencies.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [state, setState] = useState<'idle' | 'loading' | 'complete'>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const completeRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const prevPathRef = useRef(pathname);

  const start = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setState('loading');
  }, []);

  const done = useCallback(() => {
    setState('complete');
    timeoutRef.current = setTimeout(() => {
      setState('idle');
    }, 300);
  }, []);

  // Complete progress when pathname changes
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      clearTimeout(completeRef.current);
      completeRef.current = setTimeout(() => {
        done();
      }, 0);
    }

    return () => clearTimeout(completeRef.current);
  }, [pathname, done]);

  // Intercept link clicks to detect navigation start
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      // Ignore modifier keys (new tab, etc.)
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement)?.closest?.('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');

      if (!href) return;

      // Ignore external links, hash-only links, download links, target links
      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:')
      ) {
        return;
      }

      // Check same-origin
      try {
        const url = new URL(href, window.location.origin);

        if (url.origin !== window.location.origin) return;

        // Don't trigger for same page navigation
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearTimeout(completeRef.current);
    };
  }, []);

  if (state === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      className="nav-progress-container"
      data-state={state}
    >
      <div className="nav-progress-bar" />
    </div>
  );
}
