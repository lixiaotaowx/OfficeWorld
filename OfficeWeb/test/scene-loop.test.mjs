import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const source = readFileSync(new URL('../src/sceneLoop.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText;
const { SceneLoop } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

function harness() {
  let now = 0, id = 0, moving = false, simulated = 0;
  const jobs = new Map(), drawn = [], deltas = [];
  const add = (callback, delay) => { const key = ++id; jobs.set(key, { callback, at: now + delay }); return key; };
  const host = { now: () => now, requestFrame: callback => add(callback, 1000 / 120),
    cancelFrame: key => jobs.delete(key), setTimer: add, clearTimer: key => jobs.delete(key) };
  const loop = new SceneLoop(dt => { simulated += dt; deltas.push(dt); },
    dt => drawn.push(dt), () => moving, host);
  const advance = ms => {
    const end = now + ms;
    while (jobs.size) {
      const [key, job] = [...jobs].sort((a,b) => a[1].at - b[1].at)[0];
      if (job.at > end) break;
      now = job.at; jobs.delete(key); job.callback();
    }
    now = end;
  };
  return { loop, advance, drawn, deltas, jobs, setMoving: value => { moving = value; },
    simulated: () => simulated };
}

test('120Hz屏幕也限制静止10帧、操作/走路60帧、失焦10帧', () => {
  const h = harness();
  h.advance(1000); assert(h.drawn.length >= 9 && h.drawn.length <= 11);
  let before = h.drawn.length; h.loop.activity(); h.advance(1000);
  assert(h.drawn.length - before >= 59 && h.drawn.length - before <= 61);
  h.advance(3000); h.setMoving(true); before = h.drawn.length; h.advance(1000);
  assert(h.drawn.length - before >= 59 && h.drawn.length - before <= 61);
  h.loop.setFocused(false); before = h.drawn.length; h.advance(1000);
  assert(h.drawn.length - before >= 9 && h.drawn.length - before <= 11);
  h.loop.dispose();
});

test('不可见时零绘制，位置模拟继续；恢复不追赶时间、不重复循环', () => {
  const h = harness(); h.advance(500); h.loop.setVisible(false);
  const before = h.drawn.length, simulated = h.simulated(); h.advance(5000);
  assert.equal(h.drawn.length, before); assert(h.simulated() - simulated > 4.8);
  h.loop.setVisible(true); h.loop.setVisible(true); h.advance(1000);
  assert(h.drawn.length > before); assert(h.deltas.every(dt => dt <= .1));
  assert.equal(h.jobs.size, 1); h.loop.dispose(); assert.equal(h.jobs.size, 0);
});

test('手动暂停不会因窗口重新聚焦解除，只有显式恢复才继续画面', () => {
  const h = harness(); h.loop.setPaused(true); h.advance(1000);
  h.loop.setVisible(false); h.loop.setFocused(false); h.advance(1000);
  h.loop.setVisible(true); h.loop.setFocused(true); h.advance(1000);
  assert.equal(h.drawn.length, 0); assert(h.simulated() > 2.8);
  h.loop.setPaused(false); h.advance(100); assert(h.drawn.length > 0);
  const before = h.drawn.length; h.loop.dispose(); h.advance(1000);
  assert.equal(h.drawn.length, before);
});
