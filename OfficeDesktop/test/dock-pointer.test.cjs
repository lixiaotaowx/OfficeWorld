const test = require('node:test');
const assert = require('node:assert/strict');
const { createDockPointer, cleanHitRegions } = require('../dock-pointer.cjs');

test('greeting and transparent background pass through; only controls receive input without forwarded mousemove', () => {
  let point = { x: -300, y: 140 };
  const calls = [];
  let bounds = { x: -400, y: 100, width: 320, height: 480 };
  const window = { isDestroyed: () => false, getBounds: () => bounds,
    setIgnoreMouseEvents: (...args) => calls.push(args) };
  const pointer = createDockPointer({ screen: { getCursorScreenPoint: () => point }, getWindow: () => window });
  pointer.update([{ x: 0, y: 440, width: 320, height: 40 },
    { x: 220, y: 10, width: 80, height: 24 }]);
  assert.deepEqual(calls.at(-1), [true], 'greeting ignores mouse');
  point = { x: -160, y: 120 }; pointer.sync();
  assert.deepEqual(calls.at(-1), [false], 'answer button remains clickable');
  point = { x: -300, y: 130 }; pointer.sync();
  assert.deepEqual(calls.at(-1), [true], 'call label passes through');
  point = { x: -300, y: 555 }; pointer.sync();
  assert.deepEqual(calls.at(-1), [false], 'strip hover recovers without DOM mousemove');
  bounds = { ...bounds, x: 0 }; pointer.sync();
  assert.deepEqual(calls.at(-1), [true], 'moving the window updates hit testing');
  const count = calls.length; pointer.sync(); assert.equal(calls.length, count);
  pointer.update([]); assert.deepEqual(calls.at(-1), [true]);
  pointer.start(); pointer.stop();
});
test('hit regions reject invalid data and bound IPC size', () => {
  assert.deepEqual(cleanHitRegions([null, {x:0,y:0,width:NaN,height:1},
    {x:0,y:0,width:-1,height:1}]), []);
  assert.equal(cleanHitRegions(Array(100).fill({x:0,y:0,width:10,height:10})).length, 80);
});

test('预留预览窗口在收起时穿透空白，展开卡片可交互，关闭后恢复穿透', () => {
  const bounds = { x: 100, y: 600, width: 340, height: 250 };
  let point = { x: 180, y: 640 };
  let ignored;
  const window = { isDestroyed: () => false, getBounds: () => bounds,
    setIgnoreMouseEvents: value => { ignored = value; } };
  const pointer = createDockPointer({screen: {getCursorScreenPoint: () => point}, getWindow: () => window});
  const strip = {x: 0, y: 210, width: 156, height: 40};
  pointer.update([strip]);
  assert.equal(ignored, true, '收起时预留区域不拦截底下应用');
  point = {x: 180, y: 825}; pointer.sync();
  assert.equal(ignored, false, '头像仍可悬停');
  pointer.update([strip, {x: 0, y: 10, width: 330, height: 190}]);
  point = {x: 180, y: 640}; pointer.sync();
  assert.equal(ignored, false, '展开后预览可点击');
  pointer.update([strip]);
  assert.equal(ignored, true, '关闭后同一位置立即恢复穿透');
});
