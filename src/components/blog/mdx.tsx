import { MermaidDiagram } from '@/components/blog/mermaid';
import { cn } from '@/lib/utils';
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import React from 'react';
import remarkGfm from 'remark-gfm';
import { highlight } from 'sugar-high';

function flattenText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return child.toString();
      }

      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return flattenText(child.props.children);
      }

      return '';
    })
    .join('');
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, '');
}

function parseLanguage(className?: string) {
  const match = className?.match(/language-([^\s]+)/);

  return match?.[1]?.toLowerCase() ?? '';
}

function extractCodeBlock(children: React.ReactNode) {
  const [child] = React.Children.toArray(children);

  if (!React.isValidElement<React.ComponentProps<'code'>>(child)) {
    return null;
  }

  return {
    className: child.props.className,
    content: flattenText(child.props.children).replace(/\n$/, ''),
  };
}

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Heading = ({
    children,
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const text = flattenText(children);
    const slug = slugify(text);

    return React.createElement(
      `h${level}`,
      {
        id: slug,
        className: cn('group relative scroll-mt-24', className),
        ...props,
      },
      [
        React.createElement('a', {
          key: `anchor-${slug}`,
          href: `#${slug}`,
          className: 'anchor',
          'aria-label': `跳转到 ${text}`,
        }),
      ],
      children,
    );
  };

  Heading.displayName = `Heading${level}`;

  return Heading;
}

function CustomLink({
  href = '',
  className,
  ...props
}: React.ComponentProps<'a'> & { href?: string }) {
  if (href.startsWith('/')) {
    return <Link className={className} href={href} {...props} />;
  }

  if (href.startsWith('#')) {
    return <a className={className} href={href} {...props} />;
  }

  return (
    <a
      className={className}
      href={href}
      rel="noreferrer noopener"
      target="_blank"
      {...props}
    />
  );
}

function Code({ className, children, ...props }: React.ComponentProps<'code'>) {
  const content = flattenText(children).replace(/\n$/, '');

  if (!className) {
    return (
      <code
        className={cn('rounded-md bg-muted px-1.5 py-0.5', className)}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <code
      className={cn('font-mono text-[0.92em]', className)}
      dangerouslySetInnerHTML={{ __html: highlight(content) }}
      {...props}
    />
  );
}

function Pre({ children, className, ...props }: React.ComponentProps<'pre'>) {
  const codeBlock = extractCodeBlock(children);

  if (!codeBlock) {
    return (
      <pre
        className={cn(
          'my-6 overflow-x-auto rounded-xl border border-border bg-card',
          className,
        )}
        {...props}
      >
        {children}
      </pre>
    );
  }

  const language = parseLanguage(codeBlock.className);

  if (language === 'mermaid') {
    return <MermaidDiagram chart={codeBlock.content} />;
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2">
        <span className="font-mono text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          {language || 'text'}
        </span>
      </div>
      <pre
        className={cn(
          'm-0 overflow-x-auto bg-transparent text-sm text-foreground',
          className,
        )}
        {...props}
      >
        <code
          className="block min-w-full bg-transparent px-4 py-4 font-mono text-[0.92rem] leading-7"
          dangerouslySetInnerHTML={{ __html: highlight(codeBlock.content) }}
        />
      </pre>
    </div>
  );
}

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-xl border border-border">
      <table
        className={cn('w-full min-w-full border-collapse', className)}
        {...props}
      />
    </div>
  );
}

function MarkdownInput({
  type,
  className,
  ...props
}: React.ComponentProps<'input'>) {
  if (type !== 'checkbox') {
    return <input className={className} type={type} {...props} />;
  }

  return (
    <input
      className={cn(
        'mt-1 size-4 rounded border border-border accent-primary',
        className,
      )}
      disabled
      type="checkbox"
      {...props}
    />
  );
}

const components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  a: CustomLink,
  pre: Pre,
  code: Code,
  table: Table,
  input: MarkdownInput,
  img: (props: React.ComponentProps<'img'>) => (
    // Markdown images do not consistently provide dimensions, so we keep
    // them as plain img tags in article content.
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt || ''} loading="lazy" {...props} />
  ),
};

export function CustomMDX({
  components: customComponents,
  options,
  ...props
}: MDXRemoteProps) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(customComponents || {}) }}
      options={{
        ...options,
        mdxOptions: {
          ...(options?.mdxOptions || {}),
          remarkPlugins: [
            ...(options?.mdxOptions?.remarkPlugins || []),
            remarkGfm,
          ],
        },
      }}
    />
  );
}
