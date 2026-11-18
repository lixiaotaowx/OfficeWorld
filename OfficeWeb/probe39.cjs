const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
// The second useSyncExternalStore occurrence is the host-mode useHostState.
// Locate its enclosing function start and the end of the returned memo.
const hits = [];
let at = 0;
for (;;) { const i = t.indexOf('useSyncExternalStore', at); if (i < 0) break; hits.push(i); at = i + 10; }
const startCtx = t.lastIndexOf('\nfunction ', hits[1]);
const endProbe = t.slice(hits[1], hits[1] + 60000);
const endIdx = endProbe.lastIndexOf('}, [');
const end = hits[1] + (endIdx >= 0 ? endIdx + 400 : 40000);
const region = t.slice(startCtx, end);
fs.writeFileSync('D:/恢复_OfficeWorld_20261118/beautified/host-adapter-region.js', region);
console.log('wrote region:', startCtx, '->', end, 'bytes:', region.length);
