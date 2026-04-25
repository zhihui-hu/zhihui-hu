import {
  SharedElementTransition,
  getSharedTitleTransitionName,
} from '@/components/route-view-transitions';
import { Badge } from '@/components/ui/badge';
import {
  type BlogPost,
  estimateBlogReadingTime,
  formatBlogAbsoluteDate,
  formatBlogRelativeDate,
  getBlogWordCount,
} from '@/lib/blog';

interface PostHeaderProps {
  post: BlogPost;
}

export function PostHeader({ post }: PostHeaderProps) {
  const wordCount = getBlogWordCount(post.content);
  const readingTime = estimateBlogReadingTime(post.content);
  const formattedDate = formatBlogRelativeDate(post.metadata.publishedAt);
  const absoluteDate = formatBlogAbsoluteDate(post.metadata.publishedAt);
  const tags = post.metadata.tags ?? [];

  return (
    <header className="mb-8 border-b border-border/60 pb-6">
      <SharedElementTransition
        name={getSharedTitleTransitionName('blog', post.slug)}
      >
        <h1 className="title text-[clamp(2rem,5vw,2.9rem)] font-bold leading-tight tracking-[-0.04em] text-foreground">
          {post.metadata.title}
        </h1>
      </SharedElementTransition>

      <div className="mt-5 flex flex-col gap-3">
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {wordCount.toLocaleString()} 字 · {readingTime} 分钟读完
          </p>
          <time dateTime={post.metadata.publishedAt} title={absoluteDate}>
            {formattedDate}
          </time>
        </div>

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
