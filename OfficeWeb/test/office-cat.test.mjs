import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { loadTs } from './helpers.mjs';

const { OfficeCat } = await import(await loadTs('officeCat.ts'));

const CAT_STATE = { x: 1, y: 0, z: 2, rot: .5, seq: 1, pose: 'stand', moving: false };

test('office cat: block body merges per material, legs stay separate', () => {
  const scene = new THREE.Scene();
  const cat = new OfficeCat(scene);
  assert.equal(cat.root.name, 'office-cat');
  assert.equal(cat.root.visible, false, '第一次广播前不可见');
  cat.set(CAT_STATE);
  assert.equal(cat.root.visible, true, '有状态就出现');
  const meshes = cat.root.children[0].children;
  assert.equal(meshes.length, 6, '身体 2 + 腿 4');
  const legs = meshes.filter(m => m.scale.x === .065);
  assert.equal(legs.length, 4, '四条腿');
  cat.dispose();
  assert.equal(scene.children.includes(cat.root), false);
});

test('cat snaps on first sighting, then eases toward new states', () => {
  const scene = new THREE.Scene();
  const cat = new OfficeCat(scene);
  cat.set(CAT_STATE);
  cat.tick(1, 0);
  assert.equal(cat.root.position.x, 1, '第一次直接落到目标位置');
  cat.set({ ...CAT_STATE, x: 3, seq: 2 });
  cat.tick(1, 100);
  assert.ok(cat.root.position.x > 1 && cat.root.position.x < 3, '之后平滑逼近');
  cat.dispose();
});

test('lying pose squashes the body; grooming wobbles it', () => {
  const scene = new THREE.Scene();
  const cat = new OfficeCat(scene);
  cat.set({ ...CAT_STATE, pose: 'sleep' });
  cat.tick(1, 0);
  const body = cat.root.children[0];
  assert.equal(body.scale.y, .5, '睡觉趴下');
  cat.set({ ...CAT_STATE, pose: 'groom' });
  cat.tick(1, 400);
  assert.ok(Math.abs(body.rotation.z) > 0, '理毛时身体摇摆');
  cat.dispose();
});

test('shadowMoving reflects real motion only', () => {
  const scene = new THREE.Scene();
  const cat = new OfficeCat(scene);
  cat.set(CAT_STATE);
  cat.tick(1, 0);
  assert.equal(cat.shadowMoving, false, '到位且静止就不投影');
  cat.set({ ...CAT_STATE, x: 3, seq: 2 });
  assert.equal(cat.shadowMoving, true, '还没走到就要求投影');
  cat.dispose();
});
