const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
// beautified may keep minified member names; search for the exact behavior:
// 'kind:"view"' command handler + 'epoch' envelope + 'full' snapshot.
for (const probe of ['kind: "view"', 'kind:"view"', 'epoch', '"full"', 'office:host-state-get']) {
  const n = (t.match(new RegExp(probe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  console.log(probe, '->', n);
}
// find the view command in the actions function Ap we extracted
const ap = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/fn-Ap.js', 'utf8');
console.log('--- fn-Ap.js ---');
console.log(ap.slice(0, 1400));
