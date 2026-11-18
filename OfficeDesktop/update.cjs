

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawn } = require('node:child_process');
const { pipeline } = require('node:stream/promises');
const { trusted, OFFICE_URL } = require('./policy.cjs');

const PROGRESS_INTERVAL_MS = 250;

const MAX_UPDATE_BYTES = 512 * 1024 * 1024;

function safeFileName(url) {
  let name = 'officeworld-Setup.exe';
  try { name = path.basename(new URL(url).pathname) || name; } catch { /* keep the default */ }
  return name.replace(/[^A-Za-z0-9._-]/g, '_') || 'officeworld-Setup.exe';
}

function createUpdater(dependencies = {}) {
  const electron = dependencies.electron || require('electron');
  const net = dependencies.net || electron.net;
  const shell = dependencies.shell || electron.shell;
  const app = dependencies.app || electron.app;
  const files = dependencies.fs || fs;
  const now = dependencies.now || (() => Date.now());
  const launch = dependencies.spawn || spawn;
  const onProgress = dependencies.onProgress || (() => {});

  const directory = dependencies.directory || null;

  const updateDir = () => directory || path.join(app.getPath('temp'), 'officeworld-update');
  let running;
  let installing;
  const downloaded = new Map();

  const absolute = url => new URL(url, new URL(OFFICE_URL).origin).href;

  function download(url, expectedSha256) {
    if (installing) return Promise.reject(Error('Installation is already starting'));
    if (running) return running;
    running = (async () => {
      if (typeof url !== 'string' || !url) throw Error("Missing download URL");
      const target = absolute(url);
      if (!trusted(target)) throw Error("Download URL is not from the configured application origin");
      const dir = updateDir();
      files.mkdirSync(dir, { recursive: true });
      const file = path.join(dir, safeFileName(target));
      downloaded.delete(path.resolve(file));
      const response = await net.fetch(target, { cache: 'no-store' });
      if (!response.ok) throw Error("Download failed: server returned " + response.status);
      const header = Number(response.headers.get('content-length'));
      const total = Number.isFinite(header) && header > 0 ? header : 0;
      if (total > MAX_UPDATE_BYTES) throw Error("Installer is too large; download cancelled");
      const hash = crypto.createHash('sha256');
      const partial = file + '.part';
      let received = 0, lastSent = 0;
      const report = (force) => {
        const stamp = now();
        if (!force && stamp - lastSent < PROGRESS_INTERVAL_MS) return;
        lastSent = stamp;
        onProgress({ phase: 'downloading', received, total,
          percent: total ? Math.min(100, Math.round((received / total) * 1000) / 10) : null });
      };
      report(true);
      try {
        await pipeline(response.body, async function* (source) {
          for await (const chunk of source) {
            const buffer = Buffer.from(chunk);
            hash.update(buffer); received += buffer.length;
            if (received > MAX_UPDATE_BYTES) throw Error("Installer is too large; download cancelled");
            report(false);
            yield buffer;
          }
        }, files.createWriteStream(partial));
      } catch (error) {
        files.rmSync(partial, { force: true });
        throw error;
      }
      const sha256 = hash.digest('hex');
      if (!received || (total && received !== total)) {
        files.rmSync(partial, { force: true });
        throw Error("Incomplete download: " + received + '/' + total + " bytes");
      }
      if (expectedSha256 && String(expectedSha256).toLowerCase() !== sha256) {
        files.rmSync(partial, { force: true });
        throw Error("Installer checksum failed; the file was removed. Download it again.");
      }
      report(true);
      files.renameSync(partial, file);
      downloaded.set(path.resolve(file), sha256);
      return { ok: true, file, size: received, sha256 };
    })().finally(() => { running = undefined; });
    return running;
  }

  function checkPath(file) {
    const relative = typeof file === 'string' ? path.relative(path.resolve(updateDir()), path.resolve(file)) : '';
    if (!relative || relative === '..' || relative.startsWith('..' + path.sep) || path.isAbsolute(relative)) {
      throw Error("Untrusted installer path");
    }
  }

  async function reveal(file) {
    checkPath(file);
    if (!files.existsSync(file)) throw Error("Installer not found; download it again");
    shell.showItemInFolder(file);
    return { ok: true, file };
  }

  function install(file, { quitAfterMs = 0 } = {}) {
    try { checkPath(file); } catch (error) { return Promise.reject(error); }
    if (installing) return installing;
    installing = (async () => {
      checkPath(file);
      const digest = downloaded.get(path.resolve(file));
      if (!digest || path.extname(file).toLowerCase() !== '.exe') throw Error('Installer not verified; download it again');
      const info = files.statSync(file);
      if (!info.isFile() || info.size === 0) throw Error("Installer not found; download it again");
      const hash = crypto.createHash('sha256');
      for await (const chunk of files.createReadStream(file)) hash.update(chunk);
      if (hash.digest('hex') !== digest) throw Error('Installer checksum failed; download it again');
      // Same NSIS handoff as quitAndInstall(true, true): no wizard, then restart.
      // Wait for successful spawn before quitting; a failed launch keeps the app usable.
      await new Promise((resolve, reject) => {
        const child = launch(file, ['--updated', '/S', '--force-run'], { detached: true, stdio: 'ignore', windowsHide: true });
        child.once('error', reject);
        child.once('spawn', () => { child.unref(); resolve(); });
      });
      setTimeout(() => { app.quit(); }, quitAfterMs);
      return { ok: true, file };
    })().catch(error => { installing = undefined; throw error; });
    return installing;
  }

  return { download, install, reveal, directory: updateDir };
}

module.exports = { createUpdater, safeFileName, MAX_UPDATE_BYTES, PROGRESS_INTERVAL_MS };
