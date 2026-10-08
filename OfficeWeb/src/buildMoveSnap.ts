import { BUILD_GRID } from './buildGrid';
import type * as THREE from 'three';
import type { BuildPart } from './buildTypes';

type Axis='x'|'y'|'z';
const axes:Axis[]=['x','y','z'];
const mm=(n:number)=>Math.round(n*1000)/1000;

/** Snap displacement from the saved origin, never the gizmo's geometric centre. */
export function snapMove(start:BuildPart,delta:number,axis:Axis,localBoxes:THREE.Box3[],
  targets:THREE.Box3[],fine=false) {
  const step=BUILD_GRID;
  const part={...start,[axis]:mm(start[axis]+Math.round(delta/step)*step)};
  if(Math.abs(delta)<step/2 || fine)return {part,aligned:false,step};
  const raw=start[axis]+delta;
  let bestDistance=.075,best:number|undefined;
  const tangents=axes.filter(a=>a!==axis);
  for(const box of localBoxes)for(const target of targets){
    // Only magnetise geometry already overlapping/touching on both other axes.
    // Hollow doors/arches use their individual solid pieces, not a filled box.
    if(tangents.some(a=>start[a]+box.min[a]>target.max[a]+.012 || start[a]+box.max[a]<target.min[a]-.012))continue;
    const candidates=[target.min[axis]-box.max[axis],target.max[axis]-box.min[axis],
      target.min[axis]-box.min[axis],target.max[axis]-box.max[axis]];
    for(const value of candidates){
      const distance=Math.abs(value-raw);
      if(distance<bestDistance){bestDistance=distance;best=value;}
    }
  }
  if(best!==undefined)part[axis]=mm(best);
  return {part,aligned:best!==undefined,step};
}
