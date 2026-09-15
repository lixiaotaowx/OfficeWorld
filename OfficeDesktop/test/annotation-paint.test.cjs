// The sharer's overlay turns relayed points into canvas paths. A stroke must be ONE
// polyline: keeping the stroke's first point as every segment start renders a single
// stroke as N-1 lines fanning out of its origin, which is exactly what shipped once.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const WIDTH = 1000, HEIGHT = 500;

function load() {
  const ops = [];
  const context = {
    setTransform: (...args) => ops.push(['setTransform', ...args]),
    clearRect: (...args) => ops.push(['clearRect', ...args]),
    beginPath: () => ops.push(['beginPath']),
    moveTo: (x, y) => ops.push(['moveTo', x, y]),
    lineTo: (x, y) => ops.push(['lineTo', x, y]),
    stroke: () => ops.push(['stroke']),
    fill: () => ops.push(['fill']),
    roundRect: () => ops.push(['roundRect']),
    fillText: () => ops.push(['fillText']),
    measureText: () => ({ width: 10 }),
  };
  const canvas = { clientWidth: WIDTH, clientHeight: HEIGHT, width: 0, height: 0, getContext: () => context };
  let subscriber;
  const window = {
    devicePixelRatio: 1,
    addEventListener() {},
    annotationLayer: { subscribe(callback) { subscriber = callback; return () => {}; } },
  };
  vm.runInNewContext(fs.readFileSync(require.resolve('../annotation-overlay.js'), 'utf8'), {
    window, document: { getElementById: () => canvas }, console,
  });
  // Only the path operations matter here; fills are the name label and the clear is
  // what a repaint does before it redraws.
  const pathOps = () => {
    const start = ops.findIndex(([op]) => op === 'beginPath');
    return start === -1 ? [] : ops.slice(start);
  };
  return { ops, pathOps, push: (message) => subscriber(message) };
}

test('一条笔画画成一条折线，而不是从起点散开的扇形', () => {
  const f = load();
  f.push({ type: 'annotate', id: 'peer', stroke: 'k1',
    points: [[0.1, 0.1], [0.2, 0.15], [0.3, 0.3], [0.4, 0.2]] });
  const path = f.pathOps();
  // Normalised points map straight onto the 1000x500 layer.
  assert.deepEqual(path.slice(0, 6), [
    ['beginPath'],
    ['moveTo', 100, 50],
    ['lineTo', 200, 75],
    ['lineTo', 300, 150],
    ['lineTo', 400, 100],
    ['stroke'],
  ], '每段必须承接上一个点，不能都从第一个点出发');
  assert.equal(path.filter(([op]) => op === 'lineTo').length, 3, '四个点只画三段');
  assert.equal(path.filter(([op]) => op === 'stroke').length, 1, '一条笔画只描一次');
  assert.equal(path.filter(([op]) => op === 'moveTo').length, 1, '一条笔画只起一次笔');
});

test('后续到达的点从上一个点续画，不从笔画起点重画', () => {
  const f = load();
  f.push({ type: 'annotate', id: 'peer', stroke: 'k1', points: [[0.1, 0.1], [0.2, 0.15], [0.3, 0.3], [0.4, 0.2]] });
  const before = f.ops.length;
  f.push({ type: 'annotate', id: 'peer', stroke: 'k1', points: [[0.5, 0.5], [0.6, 0.4]] });
  const path = f.ops.slice(before).filter(([op]) => ['beginPath', 'moveTo', 'lineTo', 'stroke'].includes(op));
  assert.deepEqual(path, [
    ['beginPath'],
    ['moveTo', 400, 100],
    ['lineTo', 500, 250],
    ['lineTo', 600, 200],
    ['stroke'],
  ], '续画必须从上一批的最后一个点开始');
});
