import test from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './helpers.mjs';
const {TELEPORT_KIND,isTeleport,teleportTarget,landingHeight,facesSource}=await import(await loadTs('buildTeleport.ts'));
const pad=(id,x,y,z)=>({id,kind:TELEPORT_KIND,color:'#f3dfc5',x,y,z,rotation:0,version:1});
const box=(id,x,y,z)=>({id,kind:'block',color:'#f3dfc5',x,y,z,rotation:0,version:1});

/**
 * 传送点的规则：**点到哪一块就传到那一块**（用户：「不是一对一，是任何地点直接传送到点击处，
 * 只需要创建一个就行」）。第一版做成"两块互相配对"，只有一块时点了什么都不发生，被判定成"无效"。
 */
test('一块就够：在任何地方点它，都会立刻站到它上面',()=>{
  assert.equal(isTeleport('teleport-pad'),true);
  assert.equal(isTeleport('block'),false);
  const lone=[pad('a',12,0,-4),box('b',4,0,0)];
  const target=teleportTarget(lone,lone[0],{x:0,z:0});
  assert.deepEqual([target.x,target.y,target.z],[12,0,-4],'落点就是点的那一块');
  assert.equal(facesSource(target,{x:0,z:0}),true,'落地要面向来路（传过来之前站的地方）');
  // 站在很远的另一个地方点它，一样去那一块（没有"必须有第二块"的限制）。
  assert.deepEqual(teleportTarget(lone,lone[0],{x:-30,z:20}).z,-4);
  // 没有位置信息（旧调用/测试）时也照传不误。
  assert.deepEqual(teleportTarget(lone,lone[0]).x,12);
});

test('点的是哪一块就去哪一块，不是"最近的另一块"',()=>{
  const near=pad('near',2,0,0),far=pad('far',20,0,0);
  const from={x:0,z:0};
  assert.deepEqual([teleportTarget([near,far],near,from).x,teleportTarget([near,far],far,from).x],[2,20]);
});

test('已经站在这一块上再点它 → 去最近的另一块（来回跳）',()=>{
  const a=pad('a',0,0,0),b=pad('b',8,0,6);
  const there=teleportTarget([a,b],a,{x:0.1,z:0.1});
  const back=teleportTarget([a,b],b,{x:8,z:6});
  assert.deepEqual([there.x,there.z],[8,6],'站在 a 上点 a → 去 b');
  assert.deepEqual([back.x,back.z],[0,0],'站在 b 上点 b → 回 a');
  assert.equal(facesSource(back,{x:8,z:6}),true,'回去也要面向来路');
  // 世界上只有这一块、又正好站在它上面：返回 undefined，调用方给一句提示（不是静默失败）。
  assert.equal(teleportTarget([a],a,{x:0,z:0}),undefined);
  // 两块重合时朝向取 0，不产生 NaN。
  const same=pad('same',0,0,0),other=pad('other',0,0,0);
  assert.equal(teleportTarget([same,other],same).heading,0);
});

test('落点高度用"脚下能站的那一层"，拿不到支撑才退回原件高度',()=>{
  const support=(x,z)=>x===3&&z===0?1.75:null;
  assert.equal(landingHeight(support,{x:3,z:0},0),1.75);
  assert.equal(landingHeight(support,{x:9,z:0},0.5),0.5);
  // 悬空平台的传送点：从 y=1.75 出发也要问得到 1.75 那一层（+0.25 的抬腿余量在调用侧）。
  const floating=(x,z,fromY)=>fromY>=1.75?1.75:null;
  assert.equal(landingHeight(floating,{x:5,z:5},2),1.75);
});
