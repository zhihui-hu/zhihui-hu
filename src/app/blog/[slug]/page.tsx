import { MarkdownBody } from '@/components/blog/markdown-body';
import { renderBlogMdx } from '@/components/blog/mdx';
import { PostHeader } from '@/components/blog/post-header';
import { BlogRenderIssue } from '@/components/blog/render-issue';
import { ShareBar } from '@/components/blog/share-bar';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { parseToc } from '@/components/blog/toc';
import { BlogPageTransition } from '@/components/blog/view-transitions';
import { StructuredData } from '@/components/structured-data';
import { getBlogPostBySlug, getBlogPosts } from '@/lib/blog';
import { cn } from '@/lib/utils';
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
  const tocItems = parseToc(post.content);
  const hasToc = tocItems.length > 0;
  const renderedPost = await renderBlogMdx({
    source: post.content,
  });
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
    <BlogPageTransition>
      <section className="mx-auto w-full">
        <StructuredData data={jsonLd} id={`blog-post-jsonld-${post.slug}`} />
        <div
          className={cn(
            hasToc &&
              'flex flex-col gap-8 xl:grid xl:grid-cols-[minmax(0,1fr)_18rem] xl:gap-12',
          )}
        >
          {hasToc && (
            <aside className="order-1 hidden xl:order-2 xl:block">
              <div className="xl:sticky xl:top-(--blog-sticky-offset) xl:max-h-(--blog-sticky-max-height) xl:overflow-y-auto xl:pb-8">
                <TableOfContents
                  content={post.content}
                  initialItems={tocItems}
                />
              </div>
            </aside>
          )}

          <div
            className={cn(
              'min-w-0 w-full container',
              hasToc && 'order-2 xl:order-1',
            )}
          >
            <PostHeader post={post} />
            <MarkdownBody>
              {renderedPost.issue ? (
                <BlogRenderIssue issue={renderedPost.issue} />
              ) : (
                renderedPost.content
              )}
            </MarkdownBody>
            <ShareBar title={post.metadata.title} url={articleUrl} />
          </div>
        </div>
      </section>
    </BlogPageTransition>
  );
}
