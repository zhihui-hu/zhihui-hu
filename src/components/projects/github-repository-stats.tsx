'use client';

import { AnimatedCounter } from '@/components/ui/animated-counter';
import {
  type GitHubRepositoryStats as GitHubRepositoryStatsData,
  getGitHubRepository,
  githubRepositoryQueryOptions,
} from '@/lib/github';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { GitForkIcon, StarIcon } from 'lucide-react';
import { useInView } from 'motion/react';
import { useRef } from 'react';

type GitHubRepositoryStatsProps = {
  repo: string;
  initialStats?: GitHubRepositoryStatsData;
  className?: string;
  variant?: 'default' | 'hero';
};

export function GitHubRepositoryStats({
  repo,
  initialStats,
  className,
  variant = 'default',
}: GitHubRepositoryStatsProps) {
  const repository = getGitHubRepository(repo);
  const { data, isPending, isError } = useQuery(
    githubRepositoryQueryOptions(repo, initialStats),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  // counters start at 0 and roll up once the card scrolls into view
  const inView = useInView(rootRef, { once: true, margin: '0px 0px -10% 0px' });

  if (!repository) {
    return null;
  }

  const metrics = [
    {
      label: 'Star',
      icon: StarIcon,
      iconClassName: 'fill-amber-400 text-amber-500',
      count: data?.stargazers_count,
      href: `${repository.url}/stargazers`,
    },
    {
      label: 'Fork',
      icon: GitForkIcon,
      iconClassName: 'text-sky-500',
      count: data?.forks_count,
      href: `${repository.url}/forks`,
    },
  ];

  const title = isError
    ? '暂时无法获取 GitHub 数据，点击前往仓库查看'
    : undefined;
  const renderCount = (count: number | undefined, className: string) =>
    count === undefined ? (
      <span className={cn('tabular-nums', className)}>
        {isPending ? '…' : '—'}
      </span>
    ) : (
      <AnimatedCounter className={className} value={inView ? count : 0} />
    );

  if (variant === 'hero') {
    return (
      <div
        aria-busy={isPending}
        className={cn('flex items-center gap-0.5', className)}
        ref={rootRef}
      >
        {metrics.map(({ label, icon: Icon, iconClassName, count, href }) => (
          <a
            aria-label={`${label} ${count ?? ''}`}
            className="flex h-7 items-center gap-1.5 rounded-full px-2 transition-colors [corner-shape:round] hover:bg-foreground/[0.06]"
            href={href}
            key={label}
            rel="noopener noreferrer"
            target="_blank"
            title={title ?? label}
          >
            <Icon aria-hidden="true" className={cn('size-4', iconClassName)} />
            {renderCount(
              count,
              'text-[0.95rem] leading-5 font-semibold tracking-[-0.01em] text-foreground',
            )}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div
      aria-busy={isPending}
      className={cn(
        'flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground',
        className,
      )}
      ref={rootRef}
    >
      {metrics.map(({ label, icon: Icon, iconClassName, count, href }) => (
        <a
          className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          href={href}
          key={label}
          rel="noopener noreferrer"
          target="_blank"
          title={title}
        >
          <Icon aria-hidden="true" className={cn('size-3.5', iconClassName)} />
          <span>{label}</span>
          {renderCount(count, 'font-medium text-foreground')}
        </a>
      ))}
    </div>
  );
}
