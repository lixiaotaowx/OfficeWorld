import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const { pickBilliardsOrFloor, routeClick } = await import(await loadTs('clickRoute.ts'));

const TABLE = { id: 'hall-8', distance: 5 };
const FLOOR = { point: { x: 1, y: 0, z: 1 }, distance: 10 };

test('billiards beats the floor even when slightly farther (3 cm tolerance)', () => {
  const table = { id: 't', distance: 5.02 };
  const picked = pickBilliardsOrFloor([table], { ...FLOOR, distance: 5 });
  assert.equal(picked?.id, 't');
  const tooFar = { id: 't', distance: 5.1 };
  assert.equal(pickBilliardsOrFloor([tooFar], { ...FLOOR, distance: 5 }), null, '超过 3cm 容差就选地面');
});

test('route priority: billiards → cat → display → ladder → seat → walk', () => {
  const all = {
    billiardsTables: [TABLE], floor: FLOOR, catVisible: true, catHit: true,
    displayHit: true, ladderPartId: 'l1', seatId: 's1', walking: true,
  };
  assert.equal(routeClick(all).kind, 'billiards');
  assert.equal(routeClick({ ...all, billiardsTables: [] }).kind, 'cat');
  assert.equal(routeClick({ ...all, billiardsTables: [], catHit: false }).kind, 'display');
  assert.equal(routeClick({ ...all, billiardsTables: [], catHit: false, displayHit: false }).kind, 'ladder');
  assert.equal(routeClick({ ...all, billiardsTables: [], catHit: false, displayHit: false, ladderPartId: null }).kind, 'seat');
  assert.equal(routeClick({ ...all, billiardsTables: [], catHit: false, displayHit: false, ladderPartId: null, seatId: null }).kind, 'walk');
  assert.equal(routeClick({ ...all, billiardsTables: [], floor: null, catHit: false, displayHit: false, ladderPartId: null, seatId: null }).kind, 'none');
});

test('walking to the floor uses the hit point', () => {
  const route = routeClick({
    billiardsTables: [], floor: { point: { x: 2, y: 0, z: 3 }, distance: 1 },
    catVisible: false, catHit: false, displayHit: false, ladderPartId: null, seatId: null, walking: true,
  });
  assert.deepEqual(route, { kind: 'walk', point: { x: 2, y: 0, z: 3 } });
});
