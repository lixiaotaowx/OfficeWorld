const { contextBridge, ipcRenderer } = require('electron');

/** 配色/配件的槽位，和 OfficeWeb/src/look.ts 的 SLOT_ORDER 一致。 */
const LOOK_SLOTS = ['glasses', 'hair', 'beard', 'hat'];
const ID_RE = /^[a-z0-9_]{1,24}$/;

/**
 * 外观载荷的白名单清洗：只透传"配色 id + 四个槽位的 id"，其余一律丢掉。
 * 这份数据一路走到小窗页面，会被拿去当 GLB 里的网格名匹配，所以在这里就把形状钉死。
 */
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
  /**
   * 有人来看我了：所有屏幕四周亮起一圈绿光（自己在共享屏幕时传 sharing:true，不亮）。
   * `fade` 是"亮起来用多久"：悬停那一路慢慢亮 2 秒，打电话过来立刻亮（用户 2026-09-20）。
   * **这里是白名单清洗，加字段时别忘了它**——`fade` 漏在这儿时现象就是"永远立刻亮"。
   */
  previewGlow: payload => ipcRenderer.invoke('office:preview-glow',
    { sharing: payload?.sharing === true, on: payload?.on !== false,
      fade: Math.max(0, Math.min(10000, Number(payload?.fade) || 0)) }),
  /**
   * 有人来看我了：让任务栏头像条把那个人的角色拉出来。
   * `mode` 决定场合：`call`（有人打电话过来）用当前大小演一段招手，`peek`（只是鼠标停一下）
   * 小一倍、不演动作。**同样别漏在这里**，漏了就永远是"小一号、不打招呼"。
   * 打电话过来还要带那一通邀请（`requestId`/`kind`/`offer`）：漏了 `requestId` 的现象就是
   * **名字有了、但头顶气泡上没有「接听 / 拒绝」两个按钮**（用户 2026-09-21 真机上就是这条）。
   */
  dockGreet: payload => ipcRenderer.invoke('office:dock-greet',
    { id: String(payload?.id || ''), name: String(payload?.name || '').slice(0, 24),
      // 配色与配件（尺子角色）：小窗要照他自己的样子把他拉出来演。**别漏这里**。
      appearance: cleanAppearance(payload?.appearance),
      mode: payload?.mode === 'call' ? 'call' : 'peek',
      requestId: String(payload?.requestId || '').slice(0, 64),
      kind: payload?.kind === 'voice' || payload?.kind === 'screen' ? payload.kind : '',
      offer: payload?.offer === true }),
  /** 任务栏头像条：把在线状态推给主进程（它转发给小窗）。 */
  dockState: payload => ipcRenderer.invoke('office:dock-publish', payload),  /** 把某个人的最近一帧交给头像条。 */
  dockPreview: payload => ipcRenderer.invoke('office:dock-preview', payload),
  /** 头像条上点了按钮（看屏幕/分享我的/语音）。 */
  onDockCommand(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-command', listener);
    return () => ipcRenderer.removeListener('office:dock-command', listener);
  },
  /** 头像条悬停某个人，想马上要一帧。 */
  onDockPreviewWant(callback) {
    const listener = (_event, personId) => callback(String(personId || ''));
    ipcRenderer.on('office:dock-preview-want', listener);
    return () => ipcRenderer.removeListener('office:dock-preview-want', listener);
  },
  /**
   * 头像条上按了「接听 / 拒绝」（用户 2026-09-21）：主窗口拿着 socket，所以由它去应答那一通
   * 邀请。**这条桥漏了的现象就是按钮点下去没反应**（2026-09-21 真机上报的正是"名字有了、
   * 按钮没有 / 点了不动"）。
   */
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
  /** Whole-screen mode; the DOM Fullscreen API does nothing in this window. */
  setFullscreen: value => ipcRenderer.invoke('office:fullscreen', value === true),
  onFullscreenChange(callback) {
    const listener = (_event, value) => callback(value === true);
    ipcRenderer.on('office:fullscreen-changed', listener);
    return () => ipcRenderer.removeListener('office:fullscreen-changed', listener);
  },
  // 文件直传（用户 2026-09-22）：把文件拖到任务栏头像条上的某个人头上就开始发，
  // 不需要对方同意，直接落进**对方设置好的接收文件夹**。这里只做白名单清洗 + 转发；
  // 真正的文件系统在主进程（`file-transfer.cjs`），页面拿不到任意路径的读写能力。
  files: {
    /** 我这边设置里的接收文件夹（谁收到就进谁的文件夹）。 */
    settings: () => ipcRenderer.invoke('office:file-settings'),
    /** 让用户挑一个接收文件夹（原生目录选择器）。 */
    chooseFolder: () => ipcRenderer.invoke('office:file-choose-folder'),
    openFolder: folder => ipcRenderer.invoke('office:file-open-folder', String(folder || '')),
    /** 发送：按主进程交回来的句柄读，页面从不碰真实路径。 */
    sendOpen: target => ipcRenderer.invoke('office:file-send-open', String(target || '')),
    sendRead: (id, offset, length) => ipcRenderer.invoke('office:file-send-read',
      String(id || ''), Math.max(0, Math.round(Number(offset) || 0)),
      Math.max(0, Math.min(512 * 1024, Math.round(Number(length) || 0)))),
    sendClose: id => ipcRenderer.invoke('office:file-send-close', String(id || '')),
    /** 接收：一律写进设置里的接收文件夹，主进程负责防重名与防路径穿越。 */
    receiveOpen: input => ipcRenderer.invoke('office:file-receive-open', {
      transferId: String(input?.transferId || ''),
      name: String(input?.name || '').slice(0, 200),
      size: Math.max(0, Math.round(Number(input?.size) || 0)) }),
    receiveWrite: (id, bytes) => ipcRenderer.invoke('office:file-receive-write', String(id || ''), bytes),
    receiveEnd: id => ipcRenderer.invoke('office:file-receive-end', String(id || '')),
    receiveCancel: id => ipcRenderer.invoke('office:file-receive-cancel', String(id || '')),
    /** 系统级进度条（Windows 任务栏按钮上那一条）：0..1，-1 清掉，>1 表示不确定。 */
    progress: value => ipcRenderer.invoke('office:file-progress', Number(value)),
    /** 完事后的两个按钮：打开文件 / 在文件夹里显示。只认主进程交出去过的路径。 */
    open: target => ipcRenderer.invoke('office:file-open', String(target || '')),
    reveal: target => ipcRenderer.invoke('office:file-reveal', String(target || '')),
    /** 有人把文件拖到了小窗的某个头像上（主进程转过来）。 */
    onDropped(callback) {
      const listener = (_event, payload) => callback({
        personId: String(payload?.personId || ''),
        paths: Array.isArray(payload?.paths)
          ? payload.paths.filter(item => typeof item === 'string').slice(0, 64) : [] });
      ipcRenderer.on('office:dock-files', listener);
      return () => ipcRenderer.removeListener('office:dock-files', listener);
    },
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
