import * as THREE from 'three';
import { traverse } from './navigation';

/** Recheck every frame against the latest collaborative build, including height. */
export function advancePath(position: THREE.Vector3, path: THREE.Vector3[], distance: number) {
  while (path.length && distance > 0) {
    const direction = path[0].clone().sub(position);
    direction.y = 0;
    const length = direction.length();
    const target = length <= distance ? path[0] : position.clone().addScaledVector(direction,distance/length);
    const next = traverse(position,target);
    if (!next) { path.length = 0; return; }
    position.copy(next);
    if (length <= distance) { distance -= length; path.shift(); }
    else return;
  }
}
