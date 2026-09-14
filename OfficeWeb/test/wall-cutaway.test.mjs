import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import * as THREE from "three";

const source = readFileSync(new URL("../src/wallCutaway.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText.replace('"three"', JSON.stringify(import.meta.resolve("three")));
const { WallCutaway, obstructsView } = await import(
  "data:text/javascript;base64," + Buffer.from(compiled).toString("base64"));

test("只裁挡在相机和焦点之间的墙，越过墙顶或转回室内则恢复", () => {
  const wall = { axis: "x", position: 10.95, min: -8.3, max: -3.5, height: 3.2 };
  const target = new THREE.Vector3(8, 1, -6);
  assert.equal(obstructsView(wall, new THREE.Vector3(14, 2, -6), target), true);
  assert.equal(obstructsView(wall, new THREE.Vector3(9, 2, -6), target), false);
  assert.equal(obstructsView(wall, new THREE.Vector3(14, 20, -6), target), false);
  assert.equal(obstructsView(wall, new THREE.Vector3(14, 2, 5), new THREE.Vector3(8, 1, 5)), false);
});

test("独立裁切材质，不裁家具和地板，转回后墙面完整恢复", () => {
  const root = new THREE.Group();
  const original = new THREE.MeshBasicMaterial();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.2, 4.6), original);
  wall.name = "Architecture_manager_side_wall";
  wall.position.set(10.95, 1.6, -5.9);
  root.add(wall);
  const desk = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), original);
  desk.name = "Manager desk"; desk.position.copy(wall.position); root.add(desk);
  const effect = new WallCutaway(); effect.attach(root);
  const camera = new THREE.PerspectiveCamera(); camera.position.set(14, 2, -6);
  const target = new THREE.Vector3(8, 1, -6);
  effect.update(camera, target, 2);
  assert.notEqual(wall.material, original);
  assert.equal(desk.material, original);
  const plane = wall.material.clippingPlanes[0];
  assert.ok(Math.abs(plane.constant - 0.35) < 0.001);
  assert.ok(plane.distanceToPoint(new THREE.Vector3(10.95, 2, -6)) < 0);
  camera.position.x = 9; effect.update(camera, target, 2);
  assert.ok(plane.constant > 3.2);
  assert.equal(original.clippingPlanes, null);
  effect.dispose();
});

test("多层墙、内饰面、天花梁和玻璃立柱全部参与前景裁切", () => {
  const root = new THREE.Group();
  const parts = [
    ["Architecture rear room wall", 6, 1.6, -8.18],
    ["Manager interior color panel", 8.8, 1.6, -8.035],
    ["Meeting interior color panel", 3.75, 1.6, -8.035],
    ["Rear open top beam", 6, 3.23, -8.15],
    ["Window upper beam", -4.5, 3.6, -8.18],
    ["Window vertical frame", -4.5, 1.8, -8.18],
    ["Meeting side frame", 1, 1.6, -6],
    ["Open top room beam", 1, 3.23, -6],
    ["Manager office mullion", 7.85, 1.6, -3.8],
    ["Manager office top rail", 8.77, 3.2, -3.8],
    ["Meeting room glazing", 4.35, 1.6, -3.8],
  ].map(([name, x, y, z]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.1, .1, .1), new THREE.MeshBasicMaterial());
    mesh.name = name; mesh.position.set(x, y, z); root.add(mesh); return mesh;
  });
  const effect = new WallCutaway(); effect.attach(root);
  for (const mesh of parts) assert.equal(mesh.material.clippingPlanes?.length, 1, mesh.name);
  const camera = new THREE.PerspectiveCamera(); camera.position.set(4, 2, -15);
  effect.update(camera, new THREE.Vector3(4, 1, 0), 2);
  // Rear wall and a second glass wall further inside must both be cut.
  for (const index of [0, 1, 2, 3, 4, 5, 8, 9, 10])
    assert.ok(parts[index].material.clippingPlanes[0].constant < .351, parts[index].name);
  effect.dispose();
});
