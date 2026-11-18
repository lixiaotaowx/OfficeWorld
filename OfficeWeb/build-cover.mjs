import { videoLink } from './build-link.mjs';
const MAX_IMAGE_BYTES = 512 * 1024;
const MAX_ENTRIES = 200;
const cache = new Map();
const inflight = new Map();
const waiting = [];
let running = 0;
export function coverTarget(value) {
  const link = videoLink(value);
  return link?.platform === 'youtube'
    ? { url: `https://i.ytimg.com/vi/${link.id}/hqdefault.jpg` } : null;
}
export async function coverImage(value, fetcher = fetch) {
  const target = coverTarget(value);
  if (!target) return null;
  let response;
  try {
    response = await fetcher(target.url, { redirect: 'error', signal: AbortSignal.timeout(8000) });
    const type = String(response.headers.get('content-type') || '').split(';')[0].trim();
    if (!response.ok || !/^image\/(jpeg|png|webp)$/.test(type)
      || Number(response.headers.get('content-length') || 0) > MAX_IMAGE_BYTES) {
      await response.body?.cancel();
      return null;
    }
    const reader = response.body?.getReader();
    if (!reader) return null;
    const chunks = [];
    let size = 0;
    for (;;) {
      const { done, value: chunk } = await reader.read();
      if (done) break;
      size += chunk.byteLength;
      if (size > MAX_IMAGE_BYTES) { await reader.cancel(); return null; }
      chunks.push(Buffer.from(chunk));
    }
    return size ? { type, body: Buffer.concat(chunks) } : null;
  } catch { return null; }
}
export function clearCoverCache() { cache.clear(); }
async function gated(task) {
  if (running >= 3) await new Promise(resolve => waiting.push(resolve));
  running++;
  try { return await task(); }
  finally { running--; waiting.shift()?.(); }
}
export async function buildCover(value, fetcher = fetch) {
  const target = coverTarget(value);
  if (!target) return null;
  const key = target.url;
  const entry = cache.get(key);
  if (entry && Date.now() - entry.time < entry.ttl) return entry.value;
  if (inflight.has(key)) return inflight.get(key);
  const pending = gated(() => coverImage(value, fetcher)).then(result => {
    if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
    cache.set(key, { value: result, time: Date.now(), ttl: result ? 21600000 : 300000 });
    return result;
  }).finally(() => inflight.delete(key));
  inflight.set(key, pending);
  return pending;
}
