import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';

import { PROJECT_SOURCES } from './projects-source';
import type {
  ProjectSource,
  ProjectSourceAsset,
  ProjectSourceResource,
  ProjectSourceScreenshot,
  ProjectSourceUrls,
} from './projects-source';

type ProjectScreenshot = {
  image: string;
};

type ProjectAsset = {
  label?: string;
  image: string;
};

export type ProjectHeroAction = {
  kind: 'website' | 'ios' | 'android' | 'qr';
  label: string;
  url?: string;
  imageSrc?: string;
};

export type ProjectHero = {
  metaLine: string;
  actions: ProjectHeroAction[];
  compact?: boolean;
};

export type ProjectMetric = {
  label: string;
  value: string;
  sub?: string;
  href?: string;
};

export type ProjectAttribute = {
  label: string;
  module?: string;
  value?: string;
  url?: string;
  kind?: string;
  type?: string;
};

export type ProjectResource = {
  label: string;
  url?: string;
  kind?: string;
  text?: string;
};

export type ProjectPeriod = {
  start: string;
  end?: string | null;
  ongoing?: boolean;
  text: string;
};

export type ProjectDevelopment = {
  name: string;
  period?: ProjectPeriod;
  summary: string[];
  techStack?: string[];
  resources?: ProjectResource[];
  screenshots?: ProjectScreenshot[];
  assets?: ProjectAsset[];
};

const PUBLIC_ROOT = join(process.cwd(), 'public');

export type Project = {
  slug: string;
  name: string;
  route: string;
  sourceRoute?: string;
  logo?: string;
  description: string;
  tags: string[];
  listTags: string[];
  url?: string;
  repo?: string;
  companyName?: string;
  ageRating?: string;
  category?: string;
  industry?: string;
  categories: string[];
  platforms: string[];
  langs: string[];
  priceLabel?: string;
  sourceUrls: ProjectSourceUrls;
  publishedAt?: string;
  timeLabel?: string;
  headline?: string;
  attributes: ProjectAttribute[];
  hero: ProjectHero;
  metrics: ProjectMetric[];
  screenshots: ProjectScreenshot[];
  introduction: string[];
  development: ProjectDevelopment[];
};

function compareProjectSourceBySortOrder(
  left: ProjectSource,
  right: ProjectSource,
) {
  const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  const leftStart = left.startDate || '';
  const rightStart = right.startDate || '';

  const dateDiff = rightStart.localeCompare(leftStart);

  if (dateDiff !== 0) {
    return dateDiff;
  }

  return left.name.localeCompare(right.name, 'zh-CN');
}

function normalizeTagKey(tag: string) {
  return tag.trim().toLowerCase();
}

function appendProjectTag(result: string[], seen: Set<string>, tag?: string) {
  if (!tag) {
    return;
  }

  const value = tag.trim();

  if (!value) {
    return;
  }

  const key = normalizeTagKey(value);

  if (seen.has(key)) {
    return;
  }

  seen.add(key);
  result.push(value);
}

function collectProjectTags(
  tagGroups: Array<readonly string[] | undefined>,
  limit?: number,
) {
  const tags: string[] = [];
  const seen = new Set<string>();

  for (const group of tagGroups) {
    for (const tag of group || []) {
      appendProjectTag(tags, seen, tag);

      if (limit && tags.length >= limit) {
        return tags;
      }
    }
  }

  return tags;
}

function getProjectListTags(projectSource: ProjectSource) {
  return collectProjectTags(
    [
      projectSource.industry ? [projectSource.industry] : [],
      projectSource.categories,
      projectSource.platforms,
      projectSource.tags,
    ],
    6,
  );
}

function getProjectTags(projectSource: ProjectSource) {
  return collectProjectTags(
    [
      projectSource.tags,
      projectSource.techStack,
      projectSource.categories,
      projectSource.platforms,
      projectSource.langs,
      projectSource.industry ? [projectSource.industry] : [],
    ],
    8,
  );
}

