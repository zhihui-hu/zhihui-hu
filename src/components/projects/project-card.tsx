import type { Project } from '@/lib/projects';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '../ui/badge';

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
          <div className="flex items-start justify-between gap-3">
            <Link
              className="min-w-0 flex-1 text-lg font-bold leading-tight tracking-[-0.02em] text-foreground transition-colors hover:text-primary"
              href={project.route}
            >
              <span className="underline-hover">{project.name}</span>
            </Link>
            {project.timeLabel && (
              <span className="shrink-0 pt-0.5 text-[0.72rem] leading-5 text-muted-foreground">
                {project.timeLabel}
              </span>
            )}
          </div>
          <p className="mt-1 line-clamp-2 text-[0.82rem]  font-normal text-muted-foreground">
            {project.description}
          </p>
        </div>
      </div>

      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
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
