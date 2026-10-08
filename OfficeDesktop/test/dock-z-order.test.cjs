const test = require('node:test');
const assert = require('node:assert/strict');
const { createDockZOrder } = require('../dock-z-order.cjs');

function fixture() {
  const handle = Buffer.alloc(8); handle.writeBigUInt64LE(10n);
  const state = { topmost: true, above: false, owner: 0, allowed: true, repairs: 0, stopped: 0 };
  const native = {
    find: () => 20,
    getWindow: (h, kind) => kind === 4 ? state.owner : BigInt(h) === 10n && state.above ? 20 : 0,
    style: () => state.topmost ? 8 : 0,
    setOwner: (_h, _index, owner) => { state.owner = owner; },
    position: (...args) => { state.args = args; state.repairs++; state.topmost = true; state.above = false; return true; },
    watch: callback => { state.event = callback; return () => { state.stopped++; }; },
  };
  const win = { getNativeWindowHandle: () => handle, isDestroyed: () => false };
  const order = createDockZOrder({ platform: 'win32', load: () => native,
    allowed: () => state.allowed, repair: () => order.sync(win) });
  return { order, state, win };
}

test('detach legacy owner, repair demotion or taskbar overlap, remain idle when correct', () => {
  const { order, state, win } = fixture();
  state.owner = 20;
  order.sync(win);
  assert.equal(state.owner, 0);
  assert.equal(state.repairs, 0);
  state.topmost = false; order.sync(win);
  assert.equal(state.repairs, 1);
  assert.equal(state.args.at(-1), 0x213, 'no focus, no show, no owner reordering');
  state.above = true; order.sync(win);
  assert.equal(state.repairs, 2);
  for (let i = 0; i < 100; i++) order.sync(win);
  assert.equal(state.repairs, 2);
});

test('event repair needs no taskbar mouse input and respects intentional hiding and cleanup', async () => {
  const { order, state } = fixture();
  order.start(); state.above = true;
  for (let i = 0; i < 20; i++) state.event();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(state.repairs, 1);
  state.allowed = false; state.above = true; state.event();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(state.repairs, 1);
  state.allowed = true; state.event(); order.stop();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(state.repairs, 1);
  assert.equal(state.stopped, 1);
});
