import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverTarget, coverImage, buildCover, clearCoverCache } from '../build-cover.mjs';

// 11 月的封面只保留 YouTube：B 站/抖音的解析已经下线（videoLink 只认 YouTube）。
const YOUTUBE = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const image = (body, type = 'image/webp', extra = {}) =>
  ({ ok: true, headers: new Headers({ 'Content-Type': type, ...extra }), arrayBuffer: async () => body,
    body: { getReader: () => { let sent = false; return { read: async () => sent ? { done: true, value: undefined } : (sent = true, { done: false, value: body }), cancel: async () => {} }; } } });

test('cover targets: YouTube only, https only', () => {
  assert.equal(coverTarget(YOUTUBE).url, 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  assert.equal(coverTarget('https://youtu.be/dQw4w9WgXcQ').url, 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  // 11 月已下线 B 站与抖音封面：一律 no cover。
  for (const url of ['https://www.bilibili.com/video/BV1B7411m7LV/',
    'https://www.douyin.com/video/7146408143612345678',
    'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com:8443/watch?v=dQw4w9WgXcQ',
    'https://user:pass@www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://www.youtube.com/watch?v=short',
    'https://www.xiaohongshu.com/explore/test',
    'https://coolors.co/palettes/trending',
    '', null, undefined])
    assert.equal(coverTarget(url), null, `must reject ${url}`);
});

test('youtube cover fetches the thumbnail and caps the size', async () => {
  clearCoverCache();
  const calls = [];
  const fetcher = async (url) => { calls.push(String(url)); return image(Buffer.alloc(1000, 7)); };
  const cover = await coverImage(YOUTUBE, fetcher);
  assert.ok(cover, 'youtube 封面应该能拿到');
  assert.equal(cover.type, 'image/webp');
  assert.equal(calls[0], 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg');
  // 超过 512 KB 的图直接放弃。
  clearCoverCache();
  const big = await coverImage(YOUTUBE, async () => image(Buffer.alloc(600 * 1024, 7)));
  assert.equal(big, null, '超过体积上限的封面不收');
});

test('a platform hiccup gives up (no retry) and never throws', async () => {
  clearCoverCache();
  let calls = 0;
  const cover = await coverImage(YOUTUBE, async () => { calls++; throw Error('boom'); });
  assert.equal(cover, null);
  assert.equal(calls, 1, '失败不重试（封面是装饰品）');
});

test('buildCover caches hits and never throws', async () => {
  clearCoverCache();
  let calls = 0;
  const fetcher = async () => { calls++; return image(Buffer.from([1, 2, 3])); };
  const first = await buildCover(YOUTUBE, fetcher);
  const second = await buildCover(YOUTUBE, fetcher);
  assert.equal(calls, 1, '同一封面只取一次');
  assert.equal(first.type, second.type);
  // 一个永远抛错的地址也绝不把请求链弄挂。
  const bad = await buildCover('https://youtu.be/badbadbad', async () => { throw Error('x'); });
  assert.equal(bad, null);
  clearCoverCache();
});

test('one cover fetch does not stampede youtube (concurrency gated)', async () => {
  clearCoverCache();
  let inflight = 0, peak = 0;
  const fetcher = async () => {
    inflight++; peak = Math.max(peak, inflight);
    await new Promise(resolve => setTimeout(resolve, 10));
    inflight--; return image(Buffer.from([9]));
  };
  await Promise.all(Array.from({ length: 8 }, () => buildCover(`https://youtu.be/v${Math.random()}`, fetcher)));
  assert.ok(peak <= 3, `并发封顶 3，实际峰值 ${peak}`);
});
