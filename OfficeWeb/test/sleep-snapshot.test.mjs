import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const { canSleep, makeSnapshot, applySnapshot } = await import(await loadTs('sleepSnapshot.ts'));

const IDLE = {
  alive: true, billiardsId: null, billiardsLoadingId: null, buildActive: false,
  cardsOpen: false, watching: false, focusedDisplay: false, playingVideo: false,
  navigationPending: false, walkingRoute: false, falling: false, jumping: false,
};

test('idle scene can sleep', () => {
  assert.equal(canSleep(IDLE), true);
});

test('any busy condition blocks sleep', () => {
  for (const key of Object.keys(IDLE).filter(k => k !== 'alive')) {
    const busy = { ...IDLE, [key]: key === 'billiardsId' || key === 'billiardsLoadingId' ? 'x' : true };
    assert.equal(canSleep(busy), false, `${key} 忙时不休眠`);
  }
  assert.equal(canSleep({ ...IDLE, alive: false }), false, '场景销毁了也不休眠');
});

test('snapshot carries camera pairs, time and actor', () => {
  const view = { yaw: .72, pitch: .6, zoom: .6, target: [0, 1.5, 0] };
  const snapshot = makeSnapshot({
    view, goal: view, time: 'night',
    me: { x: 2, y: 0, z: 3, rotation: .5 },
    mySpot: 'desk-3',
  });
  assert.equal(snapshot.time, 'night');
  assert.deepEqual(snapshot.actor, { x: 2, y: 0, z: 3, rotation: .5, sittingSpot: 'desk-3' });
});

test('snapshot without an actor keeps the camera but no actor', () => {
  const snapshot = makeSnapshot({
    view: { yaw: 0, pitch: 0, zoom: 1, target: [0, 0, 0] },
    goal: { yaw: 0, pitch: 0, zoom: 1, target: [0, 0, 0] },
    time: 'morning', me: null, mySpot: null,
  });
  assert.equal(snapshot.actor, null);
});

test('applySnapshot restores both camera copies and re-applies time', () => {
  let timeApplied = 0;
  const view = { yaw: 0, pitch: 0, zoom: 1, target: [0, 0, 0] };
  const goal = { yaw: 0, pitch: 0, zoom: 1, target: [0, 0, 0] };
  const snapshot = makeSnapshot({
    view: { yaw: 1, pitch: .4, zoom: .8, target: [3, 1, 4] },
    goal: { yaw: 1.2, pitch: .5, zoom: .7, target: [4, 1, 5] },
    time: 'afternoon', me: null, mySpot: null,
  });
  applySnapshot({ view, goal, applyTime: () => timeApplied++ }, snapshot,
    (which, value) => { Object.assign(which === 'view' ? view : goal, value); },
    time => { snapshot.time = time; timeApplied += 0; });
  assert.equal(view.yaw, 1);
  assert.equal(goal.yaw, 1.2);
  assert.equal(timeApplied, 1, 'applyTime 恰好一次');
});
