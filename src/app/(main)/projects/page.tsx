import { ProjectGrid } from '@/components/projects/project-card';
import { getProjects } from '@/lib/projects';
import type { Metadata } from 'next';

import pkg from '../../../../package.json';

const projectsUrl = `${pkg.seo.og.url}/projects`;

export const metadata: Metadata = {
  title: '作品',
  description: '个人项目与开源作品展示。',
  alternates: {
    canonical: projectsUrl,
  },
  openGraph: {
    title: `${pkg.seo.siteName} — 作品`,
    description: '个人项目与开源作品展示。',
    url: projectsUrl,
    type: 'website',
    images: [
      {
        url: pkg.seo.og.image,
        alt: pkg.seo.og.title,
      },
    ],
  },
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <section className="container">
      <ProjectGrid projects={projects} />
    </section>
  );
}
