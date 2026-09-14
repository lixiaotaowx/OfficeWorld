import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import * as THREE from 'three';
const require = createRequire(import.meta.url);
const code = ts.transpileModule(readFileSync(new URL('../src/disposeResources.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
}).outputText;
const exports = {};
new Function('require', 'exports', code)(name => name === 'three' ? THREE : require(name), exports);

test('releases shared geometry, material, texture, bitmap and skeleton once per owned model', () => {
  const priorBitmap = globalThis.ImageBitmap;
  let closed = 0;
  globalThis.ImageBitmap = class { close() { closed++; } };
  try {
    const texture = new THREE.Texture(new ImageBitmap());
    const material = new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture });
    const geometry = new THREE.BoxGeometry();
    const skeleton = new THREE.Skeleton([new THREE.Bone()]);
    skeleton.computeBoneTexture();
    const counts = { geometry: 0, material: 0, texture: 0, boneTexture: 0 };
    for (const [key, resource] of Object.entries({geometry, material, texture, boneTexture: skeleton.boneTexture})) {
      resource.addEventListener('dispose', () => counts[key]++);
    }
    const group = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.SkinnedMesh(geometry, material);
      mesh.skeleton = skeleton; group.add(mesh);
    }
    exports.disposeResources(group);
    assert.deepEqual(counts, { geometry: 1, material: 1, texture: 1, boneTexture: 1 });
    assert.equal(closed, 1);
  } finally { globalThis.ImageBitmap = priorBitmap; }
});
