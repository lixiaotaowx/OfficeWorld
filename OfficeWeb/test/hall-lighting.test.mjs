import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { loadTs } from './helpers.mjs';

const { HallLighting } = await import(await loadTs('hallLighting.ts'));

test('hall lighting: three ceiling panels with glow strips and a shadow rim', () => {
  const scene = new THREE.Scene();
  const lighting = new HallLighting(scene);
  assert.equal(scene.children.includes(lighting.group), true, 'rig joins the scene');
  const panels = lighting.group.children.filter(o => o.userData.ceilingLight && o.isSpotLight === undefined ? o instanceof THREE.SpotLight : o instanceof THREE.SpotLight);
  assert.equal(panels.length, 3, '三盏吊顶灯');
  const strips = lighting.group.children.filter(o => o.userData.nohit === true);
  assert.equal(strips.length, 3, '三条发光条不吃拾取');
  // 补光参数（0.1.54 的补光是函数式的，11 月是固定的冷色投影灯）。
  lighting.dispose();
  assert.equal(scene.children.includes(lighting.group), false, 'dispose removes the rig');
});

test('time-of-day intensities follow the November table', () => {
  const scene = new THREE.Scene();
  const lighting = new HallLighting(scene);
  const panels = lighting.group.children.filter(o => o instanceof THREE.SpotLight);
  lighting.setTime(true, false);
  assert.equal(panels[0].intensity, 5, '白天全亮');
  lighting.setTime(false, true);
  assert.equal(panels[0].intensity, 2.8, '傍晚暖光');
  lighting.setTime(false, false);
  assert.equal(panels[0].intensity, 1.8, '夜里只留灯条');
  lighting.dispose();
});

test('quality gate drops the shadow map below high', () => {
  const scene = new THREE.Scene();
  const lighting = new HallLighting(scene);
  const rim = lighting.group.children.find(o => o instanceof THREE.DirectionalLight);
  lighting.setQuality('high');
  assert.equal(rim.castShadow, true);
  lighting.setQuality('low');
  assert.equal(rim.castShadow, false, '低配不投影');
  lighting.dispose();
});
