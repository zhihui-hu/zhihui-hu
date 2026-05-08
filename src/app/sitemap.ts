import { getBlogLastModified, getBlogPosts } from '@/lib/blog';
import { getOpenSourceProjects } from '@/lib/open-source';
import { getProjects } from '@/lib/projects';
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
    {
      url: `${pkg.seo.og.url}/projects`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${pkg.seo.og.url}/open-source`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...getBlogPosts().map((post) => ({
      url: `${pkg.seo.og.url}/blog/${post.slug}`,
      lastModified: getBlogLastModified(post.metadata.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...getProjects().map((project) => ({
      url: `${pkg.seo.og.url}${project.route}`,
      lastModified: project.publishedAt
        ? new Date(project.publishedAt)
        : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...getOpenSourceProjects().map((project) => ({
      url: `${pkg.seo.og.url}${project.route}`,
      lastModified: project.publishedAt
        ? new Date(project.publishedAt)
        : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
