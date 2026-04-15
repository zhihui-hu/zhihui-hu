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
import type { Project, ProjectResource } from '@/lib/projects';
import { FolderKanbanIcon, Layers3Icon } from 'lucide-react';

import { ProjectHeroFrame } from './hero-frame';
import { DevelopmentCard, ScreenshotShelf } from './sections';
import {
  AttributeValue,
  HighlightCard,
  ResourceButton,
  buildHighlights,
  collectScreenshots,
  getPrimaryResourceLabel,
} from './shared';

type ProjectDetailProps = {
  project: Project;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const categories = project.detail.categories || [];
  const attributes = project.detail.attributes || [];
  const introduction = project.detail.introduction || [];
  const primaryResources: ProjectResource[] = [
    ...(project.url
      ? [
          {
            label: getPrimaryResourceLabel(project.url),
            url: project.url,
            kind: project.url.includes('apps.apple.com')
              ? 'app-store'
              : 'website',
          },
        ]
      : []),
    ...(project.repo
      ? [{ label: '查看源码', url: project.repo, kind: 'repository' as const }]
      : []),
  ];
  const highlights = buildHighlights(project);
  const screenshots = collectScreenshots(project);
  const imageAttributes = attributes.filter(
    (attribute) => attribute.type === 'image' && attribute.url,
  );
  const heroImage =
    screenshots.find((item) => item.image.startsWith('/'))?.image ||
    project.detail.logo ||
    project.logo ||
    screenshots[0]?.image ||
    imageAttributes[0]?.url;

  return (
    <section className="container flex flex-col gap-8 py-6 md:py-8">
      <ProjectHeroFrame image={heroImage}>
        <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative flex shrink-0 items-center justify-center">
              {project.logo ? (
                <>
                  <div className="absolute inset-2 rounded-[30%] bg-background/30 blur-2xl" />
                  <div className="relative overflow-hidden rounded-[28%] border border-border/60 bg-background shadow-sm">
                    <img
                      alt={`${project.name} logo`}
                      className="size-24 object-cover sm:size-28"
                      src={project.logo}
                    />
                  </div>
                </>
              ) : (
                <div className="flex size-24 items-center justify-center rounded-[28%] border border-border/60 bg-background text-3xl font-semibold text-foreground shadow-sm sm:size-28">
                  {project.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
                  {project.name}
                </h1>
                <p className="max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                  {project.detail.headline}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.timeLabel && (
                  <Badge variant="secondary">{project.timeLabel}</Badge>
                )}
                {project.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {primaryResources.length > 0 && (
            <div className="flex flex-wrap gap-2 lg:max-w-xs lg:justify-end">
              {primaryResources.map((resource, index) => (
                <ResourceButton
                  key={`${project.slug}-${resource.label}`}
                  resource={resource}
                  variant={index === 0 ? 'default' : 'outline'}
                />
              ))}
            </div>
          )}
        </div>
      </ProjectHeroFrame>

      {highlights.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item) => (
            <HighlightCard key={`${project.slug}-${item.label}`} item={item} />
          ))}
        </div>
      )}

      <ScreenshotShelf project={project} screenshots={screenshots} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <Card className="gap-0 rounded-[1.75rem] border border-border/60 bg-card/80">
          <CardHeader className="gap-2 border-b border-border/60 pb-5">
            <div className="flex items-center gap-2">
              <FolderKanbanIcon className="size-4 text-muted-foreground" />
              <CardTitle className="text-lg">项目介绍</CardTitle>
            </div>
            <CardDescription>
              结合公开资料与项目经历整理出的核心定位、场景和目标用户。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-5 text-sm leading-8 text-muted-foreground sm:text-base">
            {introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-0 rounded-[1.75rem] border border-border/60 bg-card/80">
          <CardHeader className="gap-2 border-b border-border/60 pb-5">
            <div className="flex items-center gap-2">
              <Layers3Icon className="size-4 text-muted-foreground" />
              <CardTitle className="text-lg">项目信息</CardTitle>
            </div>
            <CardDescription>
              把产品分类、关键属性和补充入口聚合在同一块展示。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-5">
            {categories.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">分类</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {attributes.length > 0 && (
              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium text-foreground">属性</p>
                <dl className="flex flex-col gap-4">
                  {attributes.map((attribute) => (
                    <div
                      className="flex flex-col gap-1 border-b border-border/60 pb-4 last:border-b-0 last:pb-0"
                      key={`${project.slug}-${attribute.label}`}
                    >
                      <dt className="text-sm text-muted-foreground">
                        {attribute.label}
                      </dt>
                      <dd className="text-sm leading-7">
                        <AttributeValue attribute={attribute} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {imageAttributes.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">补充入口</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {imageAttributes.map((attribute) => (
                    <div
                      className="flex flex-col gap-2"
                      key={`${project.slug}-${attribute.label}-image`}
                    >
                      <div className="overflow-hidden rounded-[1.25rem] border border-border/60 bg-background p-3">
                        <img
                          alt={attribute.label}
                          className="w-full rounded-xl object-cover"
                          loading="lazy"
                          src={attribute.url}
                        />
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {attribute.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Layers3Icon className="size-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold tracking-tight">开发与演进</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            延续现有数据结构，把每个阶段的职责、技术栈、资源和效果图拆开展示。
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {project.detail.development.map((item) => (
            <DevelopmentCard key={`${project.slug}-${item.name}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
