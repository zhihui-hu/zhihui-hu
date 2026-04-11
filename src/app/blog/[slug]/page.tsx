import { MarkdownBody } from '@/components/blog/markdown-body';
import { CustomMDX } from '@/components/blog/mdx';
import { formatBlogDate, getBlogPostBySlug, getBlogPosts } from '@/lib/blog';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import pkg from '../../../../package.json';

export const dynamicParams = false;

function resolveImageUrl(image?: string) {
  if (!image) {
    return pkg.seo.og.image;
  }

  return image.startsWith('http')
    ? image
    : new URL(image, pkg.seo.og.url).toString();
}

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(
  props: PageProps<'/blog/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {};
  }

  const canonicalUrl = `${pkg.seo.og.url}/blog/${post.slug}`;
  const image = resolveImageUrl(post.metadata.image);

  return {
    title: post.metadata.title,
    description: post.metadata.summary,
    keywords: post.metadata.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.summary,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.metadata.publishedAt || undefined,
      images: [
        {
          url: image,
          alt: post.metadata.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.metadata.title,
      description: post.metadata.summary,
      images: [
        {
          url: image,
          alt: post.metadata.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const articleUrl = `${pkg.seo.og.url}/blog/${post.slug}`;
  const articleImage = resolveImageUrl(post.metadata.image);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata.title,
    description: post.metadata.summary,
    datePublished: post.metadata.publishedAt || undefined,
    dateModified: post.metadata.publishedAt || undefined,
    image: articleImage,
    keywords: post.metadata.keywords?.join(', '),
    url: articleUrl,
    author: {
      '@type': 'Person',
      name: pkg.seo.author.name,
      url: pkg.seo.author.url,
    },
    publisher: {
      '@type': 'Person',
      name: pkg.seo.publisher,
      url: pkg.seo.author.url,
    },
  };

  return (
    <section className="mx-auto w-full">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        type="application/ld+json"
      />
      <header className="mb-8 border-b border-border/60 pb-6">
        <h1 className="title text-[clamp(2rem,5vw,2.9rem)] font-bold leading-tight tracking-[-0.04em] text-foreground">
          {post.metadata.title}
        </h1>
        <div className="mt-3 flex items-center text-sm text-muted-foreground">
          <p>{formatBlogDate(post.metadata.publishedAt)}</p>
        </div>
      </header>
      <MarkdownBody>
        <CustomMDX source={post.content} />
      </MarkdownBody>
    </section>
  );
}
