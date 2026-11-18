'use strict';
const CHANNEL = 'office:main-visibility-changed';
function mainWindowVisible(window) {
  return Boolean(window && !window.isDestroyed() && window.isVisible() && !window.isMinimized());
}
function observeMainVisibility(window) {
  const contents = window.webContents;
  const send = () => {
    if (window.isDestroyed() || contents.isDestroyed()) return;
    try { contents.send(CHANNEL, mainWindowVisible(window)); } catch { /* navigation or teardown */ }
  };
  const events = ['show', 'hide', 'minimize', 'restore'];
  for (const event of events) window.on(event, send);
  contents.on('did-finish-load', send);
  const dispose = () => {
    for (const event of events) window.removeListener(event, send);
    contents.removeListener('did-finish-load', send);
    window.removeListener('closed', dispose);
  };
  window.on('closed', dispose);
  return dispose;
}
module.exports = { mainWindowVisible, observeMainVisibility, CHANNEL };
