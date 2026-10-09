import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const {createPart}=await require('../../tools/export_box_library.cjs').loadMeshes();
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
const beam = await import(await load('buildBeam.ts', urls));
const {collisionBoxes} = await import(await load('buildArch.ts', urls));
const {catalog} = await import('../build-store.mjs');

/**
 * 传送点的粒子条（用户：「传送点要有粒子条往上出现，简约的做一个，注意性能」）。
 * 这里守的是三件事：**长得出来**（点数/上升/淡出）、**不添乱**（不吃拾取、不进碰撞、
 * 不撑大实测尺寸）、**性能**（所有传送点共用一份几何与材质）。
 */
const pad = () => createPart({id:'pad',kind:'teleport-pad',rotation:0,x:0,y:0,z:0,color:'#b4c5a0'});

test('粒子条：18 个点、共用几何与材质、不吃拾取也不参与碰撞',()=>{
  const a=pad(), b=pad();
  const beamA=a.userData.teleportBeam, beamB=b.userData.teleportBeam;
  assert(beamA instanceof THREE.Points&&beamB instanceof THREE.Points,'传送点要挂上粒子条');
  assert.equal(beamA.geometry.getAttribute('position').count,beam.BEAM_POINTS,'点数');
  assert.equal(beamA.geometry,beamB.geometry,'所有传送点共用同一份几何（性能）');
  assert.equal(beamA.material,beamB.material,'还没配对时共用同一份材质');
  assert.equal(a.getObjectByName('teleport-beam'),beamA);
  // 不吃拾取 / 不参与碰撞 / 空包围盒（否则会把目录实测尺寸和选中框撑大）。
  const hits=[];beamA.raycast({},hits);assert.deepEqual(hits,[],'粒子条不能被射线打中');
  assert.equal(beamA.userData.noBuildCollision,true);
  assert(beamA.boundingBox instanceof THREE.Box3&&beamA.boundingBox.isEmpty(),'空包围盒');
  assert.equal(collisionBoxes(a).every(box=>box.max.y<0.35),true,'粒子条不进碰撞盒（碰撞盒都还在 0.34 以下）');
  // 目录实测尺寸仍然是传送点本体（粒子柱不算进去）。
  const item=catalog.find(row=>row.id==='teleport-pad');
  const size=new THREE.Box3().setFromObject(a).getSize(new THREE.Vector3()).toArray();
  size.forEach((n,i)=>assert(Math.abs(n-item.dimensions[i])<1e-4,`目录实测尺寸 axis ${i}（粒子条不能撑大它）`));
});

test('粒子条：所有传送点共用同一份亮青材质，而且只建一次',()=>{
  const a=pad(), b=pad();
  const material=a.userData.teleportBeam.material;
  assert.equal(a.userData.teleportBeam.geometry,b.userData.teleportBeam.geometry,'共用几何');
  assert.equal(material,b.userData.teleportBeam.material,'共用材质');
  // 注：`createPart` 走导出器的模块图，和这里的 `beam` 是两份实例；材质缓存只在各自实例内复用，
  // 所以"缓存复用"这条只能拿同一个实例自己比自己。
  assert.equal(beam.teleportBeamMaterial(),beam.teleportBeamMaterial());
  assert.equal(beam.teleportBeamMaterial().opacity>0.9,true);
  assert.equal(material.isPointsMaterial,true);
  assert.equal(material.opacity>0.9,true,'亮着（点了就传，不需要配对）');
});

test('粒子条动画：每帧只改共享几何的 y 与亮度，世界上一块都没有时是空转',()=>{
  const world=new THREE.Scene();
  const empty=new THREE.Scene();
  assert.doesNotThrow(()=>beam.updateTeleportBeams(empty,1));
  const a=pad(), b=pad();
  world.add(a);world.add(b);
  const position=a.userData.teleportBeam.geometry.getAttribute('position');
  const color=a.userData.teleportBeam.geometry.getAttribute('color');
  beam.updateTeleportBeams(world,0);
  const first=Array.from({length:beam.BEAM_POINTS},(_,i)=>position.getY(i));
  const firstShade=Array.from({length:beam.BEAM_POINTS},(_,i)=>color.getX(i));
  assert(first.every(y=>y>=0.24-1e-6&&y<=0.24+2.05+1e-6),'粒子在柱体范围内');
  assert(Math.max(...first)-Math.min(...first)>1.5,'点在高度上要拉开，才像一根柱子');
  beam.updateTeleportBeams(world,0.7);
  const later=Array.from({length:beam.BEAM_POINTS},(_,i)=>position.getY(i));
  assert(later.some((y,i)=>Math.abs(y-first[i])>0.05),'时间往前走粒子要上升');
  assert(later.every(y=>y>=0.24-1e-6&&y<=0.24+2.05+1e-6),'循环时也不能跑出柱体');
  assert(Math.max(...firstShade)>0.9&&Math.min(...firstShade)<0.5,'上下要淡出（加法混合下暗＝看不见）');
  // 两个传送点共用几何：更新一次两边都动了。
  assert.equal(a.userData.teleportBeam.geometry,b.userData.teleportBeam.geometry);
});
