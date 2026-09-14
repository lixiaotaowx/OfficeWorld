const { contextBridge, ipcRenderer } = require('electron');
let channel;
let ready;
let listener;
ipcRenderer.on('office-picker-ready', (_event, data) => {
  channel = data.channel;
  ready = data.sources;
  if (listener) listener(ready);
});
contextBridge.exposeInMainWorld('sourcePicker', {
  onSources(callback) { listener = callback; if (ready) callback(ready); },
  choose(id) { if (channel) return ipcRenderer.invoke(channel, id); },
});
