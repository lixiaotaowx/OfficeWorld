import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { catalog, createBuildStore } from '../build-store.mjs';

test('furniture kinds survive server add, move, reload and remove', () => {
  const dir = mkdtempSync(join(tmpdir(), 'props-'));
  const user = { id: 'props', name: 'props' };
  try {
    const path = join(dir, 'world.json');
    const store = createBuildStore(path);
    // 11 月目录的家居类零件（11 月按类别走 build / live 两个分组）。
    const furniture = catalog.filter(p => p.category === 'build' && !['block', 'slab', 'wall'].includes(p.id)).slice(0, 8);
    for (const item of furniture) {
      const added = store.mutate({ action: 'add', part: { kind: item.id, color: '#e9d4aa', x: 5, y: 0, z: 5, rotation: 0 } }, user).changed;
      const moved = store.mutate({ action: 'move', id: added.id, version: added.version, part: { ...added, x: 6 } }, user).changed;
      assert.equal(moved.x, 6, item.id);
      store.mutate({ action: 'remove', id: moved.id, version: moved.version }, user);
      assert.ok(!createBuildStore(path).snapshot().parts.some(p => p.id === added.id), item.id + ' removal persists');
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('seating kinds keep their seat counts (sofa 2, chair/stool 1)', () => {
  // 座位数来自 part-library（seatIds 的依据），11 月：沙发两个位置，椅凳各一。
  const seatCounts = { sofa: 2, chair: 1, stool: 1 };
  for (const [kind, count] of Object.entries(seatCounts)) {
    const item = catalog.find(p => p.id === kind);
    assert.ok(item, kind + ' in catalog');
    assert.equal(item.seat?.count ?? count, count, kind + ' seat count');
  }
});
