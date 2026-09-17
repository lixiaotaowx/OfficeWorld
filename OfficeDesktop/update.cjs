// In-app update: download the installer the office site published, watch the bytes
// arrive, verify them, then hand the file to Windows and step aside.
//
// The page cannot do any of this itself: a browser cannot write a 96MB exe to disk, and
// it certainly cannot run it. So the work lives here, behind the same trusted-origin gate
// as every other bridge call (user, 2026-09-17: "网页检测到新版本就弹出更新软件的提示，
// 然后就是下载进度条，然后安装器打开覆盖安装").
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { trusted, OFFICE_URL } = require('./policy.cjs');

/** How often progress may cross the IPC boundary; more is wasted work per chunk. */
const PROGRESS_INTERVAL_MS = 250;
/** An installer is ~100MB; refuse anything absurd before writing many bytes. */
const MAX_UPDATE_BYTES = 512 * 1024 * 1024;

/** Keep the published file name, but never let it escape the update folder. */
function safeFileName(url) {
  let name = 'iruler-dream-Setup.exe';
  try { name = path.basename(new URL(url).pathname) || name; } catch { /* keep the default */ }
  return name.replace(/[^A-Za-z0-9._-]/g, '_') || 'iruler-dream-Setup.exe';
}

function createUpdater(dependencies = {}) {
  const electron = dependencies.electron || require('electron');
  const net = dependencies.net || electron.net;
  const shell = dependencies.shell || electron.shell;
  const app = dependencies.app || electron.app;
  const files = dependencies.fs || fs;
  const now = dependencies.now || (() => Date.now());
  const onProgress = dependencies.onProgress || (() => {});
  /** Where downloaded installers live; tests inject a scratch dir, the app uses temp. */
  const directory = dependencies.directory || null;
  // Resolved on use rather than at construction: this module is also loaded by tests that
  // only exercise the trust checks and have no Electron `app` around.
  const updateDir = () => directory || path.join(app.getPath('temp'), 'iruler-dream-update');
  let running;

  const absolute = url => new URL(url, new URL(OFFICE_URL).origin).href;

  /**
   * Download `url` under the update folder. Resolves with the file path, size and digest,
   * or throws with a message the page can show verbatim.
   */
  function download(url, expectedSha256) {
    if (running) return running;
    running = (async () => {
      if (typeof url !== 'string' || !url) throw Error('缺少下载地址');
      const target = absolute(url);
      if (!trusted(target)) throw Error('下载地址不是本软件的服务器，已拒绝');
      const dir = updateDir();
      files.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, safeFileName(target));
      const response = await net.fetch(target, { cache: 'no-store' });
      if (!response.ok) throw Error('下载失败：服务器返回 ' + response.status);
      const header = Number(response.headers.get('content-length'));
      const total = Number.isFinite(header) && header > 0 ? header : 0;
      if (total > MAX_UPDATE_BYTES) throw Error('安装包异常地大，已取消下载');
      const hash = crypto.createHash('sha256');
      const out = files.createWriteStream(file);
      let received = 0, lastSent = 0;
      const report = (force) => {
        const stamp = now();
        if (!force && stamp - lastSent < PROGRESS_INTERVAL_MS) return;
        lastSent = stamp;
        onProgress({ phase: 'downloading', received, total,
          percent: total ? Math.min(100, Math.round((received / total) * 1000) / 10) : null });
      };
      const write = async chunk => {
        const buffer = Buffer.from(chunk);
        hash.update(buffer);
        received += buffer.length;
        if (received > MAX_UPDATE_BYTES) throw Error('安装包异常地大，已取消下载');
        if (!out.write(buffer)) await new Promise(resolve => out.once('drain', resolve));
        report(false);
      };
      report(true);
      try {
        // `net.fetch` runs on the Chromium stack, so it uses the app session's
        // certificate handling and streams instead of buffering 96MB in memory.
        const body = response.body;
        if (body && typeof body.getReader === 'function') {
          const reader = body.getReader();
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            await write(value);
          }
        } else {
          for await (const chunk of body) await write(chunk);
        }
      } catch (error) {
        out.destroy();
        files.rmSync(file, { force: true });
        throw error;
      }
      await new Promise((resolve, reject) => {
        out.once('error', reject);
        out.end(resolve);
      });
      const sha256 = hash.digest('hex');
      if (total && received !== total) {
        files.rmSync(file, { force: true });
        throw Error('下载不完整：' + received + '/' + total + ' 字节');
      }
      if (expectedSha256 && String(expectedSha256).toLowerCase() !== sha256) {
        files.rmSync(file, { force: true });
        throw Error('安装包校验失败，已删除，请重新下载');
      }
      report(true);
      return { ok: true, file, size: received, sha256 };
    })().finally(() => { running = undefined; });
    return running;
  }

  /**
   * Open the downloaded installer and quit, so the installer can replace the files it
   * is running from. The delay lets the page paint "正在启动安装程序" first.
   */
  async function install(file, { quitAfterMs = 1200 } = {}) {
    if (typeof file !== 'string' || !path.resolve(file).startsWith(path.resolve(updateDir()))) {
      throw Error('安装包路径不可信');
    }
    const info = files.statSync(file);
    if (!info.isFile() || info.size === 0) throw Error('安装包不存在，请重新下载');
    const failure = await shell.openPath(file);
    if (failure) throw Error('无法启动安装程序：' + failure);
    setTimeout(() => { try { app.quit(); } catch { /* already on the way out */ } }, quitAfterMs);
    return { ok: true, file };
  }

  return { download, install, directory: updateDir };
}

module.exports = { createUpdater, safeFileName, MAX_UPDATE_BYTES, PROGRESS_INTERVAL_MS };
