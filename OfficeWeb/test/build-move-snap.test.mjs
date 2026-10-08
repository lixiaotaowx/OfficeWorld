import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {loadTs} from './helpers.mjs';
const {snapMove}=await import(await loadTs('buildMoveSnap.ts'));
const box=(x,y,z,w,h,d)=>new Box3(new Vector3(x,y,z),new Vector3(x+w,y+h,z+d));
const part={id:'p',kind:'floor',color:'#f3dfc5',x:20,y:.495,z:0,rotation:0,version:1};
test('thin floors keep saved bottom height and arbitrary contact offsets',()=>{
  const local=[box(-2,0,-2,4,.25,4)];
  assert.equal(snapMove(part,0,'y',local,[]).part.y,.495);
  assert.equal(snapMove(part,.252,'y',local,[]).part.y,.745);
  assert.equal(snapMove({...part,x:20.033},.501,'x',local,[]).part.x,20.533);
  assert.equal(snapMove(part,-.252,'y',local,[]).part.y,.245);
});
test('wall faces fit exactly, fine movement can escape the magnet',()=>{
  const local=[box(-.25,0,-.25,.5,3,.5)],targets=[box(20.425,0,-2,.25,3,4)];
  const start={...part,y:0};
  const result=snapMove(start,.16,'x',local,targets);
  assert.equal(result.part.x,20.175);assert.equal(result.aligned,true);
  assert.equal(result.part.y,0);assert.equal(result.part.z,0);
  const fine=snapMove(start,.162,'x',local,targets,true);
  assert.equal(fine.part.x,20.25);assert.equal(fine.aligned,false);
});
test('real tabletop height and underground surfaces accept millimetre contact',()=>{
  const local=[box(-.1,0,-.1,.2,.2,.2)];
  const targets=[box(19,-3,-1,2,.495,2)];
  const next=snapMove({...part,y:-2},-.49,'y',local,targets);
  assert.equal(next.part.y,-2.505);assert.equal(next.aligned,true);
});
test('a hollow door does not magnetise against a part inside its opening',()=>{
  const local=[box(-1.5,0,-.15,.5,2.5,.3),box(1,0,-.15,.5,2.5,.3),box(-1.5,2.5,-.15,3,.5,.3)];
  const next=snapMove({...part,y:0},.03,'y',local,[box(19.8,-.2,-.1,.4,.25,.2)]);
  assert.equal(next.aligned,false);assert.equal(next.part.y,0);
});
