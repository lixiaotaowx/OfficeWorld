// 宝箱视频链接的封面缩略图：服务端解析平台封面、再代理回浏览器。
//
// 为什么必须放在服务端（实测过，别改回浏览器直连）：
//   - api.bilibili.com 不返回 CORS 头，页面里 fetch 会被浏览器拦掉；
//   - 封面图 CDN 认 Referer，带本站来源直接取是 **403**，带 bilibili.com 才是 200；
//   - 原始封面常有几百 KB，走 B 站图片 CDN 的 `@480w_300h_1c.webp` 规则只有几 KB。
// 解析不到就返回 null，前端退回原来的类型符号 —— 条目本身永远不受影响。
// 只允许代理这些图床的地址，避免把本站变成任意 URL 的转发器。
const IMAGE_DOMAINS = ['hdslb.com', 'bilibili.com', 'douyinpic.com', 'douyin.com', 'byteimg.com', 'bytecdn.cn'];
const RESIZE_SUFFIX = '@480w_300h_1c.webp';
const HIT_TTL = 6 * 3600 * 1000;
const MISS_TTL = 5 * 60 * 1000;
const MAX_ENTRIES = 200;
const MAX_IMAGE_BYTES = 512 * 1024;
// 打开宝箱时一屏里的视频链接会**同时**发问，不能对每个链接都打一次上游：
// 同一个链接只查一次（in-flight 合并），不同链接最多同时查 3 条。
const MAX_UPSTREAM = 3;
const TIMEOUT = 8000;
const RETRY_DELAY = 200;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

const belongs = (host, domain) => host === domain || host.endsWith('.' + domain);
const anyDomain = (host, list) => list.some(domain => belongs(host, domain));

