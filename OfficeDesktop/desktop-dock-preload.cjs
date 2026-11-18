

const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('officeDock', Object.freeze({
  displays: () => ipcRenderer.invoke('office:displays'),
  selectDisplay: id => ipcRenderer.invoke('office:display-select', String(id || '')),
  openChatTarget: input => ipcRenderer.invoke('office:dock-chat-target', {conversation: String(input?.conversation || ''), messageId: String(input?.messageId || ''), target: String(input?.target || '')}),

  videoWant: id => ipcRenderer.invoke('office:dock-video-want', id),
  onVideo(callback) {
    const listener = (_event, value) => callback(value);
    ipcRenderer.on('office:dock-video', listener);
    return () => ipcRenderer.removeListener('office:dock-video', listener);
  },
  state: () => ipcRenderer.invoke('office:dock-state'),

  onState(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-state', listener);
    return () => ipcRenderer.removeListener('office:dock-state', listener);
  },

  requestPreview: personId => ipcRenderer.invoke('office:dock-preview-want', personId),
  onPreview(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-preview', listener);
    return () => ipcRenderer.removeListener('office:dock-preview', listener);
  },

  action: (kind, personId, meeting, extra) => ipcRenderer.invoke('office:dock-action',
    { kind, personId, meeting, text: extra?.text, ids: extra?.ids }),

  answer: (requestId, accept) => ipcRenderer.invoke('office:dock-answer',
    { requestId: String(requestId || ''), accept: accept === true }),

  drag: (dx, dy) => ipcRenderer.invoke('office:dock-drag', { dx, dy }),

  layout: input => ipcRenderer.invoke('office:dock-layout', {
    expanded: input?.expanded === true, stage: input?.stage === true,
    stageMode: input?.stageMode === 'peek' || input?.stageMode === 'call' ? input.stageMode : '',

    stagePx: Math.max(0, Math.min(900, Math.round(Number(input?.stagePx) || 0))),
    cardPx: Math.max(0, Math.min(700, Number(input?.cardPx) || 0)),
    width: Number(input?.width) || 0,
    cardWidth: Math.max(0, Math.min(4096, Number(input?.cardWidth) || 0)),

    hitRegions: (Array.isArray(input?.hitRegions) ? input.hitRegions : []).slice(0, 80)
      .filter(row => row && ['x', 'y', 'width', 'height'].every(key => Number.isFinite(row[key])))
      .map(({ x, y, width, height }) => ({ x, y, width, height })) }),

  onGreet(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-greet', listener);
    return () => ipcRenderer.removeListener('office:dock-greet', listener);
  },

  onVisibility(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:dock-visible', listener);
    return () => ipcRenderer.removeListener('office:dock-visible', listener);
  },

  filePaths: files => {
    const out = [];
    for (const file of files || []) {
      try { const path = webUtils.getPathForFile(file); if (path) out.push(path); }
      catch {  }
    }
    return out;
  },

  dropFiles: (personId, paths) => ipcRenderer.invoke('office:dock-files',
    { personId: String(personId || ''),
      paths: (Array.isArray(paths) ? paths : []).filter(item => typeof item === 'string').slice(0, 64) }),
}));
