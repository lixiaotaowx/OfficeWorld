const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
const idxs = [];
let at = 0;
for (;;) { const i = t.indexOf('officeHost', at); if (i < 0) break; idxs.push(i); at = i + 10; }
console.log('officeHost occurrences:', idxs.length);
// print the surrounding of the first few
for (const i of idxs.slice(0, 6)) console.log('---\n' + t.slice(Math.max(0, i - 200), i + 260) + '\n');
