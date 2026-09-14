const { contextBridge, ipcRenderer } = require('electron');

// One-way feed: the main process relays whatever the board currently holds.
contextBridge.exposeInMainWorld('annotationLayer', {
  subscribe(callback) {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('office:annotation-strokes', listener);
    return () => ipcRenderer.removeListener('office:annotation-strokes', listener);
  },
});
