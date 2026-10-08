import * as THREE from 'three';
import type { BuildAnchor, BuildPart } from './buildTypes';

type Axis = 'x' | 'y' | 'z';
const rounded = (value: number) => Math.round(value*1000)/1000;

/** Ends follow the part's rotation, so rotating keeps the grabbed end in place. */
export function endAxis(bounds: THREE.Box3, rotation: number) {
  const size = bounds.getSize(new THREE.Vector3());
  const axis = size.x >= size.z-.00001 ? 'x' : 'z';
  const angle = rotation*Math.PI/2;
  const localX = rotation%2 ? size.z>=size.x-.00001 : size.x>=size.z-.00001;
  const direction = localX ? new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle))
    : new THREE.Vector3(Math.sin(angle),0,Math.cos(angle));
  return {axis: axis as 'x'|'z', positive: direction[axis]>=0};
}

/** Four horizontal footprint edges, following yaw even after pitch/roll. */
export function anchorEdge(bounds: THREE.Box3, rotation: number, anchor: BuildAnchor) {
  if (anchor === 'auto' || anchor === 'center') return;
  let {axis,positive}=endAxis(bounds,rotation);
  if (anchor.startsWith('side-')) {
    positive=axis==='x' ? positive : !positive;
    axis=axis==='x' ? 'z' : 'x';
  }
  const start=anchor==='start' || anchor==='side-start';
  const value=start===positive ? bounds.min[axis] : bounds.max[axis];
  return {axis,value};
}

export function snapAnchors(part: BuildPart, bounds: THREE.Box3, point: THREE.Vector3,
  normalAxis: Axis, target: THREE.Box3 | undefined, anchor: BuildAnchor = 'auto', manualHeight = 0) {
  const next = {...part};
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const targetSize = target?.getSize(new THREE.Vector3());
  const targetCenter = target?.getCenter(new THREE.Vector3());
  if (anchor === 'center') return next;
  const chosen=anchorEdge(bounds,part.rotation,anchor);
  if (chosen) {
    for (const axis of ['x','z'] as const) {
      if (axis===normalAxis) continue;
      const contact=targetSize && targetCenter && targetSize[axis]<=.55
        ? targetCenter[axis] : Math.round(point[axis]*4)/4;
      next[axis]=rounded(contact-(axis===chosen.axis ? chosen.value : center[axis]));
    }
    if (normalAxis!=='y' && !manualHeight) {
      // A bottom-edge grab must use the height grid, not raw cursor height.
      next.y=rounded(Math.round((point.y-bounds.min.y)*4)/4);
      if(target) {
        const heights=[target.min.y-bounds.min.y,target.max.y-bounds.max.y];
        const nearest=heights.sort((a,b)=>Math.abs(a-next.y)-Math.abs(b-next.y))[0];
        if(Math.abs(nearest-next.y)<=.13) next.y=rounded(nearest);
      }
    }
    return next;
  }
  for (const axis of ['x','y','z'] as Axis[]) {
    if (axis === normalAxis || (axis==='y' && manualHeight) || !target || !targetSize || !targetCenter) continue;
    // Matching narrow posts align by their axes even when the pointer hits a corner.
    if (Math.abs(size[axis]-targetSize[axis])<.002) {
      next[axis] = rounded(targetCenter[axis]-center[axis]);
      continue;
    }
    const edges = [target.min[axis]-bounds.min[axis], target.max[axis]-bounds.max[axis]];
    const nearest = edges.sort((a,b)=>Math.abs(a-next[axis])-Math.abs(b-next[axis]))[0];
    if (Math.abs(nearest-next[axis])<=.13) next[axis]=rounded(nearest);
  }
  const useEnd = anchor==='auto' && part.kind==='beam';
  if (useEnd) {
    const {axis,positive}=endAxis(bounds,part.rotation);
    if (axis!==normalAxis) {
      // Small support tops are easier to target by their centre than a single pixel.
      const contact = targetSize && targetCenter && targetSize[axis]<=.55
        ? targetCenter[axis] : Math.round(point[axis]*4)/4;
      const start = true;
      const edge = start===positive ? bounds.min[axis] : bounds.max[axis];
      next[axis]=rounded(contact-edge);
    }
  }
  return next;
}
