const { BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

function chooseSource(parent, sources, options = {}) {
  return new Promise(resolve => {
    const pickerPath = path.join(__dirname, 'picker.html');
    const pickerUrl = pathToFileURL(pickerPath).href;
    const picker = new BrowserWindow({
      parent, modal: true, width: 820, height: 600, minWidth: 520, minHeight: 400,
      frame: false, icon: path.join(__dirname, 'assets', 'icon.ico'),
      title: '选择共享内容', backgroundColor: '#eae7dd', autoHideMenuBar: true, show: options.show !== false,
      webPreferences: { preload: path.join(__dirname, 'picker-preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true },
    });
    const channel = `office-picker-${picker.webContents.id}`;
    let done = false;
    const finish = source => {
      if (done) return;
      done = true;
      ipcMain.removeHandler(channel);
      resolve(source);
      if (!picker.isDestroyed()) picker.close();
    };
    ipcMain.handle(channel, (event, id) => {
      if (event.sender !== picker.webContents || event.senderFrame !== picker.webContents.mainFrame || event.senderFrame.url !== pickerUrl) return;
      finish(typeof id === 'string' ? sources.find(source => source.id === id) : undefined);
    });
    picker.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    picker.webContents.on('will-navigate', event => event.preventDefault());
    picker.webContents.on('did-finish-load', () => picker.webContents.send('office-picker-ready', {
      channel,
      sources: sources.map(source => ({ id: source.id, name: source.name, thumbnail: source.thumbnail.toDataURL() })),
    }));
    picker.on('closed', () => finish());
    picker.loadFile(pickerPath).catch(() => finish());
  });
}
module.exports = { chooseSource };
