// 应用内更新：下载安装包、进度、校验、然后启动安装器并退出
// （用户 2026-09-17：「推送安装器到服务器，网页检测到新版本弹提示、进度条、安装器覆盖安装」）。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { createUpdater, safeFileName, MAX_UPDATE_BYTES } = require('../update.cjs');
const { OFFICE_URL } = require('../policy.cjs');

/** A body that streams in slices, the way `net.fetch` hands one over. */
function streamOf(buffer, slices = 4) {
  const size = Math.ceil(buffer.length / slices) || 1;
  const parts = [];
  for (let at = 0; at < buffer.length; at += size) parts.push(buffer.subarray(at, at + size));
  return (async function* () { for (const part of parts) yield part; })();
}

function harness({ bytes = Buffer.alloc(64, 7), sha256, status = 200, contentLength } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'office-update-'));
  const progress = [], opened = [], quit = [], revealed = [];
  const digest = sha256 ?? crypto.createHash('sha256').update(bytes).digest('hex');
  const net = { fetch: async (url, options) => {
    assert.equal(options.cache, 'no-store');
    return { ok: status === 200, status,
      headers: { get: name => (name === 'content-length'
        ? String(contentLength ?? bytes.length) : null) },
      body: streamOf(bytes) };
  } };
  const updater = createUpdater({
    electron: {}, net, directory,
    shell: { openPath: async file => { opened.push(file); return ''; },
      showItemInFolder: file => { revealed.push(file); } },
    app: { getPath: () => os.tmpdir(), quit: () => quit.push(true) },
    onProgress: payload => progress.push(payload),
    now: (() => { let t = 0; return () => (t += 1000); })(),
  });
  return { updater, directory, progress, opened, quit, revealed, digest, bytes,
    url: OFFICE_URL + 'download/iruler-dream-Setup-1.2.3-x64.exe',
    cleanup: () => fs.rmSync(directory, { recursive: true, force: true }) };
}

test('安装包文件名只取最后一段，路径穿越被拍平', () => {
  assert.equal(safeFileName('https://115.159.43.237/download/iruler-dream-Setup-0.1.14-x64.exe'),
    'iruler-dream-Setup-0.1.14-x64.exe');
  assert.equal(safeFileName('https://115.159.43.237/download/../../evil.exe'), 'evil.exe');
  assert.equal(safeFileName('not a url'), 'iruler-dream-Setup.exe', '解析不了就用默认名，不猜');
  assert.equal(safeFileName('https://115.159.43.237/download/a b;rm -rf.exe'), 'a_20b_rm_20-rf.exe');
});

test('下载安装包：写盘、按 content-length 报进度、返回 sha256', async () => {
  const h = harness();
  try {
    const result = await h.updater.download(h.url, h.digest);
    assert.equal(result.ok, true);
    assert.equal(result.size, h.bytes.length);
    assert.equal(result.sha256, h.digest);
    assert.equal(fs.readFileSync(result.file).length, h.bytes.length);
    assert.equal(path.dirname(result.file), h.directory);
    assert.equal(h.progress[0].phase, 'downloading');
    assert.equal(h.progress.at(-1).received, h.bytes.length, '最后一次进度是完整大小');
    assert.equal(h.progress.at(-1).percent, 100);
  } finally { h.cleanup(); }
});

test('哈希对不上就删掉文件并报错；下载不完整同样拒绝', async () => {
  const bad = harness({ sha256: 'a'.repeat(64) });
  try {
    await assert.rejects(bad.updater.download(bad.url, 'a'.repeat(64)), /校验失败/);
    assert.equal(fs.readdirSync(bad.directory).length, 0, '校验失败的安装包不留残留文件');
  } finally { bad.cleanup(); }

  const short = harness({ contentLength: 999 });
  try {
    await assert.rejects(short.updater.download(short.url), /下载不完整/);
    assert.equal(fs.readdirSync(short.directory).length, 0);
  } finally { short.cleanup(); }

  const missing = harness({ status: 404 });
  try { await assert.rejects(missing.updater.download(missing.url), /404/); }
  finally { missing.cleanup(); }
});

test('只允许从本软件的服务器下载，别的域名一律拒绝', async () => {
  const h = harness();
  try {
    await assert.rejects(h.updater.download('https://evil.example.com/x.exe'), /不是本软件的服务器/);
    assert.equal(h.progress.length, 0, '拒绝时不该有任何进度');
  } finally { h.cleanup(); }
});

test('体积上限：content-length 过大直接拒绝', async () => {
  const h = harness({ contentLength: MAX_UPDATE_BYTES + 1 });
  try { await assert.rejects(h.updater.download(h.url), /异常地大/); }
  finally { h.cleanup(); }
});

test('安装：打开安装器然后退出；目录外的路径不认', async () => {
  const h = harness();
  try {
    const result = await h.updater.download(h.url, h.digest);
    const installed = await h.updater.install(result.file, { quitAfterMs: 0 });
    assert.equal(installed.ok, true);
    assert.deepEqual(h.opened, [result.file]);
    await new Promise(resolve => setTimeout(resolve, 10));
    assert.deepEqual(h.quit, [true], '启动安装器后要退出，安装器才能覆盖正在运行的文件');
    await assert.rejects(h.updater.install(path.join(os.tmpdir(), 'elsewhere.exe')), /路径不可信/);
  } finally { h.cleanup(); }
});

test('弹出文件夹：在资源管理器里定位安装包；文件不在或路径越界都拒绝', async () => {
  // 用户报障「下载好了没有弹出文件夹」——新客户端把安装包所在文件夹直接弹出来（2026-09-17）。
  const h = harness();
  try {
    const result = await h.updater.download(h.url, h.digest);
    const shown = await h.updater.reveal(result.file);
    assert.equal(shown.ok, true);
    assert.deepEqual(h.revealed, [result.file]);
    fs.rmSync(result.file, { force: true });
    await assert.rejects(h.updater.reveal(result.file), /不存在/);
    await assert.rejects(h.updater.reveal('C:/Windows/system32/cmd.exe'), /路径不可信/);
  } finally { h.cleanup(); }
});
