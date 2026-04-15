import pkg from '@/../package.json';
import { ProjectDetail } from '@/components/projects/project-detail';
import { StructuredData } from '@/components/structured-data';
import { getProjectBySlug, getProjectSlugs } from '@/lib/projects';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

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
  return getProjectSlugs().map((slug) => ({
    slug,
  }));
}

export async function generateMetadata(
  props: PageProps<'/projects/[slug]'>,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {};
  }

  const canonicalUrl = `${pkg.seo.og.url}${project.route}`;
  const image = resolveImageUrl(project.detail.logo || project.logo);

  return {
    title: `${project.name} | 作品`,
    description: project.description,
    keywords: project.tags,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${project.name} | ${pkg.seo.siteName}`,
      description: project.description,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: image,
          alt: project.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.name} | ${pkg.seo.siteName}`,
      description: project.description,
      images: [
        {
          url: image,
          alt: project.name,
        },
      ],
    },
  };
}

export default async function ProjectDetailPage(
  props: PageProps<'/projects/[slug]'>,
) {
  const { slug } = await props.params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const canonicalUrl = `${pkg.seo.og.url}${project.route}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': project.repo ? 'SoftwareSourceCode' : 'CreativeWork',
    name: project.name,
    description: project.description,
    datePublished: project.publishedAt,
    url: canonicalUrl,
    keywords: project.tags.join(', '),
    codeRepository: project.repo,
    sameAs: [project.url, project.repo].filter(Boolean),
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
    <>
      <StructuredData data={jsonLd} id={`project-jsonld-${project.slug}`} />
      <ProjectDetail project={project} />
    </>
  );
}
