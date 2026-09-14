import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const js = ts.transpileModule(readFileSync(new URL('../src/presenceResources.ts', import.meta.url), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { retainPresent } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
test('成员离线清除旧连接预览/位置，保留现有成员且不重复分配', () => {
  const values = { a: 'own-frame', b: 'departed-frame' };
  assert.equal(retainPresent(values, new Set(['a', 'b'])), values);
  assert.deepEqual(retainPresent(values, new Set(['a'])), { a: 'own-frame' });
  assert.deepEqual(retainPresent(values, new Set()), {});
  assert.equal(values.b, 'departed-frame');
});
