// 「有人来看我了」的绿光层（用户 2026-09-18）：
// 每块屏幕一个透明、点不动、永远置顶的窗口；闪一下，最后一次信号之后自动收掉。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPreviewGlow, GLOW_MS } = require('../preview-glow.cjs');

class FakeWindow {
  constructor(options) {
    this.options = options;
    this.bounds = { x: options.x || 0, y: options.y || 0, width: options.width, height: options.height };
    this.destroyed = false;
    this.shown = 0;
    this.hidden = 0;
    this.visible = false;
    this.alwaysOnTop = [];
    this.ignored = [];
    this.sent = [];
    this.loaded = '';
    this.loadFile = file => { this.loaded = file; return Promise.resolve(); };
    const self = this;
    this.webContents = {
      send: (channel, payload) => self.sent.push({ channel, payload }),
      on: () => {}, once: () => {},
      setWindowOpenHandler: () => {},
    };
  }
  isDestroyed() { return this.destroyed; }
  on() {}
  once() {}
  isVisible() { return this.visible; }
  showInactive() { this.visible = true; this.shown++; }
  hide() { this.visible = false; this.hidden++; }
  setAlwaysOnTop(value, level) { this.alwaysOnTop.push([value, level]); }
  setIgnoreMouseEvents(value, options) { this.ignored.push([value, options]); }
  setVisibleOnAllWorkspaces() {}
  getBounds() { return { ...this.bounds }; }
  setBounds(next) { this.bounds = { ...next }; }
  destroy() { this.destroyed = true; this.visible = false; }
}

function harness({ displays, glowMs = 40 } = {}) {
  const screens = displays || [
    { id: 1, bounds: { x: 0, y: 0, width: 1920, height: 1080 } },
    { id: 2, bounds: { x: 1920, y: 0, width: 1280, height: 720 } },
  ];
  let state = screens;
  const windows = [];
  const glow = createPreviewGlow({
    BrowserWindow: class extends FakeWindow { constructor(options) { super(options); windows.push(this); } },
    screen: { getAllDisplays: () => state, getPrimaryDisplay: () => state[0] },
    preload: 'glow-preload.cjs',
    glowMs,
  });
  return { glow, windows, setDisplays: next => { state = next; },
    windowFor: id => windows.find(w => w.bounds.x === screens.find(d => d.id === id).bounds.x) };
}

test('每块屏幕一个光晕：透明、点不动、永远置顶、不抢焦点、不进任务栏', () => {
  const h = harness();
  assert.equal(h.glow.flash(), 2, '两块屏幕就该有两个光晕');
  for (const win of h.windows) {
    assert.equal(win.options.transparent, true);
    assert.equal(win.options.frame, false);
    assert.equal(win.options.focusable, false, '别抢焦点');
    assert.equal(win.options.skipTaskbar, true);
    assert.equal(win.options.hasShadow, false);
    assert.deepEqual(win.alwaysOnTop, [[true, 'screen-saver']], '要压得住全屏应用');
    assert.deepEqual(win.ignored, [[true, undefined]], '整窗穿透，鼠标点得到下面的东西');
    assert.match(win.loaded, /preview-glow\.html$/);
    assert.equal(win.isVisible(), true);
  }
  // 铺满整块屏幕，坐标带着屏幕原点（副屏不是从 0,0 开始）。
  assert.deepEqual(h.windows.map(w => w.bounds), [
    { x: 0, y: 0, width: 1920, height: 1080 },
    { x: 1920, y: 0, width: 1280, height: 720 },
  ]);
});

test('闪一下：页面收到 flash；最后一次信号之后自动收掉', async () => {
  const h = harness({ glowMs: 30 });
  h.glow.flash();
  assert.equal(h.windows[0].sent.at(-1).channel, 'office:preview-glow');
  assert.equal(h.glow.isVisible(), true);
  await new Promise(resolve => setTimeout(resolve, 80));
  assert.equal(h.glow.isVisible(), false, '没人再看就收掉');
  assert.equal(h.windows[0].hidden >= 1, true);
  assert.equal(GLOW_MS, 4300, '默认亮 4.3 秒（要长于页面里的 3.6s 保持 + 0.5s 淡出）');
});

