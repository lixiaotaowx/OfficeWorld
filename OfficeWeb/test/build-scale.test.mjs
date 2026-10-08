import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRequire} from 'node:module';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {catalog,createBuildStore} from '../build-store.mjs';
const {createPart}=await createRequire(import.meta.url)('../../tools/export_box_library.cjs').loadMeshes();
test('all parts scale to quarter metre sizes and retain their bottom through rotations',()=>{
 for(const item of catalog)for(const pitch of [0,1])for(const rotation of [0,1]){
  const scale=item.dimensions.map(n=>Math.ceil(n*8)/4/n);
  const p={id:'test',kind:item.id,x:0,y:0,z:0,color:'#f3dfc5',rotation,pitch,scale};
  const b=new THREE.Box3().setFromObject(createPart(p));
  let [x,y,z]=item.dimensions.map((n,i)=>n*scale[i]);
  if(pitch)[y,z]=[z,y];if(rotation)[x,z]=[z,x];
  b.getSize(new THREE.Vector3()).toArray().forEach((n,i)=>assert(Math.abs(n-[x,y,z][i])<1e-5,item.id));
  assert(b.min.y>=-1e-5,item.id);
 }
});
test('scale persists across save/reload and rejects off-grid or negative dimensions',()=>{
 const path=join(mkdtempSync(join(tmpdir(),'scale-')),'world.json'),s=createBuildStore(path),user={id:'scale',name:'scale'};
 const p=s.mutate({action:'add',part:{kind:'pillar',x:20,y:0,z:0,rotation:0,scale:[2,1.25,3],color:'#f3dfc5'}},user).changed;
 assert.deepEqual(createBuildStore(path).snapshot().parts.find(n=>n.id===p.id).scale,[2,1.25,3]);
 for(const scale of [[-1,1,1],[1.1,1,1],[Infinity,1,1]])assert.throws(()=>s.mutate({action:'move',id:p.id,version:1,part:{...p,scale}},user));
});
