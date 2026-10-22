import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { GitHubRepositoryStats as GitHubRepositoryStatsData } from '@/lib/github';
import type { Project } from '@/lib/projects';

import { GitHubRepositoryStats } from '../github-repository-stats';
import { GitHubReadme } from './github-readme';
import { ProjectHeroHeader } from './hero-header';
import { ProjectMetricsBar } from './metrics';
import { DevelopmentCard, ScreenshotShelf } from './sections';

type ProjectDetailProps = {
  project: Project;
  githubStats?: GitHubRepositoryStatsData;
};

export function ProjectDetail({ project, githubStats }: ProjectDetailProps) {
  const introduction = project.introduction || [];
  const screenshots = project.screenshots || [];
  const development = project.development || [];
  const primaryDevelopment = development[0];
  const projectTags = project.listTags || [];
  const githubRepo =
    project.route.startsWith('/open-source/') && project.repo
      ? project.repo
      : undefined;

  const localContent = (
    <>
      {screenshots.length > 0 && (
        <ScreenshotShelf project={project} screenshots={screenshots} />
      )}

      {introduction.length > 0 && (
        <>
          {screenshots.length > 0 && (
            <Separator className="my-6 bg-border/40 sm:my-8" />
          )}
          <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
            <h2 className="text-[18px] font-bold tracking-tight text-foreground sm:text-[20px]">
              项目介绍
            </h2>
            <div className="flex min-w-0 flex-col gap-2 text-[14px] leading-7 wrap-anywhere text-foreground sm:gap-1 sm:text-[15px] sm:leading-relaxed">
              {introduction.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </>
      )}

      {primaryDevelopment && (
        <>
          {(screenshots.length > 0 || introduction.length > 0) && (
            <Separator className="my-6 bg-border/40 sm:my-8" />
          )}
          <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
            <h2 className="text-[18px] font-bold tracking-tight text-foreground sm:text-[20px]">
              开发与演进
            </h2>
            <div className="mt-2 flex flex-col gap-8">
              <DevelopmentCard item={primaryDevelopment} />
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <section className="container mx-auto flex min-w-0 flex-col gap-0 px-4 py-4 sm:px-6 sm:py-6 md:py-8 lg:px-8">
      <ProjectHeroHeader
        heroImage={project.logo}
        heroPanel={project.hero}
        project={project}
      />

      {githubRepo && (
        <GitHubRepositoryStats
          className="mb-4 sm:mb-5"
          initialStats={githubStats}
          repo={githubRepo}
        />
      )}

      {projectTags.length > 0 && (
        <div className="mb-4 flex min-w-0 flex-wrap gap-1.5 sm:mb-5 sm:gap-2">
          {projectTags.map((tag) => (
            <Badge
              className="h-auto min-h-5 max-w-full whitespace-normal wrap-anywhere"
              key={`${project.slug}-${tag}`}
              variant="outline"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <ProjectMetricsBar project={project} />

      {githubRepo ? (
        <GitHubReadme fallback={localContent} repo={githubRepo} />
      ) : (
        localContent
      )}
    </section>
  );
}
