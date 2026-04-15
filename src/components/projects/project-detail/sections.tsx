/* eslint-disable @next/next/no-img-element -- this page mixes local and remote archive assets */
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Project, ProjectDevelopment } from '@/lib/projects';
import { cn } from '@/lib/utils';
import {
  CalendarRangeIcon,
  FolderKanbanIcon,
  MonitorSmartphoneIcon,
} from 'lucide-react';

import { ResourceButton } from './shared';

export function DevelopmentCard({ item }: { item: ProjectDevelopment }) {
  return (
    <Card className="gap-0 rounded-[1.75rem] border border-border/60 bg-card/80">
      <CardHeader className="gap-3 border-b border-border/60 pb-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-lg">{item.name}</CardTitle>
            {item.period && (
              <CardDescription>{item.period.text}</CardDescription>
            )}
          </div>
          {item.period && (
            <Badge variant="secondary">
              <CalendarRangeIcon data-icon="inline-start" />
              {item.period.text}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 pt-5">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.85fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <FolderKanbanIcon className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">工作内容</p>
            </div>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-7 text-muted-foreground">
              {item.summary.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            {item.techStack && item.techStack.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">技术栈</p>
                <div className="flex flex-wrap gap-2">
                  {item.techStack.map((tech) => (
                    <Badge key={tech} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {item.resources && item.resources.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">相关资源</p>
                <div className="flex flex-wrap gap-2">
                  {item.resources.map((resource) => (
                    <ResourceButton
                      key={`${item.name}-${resource.label}`}
                      resource={resource}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {item.screenshots && item.screenshots.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">界面预览</p>
              <div className="-mx-4 overflow-x-auto px-4 pb-1">
                <div className="flex gap-4">
                  {item.screenshots.map((screenshot, index) => (
                    <div
                      className="w-[220px] shrink-0 overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/90 p-2 sm:w-[240px]"
                      key={`${item.name}-${screenshot.image}`}
                    >
                      <img
                        alt={`${item.name} 界面预览 ${index + 1}`}
                        className="h-auto w-full rounded-[1.1rem] object-cover"
                        loading="lazy"
                        src={screenshot.image}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {item.assets && item.assets.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">补充图片</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {item.assets.map((asset) => (
                  <div
                    className="flex flex-col gap-2"
                    key={`${item.name}-${asset.label || asset.image}`}
                  >
                    <div className="overflow-hidden rounded-[1.25rem] border border-border/60 bg-background">
                      <img
                        alt={asset.label || `${item.name} 补充图片`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        src={asset.image}
                      />
                    </div>
                    {asset.label && (
                      <p className="text-xs leading-5 text-muted-foreground">
                        {asset.label}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MonitorSmartphoneIcon className="size-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold tracking-tight">界面预览</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          参考产品详情页的展示方式，把关键页面集中放在同一排快速浏览。
        </p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <div className="flex gap-4">
          {screenshots.map((screenshot, index) => (
            <div
              className={cn(
                'w-[220px] shrink-0 overflow-hidden rounded-[1.75rem] border border-border/60 bg-card/80 p-2 sm:w-[240px]',
                screenshots.length === 1 && 'w-full max-w-xl',
              )}
              key={`${project.slug}-${screenshot.image}`}
            >
              <img
                alt={`${project.name} 界面预览 ${index + 1}`}
                className="h-auto w-full rounded-[1.35rem] object-cover"
                loading="lazy"
                src={screenshot.image}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
