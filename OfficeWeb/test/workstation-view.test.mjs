import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import * as THREE from 'three';

const source = readFileSync(new URL('../src/workstationView.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText.replace("'three'", JSON.stringify(import.meta.resolve('three')));
const { workstationView, updateWorkstationClip } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

test('both desk directions frame a complete monitor with surrounding desk space', () => {
  for (const sign of [-1, 1]) for (const aspect of [1.5, 0.65]) {
    const panel = new THREE.Vector3(0, 1.3, 0);
    const { position, target } = workstationView({ chair: { x: 0, z: sign } }, panel, aspect);
    const camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 150);
    camera.position.copy(position); camera.lookAt(target); camera.updateMatrixWorld();
    assert.ok(position.z * sign > 2);
    assert.ok(position.y > panel.y + 0.8);
    updateWorkstationClip(camera, target, true);
    const frustum = new THREE.Frustum().setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    for (const x of [-0.36, 0.36]) for (const y of [-0.23, 0.23]) {
      assert.ok(frustum.containsPoint(panel.clone().add(new THREE.Vector3(x, y, 0))));
    }
    assert.ok(frustum.containsPoint(panel.clone().add(new THREE.Vector3(0.65, -0.5, 0))));
  }
});

test('foreground is clipped only in focus mode and never clips the target', () => {
  const camera = new THREE.PerspectiveCamera(40, 1.5, 0.1, 150);
  const target = new THREE.Vector3(0, 1.3, 0);
  camera.position.set(0, 2.2, 2.4); camera.lookAt(target); camera.updateMatrixWorld();
  updateWorkstationClip(camera, target, true);
  assert.ok(camera.near > 1);
  assert.ok(camera.near < camera.position.distanceTo(target));
  updateWorkstationClip(camera, target, false);
  assert.equal(camera.near, 0.1);
  camera.position.copy(target).add(new THREE.Vector3(0, 0, 0.5));
  updateWorkstationClip(camera, target, true);
  assert.equal(camera.near, 0.1);
});

test('the foreground clip stays bounded however far the camera pulls back', () => {
  // Regression (user, 2026-09-15): zooming out after focusing a desk used to grow
  // the near plane with the view distance (12m away => near 10.7m), which cut
  // away the whole office until the page was reloaded.
  const camera = new THREE.PerspectiveCamera(40, 1.5, 0.1, 150);
  const target = new THREE.Vector3(0, 1.3, 0);
  camera.position.set(0, 6, 11); camera.lookAt(target); camera.updateMatrixWorld();
  updateWorkstationClip(camera, target, true);
  assert.ok(camera.near > 0.1, `near=${camera.near} 应仍然开启前景裁切`);
  assert.ok(camera.near <= 1.25 + 1e-6, `near=${camera.near} 不应随视距无限放大`);
  assert.ok(camera.near < camera.position.distanceTo(target));
});
