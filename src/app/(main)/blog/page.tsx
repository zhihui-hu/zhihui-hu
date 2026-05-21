import pkg from '@/../package.json';
import { BlogPosts } from '@/components/blog/posts';
import { formatBlogDate, getBlogPosts } from '@/lib/blog';
import type { Metadata } from 'next';

const blogUrl = `${pkg.seo.og.url}/blog`;

export const metadata: Metadata = {
  title: '博客',
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
  const posts = getBlogPosts().map((post) => ({
    ...post,
    formattedPublishedAt: formatBlogDate(post.metadata.publishedAt),
  }));

  return (
    <section className="container mx-auto px-4 py-2 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          博客
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          记录软件开发、AI 应用和工程化实践。
        </p>
      </header>

      <div>
        <BlogPosts enableNativeTransition posts={posts} />
      </div>
    </section>
  );
}
