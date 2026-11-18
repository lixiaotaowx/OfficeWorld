const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
// HostStateStore likely built with class syntax + useSyncExternalStore consumer nearby.
// Search for 'useSyncExternalStore' occurrences and print surroundings.
let at = 0; const hits = [];
for (;;) { const i = t.indexOf('useSyncExternalStore', at); if (i < 0) break; hits.push(i); at = i + 10; }
console.log('useSyncExternalStore:', hits.length);
for (const i of hits) console.log('---\n' + t.slice(Math.max(0, i - 500), i + 300) + '\n');
