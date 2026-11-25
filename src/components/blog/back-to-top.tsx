'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ticking = useRef(false);
  const pathname = usePathname();
  // post pages use the scroll-progress pill below xl
  const isPost = /^\/blog\/[^/]+/.test(pathname);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 300);
        ticking.current = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      aria-label="回到顶部"
      className={cn(isPost ? 'hidden xl:flex' : 'flex')}
      onClick={scrollToTop}
      type="button"
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 50,
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '50%',
        border: '1px solid var(--border)',
        background: 'var(--background)',
        color: 'var(--muted-foreground)',
        cursor: 'pointer',
        boxShadow:
          '0 2px 8px color-mix(in srgb, var(--foreground) 8%, transparent)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(6px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition:
          'opacity 0.25s ease, transform 0.25s ease, background 0.18s, color 0.18s',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          'var(--muted)';
        (e.currentTarget as HTMLButtonElement).style.color =
          'var(--foreground)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          'var(--background)';
        (e.currentTarget as HTMLButtonElement).style.color =
          'var(--muted-foreground)';
      }}
    >
      {/* Arrow up icon */}
      <svg
        aria-hidden="true"
        fill="none"
        height="15"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        viewBox="0 0 24 24"
        width="15"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
