import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const {createPart}=await require('../../tools/export_box_library.cjs').loadMeshes();
/**
 * 转译 `src/*.ts`：`loadTs` 不处理裸包名 `three`（data URL 解析不了），这里补上，
 * 同时像 `loadTs` 一样把相对导入**递归**换成 data URL，否则 `buildClimb.ts` 里的
 * `./navigation` 会直接崩。同一个 `urls` 表保证各模块拿到同一个实例（导航状态是共享的）。
 */
async function load(name, urls = new Map()) {
  if (urls.has(name)) return urls.get(name);
  const source = readFileSync(new URL(`../src/${name}`, import.meta.url), 'utf8');
  let js = ts.transpileModule(source, {compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
  }}).outputText.replace(/from\s*['"]three['"]/g, `from '${import.meta.resolve('three')}'`);
  const relatives = [...new Set([...js.matchAll(/from\s*['"](\.[^'"]+)['"]/g)].map(m => m[1]))];
  for (const specifier of relatives) {
    const url = await load(`${specifier.replace(/^\.\//, '')}.ts`, urls);
    js = js.split(`from '${specifier}'`).join(`from '${url}'`)
      .split(`from "${specifier}"`).join(`from '${url}'`);
  }
  const url = 'data:text/javascript;base64,' + Buffer.from(js).toString('base64');
  urls.set(name, url);
  return url;
}
const urls = new Map();
const nav = await import(await load('buildNavigation.ts', urls));
const {setBuildSolids,setBuildClimbs,supportHeight,buildPath,buildClimbAt}=nav;
const {collisionBoxes,climbColumns}=await import(await load('buildArch.ts', urls));
const {climbStep,CLIMB_SPEED}=await import(await load('buildClimb.ts', urls));
const {advancePath}=await import(await load('avatarPath.ts', urls));
const {walkStep}=await import(await load('avatarWalk.ts', urls));
const {catalog}=await import('../build-store.mjs');

/**
 * 直梯必须**真的能上下通行**（用户：「新增直梯是可以通行的，不管是上和下，可以用方向键通行，
 * 就类似于游戏，以及自动寻路也可以」）。
 *
 * 踩过的坑：①把所有横档叠在同一个 z 上当台阶——上面那级会把下面那级封在 1.3m 身高之内，
 * `supportHeight` 只认最顶上一级，等于爬不上去；②改成每级退后 0.25m 的窄楼梯虽然能走，
 * 但那是 3.8m 深的楼梯、不是梯子。现在的直梯是**可攀爬柱体**：`localClimb` +
 * `buildClimb.ts` 的规则（W/↑ 往上爬、S/↓ 往下退、到顶再按一下就踏上平台），
 * 寻路也在梯子内部生成上下边。
 *
 * 注：`buildNavigation` 只认"已放置的方块"，空世界里地面本身也不存在，
 * 所以下面自己垫地面/平台（纯 box，不用 three 场景）。
 */
const LADDER={id:'ladder',kind:'ladder',rotation:0,x:0,y:0,z:0,color:'#f3dfc5'};
const GROUND={min:{x:-3,y:-0.5,z:-3},max:{x:3,y:0,z:-0.05}};
/** 梯顶对着的平台：顶面在 3.75m，和梯子的净爬升一样高，边缘贴着梯子正面。 */
const PLATFORM={min:{x:-1,y:3.25,z:0.05},max:{x:1,y:3.75,z:3}};
const boxes=()=>collisionBoxes(createPart(LADDER)).map(box=>({min:box.min,max:box.max}));
/** 柱体连法线一起用（爬梯朝向要靠它）。 */
const climbs=()=>climbColumns(createPart(LADDER));
const climbState=()=>{setBuildSolids([...boxes(),GROUND,PLATFORM]);setBuildClimbs(climbs());};
const camera=(x,z)=>({getWorldDirection:(out)=>out.set(x,0,z).normalize()});
const keys=(...list)=>new Set(list);
const TOP=3.75;

test('直梯几何：立柱是实心的、横档只是外观，柱体净爬升 3.75m',()=>{
  const part=createPart(LADDER);
  const solid=part.children.filter(mesh=>!mesh.userData.noBuildCollision);
  const rungs=part.children.filter(mesh=>mesh.userData.noBuildCollision);
  assert.equal(solid.length,2,'两根立柱要参与碰撞（能贴墙、能选中）');
  assert.equal(rungs.length,15,'15 根横档');
  rungs.forEach((rung,i)=>assert.equal(+(rung.position.y).toFixed(3),0.25+i*0.25,`第 ${i+1} 根横档`));
  const column=part.userData.localClimb;
  assert.deepEqual(column.min,[-.35,0,-.25]);
  assert.equal(column.max[1],TOP,'柱体顶部就是净爬升高度');
  assert.deepEqual(column.normal,[0,0,1],'梯面法线＝本地 +Z（爬梯朝向靠它）');
  const item=catalog.find(row=>row.id==='ladder');
  const size=new THREE.Box3().setFromObject(part).getSize(new THREE.Vector3()).toArray();
  size.forEach((n,i)=>assert(Math.abs(n-item.dimensions[i])<1e-4,`目录实测尺寸 axis ${i}`));
  assert.equal(item.dimensions[1],3.78);
});

test('站在梯子上：柱体里没有踏面也能待住，柱体外不行',()=>{
  climbState();
  try{
    assert.equal(buildClimbAt(0,0,0)?.top,TOP);
    assert.equal(buildClimbAt(0,0,TOP)?.bottom,0);
    // 高度超出柱体（爬过头）就不再算"在梯子上"。
    assert.equal(buildClimbAt(0,0,TOP+.5),null);
    // 横向偏出去就不是梯子了。
    assert.equal(buildClimbAt(.8,0,1),null);
    // 梯子不是地面：柱体里没有"能站的踏面"，高度由爬梯动作决定
    // （半空中那一格 `supportHeight` 也查不到东西）。
    assert.equal(supportHeight(0,0,1.25),null,'梯子里不该有"能站的地面"');
    assert.equal(supportHeight(0,.2,1.25),null,'梯子前面半空同理');
  }finally{setBuildSolids(null);setBuildClimbs(null);}
});

test('按键爬梯：W/↑ 一级级往上爬，S/↓ 能原路退下来',()=>{
  climbState();
  try{
    const up=new THREE.Vector3(0,0,1), down=new THREE.Vector3(0,0,-1);
    const forward=new THREE.Vector3(0,0,1);
    let position=new THREE.Vector3(0,0,-0.1);
    const dt=1/60;
    for(let i=0;i<600&&position.y<TOP-1e-4;i++){
      const step=climbStep(position,keys('KeyW'),forward,dt,1.65);
      assert(step,'按 W 就该在爬');
      position=step.position.clone();
      assert(position.y>=-1e-6&&position.y<=TOP+1e-6,'不能爬出柱体');
    }
    assert.equal(+position.y.toFixed(3),TOP,'一路爬到梯顶');
    assert.equal(position.x,0,'爬梯时不该横着飘');
    assert.equal(position.z,-0.1);
    // 到顶之后继续按 W：朝相机方向迈出去，落到 3.75m 的平台上。
    const off=climbStep(position,keys('ArrowUp'),forward,dt,1.65);
    assert(off&&off.moving,'到顶后再按方向键要能踏上平台');
    position=off.position.clone();
    const walked=walkStep(position,keys('KeyW'),{getWorldDirection:out=>out.set(0,0,1)},dt,1.65);
    assert(Math.abs(walked.position.y-TOP)<1e-6,'平台上还是 3.75m');
    assert(walked.position.z>position.z,'要在平台上往前走');
    // 走回梯子、按 S 往下退。
    position=new THREE.Vector3(0,TOP,0);
    for(let i=0;i<600&&position.y>1e-4;i++){
      const step=climbStep(position,keys('ArrowDown'),forward,dt,1.65);
      assert(step,'按 ↓ 就该往下退');
      position=step.position.clone();
    }
    assert.equal(+position.y.toFixed(3),0,'一路退到梯底');
    const back=climbStep(position,keys('ArrowDown'),forward,dt,1.65);
    assert(back&&back.moving,'到底后再按 ↓ 要能退着走出梯子');
    assert(back.position.z<position.z,'往下退是朝相机反方向迈一步');
  }finally{setBuildSolids(null);setBuildClimbs(null);}
});

test('自由行走：一路按 W 走到梯子前就开始爬，爬到平台上继续走就是踏空（掉落机制）',()=>{
  climbState();
  try{
    const cam=camera(0,1);
    let position=new THREE.Vector3(0,0,-2);
    const dt=1/60;
    let climbed=false,last;
    for(let i=0;i<1200;i++){
      const step=walkStep(position,keys('KeyW'),cam,dt,1.65);
      last=step;
      if(!step.moving)break;
      if(step.position.y>0.01)climbed=true;
      position=step.position;
    }
    assert(climbed,'走着走着就该爬上梯子，而不是撞住不动');
    assert(Math.abs(position.y-TOP)<.05,`一路爬到梯顶高度（现在 ${position.y}）`);
    assert(position.z>0.2,`要到平台上（现在 z=${position.z}）`);
    // 平台外侧没有地面：继续往前走是**踏空**（2026-10-09 的掉落机制），不是撞住不动。
    assert.equal(last.falling,true,'走到平台边缘要报踏空，剩下的交给 avatarFall 往下掉');
  }finally{setBuildSolids(null);setBuildClimbs(null);}
});

test('自动寻路：从地面点到 3.75m 的平台，路径要顺着梯子爬上去',()=>{
  climbState();
  try{
    const path=buildPath({x:0,y:0,z:-2},{x:0,y:TOP,z:2});
    assert(path.length>0,'寻路要能找到一条上去的路');
    assert.equal(path.at(-1).y,TOP,'终点在平台上');
    const heights=path.map(p=>p.y);
    assert(heights.some(y=>y>0.2&&y<TOP-0.2),'路径中间要真的在梯子上往上爬');
    assert(heights.every(y=>y>=-1e-6&&y<=TOP+1e-6),'不能飘到梯顶以上');
    // 顺着路径走真的能到（爬梯段由 `advancePath` 负责升降）。
    const position=new THREE.Vector3(0,0,-2);
    const points=path.map(p=>new THREE.Vector3(p.x,p.y,p.z));
    for(let i=0;i<4000&&points.length;i++)advancePath(position,points,1.65/60);
    assert(Math.abs(position.y-TOP)<.05,`跟着路径要能到 3.75m（现在 ${position.y}）`);
    assert(Math.hypot(position.x-0,position.z-2)<.3,'最后要走到点击的平台位置');
  }finally{setBuildSolids(null);setBuildClimbs(null);}
});

test('爬梯朝向：面朝梯子（按人站的那一侧算），不是面朝相机',()=>{
  climbState();
  try{
    // 站在梯子**前面**（z<0）：面朝 +Z（0 弧度）。站在背面：面朝 -Z（π）。
    const front=climbStep(new THREE.Vector3(0,1,-.2),keys('KeyW'),new THREE.Vector3(1,0,0),1/60,1.65);
    assert(Math.abs(front.position.y-1)>0,'按 W 要往上爬');
    assert(Math.abs(front.rotationY-0)<1e-6,`前面爬要面朝梯子 +Z（现在 ${front.rotationY}）`);
    const back=climbStep(new THREE.Vector3(0,1,.2),keys('KeyW'),new THREE.Vector3(1,0,0),1/60,1.65);
    assert(Math.abs(Math.abs(back.rotationY)-Math.PI)<1e-6,`背面爬要面朝梯子 -Z（现在 ${back.rotationY}）`);
    // 相机转到侧面（+X）也不能把人拧过去：爬的时候只认梯面法线。
    assert(Math.abs(front.rotationY)<1e-6,'相机朝 +X 时仍然是面朝梯子');
    // 梯子旋转 90°：梯面法线跟着转到 ±X，从 +X 侧爬要面朝 -X（法线由部件自己声明，不看盒子长宽）。
    const rotated=createPart({...LADDER,rotation:1});
    const columns=climbColumns(rotated);
    assert(Math.abs(columns[0].normalX-1)<1e-6,`旋转 90° 后梯面法线转到 +X（现在 ${columns[0].normalX}）`);
    setBuildClimbs(columns);
    const side=climbStep(new THREE.Vector3(.2,.5,0),keys('ArrowUp'),new THREE.Vector3(0,0,1),1/60,1.65);
    assert(Math.abs(side.rotationY+Math.PI/2)<1e-6,`旋转后的梯子要面朝 -X（现在 ${side.rotationY}）`);
    // 人正在梯子中线上：拿不到"哪一侧"，保持相机朝向。
    const middle=climbStep(new THREE.Vector3(0,.5,0),keys('KeyW'),new THREE.Vector3(0,0,1),1/60,1.65);
    assert(Math.abs(middle.rotationY)<1e-6,'中线处保持相机朝向');
  }finally{setBuildSolids(null);setBuildClimbs(null);}
});

test('爬梯速度比走路慢，而且不会一帧跳上去',()=>{
  climbState();
  try{
    const step=climbStep(new THREE.Vector3(0,0,0),keys('KeyW'),new THREE.Vector3(0,0,1),1/60,1.65);
    assert(step.moving);
    assert(Math.abs(step.position.y-CLIMB_SPEED/60)<1e-9,'一帧就爬 CLIMB_SPEED/60');
    assert(CLIMB_SPEED<1.65,'爬梯比走路慢');
  }finally{setBuildSolids(null);setBuildClimbs(null);}
});

/**
 * **摞起来的直梯**（用户 2026-10-09：「把直梯摞得很高之后，怎么不能自动寻路了」）。
 *
 * 真因：`climbSpanAt(x,z)` 只返回命中 `(x,z)` 的**第一根**梯子、而且不看高度，于是摞上去以后整个柱体
 * 被卡在最下面那根的顶上（A=0~3.75、B=3.75~7.5，A\* 在 3.75 处往上的边被 `min(y,A.max)` 夹回 3.75，
 * 永远上不去）；手动爬也一样——接缝处 `y` 已经等于 A 的顶，`climbStep` 把它当成"到顶了"、改成往相机
 * 方向踏出去，于是人在接缝上卡住。现在 `setBuildClimbs()` 会把投影重叠且竖直相接的柱体**并成一根**，
 * 接缝只是这根长梯子的中间某一格。
 */
test('摞起来的直梯：并成一根，接缝处能继续上下，寻路也能一路爬到顶',()=>{
  const lower=createPart({...LADDER,y:0});
  const upper=createPart({...LADDER,y:TOP});
  const STACK=TOP*2;                                   // 7.5
  const ground={min:{x:-3,y:-0.5,z:-3},max:{x:3,y:0,z:-0.05}};
  const platform={min:{x:-1,y:STACK-0.5,z:0.05},max:{x:1,y:STACK,z:3}};
  const solids=[...collisionBoxes(lower),...collisionBoxes(upper)].map(box=>({min:box.min,max:box.max}));
  setBuildSolids([...solids,ground,platform]);
  setBuildClimbs([...climbColumns(lower),...climbColumns(upper)]);
  try{
    // ① 并成了一根：接缝（3.75）上下都算在梯子里，底/顶是整根长梯子的两端。
    assert.equal(buildClimbAt(0,0,0)?.top,STACK,'下半段看到的顶是整根梯子的顶');
    assert.equal(buildClimbAt(0,0,STACK)?.bottom,0,'上半段看到的底是整根梯子的底');
    assert.equal(buildClimbAt(0,0,TOP+.2)?.top,STACK,'接缝以上仍然在梯子上');
    assert.equal(buildClimbAt(0,0,STACK+.5),null,'整根梯子之上就不是梯子了');
    // ② 接缝处按 W 继续往上（不能当成"到顶了"改成踏出去）：连按几帧要越过 3.75。
    let seam=new THREE.Vector3(0,TOP-.05,-0.1);
    for(let i=0;i<20;i++){
      const step=climbStep(seam,keys('KeyW'),new THREE.Vector3(0,0,1),1/60,1.65);
      assert(step&&step.moving,'接缝处按 W 要继续往上爬');
      assert.equal(step.position.z,-0.1,'爬梯时不该横着飘出去');
      seam=step.position.clone();
    }
    assert(seam.y>TOP+.2,`接缝处连按 W 要越过 3.75 继续往上（现在 ${seam.y}）`);
    // ③ 接缝处按 S 继续往下（同理，不能退出去）。
    let back=new THREE.Vector3(0,TOP+.05,-0.1);
    for(let i=0;i<20;i++){
      const step=climbStep(back,keys('KeyS'),new THREE.Vector3(0,0,1),1/60,1.65);
      assert(step&&step.moving,'接缝处按 S 要继续往下退');
      back=step.position.clone();
    }
    assert(back.y<TOP-.2,`接缝处连按 S 要退到 3.75 以下（现在 ${back.y}）`);
    // ④ 一路按 W 从地面爬到 7.5。
    let position=new THREE.Vector3(0,0,-0.1);
    for(let i=0;i<1200&&position.y<STACK-1e-4;i++){
      const step=climbStep(position,keys('KeyW'),new THREE.Vector3(0,0,1),1/60,1.65);
      assert(step,'一路按 W 都该在爬');
      position=step.position.clone();
      assert(position.y<=STACK+1e-6,'不能爬出整根梯子');
    }
    assert.equal(+position.y.toFixed(3),STACK,'一路爬到 7.5');
    // ⑤ 自动寻路：从地面点到 7.5 的平台，路径要顺着这根摞起来的梯子爬上去。
    const path=buildPath({x:0,y:0,z:-2},{x:0,y:STACK,z:2});
    assert(path.length>0,'摞起来的梯子也要能寻路上去');
    assert.equal(path.at(-1).y,STACK,'终点在 7.5 的平台上');
    assert(path.map(p=>p.y).some(y=>y>TOP+.2&&y<STACK-.2),'路径要越过接缝继续往上');
    const walking=new THREE.Vector3(0,0,-2);
    const points=path.map(p=>new THREE.Vector3(p.x,p.y,p.z));
    for(let i=0;i<8000&&points.length;i++)advancePath(walking,points,1.65/60);
    assert(Math.abs(walking.y-STACK)<.05,`跟着路径要能到 7.5（现在 ${walking.y}）`);
    console.log('摞梯寻路：'+path.length+' 个路径点，最高 '+Math.max(...path.map(p=>p.y)));
  }finally{setBuildSolids(null);setBuildClimbs(null);}
});

test('摞五根（正式世界里的真实摆法：x/z 相同、每 3.75m 一根）要并成一根长梯',()=>{
  // 正式存档实测：x=-3.5 z=-22.5，y = -8 / -4.25 / -0.5 / 3.25 / 7 —— 正好每 3.75m 一根。
  const bases=[-8,-4.25,-0.5,3.25,7], bottom=bases[0], top=bases[bases.length-1]+TOP;   // -8 → 10.75
  const parts=bases.map(y=>createPart({...LADDER,x:-3.5,y,z:-22.5}));
  const ground={min:{x:-6,y:bottom-0.5,z:-25},max:{x:0,y:bottom,z:-22.55}};
  const platform={min:{x:-4.5,y:top-0.5,z:-22.45},max:{x:-2.5,y:top,z:-20}};
  setBuildSolids(parts.flatMap(part=>collisionBoxes(part)).map(box=>({min:box.min,max:box.max})).concat([ground,platform]));
  setBuildClimbs(parts.flatMap(part=>climbColumns(part)));
  try{
    assert.equal(buildClimbAt(-3.5,-22.5,bottom)?.top,top,'整根长梯的顶是 10.75');
    assert.equal(buildClimbAt(-3.5,-22.5,top)?.bottom,bottom,'底是 −8');
    assert.equal(buildClimbAt(-3.5,-22.5,top+1),null,'长梯之上不是梯子');
    // 从最下面一路按 W 爬到顶（要越过 4 个接缝）。
    let position=new THREE.Vector3(-3.5,bottom,-22.6);
    for(let i=0;i<4000&&position.y<top-1e-4;i++){
      const step=climbStep(position,keys('KeyW'),new THREE.Vector3(0,0,-1),1/60,1.65);
      assert(step,'一路按 W 都该在爬');
      position=step.position.clone();
    }
    assert.equal(+position.y.toFixed(3),top,'一路爬到 10.75');
    // 自动寻路：从最下面的地面点到 10.75 的平台。
    const path=buildPath({x:-3.5,y:bottom,z:-24},{x:-3.5,y:top,z:-21});
    assert(path.length>0,'五根摞起来的梯子也要能寻路上去');
    assert.equal(path.at(-1).y,top,'终点在 10.75 的平台');
    console.log('五根摞梯：'+path.length+' 个路径点，从 '+bottom+' 爬到 '+top);
  }finally{setBuildSolids(null);setBuildClimbs(null);}
});
