import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fixtureFor} from '/home/ubuntu/officeweb/scene-fixtures.mjs';
const root='/home/ubuntu/officeweb';
const file=root+'/build-world.json';
const before=JSON.parse(fs.readFileSync(file));
const roster=JSON.parse(fs.readFileSync(root+'/state.json')).seats || {};
const ids=JSON.parse(fs.readFileSync(root+'/build-world.json.seats.json'));
const deleted=[],kept=[];
for(const part of before.parts){
 const seat=fixtureFor(part)?.seat;
 const index=seat?.index ?? ids[part.id];
 const unusedDesk=part.kind==='desk' && index!==undefined && !roster[index];
 const publicChair=part.kind==='chair' && Boolean(seat) && seat.index===undefined;
 const floating=/^(distant-|pillar-)/.test(part.fixture || '');
 if(unusedDesk || publicChair || floating)deleted.push(part);
 else kept.push(part);
}
const backup=root+'/backups/manual-scene-cleanup-'+new Date().toISOString().replace(/[:.]/g,'-');
fs.mkdirSync(backup,{recursive:true});
fs.copyFileSync(file,backup+'/build-world.json');
const next={...before,parts:kept,revision:before.revision+1};
fs.writeFileSync(file+'.cleanup-next',JSON.stringify(next));
fs.renameSync(file+'.cleanup-next',file);
const after=JSON.parse(fs.readFileSync(file));
assert.deepEqual(after.parts,kept);
for(const [key,value] of Object.entries(before))if(!['parts','revision'].includes(key))assert.deepEqual(after[key],value);
for(const p of kept)assert.deepEqual(before.parts.find(row=>row.id===p.id),p);
assert(kept.filter(p=>p.kind==='desk').every(p=>roster[fixtureFor(p)?.seat?.index ?? ids[p.id]]));
console.log(JSON.stringify({backup,before:before.parts.length,after:after.parts.length,revision:after.revision,
 removed:deleted.map(p=>({id:p.id,fixture:p.fixture,kind:p.kind})),keptDesks:kept.filter(p=>p.kind==='desk').length,
 unrelatedPartsAndChestsUnchanged:true}));
