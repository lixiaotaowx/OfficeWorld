const { contextBridge, ipcRenderer } = require('electron');

const LOOK_SLOTS = ['glasses', 'hair', 'beard', 'hat'];
const ID_RE = /^[a-z0-9_]{1,24}$/;

function cleanAppearance(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const color = String(raw.color || '');
  if (!ID_RE.test(color)) return null;
  const source = raw.accessories && typeof raw.accessories === 'object' ? raw.accessories : {};
  const accessories = {};
  for (const slot of LOOK_SLOTS) {
    const id = String(source[slot] || '');
    accessories[slot] = ID_RE.test(id) ? id : '';
  }
  return { color, accessories };
}

contextBridge.exposeInMainWorld('officeDesktop', Object.freeze({
  screenDock: true,
  mainWindowVisible: () => ipcRenderer.invoke('office:main-visible'),
  /** Tells the main process whether this page holds a call, a meeting room, a capture or a live microphone. */
  mediaActive: active => ipcRenderer.send('office:media-active', active === true),
  onMainWindowVisibility(callback) {
    const listener = (_event, visible) => { if (typeof visible === 'boolean') callback(visible); };
    ipcRenderer.on('office:main-visibility-changed', listener);
    return () => ipcRenderer.removeListener('office:main-visibility-changed', listener);
  },
  onDisplayChanged: callback => {
    const listener = () => callback();
    ipcRenderer.on('office:display-changed', listener);
    return () => ipcRenderer.removeListener('office:display-changed', listener);
  },
  focusWindow: () => ipcRenderer.invoke('office:focus'),

  alert: payload => ipcRenderer.invoke('office:alert', payload),
  onAlertOpen: callback => {
    const listener = (_event, section) => callback(typeof section === 'string' ? section : '');
    ipcRenderer.on('office:alert-open', listener);
    return () => ipcRenderer.removeListener('office:alert-open', listener);
  },
  displays: () => ipcRenderer.invoke('office:displays'),

  systemIdle: () => ipcRenderer.invoke('office:system-idle'),

  appVersion: () => ipcRenderer.invoke('office:app-version'),

  downloadUpdate: (url, sha256) => ipcRenderer.invoke('office:update-download', url, sha256),

  revealUpdate: file => ipcRenderer.invoke('office:update-reveal', file),
  installUpdate: file => ipcRenderer.invoke('office:update-install', file),
  /** The page found a valid update manifest; the app's own fallback check stands down. */
  updateChecked: version => { ipcRenderer.invoke('office:update-checked', String(version || '')).catch(() => {}); },
  onUpdateProgress(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:update-progress', listener);
    return () => ipcRenderer.removeListener('office:update-progress', listener);
  },
  selectDisplay: id => ipcRenderer.invoke('office:display-select', id),
  screenShareIndicator: Object.freeze({
    source: () => ipcRenderer.invoke('office:captured-display'),
    show: ids => ipcRenderer.invoke('office:sharing-displays',
      Array.isArray(ids) && ids.length <= 32 && ids.every(id => typeof id === 'string') ? ids : null),
  }),
  previewFrame: () => ipcRenderer.invoke('office:preview-frame'),

  setPreviewActive: active => ipcRenderer.invoke('office:preview-active', active === true),

  previewState: () => ipcRenderer.invoke('office:preview-state'),

  previewGlow: payload => ipcRenderer.invoke('office:preview-glow',
    { sharing: payload?.sharing === true, on: payload?.on !== false,
      fade: Math.max(0, Math.min(10000, Number(payload?.fade) || 0)),
      tone: payload?.tone === 'call' ? 'call' : 'watch' }),

  dockGreet: payload => ipcRenderer.invoke('office:dock-greet',
    { id: String(payload?.id || ''), name: String(payload?.name || '').slice(0, 24),

      appearance: cleanAppearance(payload?.appearance),
      mode: payload?.mode === 'call' ? 'call' : 'peek',
      requestId: String(payload?.requestId || '').slice(0, 64),
      kind: payload?.kind === 'voice' || payload?.kind === 'screen' ? payload.kind : '',
      offer: payload?.offer === true }),

  dockVideo: payload => ipcRenderer.invoke('office:dock-video', payload),
  onDockVideoWant(callback) {
    const listener = (_event, id) => callback(id);
    ipcRenderer.on('office:dock-video-want', listener);
    return () => ipcRenderer.removeListener('office:dock-video-want', listener);
  },
  dockState: payload => ipcRenderer.invoke('office:dock-publish', payload),  
  dockPreview: payload => ipcRenderer.invoke('office:dock-preview', payload),

  onDockCommand(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-command', listener);
    return () => ipcRenderer.removeListener('office:dock-command', listener);
  },

  onDockPreviewWant(callback) {
    const listener = (_event, personId) => callback(String(personId || ''));
    ipcRenderer.on('office:dock-preview-want', listener);
    return () => ipcRenderer.removeListener('office:dock-preview-want', listener);
  },

  onDockAnswer(callback) {
    const listener = (_event, payload) => callback({
      requestId: String(payload?.requestId || ''),
      accept: payload?.accept === true });
    ipcRenderer.on('office:dock-answer', listener);
    return () => ipcRenderer.removeListener('office:dock-answer', listener);
  },
  saveLogin: value => ipcRenderer.invoke('office:login-save', value),
  readLogin: () => ipcRenderer.invoke('office:login-read'),
  clearLogin: () => ipcRenderer.invoke('office:login-clear'),

  setFullscreen: value => ipcRenderer.invoke('office:fullscreen', value === true),
  onFullscreenChange(callback) {
    const listener = (_event, value) => callback(value === true);
    ipcRenderer.on('office:fullscreen-changed', listener);
    return () => ipcRenderer.removeListener('office:fullscreen-changed', listener);
  },

  files: {

    settings: () => ipcRenderer.invoke('office:file-settings'),

    chooseFolder: () => ipcRenderer.invoke('office:file-choose-folder'),
    openFolder: folder => ipcRenderer.invoke('office:file-open-folder', String(folder || '')),

    sendOpen: target => ipcRenderer.invoke('office:file-send-open', String(target || '')),
    sendRead: (id, offset, length) => ipcRenderer.invoke('office:file-send-read',
      String(id || ''), Math.max(0, Math.round(Number(offset) || 0)),
      Math.max(0, Math.min(512 * 1024, Math.round(Number(length) || 0)))),
    sendClose: id => ipcRenderer.invoke('office:file-send-close', String(id || '')),

    receiveOpen: input => ipcRenderer.invoke('office:file-receive-open', {
      transferId: String(input?.transferId || ''),
      name: String(input?.name || '').slice(0, 200),
      size: Math.max(0, Math.round(Number(input?.size) || 0)) }),
    receiveWrite: (id, bytes) => ipcRenderer.invoke('office:file-receive-write', String(id || ''), bytes),
    receiveEnd: id => ipcRenderer.invoke('office:file-receive-end', String(id || '')),
    receiveCancel: id => ipcRenderer.invoke('office:file-receive-cancel', String(id || '')),

    progress: value => ipcRenderer.invoke('office:file-progress', Number(value)),

    open: target => ipcRenderer.invoke('office:file-open', String(target || '')),
    reveal: target => ipcRenderer.invoke('office:file-reveal', String(target || '')),

    onDropped(callback) {
      const listener = (_event, payload) => callback({
        personId: String(payload?.personId || ''),
        paths: Array.isArray(payload?.paths)
          ? payload.paths.filter(item => typeof item === 'string').slice(0, 64) : [] });
      ipcRenderer.on('office:dock-files', listener);
      return () => ipcRenderer.removeListener('office:dock-files', listener);
    },
  },

  /** the old title bar's menu, now in the hall's settings: reconnect, open in browser, quit, sound settings, fullscreen */
  windowAction: action => ipcRenderer.invoke('officeworld:action', action),

  annotations: {
    attach: () => ipcRenderer.invoke('office:annotation-layer', true),
    detach: () => ipcRenderer.invoke('office:annotation-layer', false),
    draw: message => ipcRenderer.invoke('office:annotation-push', message),
    clear: () => ipcRenderer.invoke('office:annotation-clear'),
  },
}));

