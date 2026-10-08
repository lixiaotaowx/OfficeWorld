import * as THREE from 'three';
import type { BuildPart } from './buildTypes';

/** Tilt the mesh contents, then keep the part origin at its bottom centre. */
export function tiltContents(root: THREE.Group, part: BuildPart) {
  if (!part.pitch && !part.roll) return;
  const contents = new THREE.Group();
  for (const child of [...root.children]) contents.add(child);
  contents.rotation.set((part.pitch || 0)*Math.PI/2, 0, (part.roll || 0)*Math.PI/2, 'XYZ');
  root.add(contents);
  const bounds = new THREE.Box3().setFromObject(contents);
  const center = bounds.getCenter(new THREE.Vector3());
  contents.position.set(-center.x, -bounds.min.y, -center.z);
}
