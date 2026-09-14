const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const policy = require('../policy.cjs');

function fixture() {
  const handlers = {}, files = new Map(), calls = [], sent = [], toasts = [], timers = new Map();
  let timerSeq = 0;
  // Native toasts are raised by the main process; the mock keeps them inspectable.
  class FakeNotification {
    static isSupported() { return true; }
    constructor(options) { this.options = options; this.listeners = {}; toasts.push(this); }
    on(event, fn) { (this.listeners[event] ||= []).push(fn); return this; }
    show() { this.shown = true; }
    click() { for (const fn of this.listeners.click || []) fn(); }
  }
  const frame = { url: policy.OFFICE_URL }, wc = { mainFrame: frame, scripts: [],
    send: (channel, payload) => sent.push({ channel, payload }),
    isDestroyed: () => false,
    executeJavaScript(script) { this.scripts.push(script); return Promise.resolve(true); } };
  const event = { sender: wc, senderFrame: frame };
  const state = { displays: ['11', '22'], encrypted: true };
  const thumbnail = id => ({
    isEmpty: () => false, getSize: () => ({ width: 1920, height: 1080 }),
    resize: size => ({ toJPEG: quality => {
      calls.push({ id, size, quality }); return Buffer.from(id);
    } }),
  });
  const electron = {
    Notification: FakeNotification,
    app: { getPath: () => 'test-profile' },
    ipcMain: { handle: (name, fn) => { handlers[name] = fn; } },
    screen: { getAllDisplays: () => state.displays.map(id => ({ id, size: { width: 1920, height: 1080 } })),
      getPrimaryDisplay: () => ({ id: '11' }) },
    desktopCapturer: { getSources: async options => {
      assert.deepEqual(Array.from(options.types), ['screen']);
      assert.equal(options.thumbnailSize.width, 480);
      return state.displays.map(id => ({ id: 'screen:' + id, display_id: id, thumbnail: thumbnail(id) }));
    } },
    safeStorage: {
      isEncryptionAvailable: () => state.encrypted,
      encryptString: value => 'encrypted:' + value,
      decryptString: value => value.slice(10),
    },
  };
  const context = { module: { exports: {} },
    setTimeout: (fn, ms) => { const id = ++timerSeq; timers.set(id, { fn, ms }); return id; },
    clearTimeout: id => timers.delete(id),
    require(name) {
    if (name === 'electron') return electron;
    if (name === './policy.cjs') return policy;
    if (name === './fullscreen.cjs') return require('../fullscreen.cjs');
    if (name === 'node:path') return require(name);
    if (name === 'node:fs') return {
      readFileSync: file => { if (!files.has(file)) throw Error('Missing'); return files.get(file); },
      writeFileSync: (file, value) => files.set(file, value), rmSync: file => files.delete(file),
    };
    throw Error(name);
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../desktop-bridge.cjs'), 'utf8'), context);
  // The real display store (in a scratch file, so runs cannot see each other),
  // which also covers the shared preview/share display selection.
  const { createDisplayStore } = require('../display-store.cjs');
  const displayFile = path.join(os.tmpdir(), `office-bridge-display-${process.pid}-${Math.random().toString(36).slice(2)}.json`);
  const displays = createDisplayStore(displayFile);
  // Full-screen state lives on the window, the way Electron exposes it.
  const win = { webContents: wc, fullscreen: false, visible: true, focused: true, minimized: false,
    raised: 0, flashed: undefined, onTop: [],
    setFullScreen(value) { this.fullscreen = value; }, isFullScreen() { return this.fullscreen; },
    isDestroyed() { return false; }, isMinimized() { return this.minimized; },
    isVisible() { return this.visible; }, isFocused() { return this.focused; },
    show() { this.visible = true; this.raised++; }, moveTop() { this.raised++; },
    focus() { this.focused = true; this.raised++; },
    flashFrame(value) { this.flashed = value; },
    setAlwaysOnTop(value) { this.onTop.push(value); } };
  context.module.exports.installDesktopBridge(() => win, { displays });
  return { call: (name, ...args) => handlers['office:' + name](event, ...args),
    event, state, files, calls, handlers, wc, displays, displayFile, win, sent, toasts, timers };
}

test('自动低清只枚举屏幕、维持比例，双屏切换与断开回退', async () => {
  const f = fixture();
  assert.equal((await f.call('displays')).length, 2);
  await f.call('preview-frame');
  assert.equal(f.calls.at(-1).id, '11');
  assert.equal(f.calls.at(-1).size.width, 480);
  assert.equal(f.calls.at(-1).size.height, 270);
  await f.call('display-select', '22');
  await f.call('preview-frame');
  assert.equal(f.calls.at(-1).id, '22');
  f.state.displays = ['11'];
  await f.call('preview-frame');
  assert.equal(f.calls.at(-1).id, '11');
  await assert.rejects(f.call('display-select', 'missing'));
});

test('仅可信主窗口调用；登录信息加密保存、删除，不可加密时不落盘', async () => {
  const f = fixture();
  assert.throws(() => f.handlers['office:login-read']({ sender: f.wc, senderFrame: { url: policy.OFFICE_URL } }));
  f.event.senderFrame.url = 'https://example.com';
  assert.throws(() => f.call('preview-frame'));
  f.event.senderFrame.url = policy.OFFICE_URL;
  assert.equal(f.call('login-save', { name: '测试', password: '1' }), true);
  assert.ok([...f.files.values()].every(value => value.startsWith('encrypted:')));
  assert.equal(f.call('login-read').password, '1');
  f.call('login-clear');
  assert.equal(f.call('login-read'), null);
  f.state.encrypted = false;
  assert.equal(f.call('login-save', { name: '测试', password: '1' }), false);
  assert.equal(f.files.size, 0);
});

test('全屏走窗口原生能力，因为 DOM 全屏与它的事件在这个窗口里都不可靠', () => {
  const f = fixture();
  assert.equal(f.call('fullscreen', true), true, '返回请求的状态，不能依赖 isFullScreen 的即时值');
  assert.equal(f.win.isFullScreen(), true, '要求全屏时窗口必须真的进入全屏');
  assert.ok(f.wc.scripts.some((script) => script.includes("'iruler-fullscreen', true")), '必须给页面加上全屏类');
  assert.deepEqual(f.sent.at(-1), { channel: 'office:fullscreen-changed', payload: true },
    '必须主动通知渲染进程，因为 enter-full-screen 事件不触发');
  assert.equal(f.call('fullscreen', false), false);
  assert.equal(f.win.isFullScreen(), false);
  assert.deepEqual(f.sent.at(-1), { channel: 'office:fullscreen-changed', payload: false });
  // 非布尔输入按"关"处理，且仍然只信任主窗口。
  f.call('fullscreen', 'nonsense');
  assert.equal(f.win.isFullScreen(), false);
  f.event.senderFrame.url = 'https://example.com';
  assert.throws(() => f.call('fullscreen', true), /Untrusted/);
  assert.equal(f.win.isFullScreen(), false);
});

test('网络错误页的finish不取消重试，恢复成功/关窗清理计时', () => {
  const timers = new Map(); let sequence = 0;
  const context = { module: { exports: {} }, require: () => policy,
    setTimeout: (fn, ms) => { timers.set(++sequence, { fn, ms }); return sequence; },
    clearTimeout: id => timers.delete(id) };
  vm.runInNewContext(fs.readFileSync(require.resolve('../reconnect.cjs'), 'utf8'), context);
  const win = new EventEmitter(), wc = new EventEmitter();
  win.webContents = wc; win.setTitle = () => {}; win.isDestroyed = () => false;
  let loaded = 0; wc.loadURL = async () => { loaded++; };
  context.module.exports.reconnect(win);
  wc.emit('did-fail-load', {}, -105, 'DNS', policy.OFFICE_URL, true);
  wc.emit('did-finish-load');
  assert.equal(timers.size, 1);
  assert.equal([...timers.values()][0].ms, 5000);
  [...timers.values()][0].fn();
  assert.equal(loaded, 1);
  wc.emit('did-start-navigation', {}, policy.OFFICE_URL, false, true);
  wc.emit('did-finish-load');
  assert.equal(timers.size, 0);
  wc.emit('did-navigate', {}, policy.OFFICE_URL, 503);
  assert.equal(timers.size, 1);
  win.emit('closed');
  assert.equal(timers.size, 0);
});

test('来电与会议走主进程原生弹窗并抢到前台，普通聊天只弹通知不抢焦点', () => {
  const f = fixture();
  // A ring-type event: native toast, real window raise, taskbar flash.
  assert.equal(f.call('alert', { title: '张三 邀请你通话', body: '语音来电', section: 'call', urgent: true }), true);
  assert.equal(f.toasts.length, 1);
  assert.equal(f.toasts[0].shown, true);
  assert.equal(f.toasts[0].options.body, '语音来电');
  assert.equal(f.toasts[0].options.silent, true);
  assert.equal(f.win.raised, 3, '紧急事件必须真的显示、置顶并聚焦窗口');
  assert.equal(f.win.flashed, true);
  assert.deepEqual(f.win.onTop, [true], '先置顶，等脉冲结束再放开');
  for (const { fn } of [...f.timers.values()]) fn();
  assert.deepEqual(f.win.onTop, [true, false], '松开置顶后恢复正常层叠');
  // A plain chat alert keeps the toast and only flashes an unfocused window.
  f.win.focused = false;
  f.call('alert', { title: '李四 发来消息', body: '在吗', section: 'chat' });
  assert.equal(f.toasts.length, 2);
  assert.equal(f.win.flashed, true);
  assert.equal(f.win.raised, 3, '普通消息不得抢窗口');
  assert.deepEqual(f.win.onTop, [true, false]);
  // The toast click is what raises the window and names the section to open.
  f.toasts[0].click();
  assert.deepEqual(f.sent, [{ channel: 'office:alert-open', payload: 'call' }]);
  assert.equal(f.win.raised, 6);
  // Only the trusted main frame may raise an alert.
  f.event.senderFrame.url = 'https://example.com';
  assert.throws(() => f.call('alert', { title: 'x' }), /Untrusted/);
  f.event.senderFrame.url = policy.OFFICE_URL;
  assert.equal(f.call('alert', null), true);
  assert.equal(f.toasts.length, 3);
});