// Host-mode view bridge. The hidden host owns socket/state/login; this window
// only reads snapshots and sends commands. It is absent in the default path.
const hostMode = typeof location !== 'undefined' && typeof location.search === 'string' &&
  /(?:^|[?&])officeCommsHost=(?:1|true)(?:&|$)/.test(location.search);
if (hostMode) {
  contextBridge.exposeInMainWorld('officeHost', Object.freeze({
    enabled: true,
    state: {
      get: () => ipcRenderer.invoke('office:host-state-get'),
      onSnapshot(callback) {
        const listener = (_event, envelope) => callback(envelope);
        ipcRenderer.on('office:host-snapshot', listener);
        return () => ipcRenderer.removeListener('office:host-snapshot', listener);
      },
      command: command => ipcRenderer.invoke('office:host-command', command),
    },
    auth: {
      get: () => ipcRenderer.invoke('office:host-auth-get'),
      onChange(callback) {
        const listener = (_event, next) => callback(next);
        ipcRenderer.on('office:host-auth-changed', listener);
        return () => ipcRenderer.removeListener('office:host-auth-changed', listener);
      },
      login: (name, password) => ipcRenderer.invoke('office:host-login', { name, password }),
    },
    media: {
      request: input => ipcRenderer.invoke('office:host-request', {
        event: String(input?.event || ''), payload: input?.payload,
        timeoutMs: input?.timeoutMs, fire: false,
      }),
      emit: input => ipcRenderer.invoke('office:host-request', {
        event: String(input?.event || ''), args: Array.isArray(input?.args) ? input.args : [], fire: true,
      }),
      onEvent(callback) {
        const listener = (_event, event) => callback(event);
        ipcRenderer.on('office:host-media-event', listener);
        return () => ipcRenderer.removeListener('office:host-media-event', listener);
      },
    },
    request: payload => ipcRenderer.invoke('office:host-request', payload),
    onResponse(callback) {
      const listener = (_event, payload) => callback(payload);
      ipcRenderer.on('office:host-response', listener);
      return () => ipcRenderer.removeListener('office:host-response', listener);
    },
  }));
}

