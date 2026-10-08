import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as server from '../look.mjs';
const source = readFileSync(new URL('../src/look.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext } }).outputText;
const client = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('legacy expression fields never override shared state poses or outfit identity', () => {
  for (const expression of [...client.EXPRESSION_IDS, undefined, 'auto', 'invalid', {}]) {
    const outfit = { color: 'navy', accessories: { hair: 'none', hat: 'tophat', beard: 'full', glasses: 'black' } };
    const raw = { ...outfit, expression };
    assert.deepEqual(server.sanitizeAppearance(raw), outfit);
    assert.deepEqual(client.resolveAppearance(raw), outfit);
    assert.equal(client.sameAppearance(raw, outfit), true);
    assert.equal(server.sameAppearance(raw, outfit), true);
    assert.equal(client.appearanceKey(raw), client.appearanceKey(outfit));
  }
});
