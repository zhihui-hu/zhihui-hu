'use client';

import { useEffect } from 'react';

type BlogHashScrollProps = {
  routeKey: string;
};

function getHashTargetId() {
  const rawHash = window.location.hash.slice(1);

  if (!rawHash) {
    return '';
  }

  try {
    return decodeURIComponent(rawHash);
  } catch {
    return rawHash;
  }
}

function scrollToHashTarget(behavior: ScrollBehavior) {
  const id = getHashTargetId();

  if (!id) {
    return false;
  }

  const target = document.getElementById(id);

  if (!target) {
    return false;
  }

  target.scrollIntoView({
    behavior,
    block: 'start',
  });

  return true;
}

export function BlogHashScroll({ routeKey }: BlogHashScrollProps) {
  useEffect(() => {
    const timeouts: number[] = [];
    let frame: number | null = null;

    const clearScheduledScrolls = () => {
      if (frame !== null) {
        window.cancelAnimationFrame(frame);
        frame = null;
      }

      while (timeouts.length > 0) {
        const timeout = timeouts.pop();

        if (timeout !== undefined) {
          window.clearTimeout(timeout);
        }
      }
    };

    const scheduleScroll = (behavior: ScrollBehavior) => {
      clearScheduledScrolls();

      frame = window.requestAnimationFrame(() => {
        scrollToHashTarget(behavior);
      });

      for (const delay of [80, 250, 600, 1200, 2000]) {
        timeouts.push(
          window.setTimeout(() => {
            scrollToHashTarget(behavior);
          }, delay),
        );
      }
    };

    const handleHashChange = () => {
      scheduleScroll('smooth');
    };

    const handleWindowLoad = () => {
      scheduleScroll('auto');
    };

    scheduleScroll('auto');
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('load', handleWindowLoad, { once: true });

    return () => {
      clearScheduledScrolls();
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('load', handleWindowLoad);
    };
  }, [routeKey]);

  return null;
}
