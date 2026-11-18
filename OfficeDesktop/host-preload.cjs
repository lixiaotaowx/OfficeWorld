'use strict';

const { contextBridge, ipcRenderer } = require('electron');

const startListeners = new Set();
const commandListeners = new Set();
const requestListeners = new Set();
const stateGetListeners = new Set();
const backgroundPreviewListeners = new Set();
const authListeners = new Set();
let auth = null;
let account = null;
let startError = null;
let socketId = '';
let replaced = false;
let authGeneration = 0;
let restoreState = 'idle';

function trackState(envelope) {
  if (!envelope || typeof envelope !== 'object') return;
  const identity = envelope.kind === 'full' ? envelope.snapshot?.identity
    : envelope.kind === 'state' ? envelope.patch?.identity : null;
  if (identity?.myId) socketId = String(identity.myId);
}

const accountFor = user => user ? {
  id: String(user.id ?? user.accountId ?? user.name ?? ''),
  name: String(user.name ?? ''),
  ...(user.appearance ? { appearance: user.appearance } : {}),
} : null;

function publishAuth(next, notifyStarts = true) {
  authGeneration += 1;
  auth = next;
  ipcRenderer.send('office:host-auth', auth);
  for (const callback of authListeners) {
    try { callback(auth); } catch { /* view callback */ }
  }
  if (auth.user) {
    account = accountFor(auth.user);
    if (notifyStarts) {
      for (const callback of startListeners) {
        try { callback(account); } catch (error) {
          startError = String(error?.message || error);
          console.error('comms host start failed', error);
        }
      }
    }
  }
}

function applyAuth(payload, notifyStarts = true) {
  if (!payload || typeof payload !== 'object') return;
  const status = ['authenticated', 'signed-out', 'expired'].includes(payload.status) ? payload.status : 'signed-out';
  publishAuth({
    status,
    user: payload.user && typeof payload.user === 'object' ? payload.user : null,
    ...(typeof payload.message === 'string' ? { message: payload.message.slice(0, 160) } : {}),
  }, notifyStarts);
}

async function restore() {
  // A manual login can arrive while the saved-login restore is still waiting on
  // the main process. It is newer than this restore attempt and must win; an
  // older signed-out result would otherwise stop the host socket again.
  const generation = authGeneration;
  restoreState = 'started';
  try {
    const saved = await ipcRenderer.invoke('office:login-read').catch(() => null);
    if (authGeneration !== generation) return;
    if (saved?.name && saved?.password) {
      const result = await ipcRenderer.invoke('office:host-login',
        { name: saved.name, password: saved.password });
      if (authGeneration !== generation) return;
      if (result?.auth) { applyAuth(result.auth); return; }
      if (result?.ok && result.user) { applyAuth({ status: 'authenticated', user: result.user }); return; }
    }
    const result = await ipcRenderer.invoke('office:host-login', { restore: true });
    if (authGeneration !== generation) return;
    if (result?.auth) { applyAuth(result.auth); return; }
    if (result?.ok && result.user) { applyAuth({ status: 'authenticated', user: result.user }); return; }
    applyAuth({ status: 'signed-out', user: null });
  } catch {
    if (authGeneration === generation) applyAuth({ status: 'signed-out', user: null, message: '连不上，正在重试…' });
  } finally {
    restoreState = auth?.status || 'done';
  }
}

async function refreshAuth() {
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) return;
    const data = await response.json();
    if (data?.user) applyAuth({ status: 'authenticated', user: data.user });
  } catch { /* keep the last known auth */ }
}

ipcRenderer.on('office:host-auth-refresh', () => { void refreshAuth(); });

function emit(channel, payload) {
  try { ipcRenderer.send(channel, payload); } catch { /* window closing */ }
}

