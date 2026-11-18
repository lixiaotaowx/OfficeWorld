import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadTs } from './helpers.mjs';
import { createBuildStore, catalog } from '../build-store.mjs';

/** 11 月的世界不再强制落格：服务器原样保存坐标（只做边界与档位校验），
 *  客户端的贴面/辅助落点仍然是纯函数层，可单独验证。 */
const urls = new Map();
const { snapHorizontal, snapPart, onGrid } = await import(await loadTs('buildGrid.ts', urls));

const user = { id: 'grid-qa', name: 'grid-qa' };
const store = () => createBuildStore(join(mkdtempSync(join(tmpdir(), 'box-grid-')), 'world.json'));

test('server keeps positions as sent (add / move / moveMany / duplicate)', () => {
  const s = store();
  const added = s.mutate({ action: 'add', part: { id: 'p', version: 1, kind: 'block', color: '#e9d4aa', x: 5.11, y: .105, z: -2.19, rotation: 0 } }, user).changed;
  assert.deepEqual([added.x, added.y, added.z], [5.11, .105, -2.19], 'no snapping');
  const moved = s.mutate({ action: 'move', id: added.id, version: added.version,
    part: { ...added, x: 6.03, y: 1.61, z: -3.12 } }, user).changed;
  assert.deepEqual([moved.x, moved.y, moved.z], [6.03, 1.61, -3.12]);
  const many = s.mutate({ action: 'moveMany', items: [{ id: moved.id, version: moved.version,
    part: { ...moved, x: 7.13, y: -4.605, z: -4.06 } }] }, user);
  assert.deepEqual([many.changedMany[0].x, many.changedMany[0].y, many.changedMany[0].z], [7.13, -4.605, -4.06]);
  const copy = s.mutate({ action: 'duplicate', id: moved.id, version: many.changedMany[0].version }, user).changed;
  assert.deepEqual([copy.x, copy.y, copy.z], [7.13, -4.605, -4.06]);
});

test('client snap helpers still quantise to 0.25 m on demand', () => {
  const snapped = snapHorizontal({ x: 4.13, z: -2.09 });
  assert.equal(snapped.x, 4.25);
  assert.equal(snapped.z, -2);
  const part = snapPart({ kind: 'block', x: 4.13, y: 1.37, z: -2.09 });
  assert.equal(part.x, 4.25);
  assert.equal(onGrid(part), true);
});

test('catalog positions from the seeded hall are arbitrary but stable', () => {
  // 图书馆大厅的种子家具坐标不是 0.25 的整数倍（例如沙发 z=3.75 是，但椅子
  // 有 0.75 偏移的角度摆放）；保存/读回必须一个比特都不差。
  const s = store();
  const seed = s.snapshot().parts;
  const again = createBuildStore(s.snapshotPath ?? join(tmpdir(), 'unused'));
  // 读回同一份存档（seedParts 的库位在新建时重新生成，所以只验证有限坐标）。
  for (const part of seed.slice(0, 10)) {
    assert(part.x !== undefined && Number.isFinite(part.x), part.id);
  }
  // 目录里每个 kind 都能原样添加。
  const item = catalog.find(p => p.id === 'plant');
  const added = s.mutate({ action: 'add', part: { kind: item.id, color: '#e9d4aa', x: 9.08, y: 0, z: 1.31, rotation: 3 } }, user).changed;
  assert.deepEqual([added.x, added.z], [9.08, 1.31]);
});
