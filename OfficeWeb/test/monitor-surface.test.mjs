import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as THREE from 'three';
const source = readFileSync(new URL('../src/monitorSurface.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText.replace('"three"', JSON.stringify(import.meta.resolve('three')));
const { findMonitorSurface, fitMonitorInset, SCREEN_SURFACE_GAP } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

function model() {
  const shell = new THREE.Group();
  const panel = new THREE.Mesh(new THREE.BoxGeometry(.66, .4, .04), new THREE.MeshBasicMaterial());
  panel.position.y = 1.1;
  const foot = new THREE.Mesh(new THREE.BoxGeometry(.25, .03, .25), new THREE.MeshBasicMaterial());
  foot.position.set(0, .8, .07);
  shell.add(panel, foot);
  return shell;
}

test('屏幕深度来自显示器正面，不受凸出底座影响', () => {
  const shell = model();
  const hit = findMonitorSurface(shell, new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(0, 0, 1));
  assert.ok(hit);
  assert.ok(Math.abs(hit.z - (.02 + SCREEN_SURFACE_GAP)) < 1e-6);
  shell.children[1].position.z = .6;
  const changed = findMonitorSurface(shell, new THREE.Vector3(0, 1.1, 0), new THREE.Vector3(0, 0, 1));
  assert.ok(changed.distanceTo(hit) < 1e-6);
});

test('旋转、倾斜和嵌套变换后的正面仍贴合', () => {
  const parent = new THREE.Group(), shell = model();
  parent.position.set(8.65, .1, -5.9);
  parent.rotation.set(.1, Math.PI, 0);
  parent.scale.setScalar(.8);
  parent.add(shell);
  parent.updateMatrixWorld(true);
  const center = shell.localToWorld(new THREE.Vector3(0, 1.1, 0));
  const normal = new THREE.Vector3(0, 0, 1).transformDirection(shell.matrixWorld);
  const expected = shell.localToWorld(new THREE.Vector3(0, 1.1, .02))
    .addScaledVector(normal, SCREEN_SURFACE_GAP);
  const hit = findMonitorSurface(shell, center, normal);
  assert.ok(hit && hit.distanceTo(expected) < 1e-6);
});

test('未找到真实表面时不凭包围盒生成悬空屏幕', () => {
  const shell = model();
  assert.equal(findMonitorSurface(shell, new THREE.Vector3(0, 2, 0), new THREE.Vector3(0, 0, 1)), null);
});

test('内屏测量忽略同一网格中不相连的共面底座，并焊接UV接缝', () => {
  const screen = new THREE.PlaneGeometry(.638, .385).toNonIndexed();
  const foot = new THREE.PlaneGeometry(.3, .04).toNonIndexed();
  foot.translate(0, -.4, 0);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    ...screen.attributes.position.array, ...foot.attributes.position.array,
  ], 3));
  const shell = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  const fit = fitMonitorInset(shell, new THREE.Vector3(.03, .02, 0), new THREE.Quaternion());
  assert.ok(fit);
  assert.ok(Math.abs(fit.width - .638) < 1e-6);
  assert.ok(Math.abs(fit.height - .385) < 1e-6);
  assert.ok(fit.center.distanceTo(new THREE.Vector3(0, 0, SCREEN_SURFACE_GAP)) < 1e-6);
});

test('内屏尺寸在嵌套旋转倾斜与缩放后按实际世界尺寸测量', () => {
  const parent = new THREE.Group(), shell = model();
  parent.rotation.set(.2, Math.PI, .1);
  parent.scale.setScalar(.8);
  parent.position.set(8, .3, -6);
  parent.add(shell);
  parent.updateMatrixWorld(true);
  const center = shell.localToWorld(new THREE.Vector3(0, 1.1, 0));
  const frame = shell.getWorldQuaternion(new THREE.Quaternion());
  const fit = fitMonitorInset(shell, center, frame);
  assert.ok(fit);
  assert.ok(Math.abs(fit.width - .66 * .8) < 1e-6);
  assert.ok(Math.abs(fit.height - .4 * .8) < 1e-6);
});
