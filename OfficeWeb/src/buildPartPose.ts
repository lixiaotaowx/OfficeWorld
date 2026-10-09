import * as THREE from 'three';
import type { BuildPart } from './buildTypes';

const quarter = Math.PI / 2;

/** Quarter-turn orientation of a part, the single source for gizmo readouts. */
export function partQuaternion(part: Pick<BuildPart, 'rotation' | 'pitch' | 'roll'>) {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(
    (part.pitch || 0) * quarter, part.rotation * quarter, (part.roll || 0) * quarter, 'YXZ'));
}

/** Snap an arbitrary quaternion back to the four quarter-turns per axis. */
export function partOrientation(q: THREE.Quaternion) {
  let best = { rotation: 0, pitch: 0, roll: 0 }, score = -1, cost = Infinity;
  for (let rotation = 0; rotation < 4; rotation++) for (let pitch = 0; pitch < 4; pitch++) for (let roll = 0; roll < 4; roll++) {
    const next = { rotation, pitch, roll };
    const dot = Math.abs(q.dot(partQuaternion(next)));
    const nextCost = Math.min(pitch, 4 - pitch) + Math.min(roll, 4 - roll);
    if (dot > score + 1e-8 || (Math.abs(dot - score) < 1e-8 && nextCost < cost)) { score = dot; cost = nextCost; best = next; }
  }
  return best;
}

/** Identity of an orientation, used to notice that the palette changed it. */
export function angleKey(part: Pick<BuildPart, 'rotation' | 'pitch' | 'roll'>) {
  return `${part.rotation}:${part.pitch || 0}:${part.roll || 0}`;
}
