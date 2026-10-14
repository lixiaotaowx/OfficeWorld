import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { loadTs } from './helpers.mjs';
const urls = new Map();
const { chestUnread, BuildChestUnread } = await import(await loadTs('buildChestUnread.ts', urls));
const { updateBuildFlags } = await import(await loadTs('buildArchitecture.ts', urls));
const chest = { id:'box', kind:'chest', color:'#b4c5a0', x:2,y:0,z:3,
  chestPeople:{creator:{id:'author'},readers:[]} };
test('broadcast unread is independent per viewer, including late joiners', () => {
  assert.equal(chestUnread(chest,'author'),false);
  assert.equal(chestUnread(chest,''),false);
  assert.equal(chestUnread(chest,'alice'),true);
  const read = {...chest,chestPeople:{...chest.chestPeople,readers:[{id:'alice'}]}};
  assert.equal(chestUnread(read,'alice'),false);
  assert.equal(chestUnread(read,'bob'),true);
  assert.equal(chestUnread({...chest,chestPeople:undefined},'bob'),false);
});
test('automatic arrow points down, gently glows, never intercepts picking, and is removed on read or destroy', () => {
  const world = new THREE.Scene(), object = new THREE.Group();
  object.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1)));
  const objects = new Map([['box',object]]);
  const decoration = new BuildChestUnread(world,'alice');
  decoration.sync([chest],objects);
  const root=world.children[0], panel=root.userData.arrowPanels[0];
  const direction=new THREE.Vector3(0,0,1).applyEuler(root.rotation);
  assert.ok(direction.y < -.99);
  updateBuildFlags(world,0); const start=panel.getWorldPosition(new THREE.Vector3()).y;
  updateBuildFlags(world,.65);
  assert.ok(panel.getWorldPosition(new THREE.Vector3()).y < start);
  assert.ok(panel.material.emissiveIntensity <= .16);
  assert.equal(panel.material.emissive.getHexString(),panel.material.color.getHexString());
  assert.ok(panel.userData.glowHalo.material.opacity <= .08);
  const hits=[]; root.traverse(child=>child.raycast({},hits)); assert.equal(hits.length,0);
  decoration.sync([{...chest,chestPeople:{...chest.chestPeople,readers:[{id:'alice'}]}}],objects);
  assert.equal(world.children.length,0);
  decoration.sync([chest],objects); decoration.dispose(); assert.equal(world.children.length,0);
  object.children[0].geometry.dispose(); object.children[0].material.dispose();
});
