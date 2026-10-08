import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs, withServer, wait } from './helpers.mjs';
const {setBuildSolids,buildTraverse,buildPath,supportHeight}=await import(await loadTs('buildNavigation.ts'));
const box=(x,y,z,w,h,d)=>({min:{x:x-w/2,y,z:z-d/2},max:{x:x+w/2,y:y+h,z:z+d/2}});
const ground=box(0,-.6,0,30,.6,24);
const stairs=(x=5,z=0)=>Array.from({length:4},(_,i)=>box(x,0,z+0.75-i*0.5,2,(i+1)*0.25,0.5));
test('stairs ascend and descend every riser and reach an upper floor',()=>{
  setBuildSolids([ground,...stairs(),box(5,1,-3,4,0.25,4)]);
  const top=buildTraverse({x:5,y:0,z:2},5,-3);
  assert.equal(top.y,1.25);
  assert.equal(buildTraverse(top,5,2).y,0);
  assert.equal(buildTraverse({x:5,y:0,z:-5.1},5,-3),null,'cannot climb the back wall');
  const path=buildPath({x:9,y:0,z:-3},{x:5,y:1.25,z:-3});
  assert(path.length>0,'path must detour to the stair entrance');
  assert(path.some(p=>p.z>0.5));
  let at={x:9,y:0,z:-3};
  for(const p of path) { at=buildTraverse(at,p.x,p.z); assert(at); }
  assert.equal(at.y,1.25);
});
test('rotated stairs work and the arch opening remains passable',()=>{
  const rotated=stairs(0,0).map(b=>({min:{x:b.min.z,y:b.min.y,z:-b.max.x},max:{x:b.max.z,y:b.max.y,z:-b.min.x}}));
  setBuildSolids([ground,...rotated]);
  assert.equal(buildTraverse({x:2,y:0,z:0},-0.75,0).y,1);
  setBuildSolids([ground,box(-1.25,0,0,.5,2,.5),box(1.25,0,0,.5,2,.5),box(0,2.75,0,1.5,.25,.5)]);
  assert(buildTraverse({x:0,y:0,z:1},0,-1));
  assert.equal(buildTraverse({x:1.25,y:0,z:1},1.25,-1),null);
});
test('floor expansion supports walking past old bounds, gaps and low ceilings block',()=>{
  setBuildSolids([ground,box(16,0,0,4,.25,4),box(20,0,0,4,.25,4)]);
  assert.equal(buildTraverse({x:13,y:0,z:0},21,0).y,.25);
  assert.equal(buildTraverse({x:21,y:.25,z:0},23,0),null);
  setBuildSolids([box(10000,0,0,4,.25,4)]);
  assert.equal(supportHeight(10000,0,0),.25);
  setBuildSolids([box(5,1,0,4,.25,4)]);
  assert.equal(supportHeight(5,0,0),null,'headroom too low');
  setBuildSolids([]);
});
test('motion relays upper floor heights and positions outside the starting island',async()=>{
  await withServer(async({connect})=>{
    const a=await connect('楼上'),b=await connect('楼下'),seen=[];
    b.on('motion',m=>seen.push(m));
    await wait(50);
    a.emit('motion',{x:1000,y:30.25,z:-200,rot:0,moving:true});
    await wait(150);
    assert.equal(seen[0].y,30.25);
    assert.equal(seen[0].x,1000);
    assert.equal(seen[0].z,-200);
  });
});

test('underground stairs and floor retain negative walking heights',()=>{
  const lower=stairs(20).map(b=>({min:{...b.min,y:b.min.y-4},max:{...b.max,y:b.max.y-4}}));
  setBuildSolids([...lower,box(20,-4.25,2.5,4,.25,3),box(20,-3,-3,4,.25,4)]);
  const top=buildTraverse({x:20,y:-4,z:2},20,-3);
  assert.equal(top.y,-2.75);
  assert.equal(buildTraverse(top,20,2).y,-4);
  setBuildSolids(null);
});

test('underground motion is relayed without snapping the remote person to ground',async()=>{
  await withServer(async({connect})=>{
    const a=await connect('地下甲'),b=await connect('地下乙');
    const received=new Promise(resolve=>b.once('motion',resolve));
    a.emit('motion',{x:20,y:-100.25,z:0,rot:0,moving:true});
    assert.equal((await received).y,-100.25);
  });
});


test('narrow and tall stairs remain walkable both ways, including elevated platforms',()=>{
 for(const width of [1,2])for(const count of [4,8])for(const base of [-4,0,20]) {
  const x=30,depth=count*.5;
  const steps=Array.from({length:count},(_,i)=>box(x,base,depth/2-.25-i*.5,width,(i+1)*.25,.5));
  setBuildSolids([...steps,box(x,base-.25,depth/2+1,2,.25,2),box(x,base+count*.25,-depth/2-1,2,.25,2)]);
  const start={x,y:base,z:depth/2+1};
  const top=buildTraverse(start,x,-depth/2-1);
  assert(top);assert.equal(top.y,base+count*.25+.25);
  assert.equal(buildTraverse(top,x,start.z).y,base);
 }
 setBuildSolids(null);
});
