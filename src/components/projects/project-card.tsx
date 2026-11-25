import { ProgressiveImage } from '@/components/progressive-image';
import {
  SharedElementTransition,
  getSharedMediaTransitionName,
  getSharedTitleTransitionName,
} from '@/components/route-view-transitions';
import type { GitHubRepositoryStats as GitHubRepositoryStatsData } from '@/lib/github';
import type { Project, ProjectGroup } from '@/lib/projects';
import { ArrowUpRightIcon } from 'lucide-react';
import Link from 'next/link';

import { GitHubRepositoryStats } from './github-repository-stats';
import { GitHubStarSortedGrid } from './github-star-sorted-grid';

type ProjectCardProps = {
  project: Project;
  githubStats?: GitHubRepositoryStatsData;
  enableNativeTransition?: boolean;
  showCompanyName?: boolean;
};

const MAX_CARD_TAGS = 3;

export function ProjectCard({
  project,
  githubStats,
  enableNativeTransition = false,
  showCompanyName = true,
}: ProjectCardProps) {
  const logo = project.logo ? (
    <ProgressiveImage
      alt={`${project.name} logo`}
      className="size-11 shrink-0 rounded-[24%] bg-background shadow-[0_1px_2px_rgb(0_0_0/0.06),0_4px_12px_-4px_rgb(0_0_0/0.12)] ring-1 ring-black/5 [corner-shape:squircle] dark:ring-white/10"
      fit="cover"
      sizes="44px"
      src={project.logo}
    />
  ) : (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-[24%] bg-muted text-base font-semibold text-foreground ring-1 ring-black/5 [corner-shape:squircle] dark:ring-white/10">
      {project.name.slice(0, 1).toUpperCase()}
    </div>
  );
  const title = <span>{project.name}</span>;
  const meta = [
    showCompanyName ? project.companyName : undefined,
    project.timeLabel,
  ].filter(Boolean);
  const hasStats =
    project.route.startsWith('/open-source/') && Boolean(project.repo);
  const visibleTags = project.listTags.slice(0, MAX_CARD_TAGS);
  const hiddenTagCount = project.listTags.length - visibleTags.length;

  return (
    <article className="group relative flex h-full flex-col rounded-[22px] bg-card/55 p-4 ring-1 ring-border/50 transition-colors duration-200 [corner-shape:squircle] hover:bg-card">
      <div className="flex items-center gap-3">
        {enableNativeTransition ? (
          <SharedElementTransition
            name={getSharedMediaTransitionName('project', project.slug)}
            share="route-shared-media"
          >
            {logo}
          </SharedElementTransition>
        ) : (
          logo
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[0.98rem] font-semibold leading-5 tracking-[-0.01em] text-foreground">
            {/* the link stretches over the whole card; stats links sit above it */}
            <Link
              className="outline-none after:absolute after:inset-0 after:rounded-[22px] after:[corner-shape:squircle] focus-visible:after:ring-2 focus-visible:after:ring-ring/60"
              href={project.route}
            >
              {enableNativeTransition ? (
                <SharedElementTransition
                  name={getSharedTitleTransitionName('project', project.slug)}
                >
                  {title}
                </SharedElementTransition>
              ) : (
                title
              )}
            </Link>
          </h3>
          {meta.length > 0 && (
            <p className="mt-0.5 truncate text-xs leading-4 text-muted-foreground">
              {meta.join(' · ')}
            </p>
          )}
        </div>

        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center self-start rounded-full bg-foreground/[0.05] text-muted-foreground transition-[background-color,color] duration-300 [corner-shape:round] group-hover:bg-foreground group-hover:text-background motion-reduce:transition-none"
        >
          <ArrowUpRightIcon className="size-3.5 transition-[translate] duration-300 group-hover:translate-x-px group-hover:-translate-y-px motion-reduce:transition-none" />
        </span>
      </div>

      {project.description && (
        <p
          className="mt-2.5 line-clamp-2 text-[0.8rem] leading-5 text-muted-foreground"
          title={project.description}
        >
          {project.description}
        </p>
      )}

      {(visibleTags.length > 0 || hasStats) && (
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <ul className="flex min-w-0 flex-wrap gap-1">
            {visibleTags.map((tag) => (
              <li
                className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-[11px] leading-4 font-medium text-foreground/70 [corner-shape:round]"
                key={tag}
              >
                {tag}
              </li>
            ))}
            {hiddenTagCount > 0 && (
              <li
                className="rounded-full px-1.5 py-0.5 text-[11px] leading-4 text-muted-foreground [corner-shape:round]"
                title={project.listTags.slice(MAX_CARD_TAGS).join('、')}
              >
                +{hiddenTagCount}
              </li>
            )}
          </ul>

          {hasStats && (
            <GitHubRepositoryStats
              className="relative z-10 -mr-2 shrink-0"
              initialStats={githubStats}
              repo={project.repo!}
              variant="hero"
            />
          )}
        </div>
      )}
    </article>
  );
}

type ProjectGridProps = {
  projects: Project[];
  enableNativeTransition?: boolean;
  showCompanyName?: boolean;
  /** 传入时按 GitHub Star 数排序 */
  githubStats?: Record<string, GitHubRepositoryStatsData>;
};

export function ProjectGrid({
  projects,
  enableNativeTransition = false,
  showCompanyName = true,
  githubStats,
}: ProjectGridProps) {
  const className = 'grid grid-cols-1 gap-3 sm:grid-cols-2';
  const renderCard = (project: Project) => (
    <ProjectCard
      enableNativeTransition={enableNativeTransition}
      githubStats={githubStats?.[project.slug]}
      key={project.slug}
      project={project}
      showCompanyName={showCompanyName}
    />
  );

  if (githubStats) {
    return (
      <GitHubStarSortedGrid
        className={className}
        items={projects.map((project) => ({
          key: project.slug,
          repo: project.repo,
          initialStats: githubStats[project.slug],
          node: renderCard(project),
        }))}
      />
    );
  }

  return <div className={className}>{projects.map(renderCard)}</div>;
}

type ProjectGroupListProps = {
  groups: ProjectGroup[];
  enableNativeTransition?: boolean;
  showCompanyName?: boolean;
  /** 传入时按 GitHub Star 数排序 */
  githubStats?: Record<string, GitHubRepositoryStatsData>;
};

export function ProjectGroupList({
  groups,
  enableNativeTransition = false,
  showCompanyName = true,
  githubStats,
}: ProjectGroupListProps) {
  const showGroupHeader = groups.length > 1;

  return (
    <div className="flex flex-col gap-9 sm:gap-11">
      {groups.map((group) => {
        const headingId = `project-group-${group.key}`;

        return (
          <section
            aria-labelledby={headingId}
            className="flex flex-col gap-4"
            key={group.key}
          >
            {showGroupHeader ? (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2
                      className="font-heading text-2xl font-semibold tracking-tight text-foreground"
                      id={headingId}
                    >
                      {group.title}
                    </h2>
                  </div>
                  {group.description && (
                    <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <h2 className="sr-only" id={headingId}>
                {group.title}
              </h2>
            )}
            <ProjectGrid
              enableNativeTransition={enableNativeTransition}
              projects={group.projects}
              showCompanyName={showCompanyName}
              githubStats={githubStats}
            />
          </section>
        );
      })}
    </div>
  );
}