// The host runtime treats `auth` as an optional callback while older callers
// use auth.get()/onChange()/login(). Keep both shapes on one callable object;
// the callback path must not fan out to start listeners or start() recurses.
function authApi(next) {
  if (next && typeof next === 'object') applyAuth(next, false);
  return auth;
}
authApi.get = () => auth;
authApi.onChange = callback => runtime.onAuthChange(callback);
authApi.login = async (name, password) => {
  try {
    const response = await fetch('/api/auth/login', { method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: String(name || ''), password: String(password || '') }) });
    const data = await response.json();
    if (!response.ok || !data?.user) return { ok: false, error: data?.error || '登录失败' };
    applyAuth({ status: 'authenticated', user: data.user });
    return { ok: true, user: data.user };
  } catch { return { ok: false, error: '连不上，等一下再试' }; }
};

const runtime = {
  onStart(callback) {
    if (typeof callback !== 'function') return () => {};
    startListeners.add(callback);
    if (account) queueMicrotask(() => { try { callback(account); } catch { /* callback */ } });
    return () => startListeners.delete(callback);
  },
  onCommand(callback) {
    if (typeof callback !== 'function') return () => {};
    commandListeners.add(callback);
    return () => commandListeners.delete(callback);
  },
  onRequest(callback) {
    if (typeof callback !== 'function') return () => {};
    requestListeners.add(callback);
    return () => requestListeners.delete(callback);
  },
  onStateGet(callback) {
    if (typeof callback !== 'function') return () => {};
    stateGetListeners.add(callback);
    return () => stateGetListeners.delete(callback);
  },
  onBackgroundPreview(callback) {
    if (typeof callback !== 'function') return () => {};
    backgroundPreviewListeners.add(callback);
    return () => backgroundPreviewListeners.delete(callback);
  },
  onAuthChange(callback) {
    if (typeof callback !== 'function') return () => {};
    authListeners.add(callback);
    if (auth) queueMicrotask(() => { try { callback(auth); } catch { /* callback */ } });
    return () => authListeners.delete(callback);
  },
  state: envelope => { trackState(envelope); emit('office:host-state', envelope); },
  preview: envelope => emit('office:host-previews', envelope),
  motion: envelope => emit('office:host-motions', envelope),
  chat: envelope => emit('office:host-chat', envelope),
  mediaEvent: event => emit('office:host-media-event', event),
  response: payload => emit('office:host-response', payload),
  alert: payload => emit('office:host-alert', payload),
  async debug(payload) {
    const source = payload && typeof payload === 'object' ? payload : {};
    const info = await ipcRenderer.invoke('office:host-debug').catch(() => ({}));
    return { ...source, ...info,
      listeners: { starts: startListeners.size, commands: commandListeners.size, stateGets: stateGetListeners.size },
      hasAccount: Boolean(account), startError, restoreState,
      socketId: socketId || source.socketId || '',
      replaced: replaced || source.replaced === true };
  },
  testBusy: payload => emit('office:host-test-busy', payload),
  auth: authApi,
};

contextBridge.exposeInMainWorld('officeHostRuntime', Object.freeze(runtime));
contextBridge.exposeInMainWorld('__commsHost', Object.freeze({
  debug: payload => runtime.debug(payload),
  testBusy: payload => runtime.testBusy(payload),
}));
// The host owns the socket that dropped-file transfers run on, so the transfer
// channel needs the same desktop file handles the visible window has. The main
// process already admits the host on every office:file-* channel.
contextBridge.exposeInMainWorld('officeDesktop', Object.freeze({
  files: Object.freeze({
    settings: () => ipcRenderer.invoke('office:file-settings'),
    chooseFolder: () => ipcRenderer.invoke('office:file-choose-folder'),
    openFolder: folder => ipcRenderer.invoke('office:file-open-folder', String(folder || '')),
    sendOpen: target => ipcRenderer.invoke('office:file-send-open', String(target || '')),
    sendRead: (id, offset, length) => ipcRenderer.invoke('office:file-send-read', String(id || ''),
      Math.max(0, Math.round(Number(offset) || 0)), Math.max(0, Math.round(Number(length) || 0))),
    sendClose: id => ipcRenderer.invoke('office:file-send-close', String(id || '')),
    receiveOpen: input => ipcRenderer.invoke('office:file-receive-open', {
      transferId: String(input?.transferId || ''), name: String(input?.name || 'File'),
      size: Math.max(0, Math.round(Number(input?.size) || 0)) }),
    receiveWrite: (id, bytes) => ipcRenderer.invoke('office:file-receive-write', String(id || ''), bytes),
    receiveEnd: id => ipcRenderer.invoke('office:file-receive-end', String(id || '')),
    receiveCancel: id => ipcRenderer.invoke('office:file-receive-cancel', String(id || '')),
    progress: value => ipcRenderer.invoke('office:file-progress', Number(value)),
    open: target => ipcRenderer.invoke('office:file-open', String(target || '')),
    reveal: target => ipcRenderer.invoke('office:file-reveal', String(target || '')),
  }),
}));

