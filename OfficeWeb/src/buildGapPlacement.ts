import * as THREE from 'three';
import { createPart } from './buildMeshes';
import { collisionBoxes } from './buildArch';
import { fitToPlane } from './buildSurface';
import { gridSnap, snapPart } from './buildGrid';
import type { BuildAnchor, BuildPart } from './buildTypes';

type Support = { id: string; box: THREE.Box3 };
const feetCache = new Map<string, THREE.Box3[]>();
const round = (n: number) => Math.round(n*1000)/1000 || 0;

function feetOf(part: BuildPart) {
  const key = `${part.kind}:${part.rotation}:${part.pitch || 0}:${part.roll || 0}`;
  if (!feetCache.has(key)) {
    const boxes = collisionBoxes(createPart({...part,x:0,y:0,z:0}));
    const bottom = Math.min(...boxes.map(b=>b.min.y));
    feetCache.set(key,boxes.filter(b=>Math.abs(b.min.y-bottom)<.002));
  }
  return feetCache.get(key)!;
}

/** The cursor can point through a hole while both feet rest on real supports.
 * Infer their shared top plane without adding a solid/pickable face to the hole.
 * A nearer visible object always wins. No support is required for free building.
 */
export function gapPlacement(part: BuildPart, ray: THREE.Ray, supports: Support[],
  hitDistance = Infinity, anchor: BuildAnchor = 'auto'): BuildPart | undefined {
  if (ray.direction.y>=-.01) return;
  const feet = feetOf(part);
  if (!feet.length) return;
  const bottom = feet[0].min.y;
  const footprint = feet.reduce((box,foot)=>box.union(foot),new THREE.Box3());
  const levels = new Map<number,Support[]>();
  for(const support of supports) {
    const y=round(support.box.max.y-bottom);
    const rows=levels.get(y)||[];
    rows.push(support);levels.set(y,rows);
  }
  let best: {part:BuildPart;distance:number;area:number;offset:number} | undefined;
  for(const [y,rows] of levels) {
    const point=ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-(y+bottom)),new THREE.Vector3());
    if(!point) continue;
    const distance=point.distanceTo(ray.origin);
    if(distance>=hitDistance-.02 || (best && distance>best.distance+.02)) continue;
    let base={...part,x:Math.round(point.x*4)/4 || 0,y,z:Math.round(point.z*4)/4 || 0};
    // In automatic mode a bridge is held between its supports, not at either end.
    if(anchor!=='auto') base=fitToPlane(base,point,anchor);
    const nearby=rows.filter(({box})=>box.max.x>=base.x+footprint.min.x-.35 &&
      box.min.x<=base.x+footprint.max.x+.35 && box.max.z>=base.z+footprint.min.z-.35 &&
      box.min.z<=base.z+footprint.max.z+.35);
    if(new Set(nearby.map(s=>s.id)).size<2) continue;
    const candidates=[base];
    // Small magnetic correction centres each real foot on its column top.
    // 取整到 0.25 网格：以前直接写 `b-a`（毫米级），于是"两根柱子之间搭的梁"会落在
    // 半格偏置上（用户报"有些部件移动单位有问题，没有按照一个格子的大小步长"），
    // 而且此后每次拖动都带着这个偏置。
    for(const foot of feet) for(const {box} of nearby) {
      const a=foot.getCenter(new THREE.Vector3()),b=box.getCenter(new THREE.Vector3());
      const x=gridSnap(round(b.x-a.x)),z=gridSnap(round(b.z-a.z));
      if(Math.abs(x-base.x)<=.35 && Math.abs(z-base.z)<=.35) candidates.push({...base,x,z});
    }
    for(const candidate of candidates) {
      const ids=new Set<string>();let area=0;
      for(const foot of feet) for(const {id,box} of nearby) {
        const dx=Math.min(candidate.x+foot.max.x,box.max.x)-Math.max(candidate.x+foot.min.x,box.min.x);
        const dz=Math.min(candidate.z+foot.max.z,box.max.z)-Math.max(candidate.z+foot.min.z,box.min.z);
        if(dx>.01 && dz>.01){ids.add(id);area+=dx*dz;}
      }
      if(ids.size<2) continue;
      const offset=Math.hypot(candidate.x-base.x,candidate.z-base.z);
      if(!best || distance<best.distance-.02 || area>best.area+.0001 ||
        (Math.abs(area-best.area)<.0001 && offset<best.offset)) best={part:candidate,distance,area,offset};
    }
  }
  // 出口再兜一次整格：不确定锚点模式（anchor!=='auto'）会走 `fitToPlane`，那条路已经落格，
  // 这里保证**任何**返回都满足"水平两轴永远整格"。
  return best ? snapPart(best.part) : undefined;
}
