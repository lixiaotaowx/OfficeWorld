// 离座时长文案：不足一小时按分钟，满一小时按小时（用户 2026-09-15 要求）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/awayTime.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText;
const { awayLabel, awayMilliseconds, isAtDesk } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

const person = (extra) => ({
  id: 'p', clientId: 'c', name: '同事', seat: 1, character: 'a',
  previewAllowed: true, sharing: false, meeting: false, ...extra,
});

test('缺字段按在座处理，兼容还没上报的旧客户端', () => {
  assert.equal(isAtDesk(person()), true);
  assert.equal(isAtDesk(person({ atDesk: true })), true);
  assert.equal(isAtDesk(person({ atDesk: false })), false);
  assert.equal(awayMilliseconds(person(), 0, 999_999), 0);
});

test('离座时长从服务端给的那一刻继续往前走', () => {
  const away = person({ atDesk: false, awayFor: 120_000 });
  assert.equal(awayMilliseconds(away, 1_000, 1_000), 120_000);
  assert.equal(awayMilliseconds(away, 1_000, 61_000), 180_000);
  // 时钟或到达顺序有偏差时不能倒着走。
  assert.equal(awayMilliseconds(away, 5_000, 1_000), 120_000);
});

test('不足一分钟按秒、不足一小时按分钟、再长按小时，而且只有一个单位', () => {
  assert.equal(awayLabel(0), '离座 1 秒');
  assert.equal(awayLabel(10_000), '离座 10 秒');
  assert.equal(awayLabel(55_000), '离座 55 秒');
  assert.equal(awayLabel(59_999), '离座 59 秒');
  assert.equal(awayLabel(60_000), '离座 1 分钟');
  assert.equal(awayLabel(2 * 60_000), '离座 2 分钟');
  assert.equal(awayLabel(59.9 * 60_000), '离座 59 分钟');
  assert.equal(awayLabel(60 * 60_000), '离座 1 小时');
  assert.equal(awayLabel(90 * 60_000), '离座 1.5 小时');
  assert.equal(awayLabel(125 * 60_000), '离座 2.1 小时');
  assert.equal(awayLabel(11 * 3_600_000 + 20 * 60_000), '离座 11 小时');
  // 用户要求「只要一个单位」：不能出现「1 小时 5 分钟」这种拼接。
  for (const ms of [5_000, 55_000, 60_000, 120_000, 3_600_000, 90 * 60_000]) {
    assert.equal((awayLabel(ms).match(/秒|分钟|小时/g) || []).length, 1, awayLabel(ms));
  }
});
