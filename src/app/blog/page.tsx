import { BlogPosts } from '@/components/blog/posts';
import { getBlogPosts } from '@/lib/blog';
import type { Metadata } from 'next';

import pkg from '../../../package.json';

const blogUrl = `${pkg.seo.og.url}/blog`;

export const metadata: Metadata = {
  title: 'Blog',
  description: '记录软件开发、AI 应用和工程化实践的文章列表。',
  alternates: {
    canonical: blogUrl,
    types: {
      'application/rss+xml': `${pkg.seo.og.url}/rss.xml`,
    },
  },
  openGraph: {
    title: `${pkg.seo.siteName} Blog`,
    description: '记录软件开发、AI 应用和工程化实践的文章列表。',
    url: blogUrl,
    type: 'website',
    images: [
      {
        url: pkg.seo.og.image,
        alt: pkg.seo.og.title,
      },
    ],
  },
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">Blog</h1>
      <BlogPosts posts={posts} />
    </section>
  );
}
