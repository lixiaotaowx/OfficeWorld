const test = require('node:test');
const assert = require('node:assert/strict');
const { createDockZOrder } = require('../dock-z-order.cjs');

function fixture() {
  const handle = Buffer.alloc(8); handle.writeBigUInt64LE(10n);
  const state = { topmost: true, taskbarTopmost: true, owner: 0, allowed: true,
    repairs: 0, stopped: 0, order: [30, 10, 20, 40], fullscreen: false, visible: true };
  const native = {
    find: () => 20, foreground: () => 40, minimized: () => false, cloaked: () => false,
    visible: h => Number(h) === 10 ? state.visible : true, className: () => 'Player',
    monitorRect: () => ({ left: 0, top: 0, right: 1920, bottom: 1080 }),
    frame: () => ({ left: 0, top: 0, right: 1920, bottom: state.fullscreen ? 1080 : 1032 }),
    getWindow: (h, kind) => kind === 4 ? state.owner : state.order[state.order.indexOf(Number(h)) - 1] || 0,
    style: h => (Number(h) === 10 ? state.topmost : Number(h) === 20 ? state.taskbarTopmost : Number(h) === 30) ? 8 : 0,
    setOwner: (_h, _index, owner) => { state.owner = owner; },
    position: (h, after, ...rest) => {
      state.args = [h, after, ...rest]; state.repairs++;
      if (after === -1) state.topmost = true;
      if (after === -2) state.topmost = false;
      state.order = state.order.filter(n => n !== Number(h));
      const index = after < 0 || after === 0 ? 0 : state.order.indexOf(Number(after)) + 1;
      state.order.splice(index, 0, Number(h)); return true;
    },
    watch: callback => { state.event = callback; return () => { state.stopped++; }; },
  };
  const win = { getNativeWindowHandle: () => handle, isDestroyed: () => false,
    isVisible: () => state.visible, hide: () => { state.visible = false; } };
  const order = createDockZOrder({ platform: 'win32', load: () => native,
    allowed: () => state.allowed, repair: () => {
      if (order.blocked(win)) win.hide();
      else { state.visible = true; order.sync(win); }
    } });
  return { order, state, win, native };
}

test('dock remains immediately above taskbar and below other topmost UI without focus/show flags', () => {
  const { order, state, win } = fixture();
  state.owner = 20; order.sync(win);
  assert.equal(state.owner, 0); assert.equal(state.repairs, 0);
  state.order = [10, 30, 20, 40]; order.sync(win);
  assert.deepEqual(state.order, [30, 10, 20, 40], 'lower an excessively high dock too');
  assert.equal(state.args[1], 30, 'insert behind taskbar neighbor, not absolute topmost');
  assert.equal(state.args.at(-1), 0x213, 'no activation, show, or owner reordering');
  state.order = [30, 20, 10, 40]; order.sync(win);
  assert.deepEqual(state.order, [30, 10, 20, 40]);
  const repairs = state.repairs;
  for (let i = 0; i < 100; i++) order.sync(win);
  assert.equal(state.repairs, repairs, 'healthy ordering remains read-only');
});

test('follow taskbar topmost demotion and promotion instead of enforcing topmost forever', () => {
  const { order, state, win } = fixture();
  state.taskbarTopmost = false; order.sync(win); assert.equal(state.topmost, false);
  state.taskbarTopmost = true; order.sync(win); assert.equal(state.topmost, true);
  assert.deepEqual(state.order, [30, 10, 20, 40]);
});

test('full-screen entry hides, resize exit restores without cursor input, hidden pages stay hidden', async () => {
  const { order, state, win } = fixture();
  order.start(); order.sync(win);
  try {
    state.fullscreen = true;
    for (let i = 0; i < 20; i++) state.event();
    await new Promise(r => setTimeout(r, 20));
    assert.equal(state.visible, false); assert.equal(state.repairs, 0);
    state.fullscreen = false; state.event(0x800b, 40);
    await new Promise(r => setTimeout(r, 20)); assert.equal(state.visible, true);
    state.fullscreen = true; await new Promise(r => setTimeout(r, 300));
    assert.equal(state.visible, false, 'watchdog covers a missed native event');
    state.fullscreen = false; await new Promise(r => setTimeout(r, 300));
    assert.equal(state.visible, true, 'watchdog resumes after fullscreen');
    state.allowed = false; state.visible = false; state.event();
    await new Promise(r => setTimeout(r, 20)); assert.equal(state.visible, false);
  } finally { order.stop(); }
  assert.equal(state.stopped, 1);
  state.allowed = true; state.event(); await new Promise(r => setTimeout(r, 20));
  assert.equal(state.visible, false, 'stopped hooks cannot revive dock');
});
