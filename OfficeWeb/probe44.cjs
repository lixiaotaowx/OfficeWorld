const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
// 'new Id' means Id is a class defined elsewhere maybe as `class Id{` (no space)
const m = /\bclass Id\s*\{/.exec(t) || /\bclass Id\s*\(/.exec(t);
console.log('class Id found:', Boolean(m));
// maybe it's minified as an object literal factory assigned earlier: search "Id=" preceded by space or = in top-level scope
const m2 = /[,;{(]\s*Id\s*=/.exec(t);
console.log('Id assignment:', m2 && t.slice(m2.index, m2.index + 150).replace(/\n/g, ' '));
// If Id is a class, brace-walk its body
if (m) {
  let i = t.indexOf('{', m.index), depth = 0, j = i;
  for (; j < t.length; j++) { const c = t[j]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) break; } }
  fs.writeFileSync('D:/恢复_OfficeWorld_20261118/beautified/class-store.js', t.slice(m.index, j + 1));
  console.log('store class bytes:', j + 1 - m.index);
}
