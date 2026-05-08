import { cache } from 'react';

import { OPEN_SOURCE_SOURCES } from './open-source-source';
import {
  getItemBySlug,
  getItemGroups,
  getItemSlugs,
  getItemsFromSources,
} from './projects';

export const getOpenSourceProjects = cache(() => {
  return getItemsFromSources(OPEN_SOURCE_SOURCES, {
    routeBase: '/open-source',
    defaultFamily: {
      key: 'open-source',
      title: '开源项目',
      description: '自己写、自己用，也适合拿出去复用的开源工具。',
      sortOrder: 1,
    },
  });
});

export const getOpenSourceGroups = cache(() => {
  return getItemGroups(getOpenSourceProjects());
});

export const getOpenSourceBySlug = cache((slug: string) => {
  return getItemBySlug(getOpenSourceProjects(), slug);
});

export const getOpenSourceSlugs = cache(() => {
  return getItemSlugs(getOpenSourceProjects());
});
