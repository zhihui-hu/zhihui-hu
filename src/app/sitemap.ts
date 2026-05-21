import { getBlogLastModified, getBlogPosts } from '@/lib/blog';
import { getOpenSourceProjects } from '@/lib/open-source';
import { getProjects } from '@/lib/projects';
import type { MetadataRoute } from 'next';

import pkg from '../../package.json';

export const dynamic = 'force-static';

function latestDate(dates: Date[]) {
  const validDates = dates.filter((date) => Number.isFinite(date.getTime()));

  if (validDates.length === 0) {
    return new Date(0);
  }

  return new Date(Math.max(...validDates.map((date) => date.getTime())));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getBlogPosts();
  const projects = getProjects();
  const openSourceProjects = getOpenSourceProjects();
  const latestPostModified = latestDate(posts.map(getBlogLastModified));
  const latestProjectModified = latestDate(
    [...projects, ...openSourceProjects].map((project) =>
      project.publishedAt ? new Date(project.publishedAt) : new Date(0),
    ),
  );
  const latestSiteModified = latestDate([
    latestPostModified,
    latestProjectModified,
  ]);

  return [
    {
      url: pkg.seo.og.url,
      lastModified: latestSiteModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${pkg.seo.og.url}/blog`,
      lastModified: latestPostModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${pkg.seo.og.url}/projects`,
      lastModified: latestProjectModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${pkg.seo.og.url}/open-source`,
      lastModified: latestProjectModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${pkg.seo.og.url}/blog/${post.slug}`,
      lastModified: getBlogLastModified(post),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...projects.map((project) => ({
      url: `${pkg.seo.og.url}${project.route}`,
      lastModified: project.publishedAt
        ? new Date(project.publishedAt)
        : latestProjectModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...openSourceProjects.map((project) => ({
      url: `${pkg.seo.og.url}${project.route}`,
      lastModified: project.publishedAt
        ? new Date(project.publishedAt)
        : latestProjectModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
