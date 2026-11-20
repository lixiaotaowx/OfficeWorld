// Run with the repository's Electron executable. The optional argument is a local reference dist.
const { app, BrowserWindow, session } = require('electron');
const { once } = require('node:events');
const assert = require('node:assert/strict');
const { mkdtemp, mkdir, readdir, rm, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join, resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const project = resolve(__dirname, '../..');
const output = join(project, 'Build', 'reverse-smoke');
const applicationDist = join(project, 'OfficeWebReverse', 'dist');
const referenceDist = process.argv[2] ? resolve(process.argv[2]) : null;

async function waitFor(window, condition) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (await window.webContents.executeJavaScript(condition)) return;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  const body = await window.webContents.executeJavaScript('document.body.innerText.slice(0, 500)');
  throw new Error(`Timed out waiting for ${condition}\n${body}`);
}

async function checkEntries(origin) {
  for (const route of ['/', '/dock.html', '/host.html']) {
    const response = await fetch(origin + route);
    assert.match(response.headers.get('content-type') ?? '', /^text\/html/, route);
    for (const [, url] of (await response.text()).matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)) {
      const asset = await fetch(origin + url, { method: 'HEAD' });
      assert.ok(asset.ok && !asset.headers.get('content-type')?.includes('application/json'), url);
    }
  }
}

async function checkNavigationWorker(window, assetsRoot) {
  const workers = (await readdir(join(assetsRoot, 'assets'))).filter(name => /^navigation\.worker-.*\.js$/.test(name));
  assert.equal(workers.length, 1, 'Navigation worker build output');
  const path = '/assets/' + workers[0];
  const result = await window.webContents.executeJavaScript(`new Promise((resolve, reject) => {
    const worker = new Worker(${JSON.stringify(path)}, { type: 'module' });
    const timeout = setTimeout(() => { worker.terminate(); reject(new Error('Navigation worker timed out')); }, 5000);
    worker.onmessage = ({ data }) => { clearTimeout(timeout); worker.terminate(); resolve(data); };
    worker.postMessage({ kind: 'walk', boxes: [{ x0: -4, x1: 4, z0: -4, z1: 4, y0: -0.2, y1: 0 }],
      ladders: [], start: { x: 0, y: 0, z: 0 }, target: { x: 2, y: 0, z: 0 } });
  })`);
  assert.deepEqual(result, [{ x: 2, y: 0, z: 0 }]);
}

