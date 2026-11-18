import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog } from '../build-store.mjs';

test('catalog physical specifications cover every rotation through boxes', () => {
  // 11 月目录用 boxes 包络：奇数转（90°）交换 x/z 外延，y 不变。
  for (const item of catalog) {
    if (item.arch || item.id === 'rug' || item.id === 'pad') continue;
    for (const rotation of [0, 1]) {
      const boxes = item.boxes.map(([w, h, d, ...rest]) => rotation % 2 ? [d, h, w, ...rest] : [w, h, d, ...rest]);
      const extent = axis => Math.max(...boxes.map(b => Math.abs(b[3 + axis]) + b[axis] / 2));
      for (let axis = 0; axis < 3; axis++) {
        assert(Number.isFinite(extent(axis)) && extent(axis) >= 0, `${item.id} rotation ${rotation} axis ${axis}`);
      }
    }
  }
});

test('structural catalogue: stair risers 0.25/0.3 steps, ladder rungs 0.32 apart', () => {
  // 11 月图书馆大厅的结构件规格（boxes: [w,h,d,px,py,pz]）。
  const ladder = catalog.find(p => p.id === 'ladder');
  const rungs = ladder.boxes.filter(box => box[1] === 0.04);
  assert.ok(rungs.length >= 4, '梯子有横档');
  const ys = rungs.map(box => box[4]).sort((a, b) => a - b);
  assert.equal(+(ys[1] - ys[0]).toFixed(2), 0.32, '横档步进 0.32 m');
  const stairs = catalog.find(p => p.id === 'stairs');
  assert.ok(stairs.boxes.length >= 4, '台阶至少四档');
  // 每档的顶面 y = py + h/2，第一档顶面 0.3，之后每档 +0.3。
  const tops = stairs.boxes.map(box => +(box[4] + box[1] / 2).toFixed(3));
  assert.equal(tops[0], 0.3, '第一档顶面 0.3 m');
  assert.equal(+(tops[1] - tops[0]).toFixed(2), 0.3, '台阶步高 0.3 m');
});