/** 从 `<meta property="og:image">` 取封面（两种属性顺序都认）。 */
function ogImage(html) {
  for (const tag of String(html).match(/<meta[^>]*>/gi) || []) {
    if (!/(?:property|name)=["']og:image["']/i.test(tag)) continue;
    const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
    if (content) return content.replace(/&amp;/g, '&').trim();
  }
  return null;
}

/**
 * 视频页地址 → 取封面的方式。返回 `{ url, html, pick }`，非视频页或不认的写法返回 null。
 * 口径与 `build-link.mjs` 一致：只认 https、不能带端口和凭据。
 */
export function coverTarget(value) {
  let url;
  try { url = new URL(String(value ?? '')); } catch { return null; }
  if (url.protocol !== 'https:' || url.port || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  if (belongs(host, 'bilibili.com')) {
    const bv = url.pathname.match(/\/(BV[0-9A-Za-z]{10})(?:\/|$)/)?.[1] || url.searchParams.get('bvid');
    if (bv && /^BV[0-9A-Za-z]{10}$/.test(bv)) return {
      url: `https://api.bilibili.com/x/web-interface/view?bvid=${bv}`, html: false, pick: data => data?.data?.pic };
    const av = url.pathname.match(/\/av(\d+)(?:\/|$)/)?.[1] || url.searchParams.get('aid');
    if (av && /^\d+$/.test(av)) return {
      url: `https://api.bilibili.com/x/web-interface/view?aid=${av}`, html: false, pick: data => data?.data?.pic };
    const ep = url.pathname.match(/\/ep(\d+)(?:\/|$)/)?.[1];
    // 番剧走 pgc 接口（**不是** /x/pgc/…，那个路径在线上返回的是 HTML 错误页）。
    if (ep && /^\d+$/.test(ep)) return {
      url: `https://api.bilibili.com/pgc/view/web/season?ep_id=${ep}`, html: false, pick: data => data?.result?.cover };
    return null;
  }
  if (belongs(host, 'douyin.com') || belongs(host, 'iesdouyin.com')) {
    const id = url.pathname.match(/\/(?:video|share\/video)\/(\d+)(?:\/|$)/)?.[1]
      || url.searchParams.get('modal_id') || url.searchParams.get('vid');
    if (!id || !/^\d{10,25}$/.test(id)) return null;
    // 抖音没有公开的封面接口，只能从分享页的 og:image 里读（尽力而为，读不到就不显示）。
    return { url: `https://www.iesdouyin.com/share/video/${id}/`, html: true, pick: ogImage };
  }
  return null;
}

/** 封面地址必须落在允许的图床里，协议强制 https；B 站图片再叠一层 CDN 缩放规则。 */
function imageUrl(raw, resize) {
  if (typeof raw !== 'string' || !raw) return null;
  let url;
  try { url = new URL(raw.startsWith('//') ? 'https:' + raw : raw); } catch { return null; }
  if (url.protocol === 'http:') url.protocol = 'https:';
  if (url.protocol !== 'https:' || url.port || url.username || url.password) return null;
  if (!anyDomain(url.hostname.toLowerCase(), IMAGE_DOMAINS)) return null;
  return resize && !url.href.includes('@') ? url.href + RESIZE_SUFFIX : url.href;
}

async function read(target, fetcher, referer) {
  const response = await fetcher(target.url, {
    redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT),
    headers: { 'User-Agent': UA, 'Accept-Language': 'zh-CN,zh;q=0.9', Referer: referer },
  });
  if (!response.ok) return null;
  return target.html ? response.text() : response.json();
}

/** 「为什么这张没有缩略图」很难远程猜，所以留一条 `COVER_TRACE=1` 就能打开的失败日志。 */
const trace = process.env.COVER_TRACE ? (...row) => console.error('[cover]', ...row) : () => {};

/** 平台偶尔抖一下（风控、超时）会让第一下扑空，隔 200ms 再试一次才认输。 */
async function twice(step) {
  for (let attempt = 1; ; attempt++) {
    const value = await step().catch(() => null);
    if (value || attempt >= 2) return value;
    await new Promise(done => setTimeout(done, RETRY_DELAY));
  }
}

async function metadata(target, fetcher, platform) {
  try { return target.pick(await read(target, fetcher, platform)); }
  catch (error) { trace('metadata failed:', error.message); return null; }
}

/** 取封面图本身：只收白名单图床、只收图片、只收小图。 */
async function download(picture, fetcher, platform) {
  let response;
  try {
    response = await fetcher(picture, {
      redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT),
      headers: { 'User-Agent': UA, Referer: platform },
    });
  } catch (error) { trace('cover download failed:', error.message); return null; }
  if (!response.ok) { trace('cover download status:', response.status); return null; }
  const type = String(response.headers.get('content-type') || '').split(';')[0].trim();
  if (!/^image\/(webp|jpeg|jpg|png|gif|avif)$/.test(type)) { trace('not an image:', type); return null; }
  if (Number(response.headers.get('content-length') || 0) > MAX_IMAGE_BYTES) { trace('cover too large'); return null; }
  let body;
  try { body = Buffer.from(await response.arrayBuffer()); }
  catch (error) { trace('cover body failed:', error.message); return null; }
  if (!body.length || body.length > MAX_IMAGE_BYTES) { trace('cover body rejected:', body.length); return null; }
  return { type, body };
}

/** 解析并代理一张封面；任何一步失败都返回 null（调用方据此走降级显示）。 */
export async function coverImage(value, fetcher = fetch) {
  const target = coverTarget(value);
  if (!target) { trace('not a video page:', value); return null; }
  const platform = target.html ? 'https://www.douyin.com/' : 'https://www.bilibili.com/';
  const raw = await twice(() => metadata(target, fetcher, platform));
  const picture = imageUrl(raw, !target.html);
  if (!picture) { trace('no usable cover url:', raw); return null; }
  const cover = await twice(() => download(picture, fetcher, platform));
  if (!cover) trace('gave up on:', picture);
  return cover;
}

const cache = new Map();
const inflight = new Map();
const waiting = [];
let running = 0;
export function clearCoverCache() { cache.clear(); inflight.clear(); }

/** 上游并发闸门：超出 MAX_UPSTREAM 的请求排队，不丢、也不一起冲平台接口。 */
async function gated(task) {
  if (running >= MAX_UPSTREAM) await new Promise(done => waiting.push(done));
  running++;
  try { return await task(); }
  finally { running--; waiting.shift()?.(); }
}

/** 带 TTL 内存缓存的封面查询：命中直接回，失败只记 5 分钟，免得一次抖动被记住半天。 */
export async function buildCover(value, fetcher = fetch) {
  const key = String(value ?? '');
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) return hit.value;
  if (hit) cache.delete(key);
  const pending = inflight.get(key);
  if (pending) return pending;
  const task = gated(() => coverImage(key, fetcher).catch(() => null)).then(result => {
    inflight.delete(key);
    if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
    cache.set(key, { at: Date.now(), value: result, ttl: result ? HIT_TTL : MISS_TTL });
    return result;
  });
  inflight.set(key, task);
  return task;
}
