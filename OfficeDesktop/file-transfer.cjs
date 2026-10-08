// 文件直传的**主进程**那一半：设置里的接收文件夹、发送方的读盘、接收方的写盘，
// 以及两端的系统级进度条和"打开 / 打开文件夹"（用户 2026-09-22 要求）。
//
// 为什么要放在主进程：网页那一层没有文件系统（`nodeIntegration: false`、沙箱、上下文隔离），
// 而"直接落到设置好的位置"必须是**静默写盘**，不能弹保存对话框。所以主进程持有真实的
// 文件句柄，渲染进程只能按**它自己拿到的那个 id**读/写，不能凭空指定任意路径。
//
// 边界：发送路径来自拖拽（`webUtils.getPathForFile`，只有真拖进来的文件才有），接收路径
// 一定落在用户设置的接收文件夹里（下面的 `safeName` + `resolve` 双重防穿越）。
const fs = require('node:fs');
const path = require('node:path');

/** 一个文件最大 2 GB（用户 2026-09-21 要求，原为 4 GB）。
 *  **必须和服务端 `OfficeWeb/file-relay.mjs` 的 `MAX_FILE_BYTES` 一致**。 */
const MAX_BYTES = 2 * 1024 ** 3;
/** 默认接收文件夹：系统"下载"下的一个子目录，用户没设过也能直接收。 */
const DEFAULT_FOLDER = 'iruler dream';
/** 打开/显示文件时只认这些由我们自己交出去的路径（别人构造的路径一律拒绝）。 */
const KNOWN_LIMIT = 200;
/** 发送句柄最多同时开几个；再多了就是没人在关，直接踢掉最旧的。 */
const SEND_LIMIT = 16;

