const blogLayoutStyle = {
  '--blog-sticky-offset': 'calc(env(safe-area-inset-top, 0px) + 5rem)',
  '--blog-sticky-max-height':
    'calc(100vh - var(--blog-sticky-offset, 5rem) - 2rem)',
} as React.CSSProperties;

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div style={blogLayoutStyle}>{children}</div>;
}
