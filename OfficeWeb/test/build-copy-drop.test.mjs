import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import * as THREE from 'three';

/** `buildCopyDrop.ts` 只 import three，而 data URL 模块解析不了裸包名：先把地址换成解析结果。 */
async function loadDrop() {
  const source=readFileSync(new URL('../src/buildCopyDrop.ts',import.meta.url),'utf8');
  const js=ts.transpileModule(source,{compilerOptions:{
    target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,
  }}).outputText.replace(/from\s+'three'/,`from '${import.meta.resolve('three')}'`);
  assert(!/from 'three'/.test(js),'three 的裸包名没被替换掉');
  return import('data:text/javascript;base64,'+Buffer.from(js).toString('base64'));
}
const {copyDropPoint,keepsOriginalSpot}=await loadDrop();

/** 从 (0,8,0) 看向地面某一点的射线——比摆相机再投影直观得多。 */
const aim=(x,z)=>new THREE.Raycaster(new THREE.Vector3(0,8,0),
  new THREE.Vector3(x,-8,z).normalize()).ray;
const source3=(x,y,z)=>({x,y,z});

test('拖拽落点按 25 厘米吸附到网格（不再保留原件的小数偏置）',()=>{
  const drop=copyDropPoint(source3(2,0,0),aim(2,0));
  assert.deepEqual([drop.x,drop.y,drop.z],[2,0,0]);
  // 以前这里"保留原件的小数偏置"，好让离格的老部件不被拽跳半格；现在不变量是"水平两轴永远整格"
  // （用户 2026-10-09：「确保不会有步长不统一的部件 … 根源修复」），所以 2.4 → 2.5、-0.6 → -0.5，
  // 起点就算带 0.125 偏置也不会把副本带离网格。
  const biased=copyDropPoint(source3(2.125,0,0),aim(2.4,-0.6));
  assert.deepEqual([biased.x,biased.z],[2.5,-0.5]);
  assert.equal(biased.x%0.25===0,true,'副本落点必须在整格上');
  assert.equal(biased.z%0.25===0,true);
});

test('高度保持不变：副本沿水平面跟鼠标，竖向交给手柄',()=>{
  assert.equal(copyDropPoint(source3(0,3,0),aim(0,0)).y,3);
});

test('视线几乎平行地面那一帧返回 undefined，而不是把副本甩到天边',()=>{
  const flat=new THREE.Raycaster(new THREE.Vector3(0,.8,10),new THREE.Vector3(0,-.02,-1).normalize()).ray;
  assert.equal(copyDropPoint(source3(0,0,0),flat),undefined);
});

test('没挪出半个格子算原位放下',()=>{
  const part=source3(4,0,-2);
  assert.equal(keepsOriginalSpot(part,{x:4,y:0,z:-2}),true);
  assert.equal(keepsOriginalSpot(part,{x:4.25,y:0,z:-2}),false);
});
