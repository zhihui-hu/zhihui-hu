import { ProjectGroupList } from '@/components/projects/project-card';
import { getOpenSourceGroups } from '@/lib/open-source';
import type { Metadata } from 'next';

import pkg from '../../../../package.json';

const openSourceUrl = `${pkg.seo.og.url}/open-source`;

export const metadata: Metadata = {
  title: '开源项目',
  description: '个人开源项目与工具展示。',
  alternates: {
    canonical: openSourceUrl,
  },
  openGraph: {
    title: `${pkg.seo.siteName} — 开源项目`,
    description: '个人开源项目与工具展示。',
    url: openSourceUrl,
    type: 'website',
    images: [
      {
        url: pkg.seo.og.image,
        alt: pkg.seo.og.title,
      },
    ],
  },
};

export default function OpenSourcePage() {
  const groups = getOpenSourceGroups();

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          开源项目
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          自己写、自己用，也适合复用的工具项目。
        </p>
      </header>

      <ProjectGroupList
        enableNativeTransition
        groups={groups}
        showCompanyName={false}
      />
    </section>
  );
}
