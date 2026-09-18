// 任务栏头像条那个小窗：建窗参数、贴任务栏、跟着任务栏藏、拖动记忆、转发消息。
// （用户 2026-09-17：贴任务栏、永远置顶、无边框、紧贴右侧托盘左边。）
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createDockWindow } = require('../dock-window.cjs');
const { TRAY_RESERVE, STRIP_HEIGHT, CARD_SPACE, CARD_WIDTH } = require('../taskbar-position.cjs');
/** 窗口高度：头像条 + 悬停卡片的空间。 */
const WINDOW_HEIGHT = STRIP_HEIGHT + CARD_SPACE;

class FakeWindow {
  constructor(options) {
    this.options = options;
    this.bounds = { x: options.x || 0, y: options.y || 0, width: options.width, height: options.height };
    this.created = true;
    this.visible = false;
    this.destroyed = false;
    this.alwaysOnTop = [];
    this.sent = [];
    this.listeners = {};
    this.url = '';
    const self = this;
    this.webContents = {
      once: (event, fn) => { (self.listeners['wc:' + event] ||= []).push(fn); },
      on: () => {},
      setWindowOpenHandler: fn => { self.windowOpenHandler = fn; },
      send: (channel, payload) => self.sent.push({ channel, payload }),
      isDestroyed: () => self.destroyed,
    };
  }
  isDestroyed() { return this.destroyed; }
  isVisible() { return this.visible && !this.destroyed; }
  showInactive() { this.visible = true; }
  hide() { this.visible = false; }
  setAlwaysOnTop(value, level) { this.alwaysOnTop.push([value, level]); }
  setIgnoreMouseEvents(value, options) { this.ignored = { value, options }; }
  setVisibleOnAllWorkspaces() {}
  getBounds() { return { ...this.bounds }; }
  setBounds(next) { this.bounds = { ...next }; }
  loadURL(url) { this.url = url; return Promise.resolve(); }
  destroy() { this.destroyed = true; this.visible = false; }
  on(event, fn) { (this.listeners[event] ||= []).push(fn); }
  once(event, fn) { (this.listeners[event] ||= []).push(fn); }
  emit(event, ...args) { for (const fn of this.listeners[event] || []) fn(...args); }
}

function harness({ display, saved = {} } = {}) {
  const state = {
    display: display || { bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      workArea: { x: 0, y: 0, width: 1920, height: 1032 } },
    saved: { ...saved },
  };
  const windows = [];
  const dock = createDockWindow({
    electron: {},
    BrowserWindow: class extends FakeWindow { constructor(options) { super(options); windows.push(this); } },
    screen: { getPrimaryDisplay: () => state.display },
    session: { fromPartition: name => ({ name }) },
    preload: 'preload.cjs',
    url: 'https://115.159.43.237/dock.html',
    size: { width: 400, height: STRIP_HEIGHT + CARD_SPACE },
    store: { read: () => state.saved, write: value => { state.saved = value; } },
  });
  return { dock, state, windows, window: () => windows[0] };
}

test('建窗：无边框透明、不进任务栏、不抢焦点、贴任务栏同级置顶、用主窗口同一个会话', () => {
  const h = harness();
  h.dock.ensure();
  const win = h.window();
  assert.equal(win.options.frame, false);
  assert.equal(win.options.transparent, true);
  assert.equal(win.options.skipTaskbar, true);
  assert.equal(win.options.focusable, false, '点它不该抢走办公室窗口的焦点');
  assert.equal(win.options.resizable, false);
  assert.equal(win.options.webPreferences.session.name, 'persist:office-world', '和主窗口同会话，证书例外一致');
  assert.equal(win.options.webPreferences.preload, 'preload.cjs');
  assert.equal(win.options.webPreferences.contextIsolation, true);
  assert.deepEqual(win.alwaysOnTop, [[true, 'screen-saver']], '任务栏最顶层，必须同级才压得住');
  assert.match(win.url, /dock\.html$/);
});

test('位置：默认紧贴任务栏右侧托盘左边，头像条在任务栏里竖直居中', () => {
  const h = harness();
  h.dock.ensure();
  const win = h.window();
  h.dock.place();
  assert.equal(win.bounds.width, 400);
  assert.equal(win.bounds.height, WINDOW_HEIGHT, '窗口比头像条高，多出来的是卡片空间');
  assert.equal(win.bounds.x, 1920 - TRAY_RESERVE - 400);
  // 头像条在 48px 任务栏里竖直居中（(48-44)/2 = 2），窗口下边缘与它对齐。
  assert.equal(win.bounds.y, 1080 - 48 + 2 + STRIP_HEIGHT - WINDOW_HEIGHT);
  assert.equal(h.dock.edge(), 'bottom');
  assert.equal(win.isVisible(), true);
});

