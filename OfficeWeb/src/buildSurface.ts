import { gridSnap } from './buildGrid';
import * as THREE from 'three';
import { createPart } from './buildMeshes';
import type { BuildAnchor, BuildPart } from './buildTypes';
import { snapAnchors } from './buildAnchors';

const boundsCache = new Map<string, THREE.Box3>();
const millimetres = (value: number) => Math.round(value * 1000) / 1000;
const grid = gridSnap;

/** Bounds are taken from the actual rotated mesh, including off-centre props. */
function localBounds(part: BuildPart) {
  const key = `${part.kind}:${part.fixture || ""}:${part.rotation}:${part.pitch || 0}:${part.roll || 0}:${part.scale?.join(',') || ''}`;
  if (!boundsCache.has(key)) {
    const object = createPart({ ...part, x: 0, y: 0, z: 0 });
    boundsCache.set(key, new THREE.Box3().setFromObject(object));
  }
  return boundsCache.get(key)!;
}

/** Tangential axes keep the quarter-metre grid; the contact axis fits exactly. */
export function fitToSurface(part: BuildPart, hit: THREE.Intersection, manualHeight: number, anchor: BuildAnchor = 'auto', targetBounds?:THREE.Box3) {
  if (!hit.face) return part;
  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  const axis = Math.abs(normal.y) > .999 ? 'y' : Math.abs(normal.x) > .999 ? 'x'
    : Math.abs(normal.z) > .999 ? 'z' : null;
  if (!axis) return part;
  const next = { ...part };
  // Contact fitting changes position only; orientation always belongs to the user.
  const bounds = localBounds(next);
  next.x = grid(hit.point.x);
  next.z = grid(hit.point.z);
  next.y = manualHeight || grid(hit.point.y - bounds.getCenter(new THREE.Vector3()).y);
  if (axis === 'y' && manualHeight) return fitToPlane(part,new THREE.Vector3(part.x,part.y,part.z),anchor);
  const edge = normal[axis] > 0 ? bounds.min[axis] : bounds.max[axis];
  next[axis] = millimetres(hit.point[axis] - edge);
  const target = targetBounds || new THREE.Box3().setFromObject(hit.object);
  return snapAnchors(next,bounds,hit.point,axis,target,anchor,manualHeight);
}

export function fitToPlane(part: BuildPart, point: THREE.Vector3, anchor: BuildAnchor = 'auto') {
  return snapAnchors(part,localBounds(part),point,'y',undefined,anchor,part.y);
}
