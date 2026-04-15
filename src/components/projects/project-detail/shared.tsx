import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type {
  Project,
  ProjectAttribute,
  ProjectResource,
} from '@/lib/projects';
import type { LucideIcon } from 'lucide-react';
import {
  Building2Icon,
  CalendarRangeIcon,
  ExternalLinkIcon,
  FolderKanbanIcon,
  GitForkIcon,
  GlobeIcon,
  LanguagesIcon,
  Layers3Icon,
  MonitorSmartphoneIcon,
  QrCodeIcon,
  ShieldIcon,
} from 'lucide-react';
import Link from 'next/link';

export type HighlightItem = {
  label: string;
  value: string;
  description?: string;
  href?: string;
  icon: LucideIcon;
};

export function isExternalUrl(url: string) {
  return /^https?:\/\//.test(url);
}

function getUrlHost(url?: string) {
  if (!url || !isExternalUrl(url)) {
    return undefined;
  }

  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return undefined;
  }
}

function getAttributeIcon(attribute: ProjectAttribute): LucideIcon {
  if (attribute.kind === 'repository') {
    return GitForkIcon;
  }

  if (attribute.kind === 'website') {
    return GlobeIcon;
  }

  if (attribute.kind === 'app-store') {
    return MonitorSmartphoneIcon;
  }

  if (attribute.kind === 'qr-code') {
    return QrCodeIcon;
  }

  if (/提供者|开发者/.test(attribute.label)) {
    return Building2Icon;
  }

  if (/语言/.test(attribute.label)) {
    return LanguagesIcon;
  }

  if (/年龄/.test(attribute.label)) {
    return ShieldIcon;
  }

  if (/设备|系统|客户端|平台/.test(attribute.label)) {
    return MonitorSmartphoneIcon;
  }

  return Layers3Icon;
}

function getAttributeSummary(attribute: ProjectAttribute) {
  return attribute.value || attribute.url || '-';
}

function getAttributeDescription(attribute: ProjectAttribute) {
  const host = getUrlHost(attribute.url);

  if (host && host !== attribute.value && host !== attribute.module) {
    return host;
  }

  if (attribute.module && attribute.module !== attribute.value) {
    return attribute.module;
  }

  if (attribute.kind === 'repository') {
    return '代码仓库';
  }

  if (attribute.kind === 'app-store') {
    return '应用商店入口';
  }

  if (attribute.kind === 'website') {
    return '线上访问入口';
  }

  return undefined;
}

export function getPrimaryResourceLabel(url: string) {
  if (url.includes('apps.apple.com')) {
    return 'App Store 查看';
  }

  return '访问项目';
}

export function collectScreenshots(project: Project) {
  const seen = new Set<string>();

  return project.detail.development.flatMap((item) =>
    (item.screenshots || []).filter((screenshot) => {
      if (seen.has(screenshot.image)) {
        return false;
      }

      seen.add(screenshot.image);
      return true;
    }),
  );
}

export function buildHighlights(project: Project): HighlightItem[] {
  const items: HighlightItem[] = [];
  const categories = project.detail.categories || [];
  const attributes = project.detail.attributes || [];
  const push = (item?: HighlightItem) => {
    if (!item) {
      return;
    }

    if (
      items.some(
        (current) =>
          current.label === item.label && current.value === item.value,
      )
    ) {
      return;
    }

    items.push(item);
  };

  if (project.timeLabel) {
    push({
      label: '项目周期',
      value: project.timeLabel,
      description: '从首次交付到当前阶段的时间跨度',
      icon: CalendarRangeIcon,
    });
  }

  for (const attribute of attributes) {
    const value = getAttributeSummary(attribute);

    if (!value || value === '-') {
      continue;
    }

    push({
      label: attribute.label,
      value,
      description: getAttributeDescription(attribute),
      href: attribute.url,
      icon: getAttributeIcon(attribute),
    });

    if (items.length >= 6) {
      return items;
    }
  }

  if (items.length < 4 && categories.length > 0) {
    push({
      label: '项目分类',
      value: categories.slice(0, 2).join(' / '),
      description: `${categories.length} 个分类标签`,
      icon: Layers3Icon,
    });
  }

  if (items.length < 4 && project.detail.development.length > 0) {
    push({
      label: '开发阶段',
      value: `${project.detail.development.length} 个模块`,
      description: project.detail.development
        .map((item) => item.name)
        .slice(0, 2)
        .join(' / '),
      icon: FolderKanbanIcon,
    });
  }

  return items.slice(0, 6);
}

export function ResourceButton({
  resource,
  variant = 'outline',
}: {
  resource: ProjectResource;
  variant?: 'default' | 'outline';
}) {
  if (!resource.url) {
    return (
      <Badge variant="secondary">{`${resource.label}: ${resource.text || '-'}`}</Badge>
    );
  }

  const Icon =
    resource.kind === 'repository'
      ? GitForkIcon
      : resource.kind === 'app-store'
        ? MonitorSmartphoneIcon
        : ExternalLinkIcon;

  if (isExternalUrl(resource.url)) {
    return (
      <Button asChild size="sm" variant={variant}>
        <a href={resource.url} rel="noreferrer" target="_blank">
          <Icon data-icon="inline-start" />
          {resource.label}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild size="sm" variant={variant}>
      <Link href={resource.url}>
        <Icon data-icon="inline-start" />
        {resource.label}
      </Link>
    </Button>
  );
}

export function AttributeValue({ attribute }: { attribute: ProjectAttribute }) {
  const content = getAttributeSummary(attribute);

  if (!attribute.url) {
    return <span className="text-foreground">{content}</span>;
  }

  if (isExternalUrl(attribute.url)) {
    return (
      <a
        className="text-foreground transition-colors hover:text-primary"
        href={attribute.url}
        rel="noreferrer"
        target="_blank"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      className="text-foreground transition-colors hover:text-primary"
      href={attribute.url}
    >
      {content}
    </Link>
  );
}

export function HighlightCard({ item }: { item: HighlightItem }) {
  const Icon = item.icon;
  const content = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className="line-clamp-2 text-base leading-6 font-medium text-foreground">
            {item.value}
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </div>
      {item.description && (
        <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
          {item.description}
        </p>
      )}
    </div>
  );

  return (
    <Card className="gap-0 rounded-[1.5rem] border border-border/60 bg-card/80">
      <CardContent className="py-4">
        {item.href ? (
          isExternalUrl(item.href) ? (
            <a
              className="block transition-opacity hover:opacity-80"
              href={item.href}
              rel="noreferrer"
              target="_blank"
            >
              {content}
            </a>
          ) : (
            <Link
              className="block transition-opacity hover:opacity-80"
              href={item.href}
            >
              {content}
            </Link>
          )
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );
}
