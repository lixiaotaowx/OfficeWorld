import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRequire} from 'node:module';
import {catalog} from '../build-store.mjs';
const require=createRequire(import.meta.url);
const {createPart}=await require('../../tools/export_box_library.cjs').loadMeshes();
const make=(kind,rotation=0)=>createPart({id:kind,kind,rotation,x:0,y:0,z:0,color:'#f3dfc5'});
test('all catalog physical specifications and origin-centred envelopes cover every rotation',()=>{
  for(const item of catalog) for(let rotation=0;rotation<4;rotation++) {
    const b=new THREE.Box3().setFromObject(make(item.id,rotation));
    const size=b.getSize(new THREE.Vector3()).toArray();
    const expected=rotation%2?[item.dimensions[2],item.dimensions[1],item.dimensions[0]]:item.dimensions;
    const envelope=rotation%2?[item.size[2],item.size[1],item.size[0]]:item.size;
    for(let axis=0;axis<3;axis++) {
      assert(Math.abs(size[axis]-expected[axis])<.0001,`${item.id} rotation ${rotation} axis ${axis}`);
      assert(b.min.getComponent(axis)>=-(axis===1?0:envelope[axis]/2)-1e-6,item.id+' min envelope');
      assert(b.max.getComponent(axis)<=envelope[axis]*(axis===1?1:.5)+1e-6,item.id+' max envelope');
    }
  }
});
test('structural modules agree: pillar 0.5m square, door feet 2.5m apart, stair risers 0.25m',()=>{
  assert.deepEqual(catalog.find(p=>p.id==='pillar').dimensions,[.5,3,.5]);
  assert.deepEqual(catalog.find(p=>p.id==='beam').dimensions,[4,.5,.5]);
  const door=make('door');
  assert.equal(door.children[1].position.x-door.children[0].position.x,2.5);
  const stairs=make('stairs').children;
  assert.equal(stairs.length,4);
  stairs.forEach((s,i)=>{
    assert.equal(s.position.y+s.scale.y/2,(i+1)*.25);
    assert.equal(s.scale.z,.5);
  });
});


test('new stair modules keep 25cm risers and 50cm treads',()=>{
 for(const [kind,width,steps] of [['stairs-narrow',1,4],['stairs-tall',2,8],['stairs-narrow-tall',1,8]]) {
  const stairs=make(kind).children;assert.equal(stairs.length,steps);
  stairs.forEach((mesh,i)=>{
   assert.equal(mesh.scale.x,width);assert.equal(mesh.scale.z,.5);
   assert.equal(mesh.position.y+mesh.scale.y/2,(i+1)*.25);
  });
 }
});
