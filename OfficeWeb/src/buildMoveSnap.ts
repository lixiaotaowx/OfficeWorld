import { BUILD_GRID, gridSnap } from './buildGrid';
import type * as THREE from 'three';
import type { BuildPart } from './buildTypes';

type Axis='x'|'y'|'z';
const axes:Axis[]=['x','y','z'];
const mm=(n:number)=>Math.round(n*1000)/1000 + 0;

/**
 * Snap displacement from the saved origin, never the gizmo's geometric centre.
 *
 * 2026-10-08（用户：「有些部件移动单位有问题 没有按照一个格子的大小步长，完整检查」）：
 * - **水平两轴（x/z）落点吸附到网格**，不再是"相对原点加整格"：离格的老部件（早期贴面/桥接留下的
 *   毫米偏置）拖一下就回到格子上，之后每一步都正好是一格。贴面的磁吸候选也走同一套取整，
 *   否则"靠近边缘自动贴合"会把步长变成 0.19/0.31 这种不是整格的量。
 * - **y 仍按原点加整格、保留毫米接触精度**：叠在桌面（1.42m）或方块顶（0.34m）上的东西必须精确
 *   落在那一层，强行吸到 0.25 会让它浮起/陷进去（目录里 50/70 件部件的尺寸本来就不是整格）。
 */
export function snapMove(start:BuildPart,delta:number,axis:Axis,localBoxes:THREE.Box3[],
  targets:THREE.Box3[],fine=false) {
  const step=BUILD_GRID;
  const place=(value:number)=>axis==='y'?mm(value):mm(gridSnap(value));
  const part={...start,[axis]:place(start[axis]+Math.round(delta/step)*step)};
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
  if(best!==undefined)part[axis]=place(best);
  return {part,aligned:best!==undefined,step};
}
