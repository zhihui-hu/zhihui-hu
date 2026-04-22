'use client';

import { BlogLink } from '@/components/blog/blog-link';
import { BlogThemeToggle } from '@/components/blog/theme-toggle';
import { BLOG_NAV_BACK_TRANSITION } from '@/components/blog/view-transitions';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navItems: Array<{
  href: string;
  name: string;
  external?: boolean;
  transitionTypes?: string[];
}> = [
  {
    href: '/',
    name: '主页',
  },
  {
    href: '/blog',
    name: '博客',
    transitionTypes: [BLOG_NAV_BACK_TRANSITION],
  },
  {
    href: '/projects',
    name: '项目',
  },
];

export function BlogNavbar() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 isolate mb-4 overflow-hidden  bg-background/80 backdrop-blur-2xl backdrop-saturate-150 supports-backdrop-filter:bg-background/42 sm:mb-8',
        isVisible ? 'translate-y-0' : '-translate-y-[120%]',
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-background/95 via-background/78 to-background/90 supports-backdrop-filter:from-background/72 supports-backdrop-filter:via-background/38 supports-backdrop-filter:to-background/58"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/45"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-foreground/12 to-transparent"
      />
      <nav
        className="fade container mx-auto relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8"
        id="blog-nav"
      >
        <div className="flex min-w-0 flex-1 flex-row gap-4 overflow-x-auto pr-2 sm:gap-6">
          {navItems.map((item) => (
            <BlogLink
              key={item.href}
              className="flex shrink-0 cursor-pointer items-center py-1 transition-all hover:text-foreground"
              href={item.href}
              rel={item.external ? 'noreferrer' : undefined}
              target={item.external ? '_blank' : undefined}
              transitionTypes={item.transitionTypes}
            >
              {item.name}
            </BlogLink>
          ))}
        </div>
        <BlogThemeToggle />
      </nav>
    </header>
  );
}
