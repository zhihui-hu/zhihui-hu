function ArrowIcon() {
  return (
    <svg
      fill="none"
      height="12"
      viewBox="0 0 12 12"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
  );
}

const footerLinks = [
  {
    href: '/rss.xml',
    label: 'rss',
  },
  {
    href: 'mailto:i@huzhihui.com',
    label: 'email',
  },
  {
    href: 'https://github.com/zhihui-hu/',
    label: 'github',
  },
];

export function BlogFooter() {
  return (
    <footer className="mb-16">
      <ul className="mt-8 flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:gap-4">
        {footerLinks.map((item) => (
          <li key={item.href}>
            <a
              className="flex items-center transition-all hover:text-foreground"
              href={item.href}
              rel={
                item.href.startsWith('http') ? 'noopener noreferrer' : undefined
              }
              target={item.href.startsWith('http') ? '_blank' : undefined}
            >
              <ArrowIcon />
              <span className="ml-2">{item.label}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-muted-foreground">
        © 2016 - {new Date().getFullYear()} 胡志辉
      </p>
    </footer>
  );
}
