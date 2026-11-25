import {
  SharedElementTransition,
  getSharedTitleTransitionName,
} from '@/components/route-view-transitions';
import {
  type BlogPost,
  estimateBlogReadingTime,
  formatBlogDate,
  getBlogWordCount,
} from '@/lib/blog';

import { RelativeTime } from './relative-time';

interface PostHeaderProps {
  post: BlogPost;
}

export function PostHeader({ post }: PostHeaderProps) {
  const wordCount = getBlogWordCount(post.content);
  const readingTime = estimateBlogReadingTime(post.content);
  const formattedDate = formatBlogDate(post.metadata.publishedAt);
  const tags = post.metadata.tags ?? [];

  return (
    <header className="mb-10">
      <SharedElementTransition
        name={getSharedTitleTransitionName('blog', post.slug)}
      >
        <h1 className="title text-[clamp(2rem,5vw,2.9rem)] font-bold leading-tight tracking-[-0.04em] text-foreground">
          {post.metadata.title}
        </h1>
      </SharedElementTransition>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
        <RelativeTime
          className="tabular-nums"
          dateTime={post.metadata.publishedAt}
          fallback={formattedDate}
        />
        <span aria-hidden="true" className="size-1 rounded-full bg-border" />
        <span className="tabular-nums">
          {wordCount.toLocaleString()} 字 · {readingTime} 分钟读完
        </span>
        {tags.length > 0 ? (
          <ul className="flex basis-full flex-wrap gap-1.5 sm:basis-auto sm:pl-1">
            {tags.map((tag) => (
              <li
                className="rounded-full bg-foreground/[0.05] px-2.5 py-0.5 text-xs font-medium text-foreground/70 [corner-shape:round]"
                key={tag}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </header>
  );
}
