import { Separator } from '@/components/ui/separator';
import type { Project } from '@/lib/projects';

import { ProjectHeroHeader } from './hero-header';
import { ProjectMetricsBar } from './metrics';
import { DevelopmentCard, ScreenshotShelf } from './sections';

type ProjectDetailProps = {
  project: Project;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const introduction = project.introduction || [];
  const screenshots = project.screenshots || [];
  const development = project.development || [];
  const primaryDevelopment = development[0];

  return (
    <section className="container mx-auto flex flex-col gap-0 px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      <ProjectHeroHeader
        heroImage={project.logo}
        heroPanel={project.hero}
        project={project}
      />

      <ProjectMetricsBar project={project} />

      {screenshots.length > 0 && (
        <ScreenshotShelf project={project} screenshots={screenshots} />
      )}

      {introduction.length > 0 && (
        <>
          {screenshots.length > 0 && (
            <Separator className="bg-border/40 my-8" />
          )}
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-bold tracking-tight text-foreground">
              项目介绍
            </h2>
            <div className="flex flex-col gap-1 text-[15px] leading-relaxed text-foreground">
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
            <Separator className="bg-border/40 my-8" />
          )}
          <div className="flex flex-col gap-4">
            <h2 className="text-[20px] font-bold tracking-tight text-foreground">
              开发与演进
            </h2>
            <div className="flex flex-col gap-8 mt-2">
              <DevelopmentCard item={primaryDevelopment} />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
