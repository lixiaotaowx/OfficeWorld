import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {loadTs} from './helpers.mjs';
const {modalParts,nextConstraint,numericError}=await import(await loadTs('buildModalRules.ts'));
const {BuildModalTransform}=await import(await loadTs('BuildModalTransform.ts'));
const {partCenter}=await import(await loadTs('buildPartCenter.ts'));
const {createPart}=await import(await loadTs('buildMeshes.ts'));
const part={id:'a',kind:'pillar',color:'#b4c5a0',x:0,y:0,z:0,rotation:0,version:1};
const v=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const intent=(mode,constraint,amount=1,delta=v())=>({mode,constraint,amount,delta});
const axis=(a,plane=false,local=false)=>({axis:a,plane,local});

test('S and R retain the geometry centre while bottom-origin storage is rebased',()=>{
  const original={...part,x:8,y:4,z:-2};
  const pivot=partCenter(original);
  const [scaled]=modalParts([original],pivot,intent('scale',undefined,2));
  assert.deepEqual(scaled.scale,[2,2,2]);
  assert.equal(scaled.y,2.5,'scale grows equally above and below the centre');
  assert.ok(partCenter(scaled).distanceTo(pivot)<1e-8);
  for(const a of ['x','y','z']){
    const [rotated]=modalParts([original],pivot,intent('rotate',axis(a),90));
    assert.ok(partCenter(rotated).distanceTo(pivot)<1e-8,`${a} rotation remains centred`);
  }
});

test('centre measurements agree with real asymmetric, scaled and tilted meshes',()=>{
  for(const shape of ['pillar','beam','chest','screen','chair'].map(kind=>({kind})).concat([{kind:'desk',fixture:'desk-0'}]))for(const pose of [
    {},{rotation:1},{pitch:1},{roll:1},{rotation:3,pitch:1,roll:2,scale:[2,.5,1.5]}]){
    const p={...part,...shape,x:7,y:3,z:-4,...pose};
    const mesh=createPart(p);
    const actual=new THREE.Box3().setFromObject(mesh).getCenter(v());
    assert.ok(partCenter(p).distanceTo(actual)<1e-7,`${shape.kind} ${JSON.stringify(pose)}`);
    mesh.traverse(o=>{if(o instanceof THREE.Mesh && o.geometry.type!=='BoxGeometry')o.geometry.dispose();});
  }
});

test('world / local / free axis cycle and planar exclusions',()=>{
  const world=nextConstraint(undefined,'x',false);
  const local=nextConstraint(world,'x',false);
  assert.deepEqual(world,axis('x'));assert.deepEqual(local,axis('x',false,true));
  assert.equal(nextConstraint(local,'x',false),undefined);
  const [locked]=modalParts([part],v(),intent('translate',world,1,v(2,3,4)));
  assert.deepEqual([locked.x,locked.y,locked.z],[2,0,0]);
  const [plane]=modalParts([part],v(),intent('translate',axis('y',true),1,v(2,3,4)));
  assert.deepEqual([plane.x,plane.y,plane.z],[2,0,4]);
  const [rotated]=modalParts([{...part,rotation:1}],v(),intent('translate',local,1,v(0,0,-2)));
  assert.deepEqual([rotated.x,rotated.y,rotated.z],[0,0,-2]);
});

test('group rotation, world scale of a rotated part, grid dimensions and colour',()=>{
  const parts=[{...part,x:-2},{...part,id:'b',x:2}];
  const rows=modalParts(parts,v(),intent('rotate',axis('y'),90));
  assert.deepEqual(rows.map(p=>[p.x,p.z,p.rotation]),[[0,2,1],[0,-2,1]]);
  const scaled=modalParts(parts,v(),intent('scale',undefined,2));
  assert.deepEqual(scaled.map(p=>[p.x,p.scale]),[[-4,[2,2,2]],[4,[2,2,2]]]);
  const [worldX]=modalParts([{...part,rotation:1}],v(),intent('scale',axis('x'),2));
  assert.deepEqual(worldX.scale,[1,1,2],'world X corresponds to the rotated local Z dimension');
  assert.equal(worldX.color,part.color);
  const [furniture]=modalParts([{...part,kind:'desk',y:.041}],v(),intent('translate',axis('x'),1,v(.37,2,3)));
  assert.equal(furniture.x,.25);assert.equal(furniture.y,.041);
});

