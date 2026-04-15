import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { cache } from 'react';

import productsSourceData from './projects-source.json';

type ProductSourceAttribute = {
  label: string;
  module?: string;
  kind?: string;
  url?: string;
  type?: string;
  text?: string;
};

type ProductSourceResource = {
  label: string;
  url?: string;
  kind?: string;
  text?: string;
};

type ProjectScreenshot = {
  image: string;
};

type ProjectAsset = {
  label?: string;
  image: string;
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

export type ProjectDetail = {
  logo?: string;
  headline?: string;
  categories?: string[];
  attributes?: ProjectAttribute[];
  introduction: string[];
  development: ProjectDevelopment[];
};

type ProductSource = {
  slug: string;
  name: string;
  route?: string;
  url?: string;
  logo?: string;
  overview?: string;
  description?: string;
  tags: string[];
  detail: {
    logo?: string;
    headline?: string;
    categories?: string[];
    attributes?: ProductSourceAttribute[];
    introduction: string[];
    development: Array<{
      name: string;
      period?: ProjectPeriod;
      summary: string[];
      techStack?: string[];
      resources?: ProductSourceResource[];
      screenshots?: ProjectScreenshot[];
      assets?: ProjectAsset[];
    }>;
  };
};

type ProductSourceFile = {
  products: ProductSource[];
};

const PRODUCTS_SOURCE: ProductSourceFile = productsSourceData;
const PUBLIC_ROOT = join(process.cwd(), 'public');

export type Project = {
  slug: string;
  name: string;
  route: string;
  sourceRoute?: string;
  logo?: string;
  description: string;
  tags: string[];
  url?: string;
  repo?: string;
  publishedAt?: string;
  timeLabel?: string;
  detail: ProjectDetail;
};

function compareProjectByStartedAtDesc(left: Project, right: Project) {
  const leftStart = left.publishedAt || '';
  const rightStart = right.publishedAt || '';

  const dateDiff = rightStart.localeCompare(leftStart);

  if (dateDiff !== 0) {
    return dateDiff;
  }

  return left.name.localeCompare(right.name, 'zh-CN');
}

function normalizeTagKey(tag: string) {
  return tag.trim().toLowerCase();
}

function mergeProjectTags(product: ProductSource) {
  const tags: string[] = [];
  const seen = new Set<string>();
  const append = (tag?: string) => {
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
    tags.push(value);
  };

  for (const tag of product.tags || []) {
    append(tag);
  }

  for (const development of product.detail.development || []) {
    for (const tech of development.techStack || []) {
      if (tags.length >= 8) {
        return tags;
      }

      append(tech);
    }
  }

  return tags;
}

function getProjectOverview(product: ProductSource) {
  return product.overview || product.description || '';
}

function getPrimaryProjectUrl(product: ProductSource) {
  if (product.url) {
    return product.url;
  }

  return product.detail.attributes?.find(
    (attribute) => attribute.kind === 'website',
  )?.url;
}

function getRepositoryUrl(product: ProductSource) {
  return product.detail.attributes?.find(
    (attribute) => attribute.kind === 'repository',
  )?.url;
}

function readProductsSource(): ProductSource[] {
  return PRODUCTS_SOURCE.products || [];
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

function normalizeAttribute(
  attribute: ProductSourceAttribute,
): ProjectAttribute {
  return {
    label: attribute.label,
    module: attribute.module,
    value: attribute.text || attribute.module || attribute.url,
    url: attribute.url,
    kind: attribute.kind,
    type: attribute.type,
  };
}

function normalizeResource(resource: ProductSourceResource): ProjectResource {
  return {
    label: resource.label,
    url: resource.url,
    kind: resource.kind,
    text: resource.text,
  };
}

function normalizeDevelopment(
  development: ProductSource['detail']['development'][number],
): ProjectDevelopment {
  return {
    name: development.name,
    period: development.period,
    summary: development.summary || [],
    techStack: development.techStack || [],
    resources: (development.resources || []).map(normalizeResource),
    screenshots: (development.screenshots || [])
      .map((item) => normalizeImagePath(item.image))
      .filter(isNonEmptyString)
      .map((image) => ({
        image,
      })),
    assets: (development.assets || []).reduce<ProjectAsset[]>(
      (result, item) => {
        const image = normalizeImagePath(item.image);

        if (!image) {
          return result;
        }

        result.push({
          label: item.label,
          image,
        });

        return result;
      },
      [],
    ),
  };
}

function getProjectTimeline(product: ProductSource) {
  const periods = (product.detail.development || [])
    .map((item) => item.period)
    .filter((period): period is ProjectPeriod => Boolean(period?.start));

  if (periods.length === 0) {
    return {
      publishedAt: undefined,
      timeLabel: undefined,
    };
  }

  const starts = periods
    .map((period) => period.start)
    .sort((a, b) => a.localeCompare(b));
  const hasOngoing = periods.some((period) => period.ongoing || !period.end);
  const ends = periods
    .map((period) => period.end)
    .filter((end): end is string => Boolean(end))
    .sort((a, b) => a.localeCompare(b));
  const startedAt = starts[0];
  const endedAt = hasOngoing ? undefined : ends.at(-1);

  return {
    publishedAt: startedAt,
    timeLabel: startedAt ? `${startedAt} ～ ${endedAt || '至今'}` : undefined,
  };
}

function toProject(product: ProductSource): Project {
  const timeline = getProjectTimeline(product);

  return {
    slug: product.slug,
    name: product.name,
    route: `/projects/${product.slug}`,
    sourceRoute: product.route,
    logo: normalizeLogoPath(product.logo || product.detail.logo),
    description: getProjectOverview(product),
    tags: mergeProjectTags(product),
    url: getPrimaryProjectUrl(product),
    repo: getRepositoryUrl(product),
    publishedAt: timeline.publishedAt,
    timeLabel: timeline.timeLabel,
    detail: {
      logo: normalizeLogoPath(product.detail.logo || product.logo),
      headline: product.detail.headline || getProjectOverview(product),
      categories: product.detail.categories || [],
      attributes: (product.detail.attributes || []).map(normalizeAttribute),
      introduction: product.detail.introduction || [
        getProjectOverview(product),
      ],
      development: (product.detail.development || []).map(normalizeDevelopment),
    },
  };
}

export const getProjects = cache((): Project[] => {
  return readProductsSource()
    .map(toProject)
    .sort(compareProjectByStartedAtDesc);
});

export const getProjectBySlug = cache((slug: string): Project | undefined => {
  return getProjects().find((project) => project.slug === slug);
});

export const getProjectSlugs = cache((): string[] => {
  return getProjects().map((project) => project.slug);
});
