const ts=require('../WebRuntime/node_modules/typescript');
const fs=require('node:fs');
const source=fs.readFileSync('OfficeWeb/src/navigation.ts','utf8');
fs.writeFileSync('Build/navigation-test.cjs',ts.transpile(source,{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}));
const {chairSeats,findPath}=require('../../Build/navigation-test.cjs');
const THREE=require('../WebRuntime/node_modules/three');
const assert=require('node:assert/strict');
for(let i=0;i<8;i++){
 const s=chairSeats[i];const route=findPath(new THREE.Vector3(4,0,4),new THREE.Vector3(s.x,0,s.z+(i%2===0?.8:-.8)));
 assert.ok(route.length,`Seat ${i+1} reachable`);
}
assert.ok(findPath(new THREE.Vector3(.8,0,5.16),new THREE.Vector3(.2668,0,5.78)).length,'Grid-edge regression');
assert.equal(findPath(new THREE.Vector3(4,0,4),new THREE.Vector3(1,0,3.8)).length,0,'Desk blocked');
console.log('8 seats reachable, furniture and grid-edge checks passed');
