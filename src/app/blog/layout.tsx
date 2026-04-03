import { BlogFooter } from '@/components/blog/footer';
import { BlogNavbar } from '@/components/blog/nav';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-4 mt-8 max-w-xl text-foreground lg:mx-auto">
      <div className="mt-6 flex min-w-0 flex-col px-2 md:px-0">
        <BlogNavbar />
        {children}
        <BlogFooter />
      </div>
    </main>
  );
}
