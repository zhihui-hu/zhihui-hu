import type { Project, ProjectDevelopment } from '@/lib/projects';
import { cn } from '@/lib/utils';
import { MonitorSmartphoneIcon } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '../../ui/badge';
import { ProjectImageGallery, ProjectImagePreview } from './image-preview';
import { isExternalUrl } from './shared';

export function DevelopmentCard({ item }: { item: ProjectDevelopment }) {
  return (
    <div className="flex flex-col gap-3 py-2 border-b border-border/40 pb-6 last:border-0 last:pb-2">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[16px] font-bold text-foreground leading-tight">
          {item.name}
        </h3>
        {item.period && (
          <span className="text-[13px] text-muted-foreground/80 shrink-0 mt-[2px]">
            {item.period.text}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-muted-foreground/90">
        <ul className="flex list-disc flex-col gap-1.5 pl-5">
          {item.summary.map((point) => (
            <li key={point} className="pl-1 marker:text-muted-foreground/50">
              {point}
            </li>
          ))}
        </ul>

        {item.techStack && item.techStack.length > 0 && (
          <p className="text-[14px]">
            <span className="font-semibold text-foreground/80">技术栈：</span>
            {item.techStack.join(', ')}
          </p>
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
        <div className="flex flex-col gap-3 mt-4">
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
    src: screenshot.image,
  }));

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MonitorSmartphoneIcon className="size-4 text-muted-foreground" />
          <h2 className="text-[20px] font-bold tracking-tight text-foreground">
            界面预览
          </h2>
        </div>
        <Badge
          className="rounded-full bg-muted/40 px-2.5 text-[11px] text-muted-foreground"
          variant="outline"
        >
          {screenshots.length} 张截图
        </Badge>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 hide-scrollbar mt-1">
        <ProjectImageGallery
          buttonClassName={cn(
            'w-[220px] shrink-0 snap-start rounded-[1.4rem] border-border/50 bg-card/70 shadow-sm sm:w-[260px]',
            screenshots.length === 1 && 'w-full max-w-3xl',
          )}
          imageClassName={cn(
            'h-[320px] w-full object-contain bg-linear-to-b from-background to-muted/50 p-3 sm:h-[360px]',
            screenshots.length === 1 && 'h-[420px] sm:h-[520px]',
          )}
          images={previewImages}
        />
      </div>
    </div>
  );
}
