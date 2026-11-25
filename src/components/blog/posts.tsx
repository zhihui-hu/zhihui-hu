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
  /** 按年份分组，日期显示为 MM-DD */
  groupByYear?: boolean;
};

export function BlogPosts({
  posts,
  limit,
  enableNativeTransition = false,
  groupByYear = false,
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

  const groups = groupByYear
    ? Object.entries(
        Object.groupBy(visiblePosts, (post) =>
          post.metadata.publishedAt.slice(0, 4),
        ),
      ).sort(([a], [b]) => Number(b) - Number(a))
    : [['', visiblePosts] as const];

  return (
    <div className="flex flex-col gap-8">
      {groups.map(([year, items]) => (
        <section className="flex flex-col" key={year || 'all'}>
          {year && (
            <h2 className="mb-2 flex items-baseline gap-2 text-sm font-semibold tabular-nums text-foreground">
              {year}
              <span className="text-xs font-normal text-muted-foreground">
                {items?.length} 篇
              </span>
            </h2>
          )}
          <ul className="-mx-3 flex flex-col">
            {items?.map((post) => (
              <li key={post.slug}>
                <PostRow
                  dateLabel={
                    year ? post.metadata.publishedAt.slice(5, 10) : undefined
                  }
                  enableNativeTransition={enableNativeTransition}
                  post={post}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function PostRow({
  post,
  dateLabel,
  enableNativeTransition,
}: {
  post: BlogPostListItem;
  dateLabel?: string;
  enableNativeTransition: boolean;
}) {
  const title = (
    <p className="min-w-0 truncate text-[0.95rem] tracking-tight text-foreground/90 transition-colors group-hover:text-foreground">
      {post.metadata.title}
    </p>
  );

  return (
    <BlogLink
      className="group flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors duration-200 [corner-shape:squircle] hover:bg-foreground/[0.045]"
      href={`/blog/${post.slug}`}
    >
      <span className="min-w-0 flex-1">
        {enableNativeTransition ? (
          <SharedElementTransition
            name={getSharedTitleTransitionName('blog', post.slug)}
          >
            {title}
          </SharedElementTransition>
        ) : (
          title
        )}
      </span>
      <span
        aria-hidden="true"
        className="hidden h-px min-w-6 flex-1 basis-0 bg-linear-to-r from-transparent to-border opacity-0 transition-opacity group-hover:opacity-100 sm:block"
      />
      {dateLabel ? (
        <time
          className="shrink-0 text-xs tabular-nums text-muted-foreground"
          dateTime={post.metadata.publishedAt}
        >
          {dateLabel}
        </time>
      ) : (
        <RelativeTime
          className="shrink-0 text-xs whitespace-nowrap tabular-nums text-muted-foreground"
          dateTime={post.metadata.publishedAt}
          fallback={post.formattedPublishedAt}
        />
      )}
    </BlogLink>
  );
}
