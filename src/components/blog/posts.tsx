import { BlogLink } from '@/components/blog/blog-link';
import {
  BLOG_NAV_FORWARD_TRANSITION,
  BlogTitleTransition,
} from '@/components/blog/view-transitions';
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
};

export function BlogPosts({ posts, limit }: BlogPostsProps) {
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
          className="mb-4 flex flex-col gap-1"
          href={`/blog/${post.slug}`}
          transitionTypes={[BLOG_NAV_FORWARD_TRANSITION]}
        >
          <div className="flex w-full flex-col gap-1 md:flex-row md:gap-2">
            <p className="w-[100px] shrink-0 whitespace-nowrap tabular-nums text-muted-foreground">
              {post.formattedPublishedAt}
            </p>
            <BlogTitleTransition slug={post.slug}>
              <p className="min-w-0 tracking-tight text-foreground line-clamp-1">
                <span className="underline-hover"> {post.metadata.title}</span>
              </p>
            </BlogTitleTransition>
          </div>
        </BlogLink>
      ))}
    </div>
  );
}
