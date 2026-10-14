// 任务栏头像条小窗的测试替身：假的 BrowserWindow + 一个建好的 dock。
//
// 从 `dock-window.test.cjs` 抽出来的（那个文件 2026-10-14 到 528 行、超了 500 行上限）。
// 两个测试文件共用它：
//   * `dock-window.test.cjs` —— 建窗参数、贴任务栏、收放、转发消息、加载重试；
//   * `dock-hide-reasons.test.cjs` —— 什么时候藏、什么时候显示（四个互相独立的理由）。
//
// **这不是测试文件**（加载器只跑 `test/*.test.cjs`），所以可以放共用代码。
const { createDockWindow } = require('../dock-window.cjs');
const { STRIP_HEIGHT, CARD_SPACE } = require('../taskbar-position.cjs');

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
      on: (event, fn) => { (self.listeners['wc:' + event] ||= []).push(fn); },
      setWindowOpenHandler: fn => { self.windowOpenHandler = fn; },
      send: (channel, payload) => self.sent.push({ channel, payload }),
      isDestroyed: () => self.destroyed,
      emit: (event, ...args) => { for (const fn of self.listeners['wc:' + event] || []) fn(...args); },
    };
  }
  isDestroyed() { return this.destroyed; }
  isVisible() { return this.visible && !this.destroyed; }
  showInactive() { this.visible = true; }
  hide() { this.visible = false; }
  setAlwaysOnTop(value, level) { this.alwaysOnTop.push([value, level]); }
  moveTop() { this.raised = (this.raised || 0) + 1; }
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

function harness({ display, saved = {}, tray, anchor, loadRetryMs, systemHidden, followMs, zOrder } = {}) {
  const state = {
    display: display || { bounds: { x: 0, y: 0, width: 1920, height: 1080 },
      workArea: { x: 0, y: 0, width: 1920, height: 1032 } },
    saved: { ...saved },
  };
  const windows = [];
  const decisions = [];
  const dock = createDockWindow({
    electron: {},
    BrowserWindow: class extends FakeWindow { constructor(options) { super(options); windows.push(this); } },
    screen: { getPrimaryDisplay: () => state.display },
    session: { fromPartition: name => ({ name }) },
    preload: 'preload.cjs',
    url: 'https://115.159.43.237/dock.html',
    size: { width: 400, height: STRIP_HEIGHT + CARD_SPACE },
    store: { read: () => state.saved, write: value => { state.saved = value; },
      decide: value => decisions.push(value) },
    tray,
    // Win11 用 'left'（条子贴屏幕最左端），Win10 用 'tray'。
    ...(anchor ? { anchor } : {}),
    ...(loadRetryMs ? { loadRetryMs } : {}),
    ...(systemHidden ? { systemHidden } : {}),
    ...(followMs ? { followMs } : {}),
    zOrder: zOrder || { start() {}, sync: () => false, watching: () => false,
      diagnostics: () => ({}), stop() {} },
  });
  return { dock, state, windows, decisions, window: () => windows[0] };
}

/** 让 ensure() 里那次异步探测落地。 */
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

module.exports = { FakeWindow, harness, settle };
