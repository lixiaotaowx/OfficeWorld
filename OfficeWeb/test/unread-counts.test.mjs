// 「每人多少条未读」的比较：内容一样必须返回原对象，否则 React 会一直重渲染。
//
// 这条规则是 2026-09-20 的 CPU/内存爆表事故留下的：ChatInbox 每次渲染都会算出一份新的
// byPerson 对象、App 每次渲染又给 onUnread 一个新的箭头函数，两边一凑就无限空转，
// 主线程 100%、三维画面和头像条都画不出来。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/unreadCounts.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { sameUnreadCounts, mergeUnreadCounts } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('内容一样就是一样（顺序不同也算）', () => {
  assert.equal(sameUnreadCounts({}, {}), true);
  assert.equal(sameUnreadCounts({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
  assert.equal(sameUnreadCounts({ a: 1 }, { a: 1, b: 0 }), false, '多了一个人就是变了');
  assert.equal(sameUnreadCounts({ a: 1 }, { a: 2 }), false);
  assert.equal(sameUnreadCounts({ a: 1, b: 2 }, { a: 1 }), false);
});

test('没变就返回**原对象**（React 才会跳过这次渲染）', () => {
  const previous = { a: 1 };
  assert.equal(mergeUnreadCounts(previous, { a: 1 }), previous, '必须同一个引用');
  const next = { a: 2 };
  assert.equal(mergeUnreadCounts(previous, next), next, '变了就换成新的');
});

test('App 与 SidePanel 的 setState 都要能"原地不动"', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /setUnreadByPerson\(previous => mergeUnreadCounts\(previous, byPerson\)\)/,
    'App 必须用 mergeUnreadCounts 兜住，内容没变就不换对象');
  assert.match(app, /const handleUnread = useCallback\(/, '回调必须是稳定引用');
  assert.match(app, /onUnread=\{handleUnread\}/, '不要传新的箭头函数下去');
  const panel = readFileSync(new URL('../src/SidePanel.tsx', import.meta.url), 'utf8');
  assert.match(panel, /setUnread\(previous => \(previous === count \? previous : count\)\)/,
    'SidePanel 也不能无条件 setState');
  const inbox = readFileSync(new URL('../src/ChatInbox.tsx', import.meta.url), 'utf8');
  assert.match(inbox, /onUnreadRef/, 'ChatInbox 的回调要走 ref');
  assert.doesNotMatch(inbox, /\}, \[unread, unreadKey, props\.onUnread\]\)/,
    '回调绝不能进 effect 依赖：父组件每次渲染都会换一个新函数');
});
