import { getBlogLastModified, getBlogPosts } from '@/lib/blog';

import pkg from '../../../package.json';

export const dynamic = 'force-static';

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const siteUrl = pkg.seo.og.url;
  const posts = getBlogPosts();

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const publishedAt = getBlogLastModified(
        post.metadata.publishedAt,
      ).toUTCString();

      return `
  <item>
    <title>${escapeXml(post.metadata.title)}</title>
    <link>${url}</link>
    <pubDate>${publishedAt}</pubDate>
    <description>${escapeXml(post.metadata.summary)}</description>
  </item>`;
    })
    .join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(pkg.seo.siteName)}</title>
  <link>${siteUrl}</link>
  <description>${escapeXml(`${pkg.seo.siteName} 的个人网站 RSS feed`)}</description>
${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