function getProjectOverview(projectSource: ProjectSource) {
  return (
    projectSource.overview ||
    projectSource.description ||
    projectSource.headline ||
    projectSource.introduction?.[0] ||
    projectSource.summary?.[0] ||
    ''
  );
}

function readProjectSources(): ProjectSource[] {
  return [...PROJECT_SOURCES].sort(compareProjectSourceBySortOrder);
}

function getFileName(filePath: string) {
  const segments = filePath.split(/[\\/]/).filter(Boolean);

  return segments.at(-1) || filePath;
}

function hasPublicAsset(publicPath: string) {
  return existsSync(join(PUBLIC_ROOT, publicPath.replace(/^\//, '')));
}

function normalizePublicAssetPath(image: string) {
  if (image.startsWith('/')) {
    return hasPublicAsset(image) ? image : undefined;
  }

  if (image.startsWith('public/')) {
    const publicPath = `/${image.slice('public/'.length)}`;

    return hasPublicAsset(publicPath) ? publicPath : undefined;
  }

  if (image.startsWith('src/public/')) {
    const publicPath = `/${image.slice('src/public/'.length)}`;

    return hasPublicAsset(publicPath) ? publicPath : undefined;
  }

  const fallbackPath = `/assets/projects/${getFileName(image)}`;

  return hasPublicAsset(fallbackPath) ? fallbackPath : undefined;
}

function normalizeLogoPath(image?: string) {
  if (!image) {
    return undefined;
  }

  if (/^https?:\/\//.test(image)) {
    return image;
  }

  return normalizePublicAssetPath(image);
}

function normalizeImagePath(image?: string) {
  if (!image) {
    return undefined;
  }

  if (/^https?:\/\//.test(image)) {
    return image;
  }

  return normalizePublicAssetPath(image);
}

function isNonEmptyString(value: string | undefined): value is string {
  return Boolean(value);
}

function normalizeText(value?: string | null) {
  const nextValue = value?.trim();

  return nextValue || undefined;
}

function normalizeStringList(values?: readonly string[]) {
  return (values || []).map(normalizeText).filter(isNonEmptyString);
}

function normalizeSourceUrls(projectSource: ProjectSource): ProjectSourceUrls {
  return {
    official: normalizeText(projectSource.urls?.official),
    web: normalizeText(projectSource.urls?.web),
    ios: normalizeText(projectSource.urls?.ios),
    android: normalizeText(projectSource.urls?.android),
    mp: normalizeText(projectSource.urls?.mp),
  };
}

function getProjectCompanyUrl(urls: ProjectSourceUrls) {
  return urls.official || urls.web;
}

function getPrimaryProjectUrl(urls: ProjectSourceUrls) {
  return urls.web || urls.official || urls.ios || urls.android;
}

function normalizePriceLabel(price?: string | number) {
  if (price === undefined || price === null) {
    return undefined;
  }

  if (typeof price === 'number') {
    return price === 0 ? '免费' : String(price);
  }

  return normalizeText(price);
}

function normalizeResource(resource: ProjectSourceResource): ProjectResource {
  return {
    label: resource.label,
    url: resource.url,
    kind: resource.kind,
    text: resource.text,
  };
}

function normalizeScreenshots(screenshots?: ProjectSourceScreenshot[]) {
  const seen = new Set<string>();

  return (screenshots || []).reduce<ProjectScreenshot[]>((result, item) => {
    const image = normalizeImagePath(item.image);

    if (!image || seen.has(image)) {
      return result;
    }

    seen.add(image);
    result.push({ image });
    return result;
  }, []);
}

function normalizeAssets(assets?: ProjectSourceAsset[]) {
  return (assets || []).reduce<ProjectAsset[]>((result, item) => {
    const image = normalizeImagePath(item.image);

    if (!image) {
      return result;
    }

    result.push({
      label: item.label,
      image,
    });

    return result;
  }, []);
}

function normalizeEndDate(endDate?: string | null) {
  const value = normalizeText(endDate);

  if (!value || value === '至今') {
    return undefined;
  }

  return value;
}

function buildPeriod(projectSource: ProjectSource): ProjectPeriod | undefined {
  const start = normalizeText(projectSource.startDate);

  if (!start) {
    return undefined;
  }

  const end = normalizeEndDate(projectSource.endDate);
  const ongoing = Boolean(projectSource.ongoing || !end);

  return {
    start,
    end: end ?? null,
    ongoing,
    text: `${start} ～ ${ongoing ? '至今' : end}`,
  };
}

function buildProjectHeroActions(urls: ProjectSourceUrls): ProjectHeroAction[] {
  const actions: ProjectHeroAction[] = [];

  if (urls.web) {
    actions.push({
      kind: 'website',
      label: '在线体验',
      url: urls.web,
    });
  }

  if (urls.ios) {
    actions.push({
      kind: 'ios',
      label: 'iOS 下载',
      url: urls.ios,
    });
  }

  if (urls.android) {
    actions.push({
      kind: 'android',
      label: 'Android 下载',
      url: urls.android,
    });
  }

  if (urls.mp) {
    actions.push({
      kind: 'qr',
      label: '小程序二维码',
      imageSrc: urls.mp,
    });
  }

  return actions;
}

function buildProjectMetrics(
  projectSource: ProjectSource,
  urls: ProjectSourceUrls,
  priceLabel?: string,
): ProjectMetric[] {
  const metrics: ProjectMetric[] = [];
  const period = buildPeriod(projectSource);
  const categories = normalizeStringList(projectSource.categories);
  const platforms = normalizeStringList(projectSource.platforms);
  const langs = normalizeStringList(projectSource.langs);
  const companyUrl = getProjectCompanyUrl(urls);

  if (period) {
    metrics.push({
      label: '项目周期',
      value: period.text,
      sub: '交付跨度',
    });
  }

  if (projectSource.industry || categories.length > 0) {
    const value = projectSource.industry || categories[0];
    const sub = categories.join(' / ');

    if (value) {
      metrics.push({
        label: '分类',
        value,
        sub: sub || undefined,
      });
    }
  }

  if (platforms.length > 0) {
    metrics.push({
      label: '平台',
      value: platforms.join(' / '),
    });
  }

  if (langs.length > 0) {
    metrics.push({
      label: '语言',
      value: `${langs.length} 种`,
      sub: langs.join(' / '),
    });
  }

  if (projectSource.companyName) {
    metrics.push({
      label: '提供者',
      value: projectSource.companyName,
      href: companyUrl,
    });
  }

  if (projectSource.ageRating) {
    metrics.push({
      label: '年龄',
      value: projectSource.ageRating,
    });
  }

  if (projectSource.category) {
    metrics.push({
      label: '类别',
      value: projectSource.category,
    });
  }

  if (priceLabel) {
    metrics.push({
      label: '价格',
      value: priceLabel,
    });
  }

  return metrics;
}

function buildProjectAttributes(
  projectSource: ProjectSource,
  urls: ProjectSourceUrls,
  priceLabel?: string,
): ProjectAttribute[] {
  const attributes: ProjectAttribute[] = [];
  const platforms = normalizeStringList(projectSource.platforms);
  const langs = normalizeStringList(projectSource.langs);
  const companyUrl = getProjectCompanyUrl(urls);

  if (urls.web) {
    attributes.push({
      label: '线上地址',
      module: projectSource.name,
      value: urls.web,
      url: urls.web,
      kind: 'website',
    });
  }

  if (urls.official && urls.official !== urls.web) {
    attributes.push({
      label: '官网地址',
      module: projectSource.companyName || projectSource.name,
      value: urls.official,
      url: urls.official,
      kind: 'website',
    });
  }

  if (urls.ios) {
    attributes.push({
      label: '苹果客户端',
      module: projectSource.name,
      value: urls.ios,
      url: urls.ios,
      kind: 'app-store',
    });
  }

  if (urls.android) {
    attributes.push({
      label: '安卓客户端',
      module: projectSource.name,
      value: urls.android,
      url: urls.android,
      kind: 'android',
    });
  }

  if (urls.mp) {
    attributes.push({
      label: '小程序二维码',
      module: projectSource.name,
      value: urls.mp,
      url: urls.mp,
      kind: 'qr-code',
      type: 'image',
    });
  }

  if (projectSource.companyName) {
    attributes.push({
      label: '提供者',
      value: projectSource.companyName,
      url: companyUrl,
    });
  }

  if (platforms.length > 0) {
    attributes.push({
      label: '适用平台',
      value: platforms.join(' / '),
    });
  }

  if (langs.length > 0) {
    attributes.push({
      label: '语言',
      value: langs.join(' / '),
    });
  }

  if (priceLabel) {
    attributes.push({
      label: '价格',
      value: priceLabel,
    });
  }

  return attributes;
}

function buildProjectDevelopment(
  projectSource: ProjectSource,
): ProjectDevelopment[] {
  const summary = normalizeStringList(projectSource.summary);
  const techStack = normalizeStringList(projectSource.techStack);
  const resources = (projectSource.resources || []).map(normalizeResource);
  const screenshots = normalizeScreenshots(projectSource.screenshots);
  const assets = normalizeAssets(projectSource.assets);

  if (
    summary.length === 0 &&
    techStack.length === 0 &&
    resources.length === 0 &&
    screenshots.length === 0 &&
    assets.length === 0
  ) {
    return [];
  }

  return [
    {
      name: projectSource.name,
      period: buildPeriod(projectSource),
      summary,
      techStack,
      resources,
      screenshots,
      assets,
    },
  ];
}

function buildHeroMetaLine(projectSource: ProjectSource) {
  const parts = [
    buildPeriod(projectSource)?.text,
    normalizeStringList(projectSource.platforms).join(' / ') || undefined,
  ].filter(isNonEmptyString);

  return parts.join(' · ');
}

function toProject(projectSource: ProjectSource): Project {
  const sourceUrls = normalizeSourceUrls(projectSource);
  const priceLabel = normalizePriceLabel(projectSource.price);
  const development = buildProjectDevelopment(projectSource);
  const categories = normalizeStringList(projectSource.categories);
  const platforms = normalizeStringList(projectSource.platforms);
  const langs = normalizeStringList(projectSource.langs);
  const timeline = buildPeriod(projectSource);
  const screenshots = normalizeScreenshots(projectSource.screenshots);
  const introduction = normalizeStringList(projectSource.introduction);
  const overview = getProjectOverview(projectSource);

  return {
    slug: projectSource.slug,
    name: projectSource.name,
    route: `/projects/${projectSource.slug}`,
    sourceRoute: projectSource.route,
    logo: normalizeLogoPath(projectSource.logo),
    description: overview,
    tags: getProjectTags(projectSource),
    listTags: getProjectListTags(projectSource),
    url: getPrimaryProjectUrl(sourceUrls),
    repo: projectSource.repo,
    companyName: projectSource.companyName,
    ageRating: normalizeText(projectSource.ageRating),
    category: normalizeText(projectSource.category),
    industry: projectSource.industry,
    categories,
    platforms,
    langs,
    priceLabel,
    sourceUrls,
    publishedAt: timeline?.start,
    timeLabel: timeline?.text,
    headline: projectSource.headline || overview,
    attributes: buildProjectAttributes(projectSource, sourceUrls, priceLabel),
    hero: {
      metaLine: buildHeroMetaLine(projectSource),
      actions: buildProjectHeroActions(sourceUrls),
      compact: Boolean(sourceUrls.ios || sourceUrls.android || sourceUrls.mp),
    },
    metrics: buildProjectMetrics(projectSource, sourceUrls, priceLabel),
    screenshots,
    introduction: introduction.length > 0 ? introduction : [overview],
    development,
  };
}

export const getProjects = cache((): Project[] => {
  return readProjectSources().map(toProject);
});

export const getProjectBySlug = cache((slug: string): Project | undefined => {
  return getProjects().find((project) => project.slug === slug);
});

export const getProjectSlugs = cache((): string[] => {
  return getProjects().map((project) => project.slug);
});
