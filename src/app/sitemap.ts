import { getBlogLastModified, getBlogPosts } from '@/lib/blog';
import type { MetadataRoute } from 'next';

import pkg from '../../package.json';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: pkg.seo.og.url,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${pkg.seo.og.url}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...getBlogPosts().map((post) => ({
      url: `${pkg.seo.og.url}/blog/${post.slug}`,
      lastModified: getBlogLastModified(post.metadata.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
