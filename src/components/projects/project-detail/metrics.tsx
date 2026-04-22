import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Project, ProjectMetric } from '@/lib/projects';
import Link from 'next/link';

import { isExternalUrl } from './shared';

function normalizeMetricToken(value: string) {
  return value.trim().toLowerCase();
}

function splitMetricValue(value?: string) {
  return (value || '')
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
}

function isMetricDuplicatedInHeader(project: Project, item: ProjectMetric) {
  const heroMetaLine = project.hero.metaLine;
  const headerTags = new Set(project.listTags.map(normalizeMetricToken));

  switch (item.label) {
    case '提供者':
      return project.companyName === item.value;
    case '项目周期':
      return Boolean(heroMetaLine && heroMetaLine.includes(item.value));
    case '平台': {
      const platformParts = splitMetricValue(item.value);

      return (
        platformParts.length > 0 &&
        platformParts.every(
          (part) =>
            heroMetaLine.includes(part) ||
            headerTags.has(normalizeMetricToken(part)),
        )
      );
    }
    case '分类': {
      if (headerTags.has(normalizeMetricToken(item.value))) {
        return true;
      }

      const categoryParts = splitMetricValue(item.sub);

      return (
        categoryParts.length > 0 &&
        categoryParts.every((part) =>
          headerTags.has(normalizeMetricToken(part)),
        )
      );
    }
    default:
      return false;
  }
}

export function ProjectMetricsBar({ project }: { project: Project }) {
  const visibleMetrics = (project.metrics || []).filter(
    (item) => !isMetricDuplicatedInHeader(project, item),
  );

  if (visibleMetrics.length === 0) {
    return null;
  }

  function renderMetricBody(item: ProjectMetric) {
    const showLanguageTooltip = item.label === '语言' && Boolean(item.sub);
    const showMetricSub = item.label !== '语言' && item.sub;

    const content = (
      <>
        <span className="text-[11px] font-medium text-muted-foreground/80">
          {item.label}
        </span>
        <span className="max-w-33 px-1 text-[17px] leading-[1.3] font-semibold text-foreground sm:max-w-41 sm:text-[20px]">
          {item.value}
        </span>
        {showMetricSub && (
          <span className="line-clamp-2 max-w-33 text-[11px] text-muted-foreground/78 sm:max-w-41 sm:text-[12px]">
            {item.sub}
          </span>
        )}
      </>
    );

    if (!showLanguageTooltip) {
      return content;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex cursor-help flex-col items-center justify-start gap-1.5">
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          支持语言：{item.sub}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="mt-1 mb-6 flex items-start gap-1 overflow-x-auto border-b border-border/35 pb-4 hide-scrollbar scroll-pl-4">
      {visibleMetrics.map((item: ProjectMetric) => (
        <div
          className="relative min-w-30 shrink-0 px-3 text-center after:absolute after:right-0 after:top-2 after:bottom-2 after:w-px after:bg-border/50 last:after:hidden sm:min-w-[148px] sm:px-4"
          key={`${item.label}-${item.value}`}
        >
          {item.href ? (
            isExternalUrl(item.href) ? (
              <a
                className="flex flex-col items-center justify-start gap-1.5 transition-opacity hover:opacity-80"
                href={item.href}
                rel="noreferrer"
                target="_blank"
              >
                {renderMetricBody(item)}
              </a>
            ) : (
              <Link
                className="flex flex-col items-center justify-start gap-1.5 transition-opacity hover:opacity-80"
                href={item.href}
              >
                {renderMetricBody(item)}
              </Link>
            )
          ) : (
            <div className="flex flex-col items-center justify-start gap-1.5">
              {renderMetricBody(item)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
