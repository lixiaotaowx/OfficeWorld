import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const {
  framePace, shadowUpdate, PACE_BUSY_MS, PACE_IDLE_MS, PACE_NAP_MS,
  SHADOW_STEADY_MS, SHADOW_IDLE_MS,
} = await import(await loadTs('framePacing.ts'));

const INPUT = (over = {}) => ({
  now: 60_000, lastInteraction: 59_000, dragging: false, idleScene: false,
  playingVideo: false, ...over,
});

test('busy scenes run at the 31 ms pace; dragging is full speed', () => {
  assert.equal(framePace(INPUT()), PACE_BUSY_MS, '忙碌 31ms 档');
  assert.equal(framePace(INPUT({ dragging: true })), 0, '拖拽全速');
});

test('idle scenes slow down after 10 s, then nap after 30 s', () => {
  assert.equal(framePace(INPUT({ now: 61_000, lastInteraction: 50_000 + 1 })), PACE_IDLE_MS, '11s 空闲 → 100ms');
  assert.equal(framePace(INPUT({ now: 61_000, lastInteraction: 55_000 })), PACE_BUSY_MS, '6s 还忙 → 31ms');
  assert.equal(framePace(INPUT({ now: 61_000, lastInteraction: 20_000 })), PACE_NAP_MS, '41s 空闲 → 200ms');
  assert.equal(framePace(INPUT({ now: 61_000, lastInteraction: 41_000 })), PACE_IDLE_MS, '20s 空闲 → 100ms');
});

test('playing video keeps the busy pace even when idle', () => {
  assert.equal(framePace(INPUT({ now: 61_000, lastInteraction: 10_000, playingVideo: true })), PACE_BUSY_MS, '视频全速');
});

test('shadow updates: scene motion always, cat motion when active, else tiered', () => {
  // lastShadow 刚刷过（now - 20ms），这样间隔判断不会抢先返回 true。
  const base = { now: 100_000, lastShadow: 99_980, idleScene: false, catMoving: false, sceneMoving: false };
  assert.equal(shadowUpdate({ ...base, sceneMoving: true }), true, '场景在动必刷');
  assert.equal(shadowUpdate({ ...base, catMoving: true }), true, '猫在动且活跃档也刷');
  assert.equal(shadowUpdate({ ...base, catMoving: true, idleScene: true }), false, '空闲档猫动不刷');
  assert.equal(shadowUpdate({ ...base }), false, '静止还没到 2s 不刷');
  assert.equal(shadowUpdate({ ...base, now: base.lastShadow + SHADOW_STEADY_MS }), true, '静止 2s 刷一次');
  assert.equal(shadowUpdate({ ...base, idleScene: true, now: base.lastShadow + SHADOW_IDLE_MS }), true, '空闲档 100ms 刷');
});
