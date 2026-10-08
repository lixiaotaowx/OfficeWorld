// 别人工位小画面的合并规则（从 useOffice 里拆出来的纯逻辑）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/previewFrames.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { mergePreviewBatch, attachPreviewIncoming } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('新画面进表；关掉接收就不再收别人的画面（自己那一张不受影响）', () => {
  const first = mergePreviewBatch({}, { a: 'A', me: 'MINE' }, { selfId: 'me', receiving: true });
  assert.deepEqual(first.next, { a: 'A', me: 'MINE' });
  assert.deepEqual(first.cleared, []);
  // 关掉接收：这批里别人的画面不加进来，自己那一张照旧。
  const off = mergePreviewBatch({ a: 'A', me: 'MINE' }, { a: 'A2', b: 'B' },
    { selfId: 'me', receiving: false });
  assert.deepEqual(off.next, { me: 'MINE' });
  // 打开接收照常合并。
  const on = mergePreviewBatch({ a: 'A' }, { a: 'A2', b: 'B' }, { selfId: 'me', receiving: true });
  assert.deepEqual(on.next, { a: 'A2', b: 'B' });
});

test('null（走开停采/采集失败/关窗）不删手里那一张', () => {
  // 用户 2026-09-18：「不在的话用最后一张 不要在办公室还关着屏幕」。
  const result = mergePreviewBatch({ a: 'A' }, { a: null }, { selfId: 'me', receiving: true });
  assert.deepEqual(result.next, { a: 'A' }, '画面要留着');
  assert.deepEqual(result.cleared, ['a'], '但要记下"现在没有实时画面了"');
});

test('合并不改动传进来的旧表（React state 要拿新的对象）', () => {
  const old = { a: 'A' };
  const result = mergePreviewBatch(old, { b: 'B' }, { selfId: 'me', receiving: true });
  assert.deepEqual(old, { a: 'A' });
  assert.notEqual(result.next, old);
});

test('批量入口：同一批多帧只回调一次，卸载后不再回调', async () => {
  const handlers = {};
  const socket = {
    on: (event, handler) => { handlers[event] = handler; },
    off: (event, handler) => { if (handlers[event] === handler) delete handlers[event]; },
  };
  const batches = [];
  const detach = attachPreviewIncoming(socket, batch => batches.push(batch));
  handlers.preview({ id: 'a', image: 'A' });
  handlers.preview({ id: 'b', image: 'B' });
  assert.deepEqual(batches, [], '要等到 flush 才进 state');
  await new Promise(resolve => setTimeout(resolve, 260));
  assert.deepEqual(batches, [{ a: 'A', b: 'B' }], '一批只回调一次');
  detach();
  assert.equal(handlers.preview, undefined, '卸载后不再监听');
  handlers.preview?.({ id: 'c', image: 'C' });
  await new Promise(resolve => setTimeout(resolve, 260));
  assert.equal(batches.length, 1);
});
