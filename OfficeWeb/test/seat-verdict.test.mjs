import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';

const { seatVerdict, shouldOfferClaim } = await import(await loadTs('seatVerdict.ts'));

const SEAT = { id: 'build-seat-hall-24:0', approaches: [{ x: 1, z: 1 }], at: { x: 1, y: .3, z: 1 }, face: 0 };
const DESK = { ...SEAT, id: 'desk-2', workstation: 2 };
const owner = name => ({ name, mine: false });
const mine = () => ({ name: '自己', mine: true });

test('seat verdict: an occupied seat is refused with the occupant name', () => {
  const verdict = seatVerdict(SEAT, [{ id: 'p1', name: '甲', sittingSpot: SEAT.id }], 'me', () => null);
  assert.deepEqual(verdict, { ok: false, reason: 'taken', message: '甲坐在这里' });
});

test('seat verdict: sitting in your own current spot is fine', () => {
  const verdict = seatVerdict(SEAT, [{ id: 'me', name: '我', sittingSpot: SEAT.id }], 'me', () => null);
  assert.deepEqual(verdict, { ok: true });
});

test('seat verdict: someone else\u2019s workstation is refused', () => {
  const verdict = seatVerdict(DESK, [], 'me', () => owner('乙'));
  assert.deepEqual(verdict, { ok: false, reason: 'owned', message: '这是乙的工位' });
});

test('seat verdict: your own workstation passes', () => {
  const verdict = seatVerdict(DESK, [], 'me', () => mine());
  assert.deepEqual(verdict, { ok: true });
});

test('seat verdict: an unclaimed workstation passes', () => {
  const verdict = seatVerdict(DESK, [], 'me', () => null);
  assert.deepEqual(verdict, { ok: true });
});

test('claim offer only for unclaimed workstations', () => {
  assert.equal(shouldOfferClaim(DESK, () => null), true, '没人认领 → 要问');
  assert.equal(shouldOfferClaim(DESK, () => owner('乙')), false, '别人的 → 不问');
  assert.equal(shouldOfferClaim(DESK, () => mine()), false, '自己的 → 不问');
  assert.equal(shouldOfferClaim(SEAT, () => null), false, '非工位 → 不问');
});
