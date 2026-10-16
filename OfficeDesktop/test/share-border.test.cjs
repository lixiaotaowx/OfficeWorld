const { test } = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const fs = require('node:fs');
const vm = require('node:vm');
const { createShareBorder } = require('../share-border.cjs');

function fixture() {
  const screen = new EventEmitter(), windows = [];
  let displays = [
    { id: 1, bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
    { id: 2, bounds: { x: -1280, y: -200, width: 1280, height: 1024 }, scaleFactor: 1.5 },
  ];
  screen.getAllDisplays = () => displays;
  class Window extends EventEmitter {
    constructor(options) {
      super(); this.options = options; this.visible = false; this.destroyed = false;
      this.bounds = Object.fromEntries(['x', 'y', 'width', 'height'].map(key => [key, options[key]]));
      this.webContents = new EventEmitter();
      this.webContents.setWindowOpenHandler = handler => { this.open = handler; };
      windows.push(this);
    }
    setIgnoreMouseEvents(value) { this.ignore = value; }
    setAlwaysOnTop(value, level) { this.top = [value, level]; }
    setVisibleOnAllWorkspaces(value, options) { this.workspaces = [value, options]; }
    setContentProtection(value) { this.protected = value; }
    loadFile(file) { this.file = file; return Promise.resolve(); }
    isDestroyed() { return this.destroyed; }
    showInactive() { this.visible = true; }
    getBounds() { return this.bounds; }
    setBounds(bounds) { this.bounds = bounds; }
    destroy() { this.destroyed = true; this.visible = false; this.emit('closed'); }
  }
  const border = createShareBorder({ BrowserWindow: Window, screen });
  return { border, windows, screen, setDisplays: value => { displays = value; } };
}

test('只有已共享的屏幕有细框；捕获回执或改变选项本身不亮框', () => {
  const f = fixture();
  f.border.captured('2');
  assert.equal(f.border.source(), '2');
  assert.equal(f.windows.length, 0);
  assert.equal(f.border.show(['2']), true);
  const w = f.windows[0];
  assert.deepEqual(w.bounds, { x: -1280, y: -200, width: 1280, height: 1024 });
  assert.equal(w.visible, false);
  w.emit('ready-to-show');
  assert.equal(w.visible, true);
  assert.equal(f.windows.length, 1, '没有误框主屏或所有屏幕');
  assert.equal(w.ignore, true);
  assert.equal(w.options.focusable, false);
  assert.equal(w.options.skipTaskbar, true);
  assert.equal(w.options.transparent, true);
  assert.deepEqual(w.options.webPreferences, { contextIsolation: true, nodeIntegration: false, sandbox: true });
  assert.equal(w.protected, true, '提示层排除出 Windows 采集');
  assert.deepEqual(w.top, [true, 'screen-saver']);
  assert.deepEqual(w.open(), { action: 'deny' });
  let blocked = false;
  w.webContents.emit('will-navigate', { preventDefault() { blocked = true; } });
  assert.equal(blocked, true);
  assert.match(w.file, /share-border\.html$/);
  f.border.captured('1'); // 换屏尚未发布 / 发布失败
  assert.equal(w.visible, true);
  assert.equal(f.windows.length, 1);
  f.border.show(['1']);
  assert.equal(w.destroyed, true);
  assert.equal(f.windows[1].bounds.x, 0);
  f.border.destroy();
});

test('多个发布共用一个显示器框；停止其中一条不能消掉其他仍在分享的屏幕', () => {
  const f = fixture();
  f.border.captured('1'); f.border.captured('2');
  f.border.show(['1', '1', '2']);
  assert.equal(f.windows.length, 2);
  f.border.show(['2']);
  assert.equal(f.windows[0].destroyed, true);
  assert.equal(f.windows[1].destroyed, false);
  f.border.show([]);
  assert.equal(f.windows[1].destroyed, true);
  f.border.destroy();
});

test('缩放、分辨率和屏幕插拔跟随 bounds；断开的屏幕不挪到主屏冒充', () => {
  const f = fixture();
  f.border.captured('2'); f.border.show(['2']);
  const w = f.windows[0];
  const bounds = { x: -1600, y: 100, width: 1600, height: 900 };
  f.setDisplays([{ id: 2, bounds }]);
  f.screen.emit('display-metrics-changed');
  assert.deepEqual(w.bounds, bounds);
  f.setDisplays([{ id: 1, bounds }]);
  f.screen.emit('display-removed');
  assert.equal(w.destroyed, true);
  assert.equal(f.windows.length, 1);
  f.border.destroy();
  assert.equal(f.screen.listenerCount('display-metrics-changed'), 0);
});

test('退出/重载时连未加载完的框也收掉，迟到回调不能重开', () => {
  const f = fixture();
  for (const finish of ['reset', 'destroy']) {
    f.border.captured('1'); f.border.show(['1']);
    const w = f.windows.at(-1);
    f.border[finish]();
    w.emit('ready-to-show');
    assert.equal(w.visible, false);
    assert.equal(w.destroyed, true);
    assert.equal(f.border.source(), '');
    assert.equal(f.border.show(['1']), false);
  }
});

test('原生端拒绝任意显示器、畸形载荷；preload 只放行字符串列表', async () => {
  const f = fixture();
  for (const ids of [null, true, '1', ['other'], [1], Array(33).fill('1')])
    assert.equal(f.border.show(ids), false);
  const sent = [], api = {};
  vm.runInNewContext(fs.readFileSync(require.resolve('../desktop-preload.cjs'), 'utf8'), {
    window: { addEventListener() {} },
    require: () => ({ contextBridge: { exposeInMainWorld: (name, value) => { api[name] = value; } },
      ipcRenderer: { invoke: async (channel, payload) => { sent.push([channel, payload]); return true; } } }),
  });
  await api.officeDesktop.screenShareIndicator.source();
  await api.officeDesktop.screenShareIndicator.show(['2']);
  await api.officeDesktop.screenShareIndicator.show([2]);
  assert.equal(sent[0][0], 'office:captured-display');
  assert.equal(sent[1][0], 'office:sharing-displays');
  assert.deepEqual(Array.from(sent[1][1]), ['2']);
  assert.equal(sent[2][1], null);
  f.border.destroy();
});

test('源码接线覆盖采集来源、重载、崩溃、关闭、退出；打包包含静态边框资源', () => {
  const main = fs.readFileSync(require.resolve('../main.cjs'), 'utf8');
  assert.match(main, /onDisplayChosen:[\s\S]*?shareBorder\.captured\(displayId\)/);
  assert.match(main, /did-start-navigation[\s\S]*?shareBorder\.reset\(\)/);
  for (const event of ['render-process-gone', 'closed', 'before-quit', 'session-end'])
    assert.match(main, new RegExp(`'${event}'[^\\n]*shareBorder\\.(reset|destroy)\\(`));
  const files = require('../package.json').build.files;
  assert.ok(files.includes('*.cjs'));
  assert.ok(files.includes('share-border.html'));
  assert.ok(files.includes('share-border.css'));
});
