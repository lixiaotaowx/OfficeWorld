const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
function regionOf(name) {
  const re = new RegExp('function ' + name + '\\(');
  const m = re.exec(t);
  if (!m) return null;
  const start = m.index;
  let i = t.indexOf('{', start), depth = 0, j = i;
  for (; j < t.length; j++) {
    const c = t[j];
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) break; }
  }
  return { start, end: j + 1, body: t.slice(start, j + 1) };
}
const names = ['Up', 'Tp', 'xd', 'Id', 'Ap', 'Np', '_p', 'qo', 'Ss', 'Wo', 'Dd'];
for (const n of names) {
  const r = regionOf(n);
  if (r) { fs.writeFileSync('D:/恢复_OfficeWorld_20261118/beautified/fn-' + n + '.js', r.body); console.log(n, r.body.length, 'bytes'); }
  else console.log(n, 'NOT FOUND');
}
