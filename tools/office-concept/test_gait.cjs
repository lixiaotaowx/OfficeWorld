const ts=require('../WebRuntime/node_modules/typescript');
const fs=require('node:fs'),assert=require('node:assert/strict');
const THREE=require('../WebRuntime/node_modules/three');
for(const [src,dest] of [['navigation','navigation-test'],['OfficeAvatar','avatar-test']]){
 const code=ts.transpile(fs.readFileSync(`OfficeWeb/src/${src}.ts`,'utf8'),{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}).replace('require("./navigation")','require("./navigation-test.cjs")');
 fs.writeFileSync(`Build/${dest}.cjs`,code);
}
const {OfficeAvatar}=require('../../Build/avatar-test.cjs');
for(const fps of [30,60,144]){
 const a=Object.create(OfficeAvatar.prototype);
 Object.assign(a,{root:new THREE.Group(),model:new THREE.Group(),keys:new Set(),clock:{getDelta:()=>1/fps},path:Array.from({length:20},(_,i)=>new THREE.Vector3((i+1)*.28,0,0)),pendingSeat:null,sitting:false,lastState:'',report:()=>{},mixer:{update:()=>{}},play:(moving)=>{a.moving=moving;}});
 let prior=0,frames=0;
 while(a.path.length&&frames++<1000){
  a.update();const delta=a.root.position.x-prior;
  assert.ok(a.moving,'No idle at intermediate waypoint');
  if(a.path.length)assert.ok(Math.abs(delta-1.65/fps)<1e-7,'Continuous speed across waypoint');
  prior=a.root.position.x;
 }
 assert.ok(Math.abs(a.root.position.x-5.6)<1e-7);a.update();assert.equal(a.moving,false);
}
console.log('30/60/144 FPS: continuous waypoint speed; no mid-route idle; stops at destination');
