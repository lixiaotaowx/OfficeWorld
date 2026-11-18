'use strict';

const { BrowserWindow, ipcMain, Notification, safeStorage, app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { OFFICE_URL, hostUrl, trusted, trustedHost } = require('./policy.cjs');
const { snapshotBlockers } = require('./close-guard.cjs');

const HOST_URL = hostUrl();
const COMMAND_TIMEOUT_MS = 5000;
const FULL_WAIT_MS = 2500;
// The host page sends at least one envelope a second; silence this long means
// it is hung or gone, and nothing may be destroyed on its word.
const HOST_STALE_MS = 5000;

// Hidden socket/state/login owner. Media intentionally stays in the main
// window: this process never opens a camera, microphone, display capture or
// LiveKit room.
function createCommsHost(options = {}) {
  const BrowserWindowCtor = options.BrowserWindow || BrowserWindow;
  const ipc = options.ipcMain || ipcMain;
  const hostSession = options.session;
  const enabled = options.enabled !== false;
  const commandTimeoutMs = options.commandTimeoutMs || COMMAND_TIMEOUT_MS;
  const getMainWindow = options.getMainWindow || (() => undefined);
  const getDock = options.getDock || (() => undefined);
  const onHostEnvelope = options.onHostEnvelope || (() => {});
  const now = options.now || (() => Date.now());
  const staleMs = Number.isFinite(options.staleMs) ? options.staleMs : HOST_STALE_MS;
  let lastSeenAt = 0;
  const credentials = path.join(app.getPath('userData'), 'login.enc');
  let window;
  let destroyed = false;
  let quitting = false;
  let auth = null;
  let snapshot = null;
  let fullSnapshot = null;
  let fullEpoch = 0;
  let fullSeq = 0;
  let testBusy = false;
  let commandSeq = 0;
  let requestSeq = 0;
  const pendingCommands = new Map();
  const pendingRequests = new Map();
  const stateWaiters = new Set();
  let recoveryTimer;
  let authRestore;

  const senderIsHost = event => {
    if (!window || window.isDestroyed()) return false;
    const contents = window.webContents;
    if (!contents || event.sender !== contents) return false;
    const frame = event.senderFrame;
    return Boolean(frame) && frame === contents.mainFrame && trustedHost(frame.url);
  };
  const toMain = (channel, payload) => {
    const main = getMainWindow();
    if (!main || main.isDestroyed()) return false;
    main.webContents.send(channel, payload);
    return true;
  };
  function publishPreview(image) {
    if (typeof image !== 'string' || !image || !window || window.isDestroyed()) return false;
    window.webContents.send('office:host-background-preview', image);
    return true;
  }
  const sanitizeText = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '');
  const sanitizeAuth = value => {
    if (!value || typeof value !== 'object') return null;
    const status = ['authenticated', 'signed-out', 'expired'].includes(value.status) ? value.status : 'signed-out';
    const user = value.user && typeof value.user === 'object' ? {
      id: sanitizeText(value.user.id, 64), name: sanitizeText(value.user.name, 24),
      appearance: value.user.appearance, role: value.user.role, lookConfirmed: value.user.lookConfirmed === true,
    } : null;
    return { status, user, ...(typeof value.message === 'string' ? { message: value.message.slice(0, 160) } : {}) };
  };
  const noteSnapshot = (_envelope, next) => { snapshot = next; };
  const mergePatch = patch => {
    if (!patch || typeof patch !== 'object') return snapshot;
    return { ...(snapshot || {}), ...patch };
  };
  function applyFull(next, envelope, envelopes) {
    fullSnapshot = next;
    fullEpoch = Number(envelope?.epoch) || 0;
    fullSeq = Number(envelope?.seq) || 0;
    noteSnapshot(envelope, next);
    for (const waiter of stateWaiters) {
      clearTimeout(waiter.timer);
      waiter.resolve(envelopes);
    }
    stateWaiters.clear();
  }
  const chunkCache = new Map();
  // A window that started before the network was up (autostart at login) fails to load
  // host.html and then sits on an error page for the whole session: no socket, empty
  // roster, "还没人上线". Retry the load with backoff until the page actually talks.
  const LOAD_RETRY_MS = options.loadRetryMs || [1000, 2000, 5000, 10000, 30000];
  const NEVER_LOADED_MS = Number.isFinite(options.neverLoadedMs) ? options.neverLoadedMs : 20000;
  let loadTimer;
  let loadAttempts = 0;
  function reloadSoon() {
    if (destroyed || quitting) return;
    const delay = LOAD_RETRY_MS[Math.min(loadAttempts, LOAD_RETRY_MS.length - 1)];
    loadAttempts += 1;
    if (loadTimer) clearTimeout(loadTimer);
    loadTimer = setTimeout(() => {
      loadTimer = undefined;
      if (destroyed || quitting) return;
      const current = window;
      if (!current || current.isDestroyed()) { ensure(); return; }
      try { current.webContents.reloadIgnoringCache?.(); }
      catch { try { current.webContents.reload?.(); } catch { /* closing */ } }
    }, delay);
    loadTimer.unref?.();
  }
  function applyEnvelope(envelope) {
    if (!envelope || typeof envelope !== 'object') return;
    // Any envelope proves the host page is alive, not only the state channel:
    // a busy room sends previews and motion instead of the idle heartbeat.
    lastSeenAt = now();
    if (loadAttempts || loadTimer) { loadAttempts = 0; clearTimeout(loadTimer); loadTimer = undefined; }
    const kind = envelope.kind;
    if (kind === 'full') {
      applyFull(envelope.snapshot, envelope, [envelope]);
    } else if (kind === 'full-chunk') {
      const key = `${envelope.epoch}:${envelope.seq}`;
      const entry = chunkCache.get(key) || { total: envelope.total, parts: [] };
      entry.parts[envelope.index] = envelope.data;
      chunkCache.set(key, entry);
      if (entry.parts.filter(part => typeof part === 'string').length >= entry.total) {
        chunkCache.delete(key);
        try {
          const envelopes = [];
          for (let index = 0; index < entry.total; index += 1) {
            envelopes.push({ kind: 'full-chunk', epoch: envelope.epoch, seq: envelope.seq,
              index, total: entry.total, data: entry.parts[index] });
          }
          applyFull(JSON.parse(entry.parts.join('')), envelope, envelopes);
        } catch { /* keep the last usable snapshot */ }
      }
    } else if (kind === 'state') {
      noteSnapshot(envelope, mergePatch(envelope.patch));
      // A change replaces whole sections, but previews, motion and the message list
      // travel on their own channels: keep them, or a reopened window gets a state it
      // cannot show and sits at "nobody online".
      if (fullSnapshot && envelope.patch) {
        const merged = { ...fullSnapshot, ...envelope.patch };
        if (envelope.patch.presence) merged.presence = { ...envelope.patch.presence,
          previews: fullSnapshot.presence?.previews || {}, motions: fullSnapshot.presence?.motions || {} };
        if (envelope.patch.chat) merged.chat = { ...envelope.patch.chat, messages: fullSnapshot.chat?.messages || [] };
        fullSnapshot = merged;
      }
    } else if (kind === 'preview') {
      if (fullSnapshot) fullSnapshot = { ...fullSnapshot,
        presence: { ...fullSnapshot.presence, previews: { ...(fullSnapshot.presence?.previews || {}), ...(envelope.batch || {}) } } };
    } else if (kind === 'motion') {
      if (fullSnapshot) fullSnapshot = { ...fullSnapshot,
        presence: { ...fullSnapshot.presence, motions: { ...(fullSnapshot.presence?.motions || {}), ...(envelope.batch || {}) } } };
    } else if (kind === 'chat') {
      if (fullSnapshot) {
        const removed = new Set(envelope.removed || []);
        const messages = (fullSnapshot.chat?.messages || []).filter(row => !removed.has(row.id));
        const byId = new Map(messages.map(row => [row.id, row]));
        for (const row of envelope.upserts || []) if (row?.id) byId.set(row.id, row);
        fullSnapshot = { ...fullSnapshot, chat: { ...fullSnapshot.chat, messages: [...byId.values()] } };
      }
    }
    // Nobody is rendering this: let the owner decide whether it needs a view.
    if (!toMain('office:host-snapshot', envelope) && snapshot) onHostEnvelope(snapshot, envelope);
  }

  const handlers = [];
  const on = (channel, handler) => {
    const listener = (event, payload) => {
      if (!senderIsHost(event)) return;
      handler(payload);
    };
    handlers.push({ channel, handler: listener });
    ipc.on(channel, listener);
  };
  const handle = (channel, handler) => ipc.handle(channel, (event, ...args) => {
    if (!senderIsHost(event)) throw Error('Untrusted comms host request');
    return handler(...args);
  });
  const senderIsMain = event => {
    const main = getMainWindow();
    if (!main || main.isDestroyed()) return false;
    const frame = event.senderFrame;
    return event.sender === main.webContents && Boolean(frame) &&
      frame === main.webContents.mainFrame && trusted(frame.url);
  };
  const handleMain = (channel, handler) => ipc.handle(channel, (event, ...args) => {
    if (!senderIsMain(event)) throw Error('Untrusted main-window request');
    return handler(...args);
  });

  on('office:host-state', applyEnvelope);
  on('office:host-previews', applyEnvelope);
  on('office:host-motions', applyEnvelope);
  on('office:host-chat', applyEnvelope);
  on('office:host-media-event', event => {
    toMain('office:host-media-event', event);
    const dock = getDock();
    if (dock && !dock.isDestroyed?.()) dock.webContents.send('office:host-media-event', event);
  });
  on('office:host-auth', value => {
    auth = sanitizeAuth(value);
    toMain('office:host-auth-changed', auth);
  });
  // Test hook for the close path. It can only add a reason to stay alive; it can
  // never make a busy client look idle.
  on('office:host-test-busy', payload => {
    testBusy = Boolean(payload && (payload.calls?.active || payload.sharing || payload.meeting?.active ||
      payload.transfers?.some(row => row?.status === 'sending' || row?.status === 'receiving')));
  });
  on('office:host-alert', payload => {
    if (!Notification.isSupported()) return;
    const toast = new Notification({
      title: sanitizeText(payload?.title, 80) || 'iruler dream',
      body: sanitizeText(payload?.body, 220), silent: true,
    });
    toast.show();
  });
  on('office:host-response', payload => {
    const requestId = payload?.requestId;
    if (requestId && pendingRequests.has(requestId)) {
      const pending = pendingRequests.get(requestId);
      pendingRequests.delete(requestId);
      clearTimeout(pending.timer);
      const reply = payload.reply;
      pending.resolve(reply && typeof reply === 'object' && 'ok' in reply
        ? reply : { ok: true, reply });
      return;
    }
    const id = payload?.id;
    if (id && pendingCommands.has(id)) {
      const pending = pendingCommands.get(id);
      pendingCommands.delete(id);
      clearTimeout(pending.timer);
      pending.resolve(payload.result && typeof payload.result === 'object' ? payload.result : { ok: true });
      return;
    }
    toMain('office:host-response', payload);
    const dock = getDock();
    if (dock && !dock.isDestroyed?.()) dock.webContents.send('office:host-response', payload);
  });

  handleMain('office:host-state-get', () => {
    if (fullSnapshot) {
      return [{ kind: 'full', epoch: fullEpoch, seq: fullSeq, snapshot: fullSnapshot }];
    }
    return new Promise(resolve => {
      const waiter = { resolve, timer: setTimeout(() => {
        stateWaiters.delete(waiter); resolve([]);
      }, FULL_WAIT_MS) };
      stateWaiters.add(waiter);
      if (window && !window.isDestroyed()) window.webContents.send('office:host-state-get');
    });
  });
  handleMain('office:host-command', command => new Promise(resolve => {
    if (!window || window.isDestroyed()) { resolve({ ok: false, error: '通信宿主不可用' }); return; }
    const id = ++commandSeq;
    const timer = setTimeout(() => {
      pendingCommands.delete(id); resolve({ ok: false, error: '通信宿主命令超时' });
    }, commandTimeoutMs);
    pendingCommands.set(id, { resolve, timer });
    window.webContents.send('office:host-command', { id, command });
  }));
  handleMain('office:host-request', payload => {
    if (!window || window.isDestroyed()) return { ok: false, error: '通信宿主不可用' };
    const requestId = ++requestSeq;
    if (payload?.fire === true) {
      window.webContents.send('office:host-request', { ...payload, requestId, fire: true });
      return { ok: true };
    }
    const timeoutMs = Math.max(1000, Math.min(15000, Number(payload?.timeoutMs) || 5000));
    return new Promise(resolve => {
      const timer = setTimeout(() => {
        pendingRequests.delete(requestId);
        resolve({ ok: false, error: '通信宿主没有响应' });
      }, timeoutMs);
      pendingRequests.set(requestId, { resolve, timer });
      window.webContents.send('office:host-request', { ...payload, requestId, fire: false });
    });
  });
  handleMain('office:host-auth-get', async () => {
    // The main renderer may be reloaded after the performance harness installs
    // its isolated cookie. Give the host one restore attempt so a stale
    // signed-out snapshot cannot strand the visible window at the login gate.
    if (auth?.status === 'authenticated') return auth;
    if (!authRestore) authRestore = Promise.resolve().then(() => login({ restore: true }))
      .finally(() => { authRestore = undefined; });
    await authRestore;
    return auth;
  });
  async function persistSessionCookie(response) {
    const sessionCookie = response.headers.get('set-cookie')?.match(/office_session=([^;]+)/)?.[1];
    if (sessionCookie && hostSession?.cookies?.set) {
      await hostSession.cookies.set({ url: OFFICE_URL, name: 'office_session', value: sessionCookie,
        httpOnly: true, sameSite: 'strict' }).catch(() => {});
    }
  }
  // One sign-in at a time. The host page and the main page both restore the saved
  // login at start-up; two server logins in the same second made the later one
  // revoke the session the host socket had just connected with (empty roster).
  let loginTail = Promise.resolve();
  let lastLogin = null;
  const SAME_LOGIN_MS = 10000;
  function login(payload, automatic = payload?.restore === true) {
    const run = loginTail.then(async () => {
      // Only automatic restores are folded together; a person typing a password in
      // the main window always reaches the server.
      const repeated = automatic && lastLogin && now() - lastLogin.at < SAME_LOGIN_MS
        && auth?.status === 'authenticated'
        && (payload?.restore === true
          || (payload?.name === lastLogin.name && payload?.password === lastLogin.password));
      if (repeated) return { ok: true, user: auth.user, auth };
      return loginWith(payload);
    });
    loginTail = run.catch(() => {});
    return run;
  }
  async function loginWith(payload) {
    const restore = payload?.restore === true;
    let name = typeof payload?.name === 'string' ? payload.name : '';
    let password = typeof payload?.password === 'string' ? payload.password : '';
    if (restore) {
      try {
        const saved = JSON.parse(safeStorage.decryptString(fs.readFileSync(credentials)));
        name = String(saved?.name || ''); password = String(saved?.password || '');
      } catch { /* no saved credentials */ }
    }
    if (!restore && (!name || !password || name.length > 24 || password.length > 16)) {
      return { ok: false, error: '名字或密码不对' };
    }
    try {
      const response = restore && (!name || !password)
        ? await hostSession.fetch(new URL('api/auth/me', OFFICE_URL).href, {
          headers: { Origin: new URL(OFFICE_URL).origin } })
        : await hostSession.fetch(new URL('api/auth/login', OFFICE_URL).href, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Origin: new URL(OFFICE_URL).origin },
          body: JSON.stringify({ name, password }),
        });
      const data = await response.json();
      if (!response.ok || !data?.user) {
        if (restore) {
          auth = sanitizeAuth({ status: 'signed-out', user: null });
          toMain('office:host-auth-changed', auth);
          return { ok: false, auth };
        }
        return { ok: false, error: data?.error || '登录失败' };
      }
      await persistSessionCookie(response);
      auth = sanitizeAuth({ status: 'authenticated', user: data.user });
      lastLogin = name && password ? { at: now(), name, password } : null;
      if (!restore && safeStorage?.isEncryptionAvailable?.()) {
        try { fs.writeFileSync(credentials, safeStorage.encryptString(JSON.stringify({ name, password }))); } catch { /* best effort */ }
      }
      if (window && !window.isDestroyed()) window.webContents.send('office:host-login', { ok: true, user: data.user });
      toMain('office:host-auth-changed', auth);
      return { ok: true, user: data.user, auth };
    } catch { return { ok: false, error: '连不上，等一下再试' }; }
  }
  ipc.handle('office:host-login', (event, payload) => {
    if (!senderIsMain(event) && !senderIsHost(event)) throw Error('Untrusted comms host login');
    return login(payload, payload?.restore === true || senderIsHost(event));
  });
  handle('office:host-debug', () => ({
    pid: window && !window.isDestroyed() ? window.webContents.getOSProcessId() : 0,
    ...hostBusyState(), auth,
  }));

  /** Liveness of the host page itself, separate from what its snapshot says. */
  function health() {
    return {
      alive: isAlive(),
      connected: snapshot?.identity?.connected === true,
      stale: !lastSeenAt || now() - lastSeenAt > staleMs,
    };
  }

  function hostBusyState() {
    const base = health();
    const reasons = snapshotBlockers(snapshot);
    if (testBusy) reasons.push('test-busy');
    const active = reasons.length > 0;
    return { ...base, active, reasons, busy: !base.alive || base.stale || !base.connected || active };
  }

  function ensure() {
    if (destroyed) return undefined;
    if (window && !window.isDestroyed()) return window;
    const current = new BrowserWindowCtor({
      width: 800, height: 600, show: false, frame: false,
      skipTaskbar: true, focusable: false, hasShadow: false,
      resizable: false, movable: false, minimizable: false,
      maximizable: false, fullscreenable: false,
      title: 'iruler dream Comms Host',
      webPreferences: {
        session: hostSession,
        preload: path.join(__dirname, 'host-preload.cjs'),
        contextIsolation: true, sandbox: true, nodeIntegration: false,
        backgroundThrottling: false,
      },
    });
    window = current;
    current.on('close', event => { if (!quitting) event.preventDefault(); });
    current.on('closed', () => { if (window === current) window = undefined; });
    current.webContents.on('render-process-gone', () => {
      if (window !== current || destroyed || quitting) return;
      lastSeenAt = 0;
      auth = null;
      snapshot = null;
      fullSnapshot = null;
      fullEpoch = 0;
      fullSeq = 0;
      testBusy = false;
      for (const pending of pendingCommands.values()) {
        clearTimeout(pending.timer);
        pending.resolve({ ok: false, error: '通信宿主已崩溃' });
      }
      pendingCommands.clear();
      for (const pending of pendingRequests.values()) {
        clearTimeout(pending.timer);
        pending.resolve({ ok: false, error: '通信宿主已崩溃' });
      }
      pendingRequests.clear();
      for (const waiter of stateWaiters) {
        clearTimeout(waiter.timer);
        waiter.resolve([]);
      }
      stateWaiters.clear();
      if (window === current) window = undefined;
      try { current.destroy(); } catch { /* renderer crash teardown */ }
      if (recoveryTimer) clearTimeout(recoveryTimer);
      recoveryTimer = setTimeout(() => {
        recoveryTimer = undefined;
        if (!destroyed && !quitting) ensure();
      }, 0);
      recoveryTimer.unref?.();
    });
    current.webContents.on('will-navigate', event => event.preventDefault());
    current.webContents.on('will-attach-webview', event => event.preventDefault());
    current.webContents.setWindowOpenHandler?.(() => ({ action: 'deny' }));
    // Chromium reports a dead connection (DNS, proxy, no network at login) here, and the
    // page stays on an error document that never runs the host runtime.
    current.webContents.on('did-fail-load', (_event, errorCode, errorDescription, _url, isMainFrame) => {
      if (isMainFrame === false || errorCode === -3) return; // -3 is ERR_ABORTED, not a failure
      lastSeenAt = 0;
      reloadSoon();
    });
    if (typeof current.loadURL === 'function') {
      const target = new URL(HOST_URL);
      if (enabled) target.searchParams.set('officeCommsHost', '1');
      loadAttempts = 0;
      void current.loadURL(target.href).catch(() => { lastSeenAt = 0; reloadSoon(); });
      // A page that loaded but never publishes (blocked script, stale cache) gets reloaded
      // too, so a single bad start cannot leave the office offline until the app restarts.
      if (loadTimer) clearTimeout(loadTimer);
      loadTimer = setTimeout(() => {
        loadTimer = undefined;
        if (destroyed || quitting || lastSeenAt) return;
        reloadSoon();
      }, NEVER_LOADED_MS);
      loadTimer.unref?.();
    }
    return current;
  }

  function isAlive() {
    if (!window || window.isDestroyed()) return false;
    const contents = window.webContents;
    if (!contents || contents.isDestroyed?.()) return false;
    return contents.isCrashed?.() !== true;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    quitting = true;
    if (recoveryTimer) clearTimeout(recoveryTimer);
    recoveryTimer = undefined;
    if (loadTimer) clearTimeout(loadTimer);
    loadTimer = undefined;
    lastSeenAt = 0;
    for (const { channel, handler } of handlers) ipc.removeListener(channel, handler);
    for (const channel of ['office:host-state-get', 'office:host-command', 'office:host-request',
      'office:host-auth-get', 'office:host-login', 'office:host-debug']) ipc.removeHandler?.(channel);
    for (const pending of pendingCommands.values()) { clearTimeout(pending.timer); pending.resolve({ ok: false, error: '通信宿主已退出' }); }
    pendingCommands.clear();
    for (const pending of pendingRequests.values()) { clearTimeout(pending.timer); pending.resolve({ ok: false, error: '通信宿主已退出' }); }
    pendingRequests.clear();
    for (const waiter of stateWaiters) { clearTimeout(waiter.timer); waiter.resolve([]); }
    stateWaiters.clear();
    if (window && !window.isDestroyed()) window.destroy();
    window = undefined;
  }

  return {
    ensure,
    window: () => window,
    isAlive,
    destroy,
    busy: hostBusyState,
    health,
    forcedBusy: () => testBusy,
    connected: () => Boolean(snapshot?.identity?.connected),
    snapshot: () => snapshot,
    publishPreview,
    auth: () => auth,
    hostUrl: HOST_URL,
  };
}

module.exports = { createCommsHost, HOST_URL };
