// The sharer's annotation layer must cover the shared display, let the mouse
// through, stay on top, and stay out of the screen capture. These are easy to get
// wrong silently, so each property is asserted against a fake Electron.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const DISPLAYS = [
  { id: 1, bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
  { id: 2, bounds: { x: 1920, y: 0, width: 2560, height: 1440 } },
];

function load({ displays = DISPLAYS } = {}) {
  const created = [];
  const boundsCalls = [];
  class FakeWindow {
    constructor(options) { this.options = options; this.calls = []; this.hidden = false; created.push(this);
      this.webContents = {
        id: created.length, sent: [], destroyed: false,
        setWindowOpenHandler(fn) { this.openHandler = fn; },
        on() {}, send(channel, payload) { this.sent.push({ channel, payload }); },
      }; }
    setAlwaysOnTop(...args) { this.calls.push(['setAlwaysOnTop', ...args]); }
    setIgnoreMouseEvents(...args) { this.calls.push(['setIgnoreMouseEvents', ...args]); }
    setContentProtection(value) { this.calls.push(['setContentProtection', value]); }
    setVisibleOnAllWorkspaces(...args) { this.calls.push(['setVisibleOnAllWorkspaces', ...args]); }
    setBounds(value) { boundsCalls.push(value); this.bounds = value; }
    showInactive() { this.hidden = false; }
    hide() { this.hidden = true; }
    loadFile(file) { this.loaded = file; return Promise.resolve(); }
    isDestroyed() { return false; }
    on(event, fn) { if (event === 'closed') this.onClosed = fn; }
  }
  const context = {
    module: { exports: {} },
    // CJS modules get these for free; the vm sandbox has to be told.
    __dirname: require('node:path').join(__dirname, '..'),
    __filename: require.resolve('../annotation-overlay.cjs'),
    require(name) {
      if (name === 'electron') return { BrowserWindow: FakeWindow, screen: { getAllDisplays: () => displays } };
      if (name === 'node:path') return require('node:path');
      if (name === 'node:url') return require('node:url');
      throw Error('Unexpected dependency: ' + name);
    },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../annotation-overlay.cjs'), 'utf8'), context);
  const layer = context.module.exports.createAnnotationLayer();
  // Test-only view of what the fake Electron saw.
  layer.created = created;
  layer.boundsCalls = boundsCalls;
  return layer;
}

test('覆盖被共享的那台显示器，而不是主屏', () => {
  const layer = load();
  layer.open('2');
  assert.equal(layer.created.length, 1);
  const window = layer.created[0];
  assert.equal(window.options.x, 1920);
  assert.equal(window.options.width, 2560);
  assert.equal(window.options.transparent, true);
  assert.equal(window.options.frame, false);
  assert.equal(window.options.focusable, false, '不能抢走分享者的输入焦点');
  assert.equal(window.options.skipTaskbar, true);
  assert.equal(window.options.resizable, false);
  assert.equal(window.options.enableLargerThanScreen, true);
  assert.equal(layer.displayId(), '2');
  assert.equal(layer.isVisible(), true);
});

test('鼠标穿透、置顶层级、排除采集三项都设上了', () => {
  const layer = load();
  layer.open('1');
  const calls = layer.created[0].calls;
  // Field-by-field: objects built inside the vm sandbox have a different prototype.
  const ignore = calls.find(([name]) => name === 'setIgnoreMouseEvents');
  assert.equal(ignore[1], true);
  assert.equal(ignore[2].forward, true, '必须让点击穿透到下面的应用');
  assert.deepEqual(calls.find(([name]) => name === 'setAlwaysOnTop'), ['setAlwaysOnTop', true, 'screen-saver']);
  assert.deepEqual(calls.find(([name]) => name === 'setContentProtection'), ['setContentProtection', true]);
  const workspaces = calls.find(([name]) => name === 'setVisibleOnAllWorkspaces');
  assert.equal(workspaces[1], true);
  assert.equal(workspaces[2].visibleOnFullScreen, true);
  assert.equal(layer.created[0].hidden, false, '打开后应显示但不抢焦点');
});

test('换一台共享屏幕时移动同一个窗口，不叠加第二个', () => {
  const layer = load();
  layer.open('1');
  layer.open('2');
  assert.equal(layer.created.length, 1, '不应创建第二个悬浮窗');
  const moved = layer.boundsCalls.at(-1);
  assert.equal(moved.x, 1920);
  assert.equal(moved.width, 2560);
  assert.equal(moved.height, 1440);
});

test('笔画按通道推给悬浮层，关闭只是隐藏', () => {
  const layer = load();
  layer.open('1');
  layer.push({ type: 'annotate', id: 's1', stroke: 'k1', points: [[0.1, 0.2]] });
  const sent = layer.created[0].webContents.sent;
  assert.equal(sent.length, 1);
  assert.equal(sent[0].channel, 'office:annotation-strokes');
  assert.equal(sent[0].payload.stroke, 'k1');
  layer.close();
  assert.equal(layer.created[0].hidden, true);
  assert.equal(layer.isVisible(), false);
});

test('显示器 id 未知或列表为空时不崩，退回第一台/默认分辨率', () => {
  const fallback = load();
  fallback.open('missing');
  assert.equal(fallback.created[0].options.width, 1920, '未知 id 应退回第一台显示器');
  const empty = load({ displays: [] });
  empty.open('1');
  assert.equal(empty.created[0].options.width, 1280);
  assert.equal(empty.created[0].options.height, 720);
  const bounds = empty.bounds();
  assert.equal(bounds.width, 1280);
  assert.equal(bounds.height, 720);
  assert.equal(bounds.x, 0);
  assert.equal(bounds.y, 0);
});
