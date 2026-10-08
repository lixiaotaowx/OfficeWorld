// 视频封面解析：地址识别、图床白名单、体积上限、缓存与失败降级。
// 全部用注入的 fetcher，不打真实网络（真机链路由 test/browser/chest-cover.cjs 的
// BOX_LIVE 分支和部署后的服务端核对负责）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { coverTarget, coverImage, buildCover, clearCoverCache } from '../build-cover.mjs';

const LINK = 'https://www.bilibili.com/video/BV1B7411m7LV/';
const json = value => new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } });
const image = (body, type = 'image/webp', extra = {}) =>
  ({ ok: true, headers: new Headers({ 'Content-Type': type, ...extra }), arrayBuffer: async () => body });

test('cover targets: real video pages only, https only', () => {
  assert.match(coverTarget('https://www.bilibili.com/video/BV1B7411m7LV/?p=2&t=30').url,
    /^https:\/\/api\.bilibili\.com\/x\/web-interface\/view\?bvid=BV1B7411m7LV$/);
  assert.match(coverTarget('https://www.bilibili.com/video/av1234').url, /\?aid=1234$/);
  assert.match(coverTarget('https://www.bilibili.com/bangumi/play/ep123456').url,
    /^https:\/\/api\.bilibili\.com\/pgc\/view\/web\/season\?ep_id=123456$/);
  assert.match(coverTarget('https://www.douyin.com/video/7146408143612345678').url,
    /^https:\/\/www\.iesdouyin\.com\/share\/video\/7146408143612345678\/$/);
  assert.equal(coverTarget('https://www.bilibili.com/video/BV1B7411m7LV/').html, false);
  assert.equal(coverTarget('https://www.douyin.com/video/7146408143612345678').html, true);
  for (const url of ['http://www.bilibili.com/video/BV1B7411m7LV/',
    'https://bilibili.com.evil.test/video/BV1B7411m7LV/',
    'https://www.bilibili.com:8443/video/BV1B7411m7LV/',
    'https://user:pass@www.bilibili.com/video/BV1B7411m7LV/',
    'https://www.bilibili.com/video/BV1B7411m7L',
    'https://www.douyin.com/user/MS4wLjABAAAA',
    'https://www.xiaohongshu.com/explore/test',
    'https://coolors.co/palettes/trending',
    '', null, undefined])
    assert.equal(coverTarget(url), null, `must reject ${url}`);
});

test('bilibili cover goes through the CDN resize rule with a platform referer', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url: String(url), referer: options.headers.Referer });
    return String(url).includes('api.bilibili.com')
      ? json({ code: 0, data: { pic: 'http://i1.hdslb.com/bfs/archive/abc.jpg' } })
      : image(Buffer.from([1, 2, 3, 4, 5]));
  };
  const cover = await coverImage(LINK, fetcher);
  assert.equal(cover.type, 'image/webp');
  assert.equal(cover.body.length, 5);
  assert.deepEqual(calls.map(call => call.url), [
    'https://api.bilibili.com/x/web-interface/view?bvid=BV1B7411m7LV',
    'https://i1.hdslb.com/bfs/archive/abc.jpg@480w_300h_1c.webp',
  ]);
  for (const call of calls) assert.equal(call.referer, 'https://www.bilibili.com/', 'CDN 认 Referer，少了就是 403');
});

test('an already-resized picture is left alone', async () => {
  const seen = [];
  await coverImage(LINK, async (url) => {
    seen.push(String(url));
    return String(url).includes('api.bilibili.com')
      ? json({ data: { pic: 'https://i0.hdslb.com/bfs/archive/abc.jpg@100w_100h_1c.webp' } })
      : image(Buffer.from([7]));
  });
  assert.match(seen[1], /abc\.jpg@100w_100h_1c\.webp$/);
  assert.equal(seen[1].match(/@/g).length, 1);
});

test('covers stay inside the image allowlist and the size cap', async () => {
  const picOn = pic => async (url) => String(url).includes('api.bilibili.com')
    ? json({ data: { pic } }) : image(Buffer.from([1, 2, 3]));
  assert.equal(await coverImage(LINK, picOn('https://evil.test/track.jpg')), null, 'off-site picture host');
  assert.equal(await coverImage(LINK, picOn('https://127.0.0.1:8080/x.jpg')), null, 'private host');
  assert.equal(await coverImage(LINK, picOn('javascript:alert(1)')), null, 'not a url');
  const html = async (url) => String(url).includes('api.bilibili.com')
    ? json({ data: { pic: 'https://i0.hdslb.com/x.jpg' } }) : image(Buffer.from('hi'), 'text/html');
  assert.equal(await coverImage(LINK, html), null, 'a web page is not a cover');
  const huge = async (url) => String(url).includes('api.bilibili.com')
    ? json({ data: { pic: 'https://i0.hdslb.com/x.jpg' } })
    : image(Buffer.alloc(64), 'image/jpeg', { 'Content-Length': String(4 * 1024 * 1024) });
  assert.equal(await coverImage(LINK, huge), null, 'declared size over the cap');
  const actuallyHuge = async (url) => String(url).includes('api.bilibili.com')
    ? json({ data: { pic: 'https://i0.hdslb.com/x.jpg' } }) : image(Buffer.alloc(600 * 1024), 'image/jpeg');
  assert.equal(await coverImage(LINK, actuallyHuge), null, 'real size over the cap');
});

