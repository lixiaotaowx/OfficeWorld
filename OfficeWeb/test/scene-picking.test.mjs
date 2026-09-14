import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as THREE from 'three';
const source = readFileSync(new URL('../src/scenePicking.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText.replace("'three'", JSON.stringify(import.meta.resolve('three')));
const { pickSceneSurface, SceneClickGesture } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const event = (x=0,y=0,button=0,pointerId=1) => ({clientX:x,clientY:y,button,pointerId});
const mesh = () => new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial());
const hit = object => ({object,point:new THREE.Vector3(),distance:1});

test('长沙发按点击位置区分独立坐位，家具遮挡仍阻止穿透', () => {
  const sofa = mesh(), blocker = mesh();
  sofa.userData.sittingSpots = [
    {id:'sofa-0',chair:{x:0,z:0}}, {id:'sofa-1',chair:{x:0,z:1}},
  ];
  const h = {...hit(sofa),point:new THREE.Vector3(0,0,0.9)};
  assert.equal(pickSceneSurface([h]).spot, 'sofa-1');
  assert.equal(pickSceneSurface([hit(blocker),h]).kind, 'surface');
});

test('显示器框架子网格点击仍识别为显示器，不能当作座椅', () => {
  const parent=new THREE.Group(), child=mesh();parent.add(child);
  parent.userData.seat=3;parent.userData.monitorSeat=3;
  assert.equal(pickSceneSurface([hit(child)]).kind,'monitor');
  assert.equal(pickSceneSurface([hit(child)]).seat,3);
});
test('前方实体遮挡阻止点击穿透，隐藏父级和裁切墙不会拦截', () => {
  const panel=mesh(), blocker=mesh();panel.userData.monitorSeat=0;
  assert.equal(pickSceneSurface([hit(blocker),hit(panel)]).kind,'surface');
  const parent=new THREE.Group();parent.visible=false;parent.add(blocker);
  assert.equal(pickSceneSurface([hit(blocker),hit(panel)]).kind,'monitor');
  parent.visible=true;
  blocker.material.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,-1,0),-1)];
  assert.equal(pickSceneSurface([hit(blocker),hit(panel)]).kind,'monitor');
});
test('按下释放只响应一次，不接受右键、取消或不同指针', () => {
  const gesture=new SceneClickGesture();
  gesture.start(event());assert.equal(gesture.end(event()),true);
  assert.equal(gesture.end(event()),false);
  gesture.start(event(0,0,2));assert.equal(gesture.end(event(0,0,2)),false);
  gesture.start(event());gesture.cancel();assert.equal(gesture.end(event()),false);
  gesture.start(event());assert.equal(gesture.end(event(0,0,0,2)),false);
});
test('拖动超过阈值后回原点也不能触发点击', () => {
  const gesture=new SceneClickGesture();
  gesture.start(event());gesture.move(event(20,10));gesture.move(event());
  assert.equal(gesture.end(event()),false);
});
