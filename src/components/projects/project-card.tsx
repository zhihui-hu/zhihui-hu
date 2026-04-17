import type { Project } from '@/lib/projects';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '../ui/badge';
import { ProjectCardDescription } from './project-card-description';

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="group relative flex flex-col gap-4 rounded-[1.4rem]  bg-card/50 p-5 transition-all duration-200 hover:bg-card/80">
      <div className="flex items-center gap-4">
        {project.logo ? (
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[22%] border border-border/60 bg-background shadow-sm">
            <Image
              alt={`${project.name} logo`}
              className="size-full object-cover"
              src={project.logo}
              width={64}
              height={64}
            />
          </div>
        ) : (
          <div className="flex size-14 shrink-0 items-center justify-center rounded-[22%] border border-border/60 bg-muted text-base font-semibold text-foreground shadow-sm">
            {project.name.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:justify-between sm:gap-3">
            <Link
              className="min-w-0 flex-1 text-lg font-bold leading-tight tracking-[-0.02em] text-foreground transition-colors hover:text-primary"
              href={project.route}
            >
              <span className="underline-hover">{project.name}</span>
            </Link>
            {project.timeLabel && (
              <span className="text-[0.72rem] leading-5 text-muted-foreground sm:shrink-0 sm:pt-0.5">
                {project.timeLabel}
              </span>
            )}
          </div>
          {project.companyName && (
            <p className="mt-1 text-[0.76rem] leading-5 text-muted-foreground/80">
              {project.companyName}
            </p>
          )}
          <ProjectCardDescription description={project.description} />
        </div>
      </div>

      {project.listTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.listTags.map((tag) => (
            <Badge variant="outline" key={tag}>
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
