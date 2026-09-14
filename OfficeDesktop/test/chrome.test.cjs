const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { EventEmitter } = require('node:events');

function fixture() {
  const handlers = {}, opened = [];
  const wc = new EventEmitter();
  wc.mainFrame = { url: 'https://115.159.43.237/' };
  const window = new EventEmitter(); window.webContents = wc;
  let closed = 0;
  window.close = () => closed++;
  const electron = {
    ipcMain: { handle: (name, fn) => handlers[name] = fn, removeHandler: name => delete handlers[name] },
    shell: { openExternal: async uri => opened.push(uri) }, dialog: {}, app: {}, nativeImage: {},
  };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../chrome.cjs'), 'utf8'), {
    module, __dirname: __dirname,
    require: id => id === 'electron' ? electron : id === './policy.cjs' ? require('../policy.cjs') : require(id),
  });
  module.exports.installChrome(window);
  return { handlers, opened, window, closed: () => closed,
    event: { sender: wc, senderFrame: wc.mainFrame } };
}
test('设备管理仅打开声音设置，关闭命令经过窗口关闭事件', async () => {
  const f = fixture();
  await f.handlers['dream:action'](f.event, 'devices');
  assert.deepEqual(f.opened, ['ms-settings:sound']);
  f.handlers['dream:action'](f.event, 'close');
  assert.equal(f.closed(), 1);
});
test('子框架、其他窗口、外站与任意命令均不能使用桌面操作', () => {
  const f = fixture(), action = f.handlers['dream:action'];
  assert.throws(() => action({ ...f.event, sender: {} }, 'devices'));
  assert.throws(() => action({ ...f.event, senderFrame: { url: f.event.senderFrame.url } }, 'devices'));
  f.event.senderFrame.url = 'https://example.com/';
  assert.throws(() => action(f.event, 'devices'));
  f.event.senderFrame.url = 'https://115.159.43.237/';
  assert.throws(() => action(f.event, 'ms-settings:network'));
  assert.deepEqual(f.opened, []);
  f.window.emit('closed');
  assert.deepEqual(Object.keys(f.handlers), []);
});
