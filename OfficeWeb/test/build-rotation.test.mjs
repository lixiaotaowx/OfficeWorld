import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRequire} from 'node:module';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {catalog,dimensions,createBuildStore} from '../build-store.mjs';
const require=createRequire(import.meta.url);
const {createPart}=await require('../../tools/export_box_library.cjs').loadMeshes();
test('all components: three-axis bounds agree with server and keep bottom anchored',()=>{
  for(const item of catalog) for(let pitch=0;pitch<4;pitch++) for(let roll=0;roll<4;roll++) for(let rotation=0;rotation<4;rotation++) {
    if(!pitch&&!roll)continue;
    const part={id:'test',kind:item.id,color:'#f3dfc5',x:20,y:-3,z:0,pitch,roll,rotation};
    const bounds=new THREE.Box3().setFromObject(createPart(part));
    const size=bounds.getSize(new THREE.Vector3()).toArray();
    dimensions(part).forEach((n,i)=>assert(Math.abs(n-size[i])<.00011,item.id));
    assert(Math.abs(bounds.min.y+3)<.00001,item.id+' bottom');
    assert(Math.abs(bounds.getCenter(new THREE.Vector3()).x-20)<.00001,item.id+' centre');
  }
});
test('tilted placement persists, moves, and rejects malformed orientation',()=>{
  const path=join(mkdtempSync(join(tmpdir(),'rotation-')),'world.json');
  const store=createBuildStore(path),user={id:'u',name:'test'};
  const input={kind:'pillar',color:'#f3dfc5',x:20,y:11,z:0,rotation:0,roll:1,pitch:0};
  const saved=store.mutate({action:'add',part:input},user).changed;
  assert.equal(createBuildStore(path).snapshot().parts.at(-1).roll,1);
  assert.equal(dimensions(saved)[1],.5);
  assert.equal(store.mutate({action:'add',part:{...input,roll:0}},user).changed.y,11);
  for(const value of [-1,4,.5,'1',null])assert.throws(()=>store.mutate({action:'add',part:{...input,pitch:value}},user),/翻转/);
  const moved=store.mutate({action:'move',id:saved.id,version:1,part:{...saved,y:0,pitch:1}},user).changed;
  assert.equal(moved.pitch,1);assert.equal(moved.roll,1);
});
