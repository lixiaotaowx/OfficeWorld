import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const { MotionPublisher, motionPayload, DEBOUNCE_MS, HEARTBEAT_MS } =
  await import(await loadTs('motionPublish.ts'));

const SOURCE = (over = {}) => ({
  position: { x: 1.23456, y: 0, z: 2.34567 },
  rotationY: 0.78901,
  state: 'walk', gait: 'run', mySpot: null, ...over,
});

test('motion payload: 3-decimal rounding and movement flags', () => {
  const payload = motionPayload(SOURCE());
  assert.equal(payload.x, 1.235);
  assert.equal(payload.rot, 0.789);
  assert.equal(payload.moving, true);
  assert.equal(payload.running, true);
  assert.equal(payload.sitting, false);
  assert.equal(payload.sittingSpot, null);
});

test('sitting payload carries the seat', () => {
  const payload = motionPayload(SOURCE({ state: 'sit', gait: undefined, mySpot: 'desk-2' }));
  assert.equal(payload.sitting, true);
  assert.equal(payload.sittingSpot, 'desk-2');
  assert.equal(payload.moving, false);
});

test('publisher: change debounced 70 ms', () => {
  const publisher = new MotionPublisher();
  const first = publisher.frame(SOURCE(), 0);
  assert.ok(first, '第一次总是发');
  const immediate = publisher.frame(SOURCE({ position: { x: 9, y: 0, z: 9 } }), DEBOUNCE_MS - 10);
  assert.equal(immediate, null, '变了但不到 70ms 不发');
  const after = publisher.frame(SOURCE({ position: { x: 9, y: 0, z: 9 } }), DEBOUNCE_MS + 20);
  assert.ok(after, '过了 70ms 就发');
});

test('publisher: heartbeat every 2 s even when nothing moved', () => {
  const publisher = new MotionPublisher();
  const first = publisher.frame(SOURCE(), 0);
  assert.ok(first);
  const same = publisher.frame(SOURCE(), 1000);
  assert.equal(same, null, '没变不发');
  const beat = publisher.frame(SOURCE(), HEARTBEAT_MS + 10);
  assert.ok(beat, '两秒心跳照发');
});
