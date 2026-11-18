import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const { isTitleBarGrab, dragMode, movedBeyond, orbitDrag, DRAG_THRESHOLD } =
  await import(await loadTs('cameraDrag.ts'));

test('title bar grabs are ignored only in the desktop shell when not fullscreen', () => {
  assert.equal(isTitleBarGrab(30, true, false), true, '桌面端标题栏');
  assert.equal(isTitleBarGrab(30, true, true), false, '全屏后没有标题栏');
  assert.equal(isTitleBarGrab(30, false, false), false, '浏览器没有标题栏');
  assert.equal(isTitleBarGrab(80, true, false), false, '标题栏以下照常');
});

test('drag mode: right button pans, shift+left pans, plain left orbits', () => {
  assert.equal(dragMode(2, false, undefined), 'pan');
  assert.equal(dragMode(1, true, undefined), 'pan');
  assert.equal(dragMode(0, true, undefined), 'pan');
  assert.equal(dragMode(0, true, true), 'orbit', '建造模式武装时 Shift+左键是旋转');
  assert.equal(dragMode(0, false, undefined), 'orbit');
});

test('drag threshold: 5 px', () => {
  assert.equal(DRAG_THRESHOLD, 5);
  assert.equal(movedBeyond(3, 1), false, '3+1 没超过');
  assert.equal(movedBeyond(4, 2), true, '4+2 超过');
});

test('orbit drag: yaw −0.007/px, pitch +0.004/px clamped to ±π/2', () => {
  const start = { yaw: .72, pitch: .6, target: { x: 0, y: 1.5, z: 0 } };
  const moved = orbitDrag(start, 100, 50);
  assert.ok(Math.abs(moved.yaw - (.72 - .7)) < 1e-9, 'yaw 减');
  assert.ok(Math.abs(moved.pitch - (.6 + .2)) < 1e-9, 'pitch 加');
  // 纵向拖很多也不会翻过头顶。
  const clamped = orbitDrag(start, 0, 5000);
  assert.equal(clamped.pitch, Math.PI / 2);
  const clampedDown = orbitDrag(start, 0, -5000);
  assert.equal(clampedDown.pitch, -Math.PI / 2);
});
