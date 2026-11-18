const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
// Find the HostStateStore class: it has getSnapshot/subscribe/setViewAttached and views officeHost.state.get
const i0 = t.indexOf('function Ss()');
const i1 = t.indexOf('officeHost.state.get') >= 0 ? t.indexOf('officeHost.state.get') : t.indexOf('.state.get');
console.log('Ss at', i0, 'state.get at', i1);
// print a generous region around the store definition (search 'attachHostView'-like usage: .subscribe( and .getSnapshot
let store = -1;
const pat = /getSnapshot\(\)/g;
let m; const hits = [];
while ((m = pat.exec(t)) && hits.length < 40) hits.push(m.index);
console.log('getSnapshot hits:', hits.length);
// find the one near 'officeHost' references
const hostIdx = idxs = [];
let at = 0; for (;;) { const i = t.indexOf('officeHost', at); if (i < 0) break; idxs.push(i); at = i + 10; }
const near = hits.filter(h => idxs.some(x => Math.abs(x - h) < 6000));
console.log('getSnapshot near officeHost:', near.slice(0, 6));
if (near.length) {
  const start = Math.max(0, near[0] - 3000);
  fs.writeFileSync('D:/恢复_OfficeWorld_20261118/beautified/host-adapter-region.js', t.slice(start, near[near.length - 1] + 4000));
  console.log('wrote region', start, '->', near[near.length - 1] + 4000);
}
