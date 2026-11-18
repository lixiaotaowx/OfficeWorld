import test from 'node:test';
import assert from 'node:assert/strict';
import { withServer, wait } from './helpers.mjs';
const call = (s, event, data) => new Promise(resolve => s.emit(event, data, resolve));

// 11 月的世界：公共座位来自图书馆大厅的建造家具。种子世界里有一张沙发
// （hall-24，两个位置）和十把椅子，临时入座用 build-seat-<id> 这样的座位号。
const SOFA = 'hall-24';
const SOFA_PLACES = [0, 1].map(i => `build-seat-${SOFA}:${i}`);
const CHAIRS = ['hall-17', 'hall-18'].map(id => `build-seat-${id}`);

test('公共沙发和所有凳椅可以临时入座，不改变专属工位', async () => {
  await withServer(async ({ connect, peopleOf }) => {
    const a = await connect('甲');
    assert.equal((await call(a, 'seat', 0)).ok, true);
    for (const spot of [...SOFA_PLACES, ...CHAIRS]) {
      assert.equal((await call(a, 'sit', spot)).ok, true, spot);
      assert.equal(peopleOf(a).find(p => p.id === a.id).seat, 0);
      assert.equal(peopleOf(a).find(p => p.id === a.id).sittingSpot, spot);
    }
  });
});

test('同一坐位并发只有一人成功，相邻沙发位置独立；起身、换座和断线释放', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲'), b = await connect('乙');
    const answers = await Promise.all([call(a, 'sit', SOFA_PLACES[0]), call(b, 'sit', SOFA_PLACES[0])]);
    assert.equal(answers.filter(r => r.ok).length, 1);
    const winner = answers[0].ok ? a : b, loser = winner === a ? b : a;
    assert.equal((await call(loser, 'sit', SOFA_PLACES[1])).ok, true);
    assert.equal((await call(winner, 'sit', null)).ok, true);
    assert.equal((await call(loser, 'sit', SOFA_PLACES[0])).ok, true);
    assert.equal((await call(winner, 'sit', SOFA_PLACES[1])).ok, true);
    loser.disconnect(); await wait(50);
    assert.equal((await call(winner, 'sit', SOFA_PLACES[0])).ok, true);
  });
});

test('空闲工位可临时坐，临时占用阻止永久抢占；专属工位离线仍不可抢坐', async () => {
  await withServer(async ({ connect }) => {
    const a = await connect('甲'), b = await connect('乙'), c = await connect('丙');
    // 甲临时坐进 desk-1：乙此刻不能认领（有人坐在那里）。
    assert.equal((await call(a, 'sit', 'desk-1')).ok, true);
    assert.equal((await call(b, 'seat', 1)).ok, false);
    // 甲起身之后乙就能认领；认领是永久的，起身不释放。
    assert.equal((await call(a, 'sit', null)).ok, true);
    assert.equal((await call(b, 'seat', 1)).ok, true);
    // 认领之后即便离线，工位仍然归他（永久保留，找管理员释放）。
    b.disconnect(); await wait(50);
    assert.equal((await call(c, 'seat', 1)).ok, false);
  });
});
