import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require = createRequire(import.meta.url);
export function loadMedia(file, overrides = {}) {
  const code = ts.transpileModule(readFileSync(new URL('../src/' + file + '.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(id => overrides[id] ??
    (id.startsWith('./') ? loadMedia(id.slice(2), overrides) : require(id)), exports);
  return exports;
}
