import { BlogFooter } from '@/components/blog/footer';
import { BlogNavbar } from '@/components/blog/nav';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto mt-8 w-full max-w-[980px] px-4 text-foreground sm:px-6">
      <div className="mt-6 flex min-w-0 flex-col">
        <BlogNavbar />
        {children}
        <BlogFooter />
      </div>
    </main>
  );
}
