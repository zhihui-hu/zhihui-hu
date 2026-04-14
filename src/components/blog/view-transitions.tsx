import { ViewTransition } from 'react';

export const BLOG_NAV_FORWARD_TRANSITION = 'blog-nav-forward';
export const BLOG_NAV_BACK_TRANSITION = 'blog-nav-back';

const blogPageTransitionClasses = {
  [BLOG_NAV_FORWARD_TRANSITION]: 'blog-page-forward',
  [BLOG_NAV_BACK_TRANSITION]: 'blog-page-back',
  default: 'none',
} as const;

export function getBlogTitleTransitionName(slug: string) {
  return `blog-title-${slug}`;
}

export function BlogPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransition
      default="none"
      enter={blogPageTransitionClasses}
      exit={blogPageTransitionClasses}
    >
      {children}
    </ViewTransition>
  );
}

export function BlogTitleTransition({
  children,
  slug,
}: {
  children: React.ReactNode;
  slug: string;
}) {
  return (
    <ViewTransition
      default="none"
      name={getBlogTitleTransitionName(slug)}
      share="blog-title-share"
    >
      {children}
    </ViewTransition>
  );
}
