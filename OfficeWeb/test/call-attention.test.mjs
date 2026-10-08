// 有人用三种方式打过来时该提醒谁、提醒得多急（用户 2026-09-20）。
//
// 三条规则各占一边：谁在响（纯函数）、亮多快（立刻，不是悬停那一路的慢慢亮）、
// 以及"一通电话响 30 秒，中途不能黑掉"（每隔几秒补一次）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/callAttention.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText;
const { callAttention, CALL_ATTENTION_MS, CALL_GLOW_FADE_MS } =
  await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

const look = (color) => ({ color, accessories: { glasses: 'none', hair: 'short', beard: 'none', hat: 'none' } });
const people = [
  { id: 'a', name: '同事甲', appearance: look('ink') },
  { id: 'b', name: '客户乙', appearance: look('rose') },
];
const invite = (extra = {}) => ({ id: 'r1', from: 'a', target: 'me', kind: 'voice', name: '同事甲', ...extra });

test('正在响的邀请 → 提醒谁、用什么外观、哪种场合、哪一通', () => {
  const call = callAttention([invite()], people);
  assert.deepEqual(call, { id: 'a', name: '同事甲', appearance: look('ink'), mode: 'call',
    requestId: 'r1', kind: 'voice', offer: false },
  '打电话过来要"用当前角色大小打招呼"，所以永远是 call；还要带上邀请本身（谁、怎么打过来的、能不能接）');
  // 三种方式（看我的屏幕 / 他的屏幕给我 / 语音）到这儿是同一条邀请，都该提醒。
  for (const kind of ['screen', 'voice']) {
    assert.equal(callAttention([invite({ kind })], people)?.id, 'a', kind + ' 也要提醒');
    assert.equal(callAttention([invite({ kind, offer: true })], people)?.id, 'a', '带 offer 的也一样');
  }
  // 屏幕邀请要带上"是对方给我看"还是"要看我的屏幕"（气泡上写的是两句不同的话）。
  assert.equal(callAttention([invite({ kind: 'screen', offer: true })], people)?.offer, true);
  assert.equal(callAttention([invite({ kind: 'screen', offer: false })], people)?.offer, false);
  assert.equal(callAttention([invite({ kind: 'nonsense' })], people)?.kind, 'screen',
    '不认识的种类当屏幕邀请（老服务端只发这两种）');
});

test('没有在响的邀请就什么都不做', () => {
  assert.equal(callAttention([], people), null);
  assert.equal(callAttention(undefined, people), null);
  assert.equal(callAttention([{ id: '', from: 'a' }], people), null, '没 id 的不算');
  assert.equal(callAttention([{ id: 'r1', from: '' }], people), null, '不知道是谁就不提醒');
});

test('同时来好几通只提醒最前面的那一通', () => {
  const call = callAttention([invite({ from: 'b', name: '客户乙' }), invite({ id: 'r2', from: 'a' })], people);
  assert.equal(call.id, 'b', '先来的那一通先提醒');
  assert.equal(call.appearance.color, 'rose');
});

test('人不在名单里也给一个能用的提醒（外观留空，头像条有兜底）', () => {
  const call = callAttention([invite({ from: 'gone', name: '老同事' })], people);
  assert.equal(call.id, 'gone');
  assert.equal(call.appearance, undefined, '查不到人就留空，不要崩');
});

test('提醒的频次与"亮多快"是写死的常量，别退化成慢慢亮', () => {
  assert.ok(CALL_ATTENTION_MS > 0 && CALL_ATTENTION_MS < 4300,
    '补提醒要比绿光的存活时间（约 4.3 秒）密，否则响着响着就黑了：' + CALL_ATTENTION_MS);
  assert.ok(CALL_GLOW_FADE_MS < 500, '打电话过来是"急事"：绿光立刻亮，不是悬停那种慢慢亮');
  const hook = readFileSync(new URL('../src/useCallAttention.ts', import.meta.url), 'utf8');
  assert.match(hook, /previewGlow\?\.\(\{ sharing: latest\.current\.sharing, fade: CALL_GLOW_FADE_MS \}\)/,
    '绿光要用"立刻亮"的时长，并且共享屏幕时照旧收掉');
  assert.match(hook, /mode: call\.mode/, '头像条要收到 mode: call');
  assert.match(hook, /setInterval\(fire, CALL_ATTENTION_MS\)/, '响着的期间要一直补提醒');
  assert.match(hook, /\[key\]/, '只跟着"还有哪几通在响"重建；邀请处理掉就停');
  assert.equal(hook.includes('useOffice'), false, '不该自己去连 socket，规则靠传进来的 lists');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /useCallAttention\(\{ requests: office\.requests, people: office\.people, sharing: office\.sharing \}\)/,
    '主窗口要真的把它挂上');
});
