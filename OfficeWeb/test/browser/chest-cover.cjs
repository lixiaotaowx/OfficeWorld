// 宝箱视频链接的封面缩略图：显示、点击放大观看、取不到封面时的降级，
// 以及 `?cover=` 这个新端点的**真实**链路（不是打桩）。
//
//   node test/browser/chest-cover.cjs              # 本地：vite 前端 + 本机真后端（联网取 B 站封面）
//   BOX_LIVE=1 node test/browser/chest-cover.cjs   # 正式站前端（业务接口打桩，证明发布产物里有这套 UI）
//   BOX_QA=1   node test/browser/chest-cover.cjs   # 已部署的 QA 实例（SSH 隧道 127.0.0.1:3200）
//
// 截图 ../Build/chest-cover-{local,live,qa}.png。
const { launch } = require('./playwright.cjs');
const { createServer } = require('vite');
const react = require('@vitejs/plugin-react');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');

const LIVE = process.env.BOX_LIVE === '1';
const QA = process.env.BOX_QA === '1';
const tag = LIVE ? 'live' : QA ? 'qa' : 'local';
const SITE = 'https://115.159.43.237';
const COVER_OK = 'https://www.bilibili.com/video/BV1B7411m7LV/';
const COVER_ALSO = 'https://www.bilibili.com/video/BV1GJ411x7h7/';
const COVER_NONE = 'https://www.douyin.com/video/7146408143612345678';
const PLAIN_LINK = 'https://coolors.co/palettes/trending';
const PHOTO = 'data:image/png;base64,' + fs.readFileSync(
  path.join('public', 'assets', 'characters', 'thumbnails', 'body-ink.png')).toString('base64');

/** 真实后端：本机起一个独立实例，或打已部署的 QA 实例。 */
async function realBackend() {
  if (QA) return { base: 'http://127.0.0.1:3200', close: async () => {} };
  const ROOT = path.resolve(__dirname, '..', '..', '..');
  const { createOfficeServer } = await import(pathToFileURL(path.join(ROOT, 'OfficeWeb/server.mjs')));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'chest-cover-'));
  const server = createOfficeServer({ statePath: path.join(dir, 'state.json'),
    accountsPath: path.join(dir, 'accounts.json'), chatPath: path.join(dir, 'chat'), secureCookies: false });
  await new Promise(done => server.http.listen(0, '127.0.0.1', done));
  return { base: 'http://127.0.0.1:' + server.http.address().port,
    close: () => new Promise(done => server.http.close(done)) };
}

