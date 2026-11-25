'use client';

import { ROUTE_LIST_NAVIGATION_TRANSITION } from '@/components/route-view-transitions';
import { ThemeToggleButton } from '@/components/theme/theme-toggle-button';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const navItems: Array<{ href: string; name: string }> = [
  { href: '/', name: '主页' },
  { href: '/blog', name: '博客' },
  { href: '/projects', name: '项目' },
  { href: '/open-source', name: '开源' },
];

const GITHUB_URL = 'https://github.com/zhihui-hu/';

const BUMP_SPRING = { type: 'spring', stiffness: 400, damping: 30 } as const;
const BAR_SPRING = {
  type: 'spring',
  stiffness: 320,
  damping: 24,
  mass: 0.8,
} as const;

// frosted glass pill shared by every group in the bar
const pill = cn(
  'pointer-events-auto flex h-10 items-center rounded-full [corner-shape:round]',
  'bg-white/65 ring-1 ring-black/[0.04] backdrop-blur-2xl backdrop-saturate-150',
  'dark:bg-white/[0.07] dark:ring-white/[0.06]',
  'shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)] dark:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.6)]',
);

function isActive(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
}

export function BlogNavbar() {
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState<string | null>(null);
  const [pressed, setPressed] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // tuck away while reading down, come back on any scroll up
      setHidden(y > lastY && y > 160);
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!pressed) return;
    const release = () => setPressed(null);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, [pressed]);

  const activeHref =
    navItems.findLast((item) => isActive(pathname, item.href))?.href ?? '/';

  return (
    <header
      className="pointer-events-none sticky top-0 z-40 mb-6 pt-4 sm:mb-10 sm:pt-5"
      id="blog-nav"
    >
      <motion.nav
        animate={{
          scale: scrolled && !hidden ? 0.98 : 1,
          y: hidden ? -88 : scrolled ? -4 : 0,
        }}
        aria-label="主导航"
        className="relative container mx-auto flex items-center justify-between gap-2 px-4 sm:px-6 lg:px-8"
        onMouseLeave={() => setHovered(null)}
        transition={reduced ? { duration: 0 } : BAR_SPRING}
      >
        <Link
          className={cn(
            pill,
            'hidden gap-2 pr-4 pl-1.5 text-sm font-semibold tracking-tight text-foreground sm:flex',
          )}
          href="/"
          transitionTypes={[ROUTE_LIST_NAVIGATION_TRANSITION]}
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-full bg-foreground text-[13px] font-bold text-background [corner-shape:round]"
          >
            胡
          </span>
          胡志辉
        </Link>

        <ul
          className={cn(
            pill,
            'gap-0.5 px-1 sm:absolute sm:left-1/2 sm:-translate-x-1/2',
          )}
        >
          {navItems.map((item) => {
            const active = item.href === activeHref;
            const bumped = hovered ? hovered === item.href : active;

            return (
              <li key={item.href}>
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-8 items-center rounded-full px-3.5 text-sm transition-colors duration-200 select-none [corner-shape:round] focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none',
                    active || hovered === item.href
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                  draggable={false}
                  href={item.href}
                  // top-level pages share post titles; don't morph them between lists
                  transitionTypes={[ROUTE_LIST_NAVIGATION_TRANSITION]}
                  onMouseEnter={() => setHovered(item.href)}
                  onPointerDown={() => {
                    setPressed(item.href);
                    setHovered(item.href);
                  }}
                >
                  <AnimatePresence>
                    {bumped && (
                      <motion.span
                        animate={{
                          opacity: 1,
                          scaleX: pressed ? 1.12 : 1,
                          scaleY: pressed ? 1.18 : 1,
                        }}
                        className={cn(
                          'absolute inset-0 rounded-full [corner-shape:round]',
                          'bg-black/[0.06] dark:bg-white/[0.1]',
                          'shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),inset_0_-1px_2px_0_rgba(0,0,0,0.05)]',
                          'dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),inset_0_-1px_2px_0_rgba(0,0,0,0.3)]',
                        )}
                        exit={{ opacity: 0 }}
                        initial={{ opacity: 0 }}
                        layoutId="blog-nav-bump"
                        transition={reduced ? { duration: 0 } : BUMP_SPRING}
                      />
                    )}
                  </AnimatePresence>
                  <span className="relative">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <a
            aria-label="GitHub"
            className={cn(
              pill,
              'w-10 justify-center text-muted-foreground transition-colors duration-200 hover:text-foreground',
            )}
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
            title="GitHub"
          >
            <GitHubLogo />
          </a>
          <ThemeToggleButton
            className={cn(
              pill,
              'size-10 justify-center border-0 p-0 text-muted-foreground hover:bg-white/65 hover:text-foreground dark:hover:bg-white/[0.07] [&_svg]:size-4',
            )}
          />
        </div>
      </motion.nav>
    </header>
  );
}

function GitHubLogo() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
