const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
// Id and xd may be class or const arrow. Search their references in the Up region:
const up = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/fn-Up.js', 'utf8');
const m1 = /new\s+(\w+)\b/.exec(up); console.log('new class in Up:', m1 && m1[1]);
const m2 = /return\s+(\w+)\(/.exec(up); console.log('call in Up:', m2 && m2[1]);
// find class Id / const Id / function Id anywhere
for (const pat of ['class Id', 'const Id', 'function Id', 'class Tp']) {
  const i = t.indexOf(pat);
  console.log(pat, '@', i);
}
// extract region around the first 'attachHostView-like' call: xd( appears in Up
const xdCall = /return\s+\w+\((\w+),\s*e\)/.exec(up);
if (xdCall) { const fn = xdCall[1]; console.log('attach fn name:', fn); const m = new RegExp('function ' + fn + '\\(').exec(t); if (m) { const start = m.index; let i = t.indexOf('{', start), depth = 0, j = i; for (; j < t.length; j++) { const c = t[j]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) break; } } fs.writeFileSync('D:/恢复_OfficeWorld_20261118/beautified/fn-attach.js', t.slice(start, j + 1)); console.log('attach body bytes:', j + 1 - start); } }
