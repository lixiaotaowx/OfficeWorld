

const fs = require('node:fs');
const path = require('node:path');

const MAX_BYTES = 2 * 1024 ** 3;

const DEFAULT_FOLDER = 'iruler dream';
// Files received before the rename stay where people already look for them.
const LEGACY_FOLDER = 'OfficeWorld';

const KNOWN_LIMIT = 200;

const SEND_LIMIT = 16;

const BAD_CHARS = /[<>:"/\\|?*\u0000-\u001f\u007f]/g;
const RESERVED = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;

function safeName(raw) {
  const base = path.basename(String(raw || '').replace(/[\\/]+/g, '/'));
  let name = base.replace(BAD_CHARS, '_').replace(/[. ]+$/, '').trim();
  if (!name || name === '.' || name === '..') name = "File";
  if (RESERVED.test(name)) name = `_${name}`;
  if (name.length > 150) {
    const ext = path.extname(name).slice(0, 16);
    name = name.slice(0, 150 - ext.length) + ext;
  }
  return name;
}

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
    try { saved = JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) || {}; } catch {  }
    const legacy = path.join(app.getPath('downloads'), LEGACY_FOLDER);
    const fallback = fs.existsSync(legacy) ? legacy : path.join(app.getPath('downloads'), DEFAULT_FOLDER);
    const receiveDir = typeof saved.receiveDir === 'string' && saved.receiveDir ? saved.receiveDir : fallback;
    return { receiveDir, custom: receiveDir !== fallback, defaultDir: fallback };
  }

  function writeSettings(next) {
    try { fs.writeFileSync(settingsFile(), JSON.stringify(next)); } catch {  }
  }

  function ensureFolder() {
    const { receiveDir } = readSettings();
    try { fs.mkdirSync(receiveDir, { recursive: true }); return receiveDir; } catch { return ''; }
  }

  function inside(directory, target) {
    const base = path.resolve(directory);
    const resolved = path.resolve(target);
    return resolved === base || resolved.startsWith(base + path.sep);
  }

  const known = [];
  function remember(target) {
    if (typeof target !== 'string' || !target) return;
    known.push(target);
    while (known.length > KNOWN_LIMIT) known.shift();
  }
  function allowed(target) {
    if (typeof target !== 'string' || !target || target.length > 1024) return false;
    if (known.includes(target)) return true;

    return inside(readSettings().receiveDir, target);
  }

  const sends = new Map();
  function closeSend(id) {
    const state = sends.get(id);
    if (!state) return false;
    sends.delete(id);
    try { fs.closeSync(state.fd); } catch {  }
    return true;
  }
  function resetSends() {
    for (const id of [...sends.keys()]) closeSend(id);
  }

  function openSend(target) {
    if (typeof target !== 'string' || !target || target.length > 1024) throw Error("Invalid file path");
    let stat;
    try { stat = fs.statSync(target); } catch { throw Error("File not found"); }
    if (stat.isDirectory()) throw Error("Folders cannot be sent. Create an archive first.");
    if (!stat.isFile()) throw Error("Only regular files can be sent");
    if (!stat.size) throw Error("Empty files cannot be sent");
    if (stat.size > MAX_BYTES) throw Error("Files cannot exceed 2 GB");
    while (sends.size >= SEND_LIMIT) closeSend(sends.keys().next().value);
    const id = `f${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
    sends.set(id, { fd: fs.openSync(target, 'r'), size: stat.size, path: target });
    remember(target);
    return { id, name: path.basename(target), size: stat.size, path: target };
  }

  function readSend(id, offset, length) {
    const state = sends.get(id);
    if (!state) throw Error("Transfer has ended");
    const start = Number(offset) || 0;
    const size = Math.max(1, Math.min(Number(length) || 0, 512 * 1024, state.size - start));
    if (start < 0 || start >= state.size) throw Error("Read position is outside the file");
    const buffer = Buffer.allocUnsafe(size);
    const read = fs.readSync(state.fd, buffer, 0, size, start);
    return buffer.subarray(0, read);
  }

  const receives = new Map();
  function closeReceive(transferId) {
    const state = receives.get(transferId);
    if (!state) return false;
    receives.delete(transferId);
    try { fs.closeSync(state.fd); } catch {  }
    return true;
  }

  function openReceive(input) {
    const transferId = String(input?.transferId || '');
    if (!transferId || transferId.length > 80) return { ok: false, error: "Invalid transfer" };
    const size = Number(input?.size);
    if (!Number.isSafeInteger(size) || size < 1 || size > MAX_BYTES)
      return { ok: false, error: "File size exceeds the limit" };
    const directory = ensureFolder();
    if (!directory) return { ok: false, error: "The receive folder is unavailable. Choose another folder in Settings." };

    const taken = new Set([...receives.values()].map(state => state.savedName.toLowerCase()));
    const savedName = freeName(directory, safeName(input?.name), taken);
    const finalPath = path.join(directory, savedName);
    if (!inside(directory, finalPath)) return { ok: false, error: "Invalid file name" };
    try {
      const fd = fs.openSync(finalPath + '.part', 'w');
      receives.set(transferId, { fd, finalPath, partPath: finalPath + '.part',
        savedName, size, written: 0, queue: Promise.resolve() });
    } catch { return { ok: false, error: "Unable to create a file in the receive folder" }; }
    return { ok: true, savedName, folder: directory };
  }

  function writeReceive(transferId, bytes) {
    const state = receives.get(String(transferId || ''));
    if (!state) return Promise.resolve({ ok: false, error: "Transfer is no longer available" });
    if (!bytes || !bytes.length) return Promise.resolve({ ok: false, error: "Invalid file chunk" });
    const buffer = Buffer.from(bytes);
    state.queue = state.queue.then(() => new Promise((resolve, reject) => {
      fs.write(state.fd, buffer, 0, buffer.length, state.written, (error, written) => {
        if (error) return reject(error);
        if (written !== buffer.length) return reject(Error("Incomplete file write"));
        state.written += written;
        resolve();
      });
    }));
    return state.queue.then(() => ({ ok: true, written: state.written }))
      .catch(error => { closeReceive(transferId); return { ok: false, error: error.message }; });
  }

  function endReceive(transferId) {
    const state = receives.get(String(transferId || ''));
    if (!state) return Promise.resolve({ ok: false, error: "Transfer is no longer available" });
    return state.queue.then(() => {
      if (state.written !== state.size) throw Error("File has not been fully received");
      fs.closeSync(state.fd);
      receives.delete(transferId);
      fs.renameSync(state.partPath, state.finalPath);
      remember(state.finalPath);
      return { ok: true, path: state.finalPath, savedName: state.savedName,
        folder: path.dirname(state.finalPath), size: state.size };
    }).catch(error => {
      closeReceive(transferId);
      try { fs.rmSync(state.partPath, { force: true }); } catch {  }
      return { ok: false, error: error.message || "Unable to save file" };
    });
  }

  function cancelReceive(transferId) {
    const state = receives.get(String(transferId || ''));
    closeReceive(transferId);
    if (state) { try { fs.rmSync(state.partPath, { force: true }); } catch {  } }
    return true;
  }

  function progress(value) {
    const window = getWindow();
    if (!window || window.isDestroyed?.()) return false;
    const number = Number(value);

    const next = number < 0 ? -1 : number > 1 ? 2 : number || 0;
    window.setProgressBar(next);
    return true;
  }

  return {
    settings: readSettings,
    async chooseFolder() {
      const window = getWindow();
      const result = await dialog.showOpenDialog(window && !window.isDestroyed() ? window : undefined, {
        title: "Choose receive folder", properties: ['openDirectory', 'createDirectory'],
        defaultPath: readSettings().receiveDir,
      });
      if (result?.canceled || !result?.filePaths?.[0]) return readSettings();
      writeSettings({ receiveDir: result.filePaths[0] });
      ensureFolder();
      return readSettings();
    },
    openFolder(target) {

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

    openHandles: () => ({ sends: sends.size, receives: receives.size }),
  };
}

module.exports = { createFileTransfer, safeName, freeName };
