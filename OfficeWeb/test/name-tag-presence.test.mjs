// 头顶名字卡片上的圆点：在座绿、离桌红，落点不能压住名字，且只在状态变化时重画。
//
// The canvas is faked: every drawing call is recorded, so the assertion is about
// what the code asked the 2D context to paint, not about pixels.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const DOT_AT_DESK = '#3f9d4f';
const DOT_AWAY = '#cf4a38';

function fakeCanvas() {
  const ops = [];
  const ctx = {
    font: '', lineWidth: 0, fillStyle: '', strokeStyle: '',
    shadowColor: '', shadowBlur: 0, shadowOffsetY: 0, textAlign: '', textBaseline: '',
    beginPath() {}, moveTo() {}, arcTo() {}, closePath() {},
    arc(x, y, r) { ops.push({ op: 'arc', x, y, r }); },
    fill() { ops.push({ op: 'fill', color: this.fillStyle }); },
    stroke() { ops.push({ op: 'stroke', color: this.strokeStyle }); },
    fillText(text, x) { ops.push({ op: 'text', text, x }); },
    measureText: (text) => ({ width: text.length * 20 }),
  };
  return { width: 0, height: 0, ops, getContext: () => ctx };
}

const created = [];
globalThis.document = {
  createElement: () => { const canvas = fakeCanvas(); created.push(canvas); return canvas; },
};

const source = readFileSync(new URL('../src/nameTags.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText.replace('"three"', JSON.stringify(import.meta.resolve('three')));
const { NameTags } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

/** Colour of the first fill after the dot's `arc`, i.e. the dot itself. */
function dotColor(canvas) {
  const at = canvas.ops.findIndex((op) => op.op === 'arc');
  assert.notEqual(at, -1, '名字卡片上必须画一个圆点');
  return canvas.ops.slice(at).find((op) => op.op === 'fill')?.color;
}

/** A stand-in for the avatar root: the tag only ever adds/removes itself. */
function parent() {
  const children = [];
  return { children, add: (child) => children.push(child), remove() {}, traverse() {} };
}

test('在座画绿点、离桌画红点，名字挪到点的右边', () => {
  const tags = new NameTags();
  const object = parent();
  const item = (atDesk, name = '李文杰') =>
    ({ id: 'p1', name, kind: 'employee', atDesk, object, height: 2.02 });

  tags.sync([item(true)]);
  const first = created.at(-1);
  assert.equal(dotColor(first), DOT_AT_DESK);
  const text = first.ops.find((op) => op.op === 'text');
  assert.equal(text?.text, '李文杰');
  assert.ok(text.x > 20, `名字不能被圆点压住（x=${text.x}）`);
  assert.equal(tags.info()[0].atDesk, true);

  const painted = created.length;
  tags.sync([item(true)]);
  assert.equal(created.length, painted, '状态没变就不该重画');

  tags.sync([item(false)]);
  assert.equal(dotColor(created.at(-1)), DOT_AWAY);
  assert.equal(tags.info()[0].atDesk, false);

  tags.sync([item(false, '王小明')]);
  assert.equal(dotColor(created.at(-1)), DOT_AWAY, '改名重画后仍然要有点');
  assert.ok(created.at(-1).ops.some((op) => op.op === 'text' && op.text === '王小明'));
  tags.dispose();
});

test('姓名跟随头部前倾与换模型，移出视口时隐藏完整标签', async () => {
  const THREE = await import('three');
  const tags = new NameTags();
  const root = new THREE.Group();
  const model = new THREE.Group();
  const head = new THREE.Bone();
  head.name = 'mixamorigHead';
  head.position.set(0, 1.4, .3);
  model.add(head);
  root.add(model);
  const item = { id: 'moving', name: '测试', kind: 'me', atDesk: true, object: root, height: 2.02 };
  tags.sync([item]);
  const sprite = root.children.find(child => child.isSprite);
  assert.ok(Math.abs(sprite.position.y - 1.76) < .001);
  assert.equal(sprite.position.z, .3);
  head.position.set(.2, 1, .6);
  tags.sync([item]);
  assert.ok(Math.abs(sprite.position.y - 1.36) < .001);
  assert.equal(sprite.position.z, .6);
  root.remove(model);
  const replacement = new THREE.Bone();
  replacement.name = 'mixamorigHead';
  replacement.position.y = 1.5;
  root.add(replacement);
  tags.sync([item]);
  assert.ok(Math.abs(sprite.position.y - 1.86) < .001);
  const camera = new THREE.PerspectiveCamera(40, 1.5, .1, 100);
  camera.position.set(0, 2, 7);
  camera.lookAt(0, 1, 0);
  camera.updateMatrixWorld(true);
  tags.render(camera, 800);
  assert.equal(sprite.visible, true);
  root.position.x = 100;
  root.updateMatrixWorld(true);
  tags.render(camera, 800);
  assert.equal(sprite.visible, false);
  tags.dispose();
});

test('名字牌挂在帽子顶上，不压帽子', async () => {
  // 用户 2026-09-28：「名字挡着帽子了 提高一下字」。
  // 尺子角色的 Head 骨骼在 1.08m，板子/帽子顶到 1.38~1.72m —— 固定 +0.36 正好落在帽子上。
  const THREE = await import('three');
  const tags = new NameTags();
  const root = new THREE.Group();
  const head = new THREE.Bone();
  head.name = 'mixamorigHead';
  head.position.set(0, 1.08, 0);
  root.add(head);
  // 一块"帽子"：世界最高的角在 y=1.72（跟派对帽一样是最高的那顶）。
  const hat = new THREE.Mesh(new THREE.BoxGeometry(.4, .28, .4),
    new THREE.MeshBasicMaterial());
  hat.position.set(0, 1.58, 0);
  root.add(hat);
  const item = { id: 'hat', name: '戴帽子的', kind: 'me', atDesk: true, object: root, height: 2.02 };
  const sprite = () => root.children.find(child => child.isSprite);
  // 真实渲染循环里 sync 之前矩阵已经更新过（量帽子顶要用 matrixWorld）。
  root.updateMatrixWorld(true);
  tags.sync([item]);
  const y = sprite().position.y;
  assert.ok(y > 1.72, `名字牌要在帽子顶(1.72)之上，实际 ${y}`);
  assert.ok(Math.abs(y - (1.72 + .26)) < .01, `名字牌应贴在帽子顶上 0.26m，实际 ${y}`);
  // 换成一顶矮帽子（顶在 1.28）：牌子取二者更高的那个 = 1.28 + 0.26。
  hat.geometry.dispose();
  hat.geometry = new THREE.BoxGeometry(.4, .2, .4);
  hat.position.set(0, 1.18, 0);
  root.updateMatrixWorld(true);
  tags.sync([item]);
  assert.ok(Math.abs(sprite().position.y - 1.54) < .01,
    `矮帽子时取帽子顶+0.26=1.54，实际 ${sprite().position.y}`);
  // 没戴帽子（模型还没加载出来）时也照旧。
  hat.visible = false;
  root.updateMatrixWorld(true);
  tags.sync([item]);
  assert.ok(Math.abs(sprite().position.y - 1.44) < .01, '没有网格可量时用 head+0.36');
  tags.dispose();
});
