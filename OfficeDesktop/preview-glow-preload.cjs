const { contextBridge, ipcRenderer } = require('electron');

// 单向：主进程说"有人来看我了"，页面就亮一下。这个层不接受任何输入。
contextBridge.exposeInMainWorld('officeGlow', {
  onFlash(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:preview-glow', listener);
    return () => ipcRenderer.removeListener('office:preview-glow', listener);
  },
});
