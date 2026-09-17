const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('officeDesktop', Object.freeze({
  focusWindow: () => ipcRenderer.invoke('office:focus'),
  // Native call / message / meeting alert raised by the main process, which can
  // also raise the window and flash the taskbar when the event is a ring-type one.
  alert: payload => ipcRenderer.invoke('office:alert', payload),
  onAlertOpen: callback => {
    const listener = (_event, section) => callback(typeof section === 'string' ? section : '');
    ipcRenderer.on('office:alert-open', listener);
    return () => ipcRenderer.removeListener('office:alert-open', listener);
  },
  displays: () => ipcRenderer.invoke('office:displays'),
  /**
   * Seconds since the last mouse/keyboard input **anywhere in Windows**, plus
   * 'active' | 'idle' | 'locked'. The page uses it so somebody working in another
   * program still counts as 在座, and a locked screen counts as 离桌.
   */
  systemIdle: () => ipcRenderer.invoke('office:system-idle'),
  /** Installed version, so the page can tell whether a newer one was published. */
  appVersion: () => ipcRenderer.invoke('office:app-version'),
  /** Download the installer (progress arrives on `onUpdateProgress`), then run it. */
  downloadUpdate: (url, sha256) => ipcRenderer.invoke('office:update-download', url, sha256),
  /** Show the finished installer in Explorer. */
  revealUpdate: file => ipcRenderer.invoke('office:update-reveal', file),
  installUpdate: file => ipcRenderer.invoke('office:update-install', file),
  onUpdateProgress(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:update-progress', listener);
    return () => ipcRenderer.removeListener('office:update-progress', listener);
  },
  selectDisplay: id => ipcRenderer.invoke('office:display-select', id),
  previewFrame: () => ipcRenderer.invoke('office:preview-frame'),
  /** false releases the capture stream while nobody can receive the preview. */
  setPreviewActive: active => ipcRenderer.invoke('office:preview-active', active === true),
  /** 采集是不是因为"人不在电脑前"被暂停了（暂停时屏幕才能按电源计划熄灭）。 */
  previewState: () => ipcRenderer.invoke('office:preview-state'),
  saveLogin: value => ipcRenderer.invoke('office:login-save', value),
  readLogin: () => ipcRenderer.invoke('office:login-read'),
  clearLogin: () => ipcRenderer.invoke('office:login-clear'),
  /** Whole-screen mode; the DOM Fullscreen API does nothing in this window. */
  setFullscreen: value => ipcRenderer.invoke('office:fullscreen', value === true),
  onFullscreenChange(callback) {
    const listener = (_event, value) => callback(value === true);
    ipcRenderer.on('office:fullscreen-changed', listener);
    return () => ipcRenderer.removeListener('office:fullscreen-changed', listener);
  },
  // Annotation layer over the display this client is sharing.
  annotations: {
    attach: () => ipcRenderer.invoke('office:annotation-layer', true),
    detach: () => ipcRenderer.invoke('office:annotation-layer', false),
    draw: message => ipcRenderer.invoke('office:annotation-push', message),
    clear: () => ipcRenderer.invoke('office:annotation-clear'),
  },
}));

// Desktop-only chrome; the website remains isolated from Electron APIs.
window.addEventListener('DOMContentLoaded', async () => {
  if (location.origin !== 'https://115.159.43.237' || window.top !== window) return;
  try {
    const resources = await ipcRenderer.invoke('dream:resources');
    const style = document.createElement('style');
    style.textContent = resources.theme;
    document.head.append(style);
    document.documentElement.classList.add('iruler-desktop');
    document.documentElement.style.setProperty('--dream-icon', `url("${resources.icon}")`);
    const host = document.createElement('div');
    host.id = 'iruler-desktop-chrome';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${resources.css}</style>${resources.html}`;
    root.querySelector('.brand img').src = resources.icon;
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
      try { await ipcRenderer.invoke('dream:action', button.dataset.action); }
      catch {
        const toast = root.querySelector('.toast');
        toast.textContent = '暂时无法完成操作，请稍后重试。'; toast.hidden = false;
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
    root.querySelector('.bar').addEventListener('dblclick', event => {
      if (!event.target.closest('button,nav')) void ipcRenderer.invoke('dream:action', 'maximize');
    });
    const brand = () => {
      for (const element of document.querySelectorAll('.brand-wordmark, .account-brand > span:last-child')) {
        for (const node of element.childNodes) {
          if (node.nodeType === Node.TEXT_NODE && /OFFICE/.test(node.textContent)) node.textContent = 'iruler dream';
        }
      }
      const footer = document.querySelector('.workspace > footer > span');
      if (footer && /OFFICE WORLD/.test(footer.textContent)) footer.textContent = footer.textContent.replace('OFFICE WORLD', 'iruler dream');
    };
    brand();
    const observer = new MutationObserver(brand);
    observer.observe(document.getElementById('root') || document.body, { childList: true, subtree: true });
  } catch { /* An old desktop-bridge fixture does not expose application chrome. */ }
});
