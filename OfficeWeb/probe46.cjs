const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
const m = /setViewAttached/.exec(t);
console.log('setViewAttached at:', m && m.index);
if (m) {
  const back = t.slice(Math.max(0, m.index - 6000), m.index);
  const decl = Math.max(back.lastIndexOf('class '), back.lastIndexOf('function '));
  const abs = Math.max(0, m.index - 6000) + decl;
  let i = t.indexOf('{', abs), depth = 0, j = i;
  for (; j < t.length; j++) { const c = t[j]; if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) break; } }
  fs.writeFileSync('D:/恢复_OfficeWorld_20261118/beautified/store-region.js', t.slice(abs, j + 1));
  console.log('wrote store region bytes:', j + 1 - abs);
  console.log('decl head:', back.slice(decl, decl + 100).replace(/\n/g, ' '));
}
