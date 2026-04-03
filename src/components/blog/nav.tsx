import Link from 'next/link';

const navItems = [
  {
    href: '/blog',
    name: 'blog',
  },
  {
    href: 'https://github.com/zhihui-hu/',
    name: 'github',
    external: true,
  },
];

export function BlogNavbar() {
  return (
    <aside className="-ml-2 mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="fade relative flex flex-row items-start px-0 pb-0 md:relative md:overflow-auto md:scroll-pr-6"
          id="blog-nav"
        >
          <div className="flex flex-row pr-10">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className="m-1 flex items-center px-2 py-1 transition-all hover:text-foreground"
                href={item.href}
                rel={item.external ? 'noreferrer' : undefined}
                target={item.external ? '_blank' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </aside>
  );
}
