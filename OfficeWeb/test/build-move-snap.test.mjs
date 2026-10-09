import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {createRequire} from 'node:module';
import {loadTs} from './helpers.mjs';
const require=createRequire(import.meta.url);
const {catalog}=await import('../build-store.mjs');
const {snapMove}=await import(await loadTs('buildMoveSnap.ts'));
const {BUILD_GRID,gridSnap,isStructural}=await import(await loadTs('buildGrid.ts'));
const box=(x,y,z,w,h,d)=>new Box3(new Vector3(x,y,z),new Vector3(x+w,y+h,z+d));
const part={id:'p',kind:'floor',color:'#f3dfc5',x:20,y:.495,z:0,rotation:0,version:1};
void createRequire;

/**
 * 拖动步长（用户 2026-10-08：「有些部件额移动单位有问题 没有按照一个格子的大小步长，完整检查」→
 * 2026-10-09「我有两个拱门 差距一直都是一个小缝 对不齐」）。
 *
 * 规则：**水平两轴一定落在 0.25 网格上、每次正好走整数格**；**结构件（建筑/玩法）的高度也落格**
 * ——两件各自站在略有差异的面上时（−4.605 / −4.564），落格之后拖一下就能对齐；**家具/摆件的 y 仍按
 * 原点加整格、保留毫米接触精度**（叠在 1.42m 桌面上必须精确落在那一层）。
 */
test('拖动＝整格：水平两轴落点吸附到网格，离格的老部件拖一下回格',()=>{
  const local=[box(-2,0,-2,4,.25,4)];
  // 起点已经在格上：位移就是整数格（这里 delta 的零头被四舍五入掉）。
  assert.equal(snapMove({...part,x:20},.1,'x',local,[]).part.x,20,'不到半格不动');
  assert.equal(snapMove({...part,x:20},.3,'x',local,[]).part.x,20.25);
  assert.equal(snapMove({...part,x:20},.6,'x',local,[]).part.x,20.5);
  assert.equal(snapMove({...part,x:20},-.37,'x',local,[]).part.x,19.75,'-0.37 只算一格');
  // 起点离格（老存档里贴面/桥接留下的毫米偏置）：一步就回到网格，而不是带着偏置走一辈子。
  const off=snapMove({...part,x:20.033},.501,'x',local,[]);
  assert.equal(off.part.x,20.5,'20.033 + 0.5 → 吸到 20.5（离格偏置被抹掉）');
  assert.equal(off.part.z,0,'没拖的轴不许动');
  assert.equal(snapMove({...part,z:-3.11},-.02,'z',local,[]).part.z,-3,'小于半格也把落点拉回网格');
  // 结构件（floor 是「建筑」）的高度也落格：0.495 → 0.5，一步就是一格。
  assert.equal(snapMove(part,0,'y',local,[]).part.y,.5);
  assert.equal(snapMove(part,.252,'y',local,[]).part.y,.75);
  assert.equal(snapMove(part,-.252,'y',local,[]).part.y,.25);
  // 家具/摆件的 y 保留毫米接触精度（书桌 1.42m、方块顶 0.34m 这种层不能被拽到整格上）。
  const prop={...part,kind:'mug',y:.495};
  assert.equal(snapMove(prop,0,'y',local,[]).part.y,.495);
  assert.equal(snapMove(prop,.252,'y',local,[]).part.y,.745);
  assert.equal(snapMove(prop,-.252,'y',local,[]).part.y,.245);
});

