import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { catalog, createBuildStore, dimensions } from '../build-store.mjs';

test('catalog entries carry box envelopes with sane extents', () => {
  for (const item of catalog) {
    if (item.arch || item.id === 'rug' || item.id === 'pad') continue;
    for (const box of item.boxes) {
      const [w, h, d] = box;
      assert(w > 0 && h > 0 && d > 0, `${item.id} envelope must be positive`);
      assert(box.slice(0, 6).every(n => Number.isFinite(n)), `${item.id} finite envelope`);
    }
  }
});

test('scale persists across save/reload and rejects invalid scale', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'scale-')), 'world.json');
  const s = createBuildStore(path), user = { id: 'scale', name: 'scale' };
  const p = s.mutate({ action: 'add', part: { kind: 'column', x: 20, y: 0, z: 0, rotation: 0, scale: [2, 1.25, 3], color: '#e9d4aa' } }, user).changed;
  assert.deepEqual(createBuildStore(path).snapshot().parts.find(n => n.id === p.id).scale, [2, 1.25, 3]);
  // 11 月的缩放校验：0/负数/非有限值都不能落盘。
  for (const scale of [[-1, 1, 1], [0, 1, 1], [Infinity, 1, 1]]) {
    assert.throws(() => s.mutate({ action: 'move', id: p.id, version: p.version, part: { ...p, scale } }, user));
  }
  // dimensions() respects scale.
  const scaled = { ...p, scale: [2, 1, 1] };
  assert.equal(dimensions(scaled)[0], dimensions({ ...p, scale: undefined })[0] * 2);
});

test('positions persist exactly (no grid snapping in November)', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'scale2-')), 'world.json');
  const s = createBuildStore(path), user = { id: 'u', name: 't' };
  const added = s.mutate({ action: 'add', part: { kind: 'block', color: '#e9d4aa', x: 4.13, y: 1.37, z: -2.09, rotation: 0 } }, user).changed;
  assert.deepEqual([added.x, added.y, added.z], [4.13, 1.37, -2.09]);
  assert.equal(createBuildStore(path).snapshot().parts.find(n => n.id === added.id).x, 4.13);
});