test('numeric validation never silently accepts unsupported rotations or inverted scale',()=>{
  for(const value of ['-','.','1e500'])assert.ok(numericError('translate',value));
  assert.ok(numericError('scale','0'));assert.ok(numericError('scale','-2'));
  assert.ok(numericError('rotate','45'));
  assert.equal(numericError('rotate','-90'),'');assert.equal(numericError('translate','-.25'),'');
});

function operator() {
  let preview,locked=false,commits=0,hint,state;
  const camera=new THREE.PerspectiveCamera(50,1,.1,1000);
  camera.position.set(5,10,10);camera.lookAt(0,0,0);camera.updateMatrixWorld(true);
  const modal=new BuildModalTransform(camera,{getBoundingClientRect:()=>({left:0,top:0,width:600,height:600})},{
    selection:()=>[part],pivot:()=>v(),preview:p=>preview=p,commit:()=>commits++,
    lock:value=>locked=value,hint:value=>hint=value,state:value=>state=value,
  });
  const key=(key,shiftKey=false)=>modal.key({key,shiftKey,repeat:false});
  return {modal,key,read:()=>({preview,locked,commits,hint,state})};
}

test('modal numeric input: 2 means factor, Backspace edits, Esc rolls back without saving',()=>{
  const op=operator();op.modal.begin('scale');op.key('2');
  assert.deepEqual(op.read().preview[0].scale,[2,2,2]);
  op.key('Backspace');op.key('3');assert.deepEqual(op.read().preview[0].scale,[3,3,3]);
  op.key('Escape');assert.equal(op.read().commits,0);assert.equal(op.read().locked,false);
  assert.deepEqual(op.read().preview,[part]);
});

test('modal rejects 45°, retains operator, then accepts a corrected quarter turn',()=>{
  const op=operator();op.modal.begin('rotate');op.key('4');op.key('5');op.key('Enter');
  assert.equal(op.read().commits,0);assert.equal(op.read().locked,true);assert.ok(op.modal.active);
  op.key('Backspace');op.key('Backspace');op.key('9');op.key('0');op.key('Enter');
  assert.equal(op.read().commits,1);assert.equal(op.read().preview[0].rotation,1);
  assert.equal(op.read().locked,false);assert.equal(op.modal.active,false);
});

test('numeric move is signed and axis-only; planar input excludes the selected axis',()=>{
  const op=operator();op.modal.begin('translate',true);op.key('x');op.key('-');op.key('2');
  assert.equal(op.read().preview[0].x,-2);
  op.key('y',true);assert.equal(op.read().preview[0].y,0);
  op.key('z');op.key('Enter');assert.equal(op.read().preview[0].z,-2);assert.equal(op.read().commits,1);
});

test('unaffected dimensions and a no-op operator preserve original furniture size',()=>{
  const furniture={...part,kind:'desk',y:.041};
  assert.deepEqual(modalParts([furniture],v(),intent('scale',undefined,1)),[furniture]);
  const [scaled]=modalParts([furniture],v(),intent('scale',axis('x'),2));
  assert.equal(scaled.scale[1],1);assert.equal(scaled.scale[2],1);
});

test('Shift precision is continuous when switched on and off during mouse scaling',()=>{
  const op=operator();
  op.modal.move({clientX:300,clientY:300,shiftKey:false});op.modal.begin('scale');
  op.modal.move({clientX:480,clientY:300,shiftKey:false});
  assert.deepEqual(op.read().preview[0].scale,[2,2,2]);
  op.modal.move({clientX:480,clientY:300,shiftKey:true});
  assert.deepEqual(op.read().preview[0].scale,[2,2,2],'pressing Shift does not jump');
  op.modal.move({clientX:660,clientY:300,shiftKey:true});
  assert.deepEqual(op.read().preview[0].scale,[2,25/12,2]);
  op.modal.move({clientX:660,clientY:300,shiftKey:false});
  assert.deepEqual(op.read().preview[0].scale,[2,25/12,2],'releasing Shift does not jump');
});

test('switching operators restores the initial preview and cancellation retains duplicates',()=>{
  const op=operator();op.modal.begin('translate',true);op.key('x');op.key('2');op.key('s');
  assert.equal(op.read().preview[0].x,0);assert.ok(op.modal.copied);op.key('Escape');
  assert.equal(op.read().commits,0);assert.match(op.read().hint,/副本保留原位/);
});