async function checkHallSettings(window) {
  await window.webContents.executeJavaScript(`document.querySelector('button[aria-label="设置"]').click()`);
  await waitFor(window, 'document.querySelectorAll(".hall-sheet [role=tab]").length === 6');
  for (const tab of ['通知', '文件', '屏幕与预览', '显示与操作', '工位与账号', '我的形象']) {
    const tabSelector = JSON.stringify(tab);
    await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('.hall-sheet [role=tab]')).find(el => el.textContent.trim() === ${tabSelector}).click()`);
    await waitFor(window, `document.querySelector('.hall-sheet [role=tabpanel] h3')?.textContent.trim() === ${tabSelector}`);
  }
  await window.webContents.executeJavaScript(`document.querySelector('.hall-sheet button[aria-label="关闭设置"]').click()`);
  await waitFor(window, '!document.querySelector(".hall-sheet")');
}

async function verify(assetsRoot, label) {
  const { createOfficeServer } = await import(pathToFileURL(join(project, 'OfficeWeb/server.mjs')));
  const state = await mkdtemp(join(tmpdir(), 'office-source-smoke-'));
  const { http, io, stopCat } = createOfficeServer({
    assetsRoot, secureCookies: false,
    accountsPath: join(state, 'accounts.json'),
    statePath: join(state, 'state.json'),
  });
  http.listen(0, '127.0.0.1');
  await once(http, 'listening');
  const origin = `http://127.0.0.1:${http.address().port}`;
  const browserSession = session.fromPartition(`smoke-${label}`);
  browserSession.webRequest.onBeforeRequest(({ url }, done) => {
    const target = new URL(url);
    const network = ['http:', 'https:', 'ws:', 'wss:'].includes(target.protocol);
    done({ cancel: network && (target.hostname !== '127.0.0.1' || target.port !== String(http.address()?.port)) });
  });
  const errors = [];
  const workerRequests = [];
  browserSession.webRequest.onCompleted({ urls: [`${origin}/assets/*`] }, details => {
    const mime = Object.entries(details.responseHeaders ?? {})
      .find(([key]) => key.toLowerCase() === 'content-type')?.[1]?.join(' ') ?? '';
    if (details.statusCode >= 400 || mime.includes('application/json')) errors.push(`${details.statusCode}: ${details.url}`);
    if (/\/navigation\.worker-.*\.js$/.test(details.url) && details.statusCode === 200) workerRequests.push(details.url);
  });
  const window = new BrowserWindow({ width: 1120, height: 760, show: false,
    webPreferences: { session: browserSession, backgroundThrottling: false } });
  window.webContents.on('console-message', ({ level, message }) => {
    if (level === 'error' && !/^Failed to load resource/.test(message)) {
      errors.push(message);
      console.error(`${label}: ${message}`);
    }
  });
  try {
    await checkEntries(origin);
    const response = await fetch(origin + '/api/auth/register', { method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Source regression', password: 'local-smoke' }),
    });
    assert.equal(response.status, 200, await response.text());
    const [name, value] = response.headers.get('set-cookie').split(';')[0].split('=');
    await browserSession.cookies.set({ url: origin, name, value, httpOnly: true });
    await window.loadURL(origin);
    await waitFor(window, 'document.querySelectorAll(".role-option").length === 2');
    await window.webContents.executeJavaScript('document.fonts.ready.then(() => true)');
    const role = await window.webContents.capturePage();
    const roleHtml = await window.webContents.executeJavaScript('document.querySelector(".role-page").outerHTML');
    await window.webContents.executeJavaScript('document.querySelectorAll(".role-option")[1].click()');
    await waitFor(window, 'fetch("/api/auth/me").then(r => r.json()).then(d => d.user?.role === "visitor")');
    await waitFor(window, '!document.querySelector(".role-page") && !!document.querySelector(".hall-gl")');
    await waitFor(window, 'Array.from(document.styleSheets).some(s => /HallView-.*\\.css$/.test(s.href || ""))');
    await checkNavigationWorker(window, assetsRoot);
    await checkHallSettings(window);
    const hall = await window.webContents.capturePage();
    await writeFile(join(output, `${label}-role.png`), role.toPNG());
    await writeFile(join(output, `${label}-hall.png`), hall.toPNG());
    assert.deepEqual(errors, [], label);
    console.log(`${label}: entries, visitor selection, hall, and lazy stylesheet verified`);
    if (workerRequests.length) console.log(`${label}: navigation worker fetched`);
    return { bitmap: role.toBitmap(), roleHtml };
  } finally {
    window.destroy();
    stopCat();
    await new Promise(resolve => io.close(resolve));
    await rm(state, { recursive: true });
  }
}

app.on('window-all-closed', () => {});
mkdtemp(join(tmpdir(), 'office-electron-smoke-')).then(async profile => {
  app.setPath('userData', profile);
  await app.whenReady();
  await mkdir(output, { recursive: true });
  const reference = referenceDist ? await verify(referenceDist, 'reference') : null;
  const actual = await verify(applicationDist, 'current');
  if (reference) {
    assert.equal(actual.roleHtml, reference.roleHtml, 'Role page markup');
    assert.ok(actual.bitmap.equals(reference.bitmap), 'Role page pixels');
    console.log('Reference and current role selection match pixel for pixel');
  }
  app.exit(0);
}).catch(error => { console.error(error); app.exit(1); });
