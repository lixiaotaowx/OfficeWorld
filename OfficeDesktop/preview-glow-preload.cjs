const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('officeGlow', {
  onFlash(callback) {
    const listener = (_event, payload) => callback(payload || {});
    ipcRenderer.on('office:preview-glow', listener);
    return () => ipcRenderer.removeListener('office:preview-glow', listener);
  },
});
