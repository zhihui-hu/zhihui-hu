'use client';

import { BlogLink } from '@/components/blog/blog-link';
import { BlogThemeToggle } from '@/components/blog/theme-toggle';
import { BLOG_NAV_BACK_TRANSITION } from '@/components/blog/view-transitions';
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
      className={`sticky top-0 z-40 -mx-4 mb-8 bg-background/80 px-4 pt-6 pb-2 backdrop-blur-md sm:-mx-6 sm:px-6 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-[120%]'
      }`}
    >
      <nav
        className="fade relative flex items-center justify-between gap-3 px-0 pb-0 md:relative md:overflow-auto md:scroll-pr-6"
        id="blog-nav"
      >
        <div className="flex min-w-0 flex-1 flex-row pr-2 gap-6">
          {navItems.map((item) => (
            <BlogLink
              key={item.href}
              className=" flex cursor-pointer items-center py-1 transition-all hover:text-foreground"
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
