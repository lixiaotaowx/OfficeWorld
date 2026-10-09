import { BUILD_GRID, gridSnap, isStructural } from './buildGrid';
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
 * - **y 的落点**：结构件（建筑/玩法）也吸到整格——用户 2026-10-09 报「我有两个拱门 差距一直都是
 *   一个小缝 对不齐」：两件各自站在略有差异的面上（−4.605 / −4.564）时，"从各自原点加整格"永远
 *   凑不到同一高度，落格之后拖一下就能齐。
 * - **家具/摆件（桌、椅、杯、书…）的 y 仍按原点加整格、保留毫米接触精度**：叠在 1.42m 桌面上的
 *   东西要精确落在桌面，强行吸到 0.25 会让它浮起/陷进去（目录里 50/70 件尺寸本来就不是整格）。
 */
export function snapMove(start:BuildPart,delta:number,axis:Axis,localBoxes:THREE.Box3[],
  targets:THREE.Box3[],fine=false) {
  const step=BUILD_GRID;
  const keepsMm=axis==='y' && !isStructural(start.kind);
  const place=(value:number)=>keepsMm?mm(value):mm(gridSnap(value));
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
