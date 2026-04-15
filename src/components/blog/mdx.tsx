import { BlogLink } from '@/components/blog/blog-link';
import { CodeCopyButton } from '@/components/blog/code-copy-button';
import { isSensitiveCodeSample } from '@/components/blog/code-safety';
import { MermaidDiagram } from '@/components/blog/mermaid';
import { cn } from '@/lib/utils';
import { type MDXRemoteProps, compileMDX } from 'next-mdx-remote/rsc';
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

function CustomLink({
  href = '',
  className,
  ...props
}: React.ComponentProps<'a'> & { href?: string }) {
  return <BlogLink className={className} href={href} {...props} />;
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

export type BlogMdxIssue = {
  title: string;
  description: string;
  detail?: string;
};

type BlogMdxRenderResult = {
  content: React.ReactNode | null;
  issue: BlogMdxIssue | null;
};

type BlogMdxSourceProps = Omit<MDXRemoteProps, 'source'> & {
  source: string;
};

const blockedTagPattern = /<\s*(script)\b/i;
const fencePattern = /^(`{3,}|~{3,})/;

function stripInlineCode(line: string) {
  let result = '';
  let index = 0;

  while (index < line.length) {
    if (line[index] !== '`') {
      result += line[index];
      index += 1;
      continue;
    }

    let tickCount = 1;

    while (line[index + tickCount] === '`') {
      tickCount += 1;
    }

    const fence = '`'.repeat(tickCount);
    const closingIndex = line.indexOf(fence, index + tickCount);

    if (closingIndex === -1) {
      result += line[index];
      index += 1;
      continue;
    }

    result += ' '.repeat(closingIndex + tickCount - index);
    index = closingIndex + tickCount;
  }

  return result;
}

function findBlockedTagIssue(source: string): BlogMdxIssue | null {
  const lines = source.split('\n');
  let activeFence: string | null = null;

  for (const [lineIndex, line] of lines.entries()) {
    const trimmedLine = line.trimStart();
    const fenceMatch = trimmedLine.match(fencePattern);

    if (activeFence) {
      if (
        fenceMatch &&
        fenceMatch[1][0] === activeFence[0] &&
        fenceMatch[1].length >= activeFence.length
      ) {
        activeFence = null;
      }

      continue;
    }

    if (fenceMatch) {
      activeFence = fenceMatch[1];
      continue;
    }

    if (blockedTagPattern.test(stripInlineCode(line))) {
      return {
        title: '文章内容包含不可渲染的 script 标签',
        description:
          '当前博客正文不允许直接渲染 <script>。如果你只是想展示脚本代码，请改成 fenced code block，例如 ```html 或 ```js。',
        detail: `在第 ${lineIndex + 1} 行检测到 <script> 标签，已阻止本次渲染。`,
      };
    }
  }

  return null;
}

function getMdxErrorDetail(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return '未知的 MDX 编译错误';
}

function createMdxOptions(options?: MDXRemoteProps['options']) {
  return {
    ...options,
    mdxOptions: {
      ...(options?.mdxOptions || {}),
      remarkPlugins: [...(options?.mdxOptions?.remarkPlugins || []), remarkGfm],
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
  } satisfies MDXRemoteProps['options'];
}

export async function renderBlogMdx(
  props: BlogMdxSourceProps,
): Promise<BlogMdxRenderResult> {
  const issue = findBlockedTagIssue(props.source);

  if (issue) {
    return {
      content: null,
      issue,
    };
  }

  try {
    const { content } = await compileMDX({
      ...props,
      components: { ...components, ...(props.components || {}) },
      options: createMdxOptions(props.options),
    });

    return {
      content,
      issue: null,
    };
  } catch (error) {
    return {
      content: null,
      issue: {
        title: '文章解析失败',
        description:
          '当前文章没有通过 MDX 编译。请检查未闭合标签、JSX 语法，或者没有正确包起来的代码块。',
        detail: getMdxErrorDetail(error),
      },
    };
  }
}

export async function CustomMDX({
  components: customComponents,
  options,
  ...props
}: BlogMdxSourceProps) {
  const { content } = await renderBlogMdx({
    ...props,
    components: customComponents,
    options,
  });

  return content;
}
