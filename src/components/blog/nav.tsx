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
        'sticky top-0 z-40 mb-4 border-b border-border/55 bg-background/62 shadow-sm shadow-black/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/38 sm:mb-8',
        isVisible ? 'translate-y-0' : '-translate-y-[120%]',
      )}
    >
      <nav
        className="fade container mx-auto relative flex items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8"
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
