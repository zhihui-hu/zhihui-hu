import { BlogPosts } from '@/components/blog/posts';
import { SectionHeader } from '@/components/home/section-header';
import { ProjectGrid } from '@/components/projects/project-card';
import { ROUTE_LIST_NAVIGATION_TRANSITION } from '@/components/route-view-transitions';
import { FluidOrb } from '@/components/ui/fluid-orb';
import { formatBlogDate, getBlogPosts } from '@/lib/blog';
import { getOpenSourceProjects } from '@/lib/open-source';
import { getProjects } from '@/lib/projects';
import { ArrowRightIcon, MailIcon } from 'lucide-react';
import Link from 'next/link';

const heroPill =
  'inline-flex h-10 items-center gap-2 rounded-full bg-foreground/[0.05] px-4 text-sm font-medium text-foreground/80 transition-colors [corner-shape:round] hover:bg-foreground/[0.09] hover:text-foreground';

export default function Page() {
  const posts = getBlogPosts()
    .slice(0, 5)
    .map((post) => ({
      ...post,
      formattedPublishedAt: formatBlogDate(post.metadata.publishedAt),
    }));

  const projects = getProjects().slice(0, 4);
  const openSourceProjects = getOpenSourceProjects().slice(0, 4);

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="container mx-auto px-4 pt-6 pb-14 sm:px-6 sm:pt-12 sm:pb-20 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <div className="flex flex-col gap-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-foreground/[0.05] px-3 py-1 text-xs font-medium text-foreground/70 [corner-shape:round]">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-[#1A73F2]"
              />
              全栈工程师 · 金融 / 医疗 / AI 应用
            </span>
            <h1 className="text-5xl leading-none font-semibold tracking-[-0.04em] sm:text-7xl">
              胡志辉
            </h1>
            <div className="flex max-w-2xl flex-col gap-3 text-[0.98rem] leading-8 text-muted-foreground md:text-lg md:leading-8">
              <p>
                从 2016
                年入行起，大部分时间都在金融和医疗系统里打磨。这两个领域教给我最深的一件事：系统永远要对真实世界的混乱留有余地——无论是经不起半分差错的账目，还是关乎责任的业务留痕。国企的慢与规矩让我学会防御性思考，创业公司的快又逼着我切掉所有技术虚荣。
              </p>
              <p>
                现在我更享受一个人贯穿全栈，把 AI
                和现代工具揉进具体的业务里。对我来说，好的工程从来不是堆砌时髦名词，而是看透需求背后的本质，在成本、鲁棒性与体验之间，做出一套自洽且耐造的解法。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-opacity [corner-shape:round] hover:opacity-85"
                href="/blog"
                transitionTypes={[ROUTE_LIST_NAVIGATION_TRANSITION]}
              >
                阅读博客
                <ArrowRightIcon aria-hidden="true" className="size-3.5" />
              </Link>
              <a
                className={heroPill}
                href="https://github.com/zhihui-hu/"
                rel="noreferrer"
                target="_blank"
              >
                <GitHubLogo />
                GitHub
              </a>
              <a
                className={heroPill}
                href="mailto:i@huzhihui.com"
                title="i@huzhihui.com"
              >
                <MailIcon aria-hidden="true" className="size-4" />
                i@huzhihui.com
              </a>
            </div>
          </div>
          <FluidOrb
            aria-hidden="true"
            className="hidden shadow-[0_40px_80px_-30px_rgba(26,115,242,0.55)] md:block"
            size={260}
          />
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
            title="商业项目"
            transitionTypes={[ROUTE_LIST_NAVIGATION_TRANSITION]}
          />
          <ProjectGrid enableNativeTransition projects={projects} />
        </div>
      </section>

      {/* ── Open Source Projects ─────────────────────────── */}
      <section className="container mx-auto w-full px-4 pb-16 pt-0 sm:px-6 sm:pb-20 lg:px-8">
        <div className="flex flex-col gap-6">
          <SectionHeader
            href="/open-source"
            title="开源项目"
            transitionTypes={[ROUTE_LIST_NAVIGATION_TRANSITION]}
          />
          <ProjectGrid
            enableNativeTransition
            projects={openSourceProjects}
            showCompanyName={false}
          />
        </div>
      </section>
    </>
  );
}

function GitHubLogo() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
