'use client';

import {
  type GitHubRepositoryStats as GitHubRepositoryStatsData,
  getGitHubRepository,
  githubRepositoryQueryOptions,
} from '@/lib/github';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GitForkIcon, StarIcon } from 'lucide-react';

type GitHubRepositoryStatsProps = {
  repo: string;
  initialStats?: GitHubRepositoryStatsData;
  className?: string;
};

export function GitHubRepositoryStats({
  repo,
  initialStats,
  className,
}: GitHubRepositoryStatsProps) {
  const repository = getGitHubRepository(repo);
  const { data, isPending, isError } = useQuery(
    githubRepositoryQueryOptions(repo, initialStats),
  );

  if (!repository) {
    return null;
  }

  const metrics = [
    {
      label: 'Star',
      icon: StarIcon,
      count: data?.stargazers_count,
      href: `${repository.url}/stargazers`,
    },
    {
      label: 'Fork',
      icon: GitForkIcon,
      count: data?.forks_count,
      href: `${repository.url}/forks`,
    },
  ];

  return (
    <div
      aria-busy={isPending}
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground',
        className,
      )}
    >
      {metrics.map(({ label, icon: Icon, count, href }) => (
        <a
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          href={href}
          key={label}
          rel="noopener noreferrer"
          target="_blank"
          title={
            isError ? '暂时无法获取 GitHub 数据，点击前往仓库查看' : undefined
          }
        >
          <Icon aria-hidden="true" className="size-3.5" />
          <span>{label}</span>
          <span className="font-medium tabular-nums text-foreground">
            {count?.toLocaleString('zh-CN') ?? (isPending ? '…' : '—')}
          </span>
        </a>
      ))}
    </div>
  );
}