test('douyin cover comes from the share page og:image', async () => {
  const seen = [];
  const cover = await coverImage('https://www.douyin.com/video/7146408143612345678', async (url, options) => {
    seen.push([String(url), options.headers.Referer]);
    if (String(url).includes('iesdouyin.com/share/video/'))
      return new Response('<html><head><meta content="https://p3-sign.douyinpic.com/a.jpeg?x=1&amp;y=2" property="og:image">' +
        '<meta property="og:image" content="https://p3-sign.douyinpic.com/second.jpeg"></head></html>',
        { status: 200, headers: { 'Content-Type': 'text/html' } });
    return image(Buffer.from([9, 9]), 'image/jpeg');
  });
  assert.equal(cover.type, 'image/jpeg');
  assert.deepEqual(seen[1], ['https://p3-sign.douyinpic.com/a.jpeg?x=1&y=2', 'https://www.douyin.com/']);
  const none = async () => new Response('<html><head></head></html>', { status: 200, headers: { 'Content-Type': 'text/html' } });
  assert.equal(await coverImage('https://www.douyin.com/video/7146408143612345678', none), null, 'no og:image means no cover');
});

test('buildCover caches hits and never throws', async () => {
  clearCoverCache();
  let calls = 0;
  const fetcher = async (url) => {
    calls++;
    return String(url).includes('api.bilibili.com')
      ? json({ data: { pic: 'https://i0.hdslb.com/x.jpg' } }) : image(Buffer.from([1]), 'image/jpeg');
  };
  assert.ok(await buildCover(LINK, fetcher));
  assert.ok(await buildCover(LINK, fetcher));
  assert.equal(calls, 2, 'second lookup is served from memory');
  const boom = async () => { throw Error('network down'); };
  assert.equal(await buildCover('https://www.bilibili.com/video/BV1B7411m7LV/?p=9', boom), null);
  assert.equal(await buildCover('https://coolors.co/trending', boom), null);
  const broken = async (url) => String(url).includes('api.bilibili.com')
    ? new Response('nope', { status: 500 }) : image(Buffer.from([1]));
  assert.equal(await coverImage(LINK + '?p=3', broken), null);
  const notJson = async () => new Response('<html>', { status: 200, headers: { 'Content-Type': 'text/html' } });
  assert.equal(await coverImage(LINK + '?p=4', notJson), null);
});

test('a platform hiccup is retried once before giving up', async () => {
  clearCoverCache();
  let tries = 0;
  const flaky = async (url) => {
    if (!String(url).includes('api.bilibili.com')) return image(Buffer.from([1]), 'image/jpeg');
    tries++;
    return tries === 1 ? new Response('busy', { status: 503 })
      : json({ data: { pic: 'https://i0.hdslb.com/x.jpg' } });
  };
  assert.ok(await buildCover(LINK + '?p=11', flaky), '第二下要拿到封面');
  assert.equal(tries, 2, '第一下扑空后重试一次');
});

test('one chest opening does not stampede the platform', async () => {
  clearCoverCache();
  let calls = 0, live = 0, peak = 0;
  const fetcher = async (url) => {
    calls++;
    if (!String(url).includes('api.bilibili.com')) return image(Buffer.from([1]), 'image/jpeg');
    live++; peak = Math.max(peak, live);
    await new Promise(done => setTimeout(done, 5));
    live--;
    return json({ data: { pic: 'https://i0.hdslb.com/' + String(url).slice(-14) + '.jpg' } });
  };
  // 同一个链接被同时问两次（同一屏里两处引用）→ 只打一次上游。
  const twin = LINK + '?p=7';
  const both = await Promise.all([buildCover(twin, fetcher), buildCover(twin, fetcher)]);
  assert.ok(both[0] && both[1]);
  assert.equal(calls, 2, '同链接并发只查一次：一次接口 + 一次图片');
  // 一屏 9 条不同链接 → 全部拿到封面，且上游并发不超过 3。
  clearCoverCache(); calls = 0; peak = 0;
  const links = 'ABCDEFGHI'.split('').map(letter => `https://www.bilibili.com/video/BV1B7411m7L${letter}/`);
  const covers = await Promise.all(links.map(link => buildCover(link, fetcher)));
  assert.equal(covers.filter(Boolean).length, 9, '每一条都拿到了封面');
  assert.ok(peak <= 3, '上游并发被闸门夹住，实测峰值 ' + peak);
});