async function backendChecks(context, base) {
  // 未登录时先问一次：封面接口不能变成匿名可用（否则就成了公开的图片代理）。
  const anonymous = await context.request.get(base + '/api/build?cover=' + encodeURIComponent(COVER_OK));
  assert.equal(anonymous.status(), 401, '封面接口同样要登录');
  const name = '宝箱封面验收';
  const options = { headers: { origin: base }, data: { name, password: 'coverqa' } };
  let response = await context.request.post(base + '/api/auth/register', options);
  if (response.status() !== 200) response = await context.request.post(base + '/api/auth/login', options);
  assert.equal(response.status(), 200, 'QA 账号要能注册或登录');
  await context.request.post(base + '/api/auth/role', { headers: { origin: base }, data: { role: 'employee' } });

  const part = { kind: 'chest', x: 20, y: 0, z: 0, rotation: 0, color: '#f3dfc5' };
  const chest = (await (await context.request.post(base + '/api/build',
    { headers: { origin: base }, data: { action: 'add', part } })).json()).changed;
  assert.ok(chest?.id, 'QA 宝箱要能建出来');

  const cover = await context.request.get(base + '/api/build?cover=' + encodeURIComponent(COVER_OK));
  assert.equal(cover.status(), 200, 'B 站链接要能取到封面');
  assert.match(cover.headers()['content-type'], /^image\//, '封面必须是图片');
  const bytes = Buffer.from(await cover.body());
  assert.ok(bytes.length > 2000, '封面要有实际内容，实际 ' + bytes.length + ' 字节');
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', '封面应是平台 CDN 压过的小图（webp）');
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
  assert.match(String(cover.headers()['cache-control'] || ''), /max-age=\d+/, '封面要允许浏览器缓存');

  // 一屏里同时有好几条视频链接：连发不能被限速（以前 300ms/账号会把缩略图成片打掉）。
  const burst = await Promise.all([COVER_OK, COVER_OK, COVER_ALSO].map(link =>
    context.request.get(base + '/api/build?cover=' + encodeURIComponent(link))));
  for (const item of burst) assert.equal(item.status(), 200, '连发封面请求不该被限速');
  assert.equal(Buffer.from(await burst[2].body()).toString('ascii', 8, 12), 'WEBP', '第二条视频链接也有封面');

  for (const bad of ['https://evil.test/steal.jpg', 'https://www.bilibili.com/video/BV0000000000/']) {
    const refused = await context.request.get(base + '/api/build?cover=' + encodeURIComponent(bad));
    assert.equal(refused.status(), 204, '拿不到封面就回 204，让前端降级：' + bad);
    assert.equal((await refused.body()).length, 0);
  }
  return { coverBytes: bytes.length, contentType: cover.headers()['content-type'] };
}

/** 走到场景里的宝箱前点开它（三维拾取，不走 DOM 捷径）。 */
async function openChest(page, id, x = 20) {
  await page.waitForFunction(chest => window.__officeDebug?.__scene.getObjectByName('build-' + chest),
    id, { timeout: 25000 });
  const at = await page.evaluate(spot => {
    const d = window.__officeDebug, c = d.__camera, k = d.controls();
    k.dispatchEvent({ type: 'start' }); k.target.set(spot, .5, 0);
    c.position.set(spot, 4, 6); c.lookAt(k.target); c.updateMatrixWorld(true);
    const v = c.position.clone().set(spot, .5, 0).project(c), r = document.querySelector('.scene canvas').getBoundingClientRect();
    return { x: r.left + (v.x + 1) * r.width / 2, y: r.top + (1 - v.y) * r.height / 2 };
  }, x);
  await page.mouse.click(at.x, at.y);
  await page.getByRole('dialog', { name: '共享宝箱', exact: true }).waitFor();
}

/** 真实后端 + 真实封面 + 真实面板：截图里看到的是 B 站自己那张图。 */
async function realPanel(browser, base, vite) {
  const context = await browser.newContext({ viewport: { width: 1500, height: 950 } });
  // 换一个账号：`/api/build` 的写节流是按账号的（120ms），同一账号连着写会被挡。
  const options = { headers: { origin: base }, data: { name: '宝箱封面实拍', password: 'coverqa' } };
  let response = await context.request.post(base + '/api/auth/register', options);
  if (response.status() !== 200) response = await context.request.post(base + '/api/auth/login', options);
  assert.equal(response.status(), 200);
  const account = (await response.json()).user;
  // 只把 `/api/auth/me` 换成"访客 + 已捏过人"：否则新账号会先被捏人面板挡住，员工还会弹选座提示。
  // 存档、宝箱和封面走的都是真服务端。
  await context.route('**/api/auth/me', route => route.fulfill({ json: {
    user: { ...account, role: 'visitor', lookConfirmed: true } } }));
  // 服务端对 `/api/build` 的写操作有 120ms/账号 的既有节流（真人一次贴一条，撞不上）。
  const write = async data => {
    await new Promise(done => setTimeout(done, 160));
    return context.request.post(base + '/api/build', { headers: { origin: base }, data });
  };
  // 离上面那个验收宝箱远一点：两个宝箱叠在同一坐标时，点击只会命中先渲染的那个。
  const part = { kind: 'chest', x: 30, y: 0, z: 0, rotation: 0, color: '#f3dfc5' };
  const chest = (await (await write({ action: 'add', part })).json()).changed;
  const entries = [
    { type: 'link', title: '真实 B 站视频（封面来自平台）', value: COVER_ALSO },
    { type: 'link', title: '普通网页链接', value: PLAIN_LINK },
    { type: 'note', title: '一张便签', value: '封面取不到时退回原来的类型符号。' },
  ];
  for (const entry of entries) {
    const put = await write({ action: 'put', id: chest.id, entry });
    assert.equal(put.status(), 200, '要能放进宝箱');
  }
  const listed = await (await context.request.get(base + '/api/build?chest=' + encodeURIComponent(chest.id))).json();
  assert.equal(listed.entries?.length, entries.length, '宝箱里应该有刚放进去的条目：' + JSON.stringify(listed).slice(0, 200));

  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (process.env.COVER_TRACE) {
    page.on('request', r => { if (r.url().includes('api/build')) console.error('[browser req]', r.url().slice(0, 140)); });
    page.on('requestfailed', r => console.error('[browser failed]', r.url().slice(0, 140), r.failure()?.errorText));
    page.on('response', r => { if (r.url().includes('api/build')) console.error('[browser res]', r.status(), r.url().slice(0, 140)); });
  }
  await page.routeWebSocket('**/socket.io/**', socket => socket.close());
  await page.route('**/socket.io/**', route => route.fulfill({ status: 503, body: 'isolated' }));
  await page.goto('http://127.0.0.1:' + vite.httpServer.address().port + '/?debug=1');
  await openChest(page, chest.id, 30);
  try {
    await page.waitForFunction(() => document.querySelector('.chest-cover img')?.naturalWidth > 0, null, { timeout: 25000 });
  } catch (error) {
    console.error('[real] cover never painted:', JSON.stringify(await page.evaluate(mine => ({
      covers: document.querySelectorAll('.chest-cover').length,
      glyphs: document.querySelectorAll('.chest-glyph').length,
      rows: document.querySelectorAll('.build-chest-items article').length,
      error: document.querySelector('.build-error')?.textContent,
      mine,
      html: document.querySelector('.build-chest-items')?.innerHTML.slice(0, 600),
    }), chest.id)));
    throw error;
  }
  await page.locator('.build-chest').screenshot({ path: path.join('..', 'Build', 'chest-cover-real.png') });
  const result = await page.locator('.chest-cover img').evaluate(img => ({ src: img.getAttribute('src'),
    natural: [img.naturalWidth, img.naturalHeight] }));
  result.glyphs = await page.locator('.chest-glyph').count();
  result.notes = await page.locator('.chest-note').count();
  assert.ok(result.natural[0] > 0 && result.natural[1] > 0, '真实封面要真的画出来 ' + JSON.stringify(result));
  assert.equal(result.glyphs, 2, '普通链接是 ↗、便签是 ≡，都不该有封面');
  assert.equal(result.notes, 1, '便签照常渲染');
  assert.deepEqual(errors, [], '真实链路没有页面异常');
  await context.close();
  return result;
}

(async () => {
  // 后端要先起来：vite 那个开发页把 `/api` 代理过去，页面才拿得到真存档（也才能点到真宝箱）。
  const backend = await realBackend();
  const vite = LIVE ? null : await createServer({ configFile: false, root: path.resolve('.'),
    plugins: [react()], server: { host: '127.0.0.1', port: 0,
      proxy: { '/api': { target: backend.base, changeOrigin: false } } } });
  if (vite) await vite.listen();
  const browser = await launch();
  const report = {};
  try {
    // ── 1. 真的后端：解析平台封面并代理 ────────────────────────────────────────
    const api = await browser.newContext({ ignoreHTTPSErrors: true });
    try {
      report.backend = await backendChecks(api, backend.base);
      // 打桩那半验证"行为"，这一半验证"看到的图真的是平台的图"（正式站没有测试账号，跳过）。
      if (!LIVE) report.realPanel = await realPanel(browser, backend.base, vite);
    } finally { await api.close(); }

    // ── 2. 界面：缩略图、点击放大观看、降级 ────────────────────────────────────
    const page = await browser.newPage({ viewport: { width: 1500, height: 950 }, ignoreHTTPSErrors: true });
    page.setDefaultTimeout(15000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const entries = [
      { id: 'a', type: 'link', title: '拱门做法参考', value: COVER_OK, author: '验收', owner: 'test', at: Date.now() },
      { id: 'b', type: 'link', title: '配色参考', value: PLAIN_LINK, author: '验收', owner: 'test', at: Date.now() },
      { id: 'c', type: 'link', title: '抖音片段', value: COVER_NONE, author: '验收', owner: 'test', at: Date.now() },
      { id: 'd', type: 'image', title: '材料样板', value: PHOTO, author: '验收', owner: 'test', at: Date.now() },
    ];
    const asked = [];
    await page.routeWebSocket('**/socket.io/**', socket => socket.close());
    await page.route('**/socket.io/**', route => route.fulfill({ status: 503, body: 'isolated' }));
    await page.route('**/api/**', route => {
      const url = new URL(route.request().url());
      if (url.pathname === '/api/auth/me') return route.fulfill({ json: { user: { id: 'test', name: '验收', role: 'visitor', lookConfirmed: true } } });
      if (url.pathname === '/api/build' && url.searchParams.has('cover')) {
        const wanted = url.searchParams.get('cover');
        asked.push(wanted);
        if (wanted !== COVER_OK) return route.fulfill({ status: 204, body: '' });
        return route.fulfill({ status: 200, headers: { 'content-type': 'image/png' },
          body: Buffer.from(PHOTO.split(',')[1], 'base64') });
      }
      if (url.pathname === '/api/build') return route.fulfill({ json: url.searchParams.has('chest') ? { entries }
        : { revision: 1, parts: [{ id: 'box', kind: 'chest', x: 20, y: 0, z: 0, rotation: 0, version: 1, color: '#f3dfc5' }] } });
      return route.fulfill({ json: {} });
    });
    await page.goto((LIVE ? SITE : 'http://127.0.0.1:' + vite.httpServer.address().port) + '/?debug=1');
    await openChest(page, 'box');
    await page.waitForSelector('.chest-cover img');
    await page.waitForFunction(() => document.querySelector('.chest-cover img')?.naturalWidth > 0);
    // 取不到封面（抖音回 204）的那条要**退回类型符号**才叫稳定：img 出错事件是异步的，
    // 不等它落定就断言会和"封面还没失败"的中间态赛跑。
    await page.waitForFunction(() => document.querySelectorAll('.chest-glyph').length === 2);

    report.ui = await page.evaluate(() => {
      const rect = el => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
      const covers = [...document.querySelectorAll('.chest-cover')];
      const images = [...document.querySelectorAll('.chest-cover img')];
      return {
        covers: covers.length,
        coverBox: covers.map(rect),
        coverSrc: images.map(i => i.getAttribute('src')),
        coverNatural: images.map(i => [i.naturalWidth, i.naturalHeight]),
        glyphs: document.querySelectorAll('.chest-glyph').length,
        imageThumbs: document.querySelectorAll('.chest-thumb:not(.chest-cover) img').length,
        playLabels: covers.map(c => c.getAttribute('aria-label')),
      };
    });
    fs.writeFileSync(path.join('..', 'Build', 'chest-cover-' + tag + '.json'), JSON.stringify(report, null, 1));
    // 只给"视频链接"配封面；取不到封面（抖音）和普通链接保留类型符号。
    assert.equal(report.ui.covers, 1, '只有能拿到封面的视频链接显示缩略图 ' + JSON.stringify(report.ui));
    assert.equal(report.ui.glyphs, 2, '普通链接与取不到封面的视频链接退回类型符号');
    assert.equal(report.ui.imageThumbs, 1, '图片条目的缩略图不受影响');
    assert.equal(report.ui.coverNatural[0][0] > 0, true, '封面图真的加载出来了');
    assert(report.ui.coverBox[0].w >= 100 && report.ui.coverBox[0].h >= 80, '封面有实际尺寸 ' + JSON.stringify(report.ui.coverBox[0]));
    // 页面只请求本站端点，绝不能把第三方图床地址直接塞进 <img>。
    for (const src of report.ui.coverSrc) assert.match(src, /^\/api\/build\?cover=https%3A%2F%2F/, '封面走本站代理：' + src);
    assert.deepEqual([...new Set(asked)].sort(), [COVER_OK, COVER_NONE].sort(), '只为视频链接请求封面，且各问一次');
    assert.match(report.ui.playLabels[0], /^放大观看：/, '缩略图的可访问名说明它会放大观看');
    await page.locator('.build-chest').screenshot({ path: path.join('..', 'Build', 'chest-cover-' + tag + '.png') });

    // 点缩略图就是"放大观看"：直接开播放器，不用再去点那个小按钮。
    await page.locator('.chest-cover').click();
    const dialog = page.getByRole('dialog', { name: '宝箱视频' });
    await dialog.waitFor();
    assert.match(await page.locator('.chest-video-window iframe').getAttribute('src'), /player\.bilibili\.com/,
      '点缩略图直接打开放大播放器');
    report.playerWidth = await page.locator('.chest-video-window').evaluate(el => Math.round(el.getBoundingClientRect().width));
    assert.ok(report.playerWidth >= 900, '宽屏下播放器窗口要够大（放大观看），实际 ' + report.playerWidth);
    await page.screenshot({ path: path.join('..', 'Build', 'chest-cover-player-' + tag + '.png') });
    await page.getByRole('button', { name: '关闭视频', exact: true }).click();

    // 原按钮还在，两条路都能进播放器。
    await page.getByRole('button', { name: '▶ B站观看' }).click();
    await page.getByRole('dialog', { name: '宝箱视频' }).waitFor();
    await page.keyboard.press('Escape');
    assert.deepEqual(errors, [], '没有页面异常');
    console.log('PASS chest cover', JSON.stringify(report));
  } finally { await browser.close(); if (vite) await vite.close(); await backend.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
