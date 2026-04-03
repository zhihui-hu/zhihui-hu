import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { type BlogPost, formatBlogDate } from '@/lib/blog';
import { BookOpenTextIcon } from 'lucide-react';
import Link from 'next/link';

type BlogPostsProps = {
  posts: BlogPost[];
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
        <Link
          key={post.slug}
          className="mb-4 flex flex-col gap-1"
          href={`/blog/${post.slug}`}
        >
          <div className="flex w-full flex-col gap-1 md:flex-row md:gap-2">
            <p className="w-[100px] shrink-0 whitespace-nowrap tabular-nums text-muted-foreground">
              {formatBlogDate(post.metadata.publishedAt)}
            </p>
            <p className="min-w-0 tracking-tight text-foreground line-clamp-1">
              <span className="underline-hover"> {post.metadata.title}</span>
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
