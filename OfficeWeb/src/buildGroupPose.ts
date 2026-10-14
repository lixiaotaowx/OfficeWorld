import type * as THREE from 'three';
import { fixtureFor } from './buildFixtures';
import { catalog, type BuildPart } from './buildTypes';
import { snapPart } from './buildGrid';

export function groupPose(start:BuildPart,pivot:THREE.Vector3,rotate:number,tilt:{pitch:number;roll:number},factors:[number,number,number]):BuildPart {
  const turn=rotate*Math.PI/2;
  const cos=Math.cos(turn),sin=Math.sin(turn);
  const dx=start.x-pivot.x,dz=start.z-pivot.z;
  const scaled=factors.some(value=>value!==1);
  let x=pivot.x+dx*cos+dz*sin;
  let z=pivot.z-dx*sin+dz*cos;
  let y=start.y;
  if(scaled) {
    x=pivot.x+(x-pivot.x)*factors[0];
    y=pivot.y+(start.y-pivot.y)*factors[1];
    z=pivot.z+(z-pivot.z)*factors[2];
  }
  const next:BuildPart={...start,x,y,z,
    rotation:(((start.rotation+rotate)%4)+4)%4,
    pitch:start.pitch?(start.pitch+tilt.pitch)%4:undefined,
    roll:start.roll?(start.roll+tilt.roll)%4:undefined};
  if(tilt.pitch)next.pitch=(((next.pitch||0)+tilt.pitch)%4+4)%4;
  if(tilt.roll)next.roll=(((next.roll||0)+tilt.roll)%4+4)%4;
  if(scaled) {
    const base=fixtureFor(start)?.dimensions || catalog.find(item=>item.id===start.kind)!.dimensions;
    const scale:[number,number,number]=[...(start.scale || [1,1,1])];
    for(const index of [0,1,2]) {
      const factor=factors[index];
      if(factor===1)continue;
      // 和单件缩放同一条规则：乘完之后仍按 0.25 格取整（缩放尺寸必须整格）。
      scale[index]=Math.max(.25,Math.round(base[index]*scale[index]*factor*4)/4)/base[index];
    }
    next.scale=scale;
  }
  return snapPart(next);
}

export const sameMovePart=(a:BuildPart,b:BuildPart)=>JSON.stringify(a.scale)===JSON.stringify(b.scale)
  && ['x','y','z','rotation','pitch','roll','color'].every(k=>(a[k as keyof BuildPart] || 0)===(b[k as keyof BuildPart] || 0));