test('任务栏自动隐藏时我们也藏：不能让任务栏弹不出来', () => {
  const full = { bounds: { x: 0, y: 0, width: 1920, height: 1080 },
    workArea: { x: 0, y: 0, width: 1920, height: 1080 } };
  const h = harness({ display: full });
  h.dock.ensure();
  h.dock.place();
  assert.equal(h.window().isVisible(), false);
});

test('任务栏换边/换屏/改高度都会重新贴上去', () => {
  const h = harness();
  h.dock.ensure();
  h.state.display = { bounds: { x: 1920, y: 0, width: 2560, height: 1440 },
    workArea: { x: 1920, y: 0, width: 2560, height: 1392 } };
  h.dock.place();
  assert.equal(h.window().bounds.x, 1920 + 2560 - TRAY_RESERVE - 400, '副屏的坐标带原点');
  assert.equal(h.window().bounds.y, 1440 - 48 + 2 + STRIP_HEIGHT - WINDOW_HEIGHT);
});

test('应用层要求隐藏（共享屏幕/全屏）就藏，要求显示就回来', () => {
  const h = harness();
  h.dock.ensure();
  h.dock.setVisible(false, 'sharing');
  assert.equal(h.window().isVisible(), false);
  assert.equal(h.dock.reason(), 'sharing');
  h.dock.setVisible(true);
  assert.equal(h.window().isVisible(), true);
});

test('拖动后记住偏移，下次仍然贴在那个位置', async () => {
  const h = harness();
  h.dock.ensure();
  const base = { x: 1920 - TRAY_RESERVE - 400, y: 1080 - 48 + 2 + STRIP_HEIGHT - WINDOW_HEIGHT };
  h.window().setBounds({ x: 1000, y: 900, width: 400, height: WINDOW_HEIGHT });
  // 直接记一次：算的就是"相对默认贴法"的偏移。
  h.dock.remember();
  const moved = h.state.saved.dx;
  assert.equal(moved, 1000 - base.x);
  assert.equal(h.state.saved.dy, 900 - base.y);
  h.dock.place();
  assert.equal(h.window().bounds.x, base.x + moved, '下次仍然贴在那个位置');
  // 窗口自己发 moved 也会记（防抖 300ms）。
  h.state.saved = {};
  h.window().setBounds({ x: 700, y: 900, width: 400, height: WINDOW_HEIGHT });
  h.window().emit('moved');
  await new Promise(resolve => setTimeout(resolve, 400));
  assert.equal(h.state.saved.dx, 700 - base.x, 'moved 事件也要把位置记下来');
});

test('转发消息给小窗；窗口没建好时不报错', () => {
  const h = harness();
  assert.equal(h.dock.send('office:dock-state', { people: [] }), false, '还没建窗就是 false');
  h.dock.ensure();
  assert.equal(h.dock.send('office:dock-state', { people: [{ id: 'a' }] }), true);
  assert.deepEqual(h.window().sent.at(-1), { channel: 'office:dock-state', payload: { people: [{ id: 'a' }] } });
});

test('透明区不抢任务栏的点击：默认穿透，指针到了头像条上才接管', () => {
  const h = harness();
  h.dock.ensure();
  assert.deepEqual(h.window().ignored, { value: true, options: { forward: true } },
    '窗口比头像条大，默认必须让点击透过去');
  h.dock.setInteractive(true);
  assert.deepEqual(h.window().ignored, { value: false, options: { forward: true } });
  assert.equal(h.dock.interactive(), true);
  h.dock.setInteractive(false);
  assert.deepEqual(h.window().ignored, { value: true, options: { forward: true } });
  assert.equal(h.dock.interactive(), false);
});

test('宽度跟着人数走：人少就不占任务栏', () => {
  const h = harness();
  h.dock.ensure();
  const three = h.dock.resize(3);
  const one = h.dock.resize(1);
  const many = h.dock.resize(30);
  assert.ok(one < three, '一个人比三个人窄');
  assert.ok(three < many, '人多就宽');
  assert.equal(many, 560, '再多人也不会无限宽');
  assert.ok(one >= 140);
  h.dock.resize(2);
  assert.equal(h.window().bounds.width, Math.max(h.dock.width(), CARD_WIDTH),
    '窗口至少和悬停卡片一样宽（否则卡片会被裁掉）');
});

test('销毁后不再跟随，也不留定时器', () => {
  const h = harness();
  h.dock.ensure();
  const win = h.window();
  h.dock.destroy();
  assert.equal(win.isDestroyed(), true);
  assert.equal(h.dock.window(), undefined);
  assert.equal(h.dock.send('x', 1), false);
});
