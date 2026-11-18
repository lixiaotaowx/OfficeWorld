const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
// find all 'new <Ident>(' occurrences where ident starts with a capital letter and is 2-3 chars
const re = /new\s+([A-Z][\w$]{1,3})\b/g;
let m; const counts = {};
while ((m = re.exec(t))) counts[m[1]] = (counts[m[1]] || 0) + 1;
console.log(counts);
