import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import * as THREE from 'three';
import {loadTs} from './helpers.mjs';
const require=createRequire(import.meta.url);
const {loadMeshes}=require('../../tools/export_box_library.cjs');
const {createPart}=await loadMeshes();
const {collisionBoxes}=await import('../../Build/BoxLibraryModules/'+process.pid+'/buildArch.mjs');
const {setBuildSolids,buildTraverse}=await import(await loadTs('buildNavigation.ts'));
const make=(rotation=0)=>createPart({id:'round',kind:'arch',x:0,y:0,z:0,rotation,color:'#f3dfc5',version:1});
test('arch has square outer corners and a real semicircular opening, no bevel',()=>{
  const root=make();root.updateMatrixWorld(true);
  const mesh=root.children[0];
  assert.equal(mesh.geometry.type,'ExtrudeGeometry');
  assert.equal(mesh.geometry.parameters.options.bevelEnabled,false);
  const bounds=new THREE.Box3().setFromObject(root);
  assert.deepEqual(bounds.min.toArray(),[-1.5,0,-.25]);
  assert.deepEqual(bounds.max.toArray(),[1.5,3,.25]);
  const hit=(x,y)=>new THREE.Raycaster(new THREE.Vector3(x,y,2),new THREE.Vector3(0,0,-1)).intersectObject(root,true).length>0;
  assert(hit(1.3,2.9));assert(hit(-1.3,2.9));assert(hit(0,2.9));
  assert(!hit(0,2.4));assert(hit(0,2.6));
  assert(!hit(.8,2.05));assert(hit(.8,2.2));
  assert(!hit(0,.1));assert(!hit(1.51,2.9));
});
test('new curved arch remains passable in both orientations and its feet stay separate',()=>{
  for(const rotation of [0,1]) {
    const boxes=collisionBoxes(make(rotation));
    assert.equal(boxes.filter(b=>b.min.y===0).length,2);
    setBuildSolids([{min:{x:-15,y:-.6,z:-12},max:{x:15,y:0,z:12}},...boxes]);
    assert(buildTraverse(rotation ? {x:2,y:0,z:0} : {x:0,y:0,z:2},rotation ? -2 : 0,rotation ? 0 : -2));
    assert.equal(buildTraverse(rotation ? {x:2,y:0,z:1.25} : {x:1.25,y:0,z:2},rotation ? -2 : 1.25,rotation ? 1.25 : -2),null);
  }
  setBuildSolids(null);
});
