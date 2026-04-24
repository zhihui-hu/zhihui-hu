import type { NextRequest } from 'next/server';

const ALLOWED_REMOTE_IMAGE_HOSTS = new Set(['img.huzhihui.com']);
const DEFAULT_CACHE_CONTROL =
  'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800';

function getUpstreamImageUrl(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');

  if (!rawUrl) {
    return null;
  }

  try {
    const url = new URL(rawUrl);

    if (url.protocol !== 'https:') {
      return null;
    }

    if (!ALLOWED_REMOTE_IMAGE_HOSTS.has(url.hostname)) {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const upstreamUrl = getUpstreamImageUrl(request);

  if (!upstreamUrl) {
    return new Response('Invalid image url', { status: 400 });
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetch(upstreamUrl, {
      headers: {
        accept:
          'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      next: {
        revalidate: 60 * 60 * 24,
      },
    });
  } catch {
    return new Response('Failed to fetch image', { status: 502 });
  }

  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return new Response('Failed to fetch image', {
      status: upstreamResponse.status || 502,
    });
  }

  const contentType = upstreamResponse.headers.get('content-type');

  if (!contentType?.startsWith('image/')) {
    return new Response('Unsupported image type', { status: 415 });
  }

  const headers = new Headers();
  const contentLength = upstreamResponse.headers.get('content-length');
  const etag = upstreamResponse.headers.get('etag');
  const lastModified = upstreamResponse.headers.get('last-modified');

  headers.set('Cache-Control', DEFAULT_CACHE_CONTROL);
  headers.set('Content-Disposition', 'inline');
  headers.set('Content-Type', contentType);

  if (contentLength) {
    headers.set('Content-Length', contentLength);
  }

  if (etag) {
    headers.set('ETag', etag);
  }

  if (lastModified) {
    headers.set('Last-Modified', lastModified);
  }

  return new Response(upstreamResponse.body, {
    headers,
    status: upstreamResponse.status,
  });
}
