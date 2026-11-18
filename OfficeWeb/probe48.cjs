const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
let at = 0; const hits = [];
for (;;) { const i = t.indexOf('kind: "view"', at); if (i < 0) break; hits.push(i); at = i + 12; }
console.log('kind:view hits:', hits);
const eHits = [];
at = 0;
for (;;) { const i = t.indexOf('epoch', at); if (i < 0) break; eHits.push(i); at = i + 5; }
console.log('epoch hits:', eHits);
// the store class contains epoch; slice around the first epoch hit that also has "view" nearby
for (const e of eHits) {
  const window = t.slice(Math.max(0, e - 3000), e + 3000);
  if (window.includes('kind: "view"') || window.includes('subscribe')) {
    console.log('epoch at', e, 'near subscribe/view');
    const back = window.lastIndexOf('class ');
    console.log('class start in window:', back >= 0 ? window.slice(back, back + 80).replace(/\n/g, ' ') : 'none');
    break;
  }
}
