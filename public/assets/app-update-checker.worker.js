const inFlightUrls = new Set();
const etags = new Map();
self.addEventListener('message', ({ data }) => {
  if (data?.type !== 'check' || typeof data.url !== 'string') return;
  void check(data);
});
async function check(message) {
  if (inFlightUrls.has(message.url)) return;
  inFlightUrls.add(message.url);
  try {
    const url = new URL(message.url);
    url.searchParams.set('t', Date.now().toString());
    const response = await fetch(url, {
      method: 'HEAD',
      cache: 'no-store',
      credentials: 'same-origin',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new Error(`Update check failed with HTTP ${response.status}`);
    const etag = response.headers.get('etag');
    if (!etag) {
      self.postMessage({ type: 'unavailable' });
      return;
    }
    if (!etags.has(message.url)) {
      etags.set(message.url, etag);
      self.postMessage({ type: 'baseline' });
      return;
    }
    self.postMessage({
      type: etag === etags.get(message.url) ? 'unchanged' : 'changed',
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : String(error),
    });
  } finally {
    inFlightUrls.delete(message.url);
  }
}
