import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';

type SectionHeaderProps = {
  title: string;
  href: string;
  linkText?: string;
};

export function SectionHeader({
  title,
  href,
  linkText = '查看更多',
}: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h2>
      <Link
        className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        href={href}
      >
        {linkText}
        <ArrowRightIcon
          aria-hidden="true"
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}
