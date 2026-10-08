import * as THREE from 'three';

// Geometry now comes from the persisted, editable scene fixtures.
export function buildEnvironment(world: THREE.Scene) {
  const root=new THREE.Group();
  root.name='box-island';
  world.add(root);
  return root;
}
