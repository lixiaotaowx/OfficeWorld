const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTaskbarGuard, overTaskbar, INTERVAL_MS } = require('../dock-taskbar-guard.cjs');

test('detect all taskbar edges, negative monitor coordinates and auto-hide', () => {
  const bounds = { x: -1920, y: 0, width: 1920, height: 1080 };
  for (const [workArea, point] of [
    [{ ...bounds, height: 1040 }, { x: -100, y: 1060 }],
    [{ ...bounds, y: 40, height: 1040 }, { x: -100, y: 20 }],
    [{ ...bounds, x: -1880, width: 1880 }, { x: -1900, y: 500 }],
    [{ ...bounds, width: 1880 }, { x: -20, y: 500 }],
  ]) {
    assert.equal(overTaskbar(point, { bounds, workArea }), true);
    assert.equal(overTaskbar({ x: -900, y: 500 }, { bounds, workArea }), false);
  }
  assert.equal(overTaskbar({ x: -20, y: 1079 }, { bounds, workArea: bounds }), false);
});

test('taskbar app switch repairs stacking within 80ms without showing or focusing', () => {
  let tick, time = 1000, allowed = true, raised = 0, stopped = 0;
  let cursor = { x: 500, y: 1060 };
  const guard = createTaskbarGuard({
    screen: { getCursorScreenPoint: () => cursor,
      getPrimaryDisplay: () => ({ bounds: { x: 0, y: 0, width: 1920, height: 1080 },
        workArea: { x: 0, y: 0, width: 1920, height: 1040 } }) },
    allowed: () => allowed, raise: () => raised++, now: () => time,
    setInterval: (fn, ms) => { assert.equal(ms, INTERVAL_MS); tick = fn; return 1; },
    clearInterval: () => stopped++,
  });
  guard.start(); guard.start();
  tick(); assert.equal(raised, 1);
  time += 80; tick(); assert.equal(raised, 2);
  cursor = { x: 500, y: 500 };
  time += 200; tick(); assert.equal(raised, 3, 'activation animation tail');
  time += 801; tick(); assert.equal(raised, 3, 'no fast raising during normal work');
  cursor.y = 1060; allowed = false; tick();
  assert.equal(raised, 3, 'sharing/fullscreen/manual hidden never raised');
  allowed = true; tick(); assert.equal(raised, 4);
  guard.stop(); assert.equal(stopped, 1);
});
