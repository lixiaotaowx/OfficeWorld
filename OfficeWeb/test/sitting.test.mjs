import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { withServer, wait } from './helpers.mjs';
const call = (s, event, data) => new Promise(resolve => s.emit(event, data, resolve));
const spots = JSON.parse(readFileSync(new URL('../public-seats.json', import.meta.url)));

test('公共沙发和所有凳椅可以临时入座，不改变专属工位', async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect('甲');
    assert.equal((await call(a, 'seat', 0)).ok, true);
    for (const spot of spots) {
      assert.equal((await call(a, 'sit', spot.id)).ok, true, spot.id);
      assert.equal(peopleOf(a).find(p => p.id === a.id).seat, 0);
      assert.equal(peopleOf(a).find(p => p.id === a.id).sittingSpot, spot.id);
    }
  });
});

test('同一坐位并发只有一人成功，相邻沙发位置独立；起身、换座和断线释放', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲'), b = await connect('乙');
    const answers = await Promise.all([call(a, 'sit', 'sofa-0'), call(b, 'sit', 'sofa-0')]);
    assert.equal(answers.filter(r => r.ok).length, 1);
    const winner = answers[0].ok ? a : b, loser = winner === a ? b : a;
    assert.equal((await call(loser, 'sit', 'sofa-1')).ok, true);
    assert.equal((await call(winner, 'sit', null)).ok, true);
    assert.equal((await call(loser, 'sit', 'sofa-0')).ok, true);
    assert.equal((await call(winner, 'sit', 'sofa-1')).ok, true);
    loser.disconnect(); await wait(50);
    assert.equal((await call(winner, 'sit', 'sofa-0')).ok, true);
  });
});

test('空工位可临时坐，临时占用阻止永久抢占；专属工位离线仍不可抢坐', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲'), b = await connect('乙');
    assert.equal((await call(a, 'sit', 'desk-1')).ok, true);
    assert.equal((await call(b, 'seat', 1)).ok, false);
    assert.equal((await call(a, 'seat', 1)).ok, true);
    assert.equal((await call(a, 'sit', null)).ok, true);
    assert.equal((await call(b, 'sit', 'desk-1')).ok, false);
    a.disconnect(); await wait(50);
    assert.equal((await call(b, 'sit', 'desk-1')).ok, false);
    assert.equal((await call(b, 'sit', 'desk-2')).ok, true);
    assert.equal((await call(b, 'sit', 'sofa-999')).ok, false);
  });
});
