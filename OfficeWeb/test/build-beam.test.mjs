import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../build-store.mjs';

/** 11 月：传送点（teleport-pad）和它的粒子条已经退役；目录里的 'pad' 是
 *  一块平垫（teleport: true，用 shapes 描述，无碰撞包络）。'beam' 零件同样
 *  退役（梁用 wall/column 组合搭建）。这两个测试钉住目录的现状。 */

test('teleport pad and beam kinds are retired from the catalog', () => {
  assert.equal(catalog.some(p => p.id === 'teleport-pad'), false, 'teleport-pad 已下线');
  assert.equal(catalog.some(p => p.id === 'beam'), false, 'beam 已下线');
  const pad = catalog.find(p => p.id === 'pad');
  assert.ok(pad, 'pad 还在目录里');
  assert.equal(pad.teleport, true, 'pad 保留了传送玩法');
  // 平垫没有碰撞包络（可以踩上去，不算墙）。
  assert.equal(pad.boxes === undefined || pad.boxes.length === 0, true, 'pad 无碰撞包络');
});

test('pad keeps teleport, rug is a decorative flat overlay', () => {
  const pad = catalog.find(p => p.id === 'pad');
  assert.equal(pad.category, 'live', 'pad 是玩法件');
  const rug = catalog.find(p => p.id === 'rug');
  assert.ok(rug, 'rug in catalog');
  assert.equal(rug.category, 'build', 'rug is buildable');
  assert.equal(rug.boxes === undefined || rug.boxes.length === 0, true, 'rug has no collision envelope');
});
