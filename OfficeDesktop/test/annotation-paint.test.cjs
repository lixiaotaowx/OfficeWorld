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
    // `strokeStyle` 记进 ops：颜色的断言全靠它。
    set strokeStyle(value) { ops.push(['strokeStyle', value]); },
    setTransform: (...args) => ops.push(['setTransform', ...args]),
    clearRect: (...args) => ops.push(['clearRect', ...args]),
    beginPath: () => ops.push(['beginPath']),
    moveTo: (x, y) => ops.push(['moveTo', x, y]),
    lineTo: (x, y) => ops.push(['lineTo', x, y]),
    stroke: () => ops.push(['stroke']),
    fill: () => ops.push(['fill']),
    roundRect: () => ops.push(['roundRect']),
    fillText: (...args) => ops.push(['fillText', ...args]),
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

test('每一笔不再署名（用户 2026-10-14：「标记每一笔都会署名，名称去掉」）', () => {
  const f = load();
  f.push({ type: 'annotate', id: 'peer', stroke: 'k1', name: '张三',
    points: [[0.1, 0.1], [0.2, 0.2]] });
  f.push({ type: 'annotate', id: 'peer2', stroke: 'k2', name: '李四',
    points: [[0.5, 0.5], [0.6, 0.6]] });
  const fills = f.ops.filter(([op]) => op === 'fillText' || op === 'roundRect' || op === 'measureText');
  assert.deepEqual(fills, [], '笔画里不能出现任何文字/名牌胶囊（署名已经删掉）');
  assert.ok(f.pathOps().length > 0, '笔画本身照样要画出来');
});

test('观众挑的颜色整条笔画都用它，不在色板里的退回这个人的固定色', () => {
  // 用户 2026-10-14：「观众看别人时标记可以修改颜色」。颜色是**每条笔画**的属性，
  // 所以中途换色不能把已经画好的笔画也改掉。
  const f = load();
  f.push({ type: 'annotate', id: 'peer', stroke: 'k1', color: '#4a9fd8',
    points: [[0.1, 0.1], [0.2, 0.2]] });
  f.push({ type: 'annotate', id: 'peer', stroke: 'k1', color: '#5fb96a', points: [[0.3, 0.3]] });
  const colors = f.ops.filter(([op]) => op === 'strokeStyle').map(([, value]) => value);
  assert.deepEqual(colors, ['#4a9fd8', '#4a9fd8'],
    '续画必须沿用起笔时的颜色，不能被后来选的颜色改写');
  // 不在色板里的（老客户端、脏数据）退回这个人固定的那一色 —— 老版本发来的笔画照样能画。
  const g = load();
  g.push({ type: 'annotate', id: 'peer', stroke: 'k1', color: 'javascript:alert(1)',
    points: [[0.1, 0.1], [0.2, 0.2]] });
  const fallback = g.ops.filter(([op]) => op === 'strokeStyle').map(([, value]) => value);
  assert.equal(fallback.length, 1);
  assert.match(String(fallback[0]), /^hsl\(\d+ 74% 46%\)$/, '退回 colorFor(clientId) 那一色');
});
test('撤销按笔画 id 精确删，老消息（不带 stroke）才退回这个人的最后一条', () => {
  const f = load();
  f.push({ type: 'annotate', id: 'peer', stroke: 'k1', color: '#e0524a', points: [[0.1, 0.1], [0.2, 0.2]] });
  f.push({ type: 'annotate', id: 'peer', stroke: 'k2', color: '#5fb96a', points: [[0.3, 0.3], [0.4, 0.4]] });
  f.push({ type: 'annotate', id: 'other', stroke: 'k9', points: [[0.7, 0.7], [0.8, 0.8]] });
  /** 最后一次整屏重画里留下的笔画颜色 = 还在板上的笔画。 */
  const left = () => f.ops.slice(f.ops.map(([op]) => op).lastIndexOf('clearRect'))
    .filter(([op]) => op === 'strokeStyle').map(([, value]) => value);
  // 别人的那一条没有颜色字段，走 colorFor(clientId)，具体色相由 id 决定，这里只认形状。
  const FIXED = /^hsl\(\d+ 74% 46%\)$/;
  assert.deepEqual(left().slice(0, 2), ['#e0524a', '#5fb96a'], '两条点名的按自己的颜色画');
  assert.match(String(left()[2]), FIXED, '别人的按他的固定色画');
  // 撤销 k1（点名的那一条）：k1 消失，k2 和别人的都留下。
  f.push({ type: 'undo', id: 'peer', stroke: 'k1' });
  assert.deepEqual(left().slice(0, 1), ['#5fb96a'], '只删掉被点名的那一条');
  assert.match(String(left()[1]), FIXED, '别人的笔迹不受影响');
  // 老客户端不带 stroke：退回"这个人最后画的一条"（这时是 k2）。
  f.push({ type: 'undo', id: 'peer' });
  assert.equal(left().length, 1, '这个人的两条都撤完了，剩下的只有别人的那一条');
  assert.match(String(left()[0]), FIXED);
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
