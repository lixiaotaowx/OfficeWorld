import { gridSnap, snapPart } from './buildGrid';
import * as THREE from 'three';
import { createPart } from './buildMeshes';
import type { BuildAnchor, BuildPart } from './buildTypes';
import { snapAnchors } from './buildAnchors';

const boundsCache = new Map<string, THREE.Box3>();
const millimetres = (value: number) => Math.round(value * 1000) / 1000 + 0;

/** Bounds are taken from the actual rotated mesh, including off-centre props. */
function localBounds(part: BuildPart) {
  const key = `${part.kind}:${part.fixture || ""}:${part.rotation}:${part.pitch || 0}:${part.roll || 0}:${part.scale?.join(',') || ''}`;
  if (!boundsCache.has(key)) {
    const object = createPart({ ...part, x: 0, y: 0, z: 0 });
    boundsCache.set(key, new THREE.Box3().setFromObject(object));
  }
  return boundsCache.get(key)!;
}

/**
 * 贴面放置。**水平两轴最后一定要过 `snapHorizontal`**：接触轴原来是毫米级写进去的
 * （贴着一面 0.173 的墙就存 0.173），那就等于"贴面一次、离格一辈子"。用户 2026-10-09 要求
 * 「确保不会有步长不统一的部件 … 根源修复」——所以贴面精度让位给整格：最多差 0.125 米，
 * 但世界里再也不会出现半格偏置。y 照旧不动（接触高度/桌面高度是毫米级，强行取整会浮起或陷进去）。
 */
export function fitToSurface(part: BuildPart, hit: THREE.Intersection, manualHeight: number, anchor: BuildAnchor = 'auto', targetBounds?:THREE.Box3) {
  if (!hit.face) return part;
  const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
  const axis = Math.abs(normal.y) > .999 ? 'y' : Math.abs(normal.x) > .999 ? 'x'
    : Math.abs(normal.z) > .999 ? 'z' : null;
  if (!axis) return part;
  const next = { ...part };
  // Contact fitting changes position only; orientation always belongs to the user.
  const bounds = localBounds(next);
  next.x = gridSnap(hit.point.x);
  next.z = gridSnap(hit.point.z);
  next.y = manualHeight || gridSnap(hit.point.y - bounds.getCenter(new THREE.Vector3()).y);
  if (axis === 'y' && manualHeight) return fitToPlane(part,new THREE.Vector3(part.x,part.y,part.z),anchor);
  const edge = normal[axis] > 0 ? bounds.min[axis] : bounds.max[axis];
  next[axis] = millimetres(hit.point[axis] - edge);
  const target = targetBounds || new THREE.Box3().setFromObject(hit.object);
  return snapPart(snapAnchors(next,bounds,hit.point,axis,target,anchor,manualHeight));
}

export function fitToPlane(part: BuildPart, point: THREE.Vector3, anchor: BuildAnchor = 'auto') {
  return snapPart(snapAnchors(part,localBounds(part),point,'y',undefined,anchor,part.y));
}
