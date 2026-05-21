import { BlogLink } from '@/components/blog/blog-link';
import { RelativeTime } from '@/components/blog/relative-time';
import {
  SharedElementTransition,
  getSharedTitleTransitionName,
} from '@/components/route-view-transitions';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { type BlogPost } from '@/lib/blog';
import { BookOpenTextIcon } from 'lucide-react';

export type BlogPostListItem = BlogPost & {
  formattedPublishedAt: string;
};

type BlogPostsProps = {
  posts: BlogPostListItem[];
  limit?: number;
  enableNativeTransition?: boolean;
};

export function BlogPosts({
  posts,
  limit,
  enableNativeTransition = false,
}: BlogPostsProps) {
  const visiblePosts =
    typeof limit === 'number' ? posts.slice(0, limit) : posts;

  if (!visiblePosts.length) {
    return (
      <Empty className="border border-dashed border-border bg-muted/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BookOpenTextIcon />
          </EmptyMedia>
          <EmptyTitle>还没有博客文章</EmptyTitle>
          <EmptyDescription>
            文章写好后放到 <code>posts</code> 目录里，这里会自动列出来。
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div>
      {visiblePosts.map((post) => (
        <BlogLink
          key={post.slug}
          className="mb-3 block"
          href={`/blog/${post.slug}`}
        >
          <div className="grid w-full grid-cols-[5.5rem_minmax(0,1fr)] items-baseline gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
            <RelativeTime
              className="text-sm whitespace-nowrap text-muted-foreground"
              dateTime={post.metadata.publishedAt}
              fallback={post.formattedPublishedAt}
            />
            {enableNativeTransition ? (
              <SharedElementTransition
                name={getSharedTitleTransitionName('blog', post.slug)}
              >
                <p className="min-w-0 tracking-tight text-foreground line-clamp-1">
                  <span className="underline-hover">{post.metadata.title}</span>
                </p>
              </SharedElementTransition>
            ) : (
              <p className="min-w-0 tracking-tight text-foreground line-clamp-1">
                <span className="underline-hover">{post.metadata.title}</span>
              </p>
            )}
          </div>
        </BlogLink>
      ))}
    </div>
  );
}