/** Windows 上不能当文件名的字符 + 保留设备名。 */
const BAD_CHARS = /[<>:"/\\|?*\u0000-\u001f\u007f]/g;
const RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

/**
 * 把对端发来的文件名变成一个**只在本目录内**的安全文件名。任何目录成分都被丢掉，
 * 所以 `../../windows/system32/x.dll` 这样的名字落到磁盘上只会是 `.._.._windows_...`。
 */
function safeName(raw) {
  const base = path.basename(String(raw || '').replace(/[\\/]+/g, '/'));
  let name = base.replace(BAD_CHARS, '_').replace(/[. ]+$/, '').trim();
  if (!name || name === '.' || name === '..') name = '文件';
  if (RESERVED.test(name)) name = `_${name}`;
  if (name.length > 150) {
    const ext = path.extname(name).slice(0, 16);
    name = name.slice(0, 150 - ext.length) + ext;
  }
  return name;
}

/** 重名就往后排 `(1)`、`(2)`…——绝不覆盖对方已有的文件。 */
function freeName(directory, name, taken) {
  const ext = path.extname(name);
  const stem = name.slice(0, name.length - ext.length);
  for (let index = 0; index < 1000; index += 1) {
    const candidate = index === 0 ? name : `${stem} (${index})${ext}`;
    if (taken.has(candidate.toLowerCase())) continue;
    const full = path.join(directory, candidate);
    try { fs.accessSync(full); } catch { return candidate; }
  }
  return `${stem} (${Date.now()})${ext}`;
}

function createFileTransfer(dependencies = {}) {
  const app = dependencies.app || require('electron').app;
  const dialog = dependencies.dialog || require('electron').dialog;
  const shell = dependencies.shell || require('electron').shell;
  const getWindow = dependencies.getWindow || (() => undefined);
  const settingsFile = () => path.join(app.getPath('userData'), 'file-transfer.json');

  function readSettings() {
    let saved = {};
    try { saved = JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) || {}; } catch { /* 没设过就是默认 */ }
    const fallback = path.join(app.getPath('downloads'), DEFAULT_FOLDER);
    const receiveDir = typeof saved.receiveDir === 'string' && saved.receiveDir ? saved.receiveDir : fallback;
    return { receiveDir, custom: receiveDir !== fallback, defaultDir: fallback };
  }

  function writeSettings(next) {
    try { fs.writeFileSync(settingsFile(), JSON.stringify(next)); } catch { /* 记不住不影响这次用 */ }
  }

  /** 接收文件夹不存在就建出来：拖过来的那一刻不该因为"目录还没建"而失败。 */
  function ensureFolder() {
    const { receiveDir } = readSettings();
    try { fs.mkdirSync(receiveDir, { recursive: true }); return receiveDir; } catch { return ''; }
  }

  /** 读进来的路径是不是落在这个目录里面（防 `..` 穿越的兜底）。 */
  function inside(directory, target) {
    const base = path.resolve(directory);
    const resolved = path.resolve(target);
    return resolved === base || resolved.startsWith(base + path.sep);
  }

  // ---- 交出去的路径：打开/显示只认这些 ----
  const known = [];
  function remember(target) {
    if (typeof target !== 'string' || !target) return;
    known.push(target);
    while (known.length > KNOWN_LIMIT) known.shift();
  }
  function allowed(target) {
    if (typeof target !== 'string' || !target || target.length > 1024) return false;
    if (known.includes(target)) return true;
    // 兜底：接收文件夹里的东西任何时候都能打开（重启后 known 是空的）。
    return inside(readSettings().receiveDir, target);
  }

  // ---- 发送方：按 id 读自己拖进来的那个文件 ----
  const sends = new Map();
  function closeSend(id) {
    const state = sends.get(id);
    if (!state) return false;
    sends.delete(id);
    try { fs.closeSync(state.fd); } catch { /* 已经关了 */ }
    return true;
  }
  function resetSends() {
    for (const id of [...sends.keys()]) closeSend(id);
  }

  function openSend(target) {
    if (typeof target !== 'string' || !target || target.length > 1024) throw Error('无效的文件路径');
    let stat;
    try { stat = fs.statSync(target); } catch { throw Error('找不到这个文件'); }
    if (stat.isDirectory()) throw Error('暂时不能发送文件夹，请打包后再发');
    if (!stat.isFile()) throw Error('只能发送普通文件');
    if (!stat.size) throw Error('空文件无法发送');
    if (stat.size > MAX_BYTES) throw Error('文件不能超过 2 GB');
    while (sends.size >= SEND_LIMIT) closeSend(sends.keys().next().value);
    const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    sends.set(id, { fd: fs.openSync(target, 'r'), size: stat.size, path: target });
    remember(target);
    return { id, name: path.basename(target), size: stat.size, path: target };
  }

  function readSend(id, offset, length) {
    const state = sends.get(id);
    if (!state) throw Error('发送已结束');
    const start = Number(offset) || 0;
    const size = Math.max(1, Math.min(Number(length) || 0, 512 * 1024, state.size - start));
    if (start < 0 || start >= state.size) throw Error('读取位置超出文件范围');
    const buffer = Buffer.allocUnsafe(size);
    const read = fs.readSync(state.fd, buffer, 0, size, start);
    return buffer.subarray(0, read);
  }

  // ---- 接收方：静默写进接收文件夹 ----
  const receives = new Map();
  function closeReceive(transferId) {
    const state = receives.get(transferId);
    if (!state) return false;
    receives.delete(transferId);
    try { fs.closeSync(state.fd); } catch { /* 已经关了 */ }
    return true;
  }

  function openReceive(input) {
    const transferId = String(input?.transferId || '');
    if (!transferId || transferId.length > 80) return { ok: false, error: '无效的传输' };
    const size = Number(input?.size);
    if (!Number.isSafeInteger(size) || size < 1 || size > MAX_BYTES)
      return { ok: false, error: '文件大小超出限制' };
    const directory = ensureFolder();
    if (!directory) return { ok: false, error: '接收文件夹不可用，请在设置里重新选择' };
    // 同时来的重名（同一批拖进来的两个同名文件）也要错开，不能只看磁盘。
    const taken = new Set([...receives.values()].map(state => state.savedName.toLowerCase()));
    const savedName = freeName(directory, safeName(input?.name), taken);
    const finalPath = path.join(directory, savedName);
    if (!inside(directory, finalPath)) return { ok: false, error: '文件名无效' };
    try {
      const fd = fs.openSync(finalPath + '.part', 'w');
      receives.set(transferId, { fd, finalPath, partPath: finalPath + '.part',
        savedName, size, written: 0, queue: Promise.resolve() });
    } catch { return { ok: false, error: '无法在接收文件夹里创建文件' }; }
    return { ok: true, savedName, folder: directory };
  }

  /**
   * 追加一片。写盘是**串行排队**的：四条通道同时进来也不会写乱，而且天然带背压
   * （磁盘慢，队列就长，发送方就会被拖慢）。
   */
  function writeReceive(transferId, bytes) {
    const state = receives.get(String(transferId || ''));
    if (!state) return Promise.resolve({ ok: false, error: '传输已失效' });
    if (!bytes || !bytes.length) return Promise.resolve({ ok: false, error: '无效的文件分片' });
    const buffer = Buffer.from(bytes);
    state.queue = state.queue.then(() => new Promise((resolve, reject) => {
      fs.write(state.fd, buffer, 0, buffer.length, state.written, (error, written) => {
        if (error) return reject(error);
        if (written !== buffer.length) return reject(Error('文件写入不完整'));
        state.written += written;
        resolve();
      });
    }));
    return state.queue.then(() => ({ ok: true, written: state.written }))
      .catch(error => { closeReceive(transferId); return { ok: false, error: error.message }; });
  }

  function endReceive(transferId) {
    const state = receives.get(String(transferId || ''));
    if (!state) return Promise.resolve({ ok: false, error: '传输已失效' });
    return state.queue.then(() => {
      if (state.written !== state.size) throw Error('文件没有收完');
      fs.closeSync(state.fd);
      receives.delete(transferId);
      fs.renameSync(state.partPath, state.finalPath);
      remember(state.finalPath);
      return { ok: true, path: state.finalPath, savedName: state.savedName,
        folder: path.dirname(state.finalPath), size: state.size };
    }).catch(error => {
      closeReceive(transferId);
      try { fs.rmSync(state.partPath, { force: true }); } catch { /* 没留下更好 */ }
      return { ok: false, error: error.message || '文件保存失败' };
    });
  }

  function cancelReceive(transferId) {
    const state = receives.get(String(transferId || ''));
    closeReceive(transferId);
    if (state) { try { fs.rmSync(state.partPath, { force: true }); } catch { /* 没留下更好 */ } }
    return true;
  }

  // ---- 系统级进度条 + 打开文件 ----
  function progress(value) {
    const window = getWindow();
    if (!window || window.isDestroyed?.()) return false;
    const number = Number(value);
    // Electron：负数清掉进度，大于 1 就是"不确定"。其余夹到 0..1。
    const next = number < 0 ? -1 : number > 1 ? 2 : number || 0;
    window.setProgressBar(next);
    return true;
  }

  return {
    settings: readSettings,
    async chooseFolder() {
      const window = getWindow();
      const result = await dialog.showOpenDialog(window && !window.isDestroyed() ? window : undefined, {
        title: '选择接收文件夹', properties: ['openDirectory', 'createDirectory'],
        defaultPath: readSettings().receiveDir,
      });
      if (result?.canceled || !result?.filePaths?.[0]) return readSettings();
      writeSettings({ receiveDir: result.filePaths[0] });
      ensureFolder();
      return readSettings();
    },
    openFolder(target) {
      // 指定了路径就**只开那个**：不在允许范围里就如实拒绝，绝不"悄悄换成接收文件夹"
      // ——那样用户以为打开的是自己点的那个文件夹，实际上不是。
      const requested = typeof target === 'string' ? target.trim() : '';
      if (requested && !allowed(requested)) return false;
      const directory = requested || ensureFolder();
      if (!directory) return false;
      void shell.openPath(directory);
      return true;
    },
    reset: () => { resetSends(); for (const id of [...receives.keys()]) cancelReceive(id); },
    openSend, readSend, closeSend,
    openReceive, writeReceive, endReceive, cancelReceive,
    progress,
    openPath(target) {
      if (!allowed(target)) return false;
      void shell.openPath(target);
      return true;
    },
    revealPath(target) {
      if (!allowed(target)) return false;
      shell.showItemInFolder(target);
      return true;
    },
    /** 只给测试看：手里还开着几个句柄。 */
    openHandles: () => ({ sends: sends.size, receives: receives.size }),
  };
}

module.exports = { createFileTransfer, safeName, freeName };
