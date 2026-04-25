import { BlogPosts } from '@/components/blog/posts';
import { SectionHeader } from '@/components/home/section-header';
import { ProjectGrid } from '@/components/projects/project-card';
import { ROUTE_LIST_NAVIGATION_TRANSITION } from '@/components/route-view-transitions';
import { Button } from '@/components/ui/button';
import { formatBlogRelativeDate, getBlogPosts } from '@/lib/blog';
import { getProjects } from '@/lib/projects';
import { MailIcon } from 'lucide-react';

export default function Page() {
  const posts = getBlogPosts()
    .slice(0, 5)
    .map((post) => ({
      ...post,
      formattedPublishedAt: formatBlogRelativeDate(post.metadata.publishedAt),
    }));

  const projects = getProjects().slice(0, 4);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="container mx-auto flex min-h-[50vh] items-center px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex w-full flex-col gap-6 sm:gap-8">
          <h1 className="text-4xl leading-none font-semibold tracking-tight sm:text-6xl md:text-7xl">
            胡志辉
          </h1>
          <div className="flex flex-col gap-4">
            <p className="max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
              自 2016 年
              12月开始至今从事软件开发，先后参与金融和医疗行业系统建设与产品交付。金融方向的工作覆盖业务流程、数据准确性、权限控制和系统稳定性；医疗方向的工作覆盖多角色协作、信息完整性和过程留痕。当前聚焦
              AI 应用、Web
              开发、移动端与跨平台交付，工作内容涵盖需求分析、界面实现和多端落地。感受过国企的氛围，也经历过创业公司的节奏，积累了丰富的项目经验和技术能力。热衷于探索新技术，持续提升开发效率和代码质量，致力于构建高效、可靠的软件系统。
            </p>
            <div className="flex items-center gap-3">
              <Button asChild size="icon" variant="outline">
                <a
                  aria-label="发送邮件到 i@huzhihui.com"
                  href="mailto:i@huzhihui.com"
                  title="i@huzhihui.com"
                >
                  <MailIcon aria-hidden="true" />
                  <span className="sr-only">i@huzhihui.com</span>
                </a>
              </Button>
              <Button asChild size="icon" variant="outline">
                <a
                  aria-label="打开 GitHub 主页"
                  href="https://github.com/zhihui-hu/"
                  rel="noreferrer"
                  target="_blank"
                  title="github.com/zhihui-hu"
                >
                  <GitHubLogo />
                  <span className="sr-only">github.com/zhihui-hu</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Latest Posts ──────────────────────────────────── */}
      <section className="container mx-auto w-full px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="flex flex-col gap-6">
          <SectionHeader
            href="/blog"
            title="最新文章"
            transitionTypes={[ROUTE_LIST_NAVIGATION_TRANSITION]}
          />
          <BlogPosts enableNativeTransition limit={5} posts={posts} />
        </div>
      </section>

      {/* ── Latest Projects ──────────────────────────────── */}
      <section className="container mx-auto w-full px-4 pb-16 pt-4 sm:px-6 sm:pb-20 lg:px-8">
        <div className="flex flex-col gap-6">
          <SectionHeader
            href="/projects"
            title="最新作品"
            transitionTypes={[ROUTE_LIST_NAVIGATION_TRANSITION]}
          />
          <ProjectGrid enableNativeTransition projects={projects} />
        </div>
      </section>
    </>
  );
}

function GitHubLogo() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