window.addEventListener('DOMContentLoaded', async () => {
  if (window.top !== window) return;
  document.documentElement.classList.add('officeworld-desktop');
  try {
    // The main process checks the configured origin before returning chrome resources.
    const resources = await ipcRenderer.invoke('officeworld:resources');
    const style = document.createElement('style');
    style.textContent = resources.theme;
    document.head.append(style);
    document.documentElement.classList.add('officeworld-desktop');
    document.documentElement.style.setProperty('--officeworld-icon', `url("${resources.icon}")`);
    const host = document.createElement('div');
    host.id = 'officeworld-desktop-chrome';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${resources.css}</style>${resources.html}`;
    document.body.append(host);
    const triggers = [...root.querySelectorAll('[aria-haspopup]')];
    const closeMenus = () => triggers.forEach(button => {
      button.setAttribute('aria-expanded', 'false');
      button.nextElementSibling.hidden = true;
    });
    triggers.forEach(button => button.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      closeMenus();
      button.setAttribute('aria-expanded', String(open));
      button.nextElementSibling.hidden = !open;
    }));
    root.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', async () => {
      closeMenus();
      try { await ipcRenderer.invoke('officeworld:action', button.dataset.action); }
      catch {
        const toast = root.querySelector('.toast');
        toast.textContent = "现在用不了，等一下再试"; toast.hidden = false;
        setTimeout(() => { toast.hidden = true; }, 3500);
      }
    }));
    document.addEventListener('pointerdown', event => {
      if (!event.composedPath().includes(host)) closeMenus();
    });
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeMenus(); return; }
      if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const trigger = event.target.closest('.menu')?.querySelector('[aria-haspopup]');
      if (!trigger) return;
      trigger.setAttribute('aria-expanded', 'true'); trigger.nextElementSibling.hidden = false;
      const items = [...trigger.nextElementSibling.querySelectorAll('button')];
      const current = items.indexOf(event.target);
      items[(current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    });
    root.querySelector('.drag')?.addEventListener('dblclick', event => {
      if (!event.target.closest('button,nav')) void ipcRenderer.invoke('officeworld:action', 'maximize');
    });
    const brand = () => {
      for (const element of document.querySelectorAll('.brand-wordmark, .account-brand > span:last-child')) {
        for (const node of element.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && /OFFICE/.test(node.textContent)) node.textContent = 'iruler dream';
        }
      }
      const footer = document.querySelector('.workspace > footer > span');
      if (footer && /IRULER DREAM/.test(footer.textContent)) footer.textContent = footer.textContent.replace('IRULER DREAM', 'iruler dream');
    };
    brand();
    const observer = new MutationObserver(brand);
    observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  } catch { /* Leave the page unchanged if the main process rejects the resource request. */ }
});
