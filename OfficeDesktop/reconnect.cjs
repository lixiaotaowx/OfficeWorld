const { OFFICE_URL } = require('./policy.cjs');

function reconnect(window) {
  const contents = window.webContents;
  let timer, attempt = 0, failed = false;
  const retry = () => {
    failed = true;
    clearTimeout(timer);
    window.setTitle('iruler dream · 网络暂不可用，正在自动重连');
    timer = setTimeout(() => {
      if (!window.isDestroyed()) void contents.loadURL(OFFICE_URL).catch(() => {});
    }, Math.min(30000, 5000 * ++attempt));
  };
  contents.on('did-start-navigation', (_event, _url, _inPlace, mainFrame) => {
    if (mainFrame) failed = false;
  });
  contents.on('did-fail-load', (_event, code, _description, _url, mainFrame) => {
    if (code !== -3 && mainFrame) retry();
  });
  contents.on('did-navigate', (_event, _url, status) => {
    if (status >= 400) retry();
  });
  contents.on('did-finish-load', () => {
    // Chromium also emits finish for its network error page.
    if (!failed) { clearTimeout(timer); attempt = 0; }
  });
  window.on('closed', () => clearTimeout(timer));
}
module.exports = { reconnect };