ipcRenderer.on('office:host-command', async (_event, payload) => {
  const command = payload?.command ?? payload;
  if (command?.kind === 'logout' || command?.kind === 'chooseRole') {
    let result;
    try {
      if (command.kind === 'logout') {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (!response.ok) throw Error('logout failed');
        await ipcRenderer.invoke('office:login-clear').catch(() => {});
        applyAuth({ status: 'signed-out', user: null });
        result = { ok: true };
      } else {
        const role = command.role === 'visitor' ? 'visitor' : command.role === 'employee' ? 'employee' : '';
        if (!role) throw Error('invalid role');
        const response = await fetch('/api/auth/role', { method: 'POST',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
        const data = await response.json();
        if (!response.ok || !data?.user) throw Error(data?.error || 'role selection failed');
        applyAuth({ status: 'authenticated', user: data.user });
        result = { ok: true, user: data.user };
      }
    } catch (error) { result = { ok: false, error: String(error?.message || error) }; }
    if (payload?.id) ipcRenderer.send('office:host-response', { id: payload.id, result });
    return;
  }
  let result = { ok: true };
  for (const callback of commandListeners) {
    try {
      const value = await callback(command);
      if (value && typeof value === 'object') result = value;
    } catch (error) { result = { ok: false, error: String(error?.message || error) }; }
  }
  if (payload?.id) ipcRenderer.send('office:host-response', { id: payload.id, result });
  if (command?.kind === 'setAppearance' || command?.kind === 'chooseRole') void refreshAuth();
});

ipcRenderer.on('office:host-request', async (_event, payload) => {
  const input = payload?.event
    ? { event: payload.event, payload: payload.payload, args: payload.args }
    : (payload?.payload ?? payload);
  let result = { ok: true };
  for (const callback of requestListeners) {
    try {
      const value = await callback(input);
      if (value !== undefined) result = value;
    } catch (error) { result = { ok: false, error: String(error?.message || error) }; }
  }
  if (payload?.requestId && payload?.fire !== true) {
    ipcRenderer.send('office:host-response', { requestId: payload.requestId, reply: result });
  }
});

ipcRenderer.on('office:host-state-get', () => {
  for (const callback of stateGetListeners) {
    try { callback(); } catch { /* publisher */ }
  }
});

ipcRenderer.on('office:host-background-preview', (_event, image) => {
  if (typeof image !== 'string' || image.length > 180000) return;
  for (const callback of backgroundPreviewListeners) callback(image);
});

ipcRenderer.on('office:host-login', (_event, payload) => {
  if (payload?.ok && payload.user) applyAuth({ status: 'authenticated', user: payload.user });
  else if (payload && payload.ok === false) applyAuth({ status: 'signed-out', user: null, message: payload.error });
});

const hostMode = typeof location !== 'undefined' && typeof location.search === 'string' &&
  /(?:^|[?&])officeCommsHost=(?:1|true)(?:&|$)/.test(location.search);
if (hostMode) {
  const startRestore = () => { void restore(); };
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startRestore, { once: true });
  } else {
    queueMicrotask(startRestore);
  }
}
