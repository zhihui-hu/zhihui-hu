'use client';

import {
  type GitHubRepositoryStats,
  githubRepositoryQueryOptions,
  sortByGitHubStars,
} from '@/lib/github';
import { useQueries } from '@tanstack/react-query';
import type { ReactNode } from 'react';

type GitHubStarSortedGridProps = {
  items: {
    key: string;
    repo?: string;
    initialStats?: GitHubRepositoryStats;
    node: ReactNode;
  }[];
  className?: string;
};

/** 用最新的 Star 数重新排序（初始顺序已由构建时数据排好） */
export function GitHubStarSortedGrid({
  items,
  className,
}: GitHubStarSortedGridProps) {
  const stars = useQueries({
    queries: items.map((item) =>
      githubRepositoryQueryOptions(item.repo ?? '', item.initialStats),
    ),
    combine: (results) =>
      results.map((result) => result.data?.stargazers_count),
  });

  return (
    <div className={className}>
      {sortByGitHubStars(items, (_, index) => stars[index]).map((item) => (
        <div className="contents" key={item.key}>
          {item.node}
        </div>
      ))}
    </div>
  );
}