test('磁吸只在网格上生效：正好整格贴合时贴上去，否则退回整格步长',()=>{
  // 墙面在 20.5 → 左侧齐平位置 20.25（整格）：磁吸要能抓住它。
  const local=[box(-.25,0,-.25,.5,3,.5)],targets=[box(20.5,0,-2,.25,3,4)];
  const start={...part,y:0};
  const flush=snapMove(start,.2,'x',local,targets);
  assert.equal(flush.part.x,20.25,'整格齐平：吸到 20.25');
  assert.equal(flush.aligned,true);
  // 墙面在 20.425 → 精确齐平点是 20.175（半格偏置）：不能把步长变成 0.175，退回网格上的 20.25。
  const odd=snapMove(start,.16,'x',[box(-.25,0,-.25,.5,3,.5)],[box(20.425,0,-2,.25,3,4)]);
  assert.equal(odd.part.x,20.25,'非整格齐平点也要落回网格');
  assert.equal(odd.part.x%BUILD_GRID,0);
  // Shift（fine）不吸附，但步长仍然是整格。
  assert.equal(snapMove(start,.162,'x',local,targets,true).part.x,20.25);
  assert.equal(snapMove(start,.162,'x',local,targets,true).aligned,false);
  // y 的接触磁吸：结构件吸到整格（-2.505 → -2.5），家具/摆件保留毫米精度。
  const step=snapMove({...part,y:-2},-.49,'y',[box(-.1,0,-.1,.2,.2,.2)],[box(19,-3,-1,2,.495,2)]);
  assert.equal(step.part.y,-2.5);
  assert.equal(step.aligned,true);
  const prop=snapMove({...part,kind:'mug',y:-2},-.49,'y',[box(-.1,0,-.1,.2,.2,.2)],[box(19,-3,-1,2,.495,2)]);
  assert.equal(prop.part.y,-2.505);
  assert.equal(prop.aligned,true);
});

test('空门框不会把门吞进洞里做磁吸',()=>{
  const local=[box(-1.5,0,-.15,.5,2.5,.3),box(1,0,-.15,.5,2.5,.3),box(-1.5,2.5,-.15,3,.5,.3)];
  const next=snapMove({...part,y:0},.03,'y',local,[box(19.8,-.2,-.1,.4,.25,.2)]);
  assert.equal(next.aligned,false);assert.equal(next.part.y,0);
});

test('全部 70 件部件：任何方向拖多少，水平落点都在网格上、位移都是整数格',()=>{
  for(const item of catalog){
    const start={id:item.id,kind:item.id,color:'#f3dfc5',x:4.11,y:1.37,z:-2.09,rotation:0,version:1};
    for(const axis of ['x','z']){
      for(const raw of [-1.02,-.5,-.26,-.13,.13,.26,.5,1.02]){
        const {part:next}=snapMove(start,raw,axis,[],[]);
        assert.equal(Math.abs(next[axis]-gridSnap(next[axis]))<1e-9,true,
          `${item.id} ${axis} 落点要在网格上（${next[axis]}）`);
        // 离格起点"回格"那一下最多再多半个格，绝不允许甩得更远。
        assert.equal(Math.abs(next[axis]-start[axis])<=Math.abs(raw)+BUILD_GRID+1e-9,true,
          `${item.id} ${axis} 不能跳得比鼠标更远`);
        // 而且必须朝鼠标拖的方向走（不能反着跳）。
        if(Math.abs(next[axis]-start[axis])>1e-9)
          assert.equal(Math.sign(next[axis]-start[axis]),Math.sign(raw),`${item.id} ${axis} 方向不能反`);
        // 回格之后再拖一格，位移必须正好是一格。
        const again=snapMove(next,.25,axis,[],[]).part[axis]-next[axis];
        assert.equal(Math.abs(Math.abs(again)-BUILD_GRID)<1e-9,true,`${item.id} ${axis} 第二步要正好一格`);
      }
    }
    // y：结构件（建筑/玩法）必须**绝对整格**（这样两件永远能对齐）；家具/摆件只保证整格步长，
    // 接触高度可以是毫米级（桌面 1.42m 那一层）。
    const moved=snapMove(start,.25,'y',[],[]).part.y;
    if(isStructural(item.id)){
      assert.equal(Math.abs(moved-gridSnap(moved))<1e-9,true,`${item.id} 结构件高度要落在网格上（${moved}）`);
      assert.equal(moved,gridSnap(start.y+.25),`${item.id} 结构件 1.37 → 1.5`);
    }else{
      assert.equal(Math.abs((moved-start.y)-BUILD_GRID)<1e-9,true,`${item.id} 摆件 y 一步一格`);
      assert.equal(moved,1.62,`${item.id} 摆件高度保留毫米精度`);
    }
  }
});
