const fs = require('fs');
const t = fs.readFileSync('D:/恢复_OfficeWorld_20261118/beautified/main.js', 'utf8');
// Id is likely a function used with new: search "(new Id" already found. Search var/let/const/function Id declarations with other syntax
for (const pat of ['Id=class', 'Id = class', 'function Id(', 'Id=function', 'var Id', 'let Id', ' Id(', 'Id)']) {
  const i = t.indexOf(pat); if (i >= 0) console.log(pat, '@', i, ':', t.slice(i, i + 120).replace(/\n/g, ' '));
}
