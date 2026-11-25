export const BLOG_SITE_HOSTS = new Set(['huzhihui.com', 'www.huzhihui.com']);

export const BLOG_TRUSTED_EXTERNAL_HOSTS = new Set([
  ...BLOG_SITE_HOSTS,
  'github.com',
  'www.github.com',
  'localhost',
  '127.0.0.1',
]);

export const BLOG_BASE_ORIGIN = 'https://huzhihui.com';

export function isBlogStaticAssetLink(href: string) {
  return (
    href.startsWith('/assets/') ||
    /\.(json|txt|csv|pdf|zip|ya?ml|xml|log)$/i.test(href)
  );
}

export function isBlogDirectActionLink(href: string) {
  return href.startsWith('mailto:') || href.startsWith('tel:');
}

export function isBlogInternalPath(href: string) {
  return (
    href.startsWith('/') || href.startsWith('./') || href.startsWith('../')
  );
}

export function resolveBlogUrl(href: string) {
  try {
    return new URL(href, BLOG_BASE_ORIGIN);
  } catch {
    return null;
  }
}

export function getBlogSafeInternalHref(url: URL) {
  const pathname = url.pathname || '/';
  return `${pathname}${url.search}${url.hash}`;
}

export function isBlogSameSiteUrl(url: URL) {
  return BLOG_SITE_HOSTS.has(url.hostname.toLowerCase());
}

// every subdomain of the site (ui., img., ...) is ours, so it skips the warning
export function isBlogOwnSubdomainUrl(url: URL) {
  return url.hostname.toLowerCase().endsWith('.huzhihui.com');
}

export function isBlogTrustedExternalUrl(url: URL) {
  return (
    BLOG_TRUSTED_EXTERNAL_HOSTS.has(url.hostname.toLowerCase()) ||
    isBlogOwnSubdomainUrl(url)
  );
}
