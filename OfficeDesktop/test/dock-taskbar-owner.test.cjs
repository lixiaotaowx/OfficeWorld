const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTaskbarOwner } = require('../dock-taskbar-owner.cjs');

function fixture() {
  let taskbar = 123, owner = 0;
  const calls = [];
  const bytes = Buffer.alloc(8); bytes.writeBigUInt64LE(456n);
  const win = { getNativeWindowHandle: () => bytes, isDestroyed: () => false };
  const native = {
    find: () => taskbar, valid: () => taskbar !== 0, owner: () => owner,
    setOwner: (hwnd, index, next) => {
      calls.push([hwnd, index, next]); const previous = owner; owner = next; return previous;
    },
  };
  const binding = createTaskbarOwner({ platform: 'win32', load: () => native });
  return { win, native, binding, calls, changeTaskbar: value => { taskbar = value; } };
}
test('ownership succeeds even when SetWindowLongPtr returns zero, and is not rewritten every tick', () => {
  const h = fixture();
  assert.equal(h.binding.sync(h.win), true);
  assert.deepEqual(h.calls, [[456n, -8, 123]]);
  for (let i = 0; i < 100; i++) assert.equal(h.binding.sync(h.win), true);
  assert.equal(h.calls.length, 1);
});
test('Explorer replacement rebinds; missing taskbar and refused ownership use fallback', () => {
  const h = fixture(); h.binding.sync(h.win);
  h.changeTaskbar(789); assert.equal(h.binding.sync(h.win), true);
  assert.equal(h.calls.at(-1)[2], 789);
  h.changeTaskbar(0); assert.equal(h.binding.sync(h.win), false);
  h.changeTaskbar(111); h.native.setOwner = () => 0;
  assert.equal(h.binding.sync(h.win), false);
  assert.equal(h.binding.error(), 'owner-not-applied');
});
test('unsupported platforms and native failures do not stop the dock', () => {
  const h = fixture();
  const unsupported = createTaskbarOwner({ platform: 'linux', load: () => { throw Error('unexpected'); } });
  assert.equal(unsupported.sync(h.win), false);
  const failed = createTaskbarOwner({ platform: 'win32', load: () => { throw Error('native missing'); } });
  assert.equal(failed.sync(h.win), false);
  assert.equal(failed.error(), 'native missing');
});
