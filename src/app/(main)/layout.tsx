import { BackToTop } from '@/components/blog/back-to-top';
import { BlogFooter } from '@/components/blog/footer';
import { BlogNavbar } from '@/components/blog/nav';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="mx-auto flex min-h-screen w-full max-w-[1280px] flex-col px-4 text-foreground sm:px-6">
        <BlogNavbar />
        <main className="flex-1">{children}</main>
        <BlogFooter />
      </div>
      <BackToTop />
    </>
  );
}
