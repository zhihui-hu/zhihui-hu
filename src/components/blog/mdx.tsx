import { CodeCopyButton } from '@/components/blog/code-copy-button';
import { isSensitiveCodeSample } from '@/components/blog/code-safety';
import { MermaidDiagram } from '@/components/blog/mermaid';
import { cn } from '@/lib/utils';
import { MDXRemote, type MDXRemoteProps } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import React from 'react';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode, {
  type LineElement,
  type Options as RehypePrettyCodeOptions,
} from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

type MarkdownElementProps = {
  children?: React.ReactNode;
  className?: string;
  ['data-language']?: string;
  ['data-line']?: string;
  ['data-rehype-pretty-code-figure']?: string;
  ['data-rehype-pretty-code-title']?: string;
  ['data-rehype-pretty-code-caption']?: string;
};

const headingLinkIcon = {
  type: 'element',
  tagName: 'span',
  properties: {
    className: ['octicon', 'octicon-link'],
  },
  children: [],
} as const;

const prettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'dark-plus',
  },
  keepBackground: false,
  bypassInlineCode: true,
  onVisitLine(line: LineElement) {
    if (line.children.length === 0) {
      line.children = [{ type: 'text', value: ' ' }];
    }
  },
};

function flattenText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        return child.toString();
      }

      if (React.isValidElement<MarkdownElementProps>(child)) {
        const text = flattenText(child.props.children);

        if (child.props['data-line'] !== undefined) {
          return `${text}\n`;
        }

        return text;
      }

      return '';
    })
    .join('');
}

function isTagElement(
  node: React.ReactNode,
  tagName: string,
): node is React.ReactElement<MarkdownElementProps> {
  return (
    React.isValidElement<MarkdownElementProps>(node) && node.type === tagName
  );
}

function findChildByTag(children: React.ReactNode, tagName: string) {
  return React.Children.toArray(children).find((child) =>
    isTagElement(child, tagName),
  );
}

function parseLanguage(className?: string) {
  const match = className?.match(/language-([^\s]+)/);

  return match?.[1]?.toLowerCase() ?? '';
}

function extractCodeContent(children: React.ReactNode) {
  return flattenText(children).replace(/\n$/, '');
}

function isStaticAssetLink(href: string) {
  return (
    href.startsWith('/assets/') ||
    /\.(json|txt|csv|pdf|zip|ya?ml|xml|log)$/i.test(href)
  );
}

function isExternalLink(href: string) {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  );
}

function CustomLink({
  href = '',
  className,
  ...props
}: React.ComponentProps<'a'> & { href?: string }) {
  const openInNewTab = isExternalLink(href);
  const linkProps = openInNewTab
    ? { rel: 'noopener noreferrer', target: '_blank' as const }
    : {};

  if (href.startsWith('#')) {
    return <a className={className} href={href} {...props} />;
  }

  if (isStaticAssetLink(href)) {
    return <a className={className} href={href} {...linkProps} {...props} />;
  }

  if (href.startsWith('/')) {
    return (
      <Link className={className} href={href} {...props}>
        {props.children}
      </Link>
    );
  }

  return <a className={className} href={href} {...linkProps} {...props} />;
}

function Code({
  className,
  children,
  ...props
}: React.ComponentProps<'code'> & { 'data-language'?: string }) {
  const isBlockCode =
    props['data-language'] !== undefined || parseLanguage(className) !== '';

  if (isBlockCode) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <code
      className={cn(
        'rounded-md border border-border/70 bg-muted/55 px-1.5 py-0.5 font-mono text-[0.92em]',
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}

function PrettyCodeFigure({
  children,
  className,
  ...props
}: React.ComponentProps<'figure'> & {
  'data-rehype-pretty-code-figure'?: string;
}) {
  if (props['data-rehype-pretty-code-figure'] === undefined) {
    return (
      <figure className={className} {...props}>
        {children}
      </figure>
    );
  }

  const preElement = findChildByTag(children, 'pre');

  if (!preElement) {
    return (
      <figure className={className} {...props}>
        {children}
      </figure>
    );
  }

  const language = preElement.props['data-language']?.toLowerCase() ?? 'text';
  const code = extractCodeContent(preElement.props.children);

  if (language === 'mermaid') {
    return <MermaidDiagram chart={code} className={className} />;
  }

  const allowCopy = code !== '' && !isSensitiveCodeSample(code);
  const titleElement = React.Children.toArray(children).find((child) => {
    if (!React.isValidElement<MarkdownElementProps>(child)) {
      return false;
    }

    return child.props['data-rehype-pretty-code-title'] !== undefined;
  });
  const title = React.isValidElement<MarkdownElementProps>(titleElement)
    ? flattenText(titleElement.props.children).trim()
    : '';
  const captionElement = React.Children.toArray(children).find((child) => {
    if (!React.isValidElement<MarkdownElementProps>(child)) {
      return false;
    }

    return child.props['data-rehype-pretty-code-caption'] !== undefined;
  });
  const caption = React.isValidElement<MarkdownElementProps>(captionElement)
    ? flattenText(captionElement.props.children).trim()
    : '';

  return (
    <div
      className={cn('github-code-block group relative my-4 w-full', className)}
    >
      {title ? (
        <div className="github-code-title text-muted-foreground mb-2 font-mono text-xs">
          {title}
        </div>
      ) : null}
      {allowCopy ? (
        <CodeCopyButton
          className="github-code-copy absolute top-3 right-3 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          value={code}
        />
      ) : null}
      <div className="github-code-content">{preElement}</div>
      {caption ? (
        <div className="github-code-caption text-muted-foreground mt-2 text-sm">
          {caption}
        </div>
      ) : null}
    </div>
  );
}

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="my-6 w-full overflow-x-auto">
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
  a: CustomLink,
  code: Code,
  figure: PrettyCodeFigure,
  table: Table,
  input: MarkdownInput,
  img: (props: React.ComponentProps<'img'>) => (
    // Markdown images do not consistently provide dimensions, so we keep
    // them as plain img tags in article content.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={props.alt || ''}
      className={cn('h-auto max-w-full', props.className)}
      loading="lazy"
      {...props}
    />
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
          rehypePlugins: [
            ...(options?.mdxOptions?.rehypePlugins || []),
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: 'prepend',
                properties: {
                  ariaLabel: 'Link to section',
                  className: ['anchor'],
                },
                content: headingLinkIcon,
              },
            ],
            [rehypePrettyCode, prettyCodeOptions],
          ],
        },
      }}
    />
  );
}
