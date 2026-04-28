import type { Project, ProjectDevelopment } from '@/lib/projects';
import { cn } from '@/lib/utils';
import { DotIcon, MonitorSmartphoneIcon } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '../../ui/badge';
import { ProjectImageGallery, ProjectImagePreview } from './image-preview';
import { isExternalUrl } from './shared';

function getProjectPreviewKind(project: Project) {
  const platformText = project.platforms.join(' ').toLowerCase();
  const categoryText = project.categories.join(' ').toLowerCase();
  const targetText = `${platformText} ${categoryText}`;

  if (
    targetText.includes('iphone') ||
    targetText.includes('android') ||
    targetText.includes('小程序') ||
    targetText.includes('移动端') ||
    targetText.includes('h5')
  ) {
    return 'mobile' as const;
  }

  return 'desktop' as const;
}

export function DevelopmentCard({ item }: { item: ProjectDevelopment }) {
  return (
    <div className="flex flex-col gap-5 py-1">
      <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-muted-foreground/90">
        <ul className="flex flex-col gap-3">
          {item.summary.map((point) => (
            <li key={point} className="flex items-start gap-2.5">
              <DotIcon className="mt-[1px] size-4 shrink-0 text-primary/70" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {item.techStack && item.techStack.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-semibold text-foreground/80">
              技术栈
            </p>
            <div className="flex flex-wrap gap-2">
              {item.techStack.map((tech) => (
                <Badge key={`${item.name}-${tech}`} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {item.resources && item.resources.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-1">
            {item.resources.map((resource) =>
              resource.url ? (
                isExternalUrl(resource.url) ? (
                  <a
                    key={`${item.name}-${resource.label}`}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[14px] text-primary hover:underline"
                  >
                    {resource.label}
                  </a>
                ) : (
                  <Link
                    key={`${item.name}-${resource.label}`}
                    href={resource.url}
                    className="text-[14px] text-primary hover:underline"
                  >
                    {resource.label}
                  </Link>
                )
              ) : (
                <span
                  key={`${item.name}-${resource.label}`}
                  className="text-[14px] text-muted-foreground"
                >
                  {resource.label}: {resource.text || '-'}
                </span>
              ),
            )}
          </div>
        )}
      </div>

      {item.assets && item.assets.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          <p className="text-[14px] font-medium text-foreground">补充图片</p>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
            {item.assets.map((asset) => (
              <div
                className="flex flex-col gap-1.5"
                key={`${item.name}-${asset.label || asset.image}`}
              >
                <ProjectImagePreview
                  alt={asset.label || `${item.name} 补充图片`}
                  buttonClassName="rounded-[1rem] border border-border/40"
                  imageClassName="aspect-square w-full object-cover"
                  src={asset.image}
                />
                {asset.label && (
                  <p className="text-[11px] text-muted-foreground/80 truncate px-1">
                    {asset.label}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ScreenshotShelf({
  project,
  screenshots,
}: {
  project: Project;
  screenshots: Array<{ image: string }>;
}) {
  if (screenshots.length === 0) {
    return null;
  }

  const previewImages = screenshots.map((screenshot, index) => ({
    alt: `${project.name} 界面预览 ${index + 1}`,
    caption: `${project.name} 的第 ${index + 1} 张界面截图`,
    previewKind: getProjectPreviewKind(project),
    src: screenshot.image,
  }));
  const previewKind = getProjectPreviewKind(project);

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-center gap-2">
        <MonitorSmartphoneIcon className="size-4 text-muted-foreground" />
        <h2 className="text-[20px] font-bold tracking-tight text-foreground">
          界面预览
        </h2>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 hide-scrollbar mt-1">
        <ProjectImageGallery
          buttonClassName={cn(
            'snap-start',
            screenshots.length === 1 && 'max-w-full',
          )}
          imageClassName={cn(
            'max-w-none bg-transparent',
            previewKind === 'desktop'
              ? 'aspect-[16/10] h-[210px] w-[336px] sm:h-[260px] sm:w-[416px] lg:h-[340px] lg:w-[544px]'
              : 'aspect-[6/13] h-[360px] w-[166px] sm:h-[420px] sm:w-[194px] lg:h-[600px] lg:w-[277px]',
            screenshots.length === 1 &&
              (previewKind === 'desktop'
                ? 'h-[240px] w-[384px] max-w-full sm:h-[360px] sm:w-[576px] lg:h-[520px] lg:w-[832px]'
                : 'h-[460px] w-[212px] max-w-full sm:h-[560px] sm:w-[258px] lg:h-[76vh] lg:w-[35.1vh]'),
          )}
          images={previewImages}
        />
      </div>
    </div>
  );
}