test('亮起来的快慢由调用方给（悬停慢慢亮 2 秒，打电话过来立刻亮）', () => {
  const h = harness({ glowMs: 400 });
  h.glow.flash({ fade: 2000 });
  assert.equal(h.windows[0].sent.at(-1).payload.fade, 2000, '页面据此决定过渡时长');
  h.glow.flash({ fade: 150 });
  assert.equal(h.windows[0].sent.at(-1).payload.fade, 150);
  h.glow.flash();
  assert.equal(h.windows[0].sent.at(-1).payload.fade, 0, '不给时长就立刻亮（托盘里的测试菜单）');
  h.glow.flash({ fade: -5 });
  assert.equal(h.windows[0].sent.at(-1).payload.fade, 0, '负数当立刻');
  h.glow.flash({ fade: 999999 });
  assert.equal(h.windows[0].sent.at(-1).payload.fade, 10000, '荒唐的时长要夹住（别让页面卡在半亮）');
  assert.ok(h.windows[0].sent.every(row => Number.isFinite(row.payload.at) && row.payload.at > 0),
    '每次都带一个时间戳，页面据此重排计时器');
  h.glow.destroy();
});

test('"从头亮一次"由主进程说了算（窗口刚才是藏着的才算）', () => {
  // 窗口一藏起来，页面里的计时器就被节流/冻住，淡出可能根本没跑；页面自己记的"我还亮着"
  // 是错的——所以这个判断必须在主进程做，否则第二次悬停还是"啪一下就亮"（2026-09-20 实测）。
  const h = harness({ glowMs: 400 });
  h.glow.flash({ fade: 2000 });
  assert.equal(h.windows[0].sent.at(-1).payload.restart, true, '第一次亮：窗口刚建出来，要从透明开始');
  h.glow.flash({ fade: 2000 });
  assert.equal(h.windows[0].sent.at(-1).payload.restart, false, '还亮着（悬停心跳）：别重置成透明，会闪');
  h.glow.hide();
  h.glow.flash({ fade: 2000 });
  assert.equal(h.windows[0].sent.at(-1).payload.restart, true, '收掉之后再亮，必须重新淡入');
  h.glow.destroy();
});

test('一直有人看就一直亮：后续 flash 不会叠出更多窗口', async () => {
  const h = harness({ glowMs: 60 });
  h.glow.flash();
  const windows = h.windows.length;
  await new Promise(resolve => setTimeout(resolve, 30));
  h.glow.flash();
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(h.windows.length, windows, '不会每闪一次就新建一层');
  assert.equal(h.glow.isVisible(), true, '刚闪完还亮着');
  await new Promise(resolve => setTimeout(resolve, 90));
  assert.equal(h.glow.isVisible(), false);
});

test('屏幕插拔/改分辨率：新屏幕补一层，拔掉的收掉，尺寸变了贴回去', () => {
  const h = harness();
  h.glow.flash();
  h.setDisplays([{ id: 1, bounds: { x: 0, y: 0, width: 1280, height: 800 } },
    { id: 3, bounds: { x: 1280, y: 0, width: 1920, height: 1080 } }]);
  h.glow.sync();
  assert.equal(h.glow.count(), 2, '2 号拔了、3 号补上');
  assert.deepEqual(h.glow.layerFor(1).getBounds(), { x: 0, y: 0, width: 1280, height: 800 });
  assert.deepEqual(h.glow.layerFor(3).getBounds(), { x: 1280, y: 0, width: 1920, height: 1080 });
  assert.equal(h.glow.layerFor(2), undefined);
});

test('立刻收掉（共享屏幕时用），再闪还能亮', () => {
  const h = harness({ glowMs: 400 });
  h.glow.flash();
  h.glow.hide();
  assert.equal(h.glow.isVisible(), false);
  h.glow.flash();
  assert.equal(h.glow.isVisible(), true);
  h.glow.destroy();
  assert.equal(h.glow.count(), 0);
});
