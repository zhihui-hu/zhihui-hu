'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { fetchGitHub, getGitHubRepository } from '@/lib/github';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { ExternalLinkIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type ReadmeMetadata = {
  html_url: string;
  download_url: string;
};

function prepareReadme(html: string, metadata: ReadmeMetadata) {
  const document = new DOMParser().parseFromString(
    DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }),
    'text/html',
  );

  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    const href = link.getAttribute('href')!;

    if (href.startsWith('#')) {
      try {
        const id = decodeURIComponent(href.slice(1));
        const target =
          document.getElementById(id) ||
          document.getElementById(`user-content-${id}`);

        if (target) {
          link.setAttribute('href', `#${encodeURIComponent(target.id)}`);
        }
      } catch {
        link.removeAttribute('href');
      }

      return;
    }

    link.href = new URL(href, metadata.html_url).href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  });

  document.querySelectorAll<HTMLImageElement>('img[src]').forEach((image) => {
    image.src = new URL(image.getAttribute('src')!, metadata.download_url).href;
    image.loading = 'lazy';
  });

  return document.body.innerHTML;
}

type GitHubReadmeProps = {
  repo: string;
  /** 远程 README 不可用时展示的本地内容 */
  fallback?: ReactNode;
};

export function GitHubReadme({ repo, fallback }: GitHubReadmeProps) {
  const repository = getGitHubRepository(repo);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['github-readme', repository?.name],
    enabled: Boolean(repository),
    staleTime: 10 * 60 * 1000,
    retry: false,
    queryFn: async ({ signal }) => {
      const [metadataResponse, htmlResponse] = await Promise.all([
        fetchGitHub(`${repository!.apiUrl}/readme`, signal),
        fetchGitHub(
          `${repository!.apiUrl}/readme`,
          signal,
          'application/vnd.github.html',
          // 同一 URL 仅 Accept 不同，浏览器缓存可能把 JSON 响应复用给 HTML 请求
          'no-store',
        ),
      ]);
      const metadata: ReadmeMetadata = await metadataResponse.json();
      const html = await htmlResponse.text();

      if (!html.trim()) {
        throw new Error('README 内容为空');
      }

      return {
        html: prepareReadme(html, metadata),
        url: metadata.html_url,
      };
    },
  });

  if (!repository) {
    return fallback ?? null;
  }

  if (isError && fallback) {
    return fallback;
  }

  return (
    <section aria-labelledby="github-readme-title" className="min-w-0">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2
          className="text-[18px] font-bold tracking-tight text-foreground sm:text-[20px]"
          id="github-readme-title"
        >
          README
        </h2>
        <a
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          href={data?.url ?? `${repository.url}#readme`}
          rel="noopener noreferrer"
          target="_blank"
        >
          在 GitHub 查看
          <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
        </a>
      </div>

      {data ? (
        <article
          className="markdown-body min-w-0 bg-transparent! wrap-anywhere [&_img]:inline [&_picture]:inline [&_video]:inline [&_pre]:max-w-full [&_table]:max-w-full"
          dangerouslySetInnerHTML={{ __html: data.html }}
        />
      ) : isPending ? (
        <div
          aria-label="正在加载 README"
          className="flex flex-col gap-4"
          role="status"
        >
          <Skeleton className="h-8 w-2/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <div
          className="rounded-xl border border-border/60 px-4 py-5 text-sm text-muted-foreground"
          role="status"
        >
          <p>暂时无法加载远程 README，请稍后重试，或前往 GitHub 查看。</p>
          <button
            className="mt-3 font-medium text-foreground underline underline-offset-4"
            onClick={() => void refetch()}
            type="button"
          >
            重新加载
          </button>
        </div>
      )}
    </section>
  );
}
