import * as THREE from 'three';
import { catalog, type BuildPart } from './buildTypes';
import { fixtureFor } from './buildFixtures';
import { gridSnap, snapPart } from './buildGrid';
import { partOrientation, partQuaternion } from './buildPartPose';
import { partCenter } from './buildPartCenter';

export type ModalMode = 'translate' | 'rotate' | 'scale';
export type ModalAxis = 'x' | 'y' | 'z';
export type ModalConstraint = {axis:ModalAxis;plane:boolean;local:boolean};
export type ModalIntent = {
  mode:ModalMode;
  constraint?:ModalConstraint;
  delta:THREE.Vector3;
  amount:number;
};
const axes:ModalAxis[]=['x','y','z'];

/** Axis repeated: world → local → unrestricted, as in Blender. */
export function nextConstraint(current:ModalConstraint|undefined,axis:ModalAxis,plane:boolean) {
  if(current?.axis!==axis || current.plane!==plane)return {axis,plane,local:false};
  return current.local ? undefined : {...current,local:true};
}
export function numericError(mode:ModalMode,input:string) {
  if(!input)return '';
  const value=Number(input);
  if(!Number.isFinite(value) || !/^-?(?:\d+\.?\d*|\.\d+)$/.test(input))return '请输入完整数字';
  if(mode==='scale' && value<=0)return '缩放倍数必须大于 0';
  if(mode==='rotate' && Math.abs(value/90-Math.round(value/90))>1e-8)return '当前建筑旋转须为 90° 的整数倍';
  return '';
}

export function modalParts(parts:BuildPart[],pivot:THREE.Vector3,intent:ModalIntent):BuildPart[] {
  const {mode,constraint,amount}=intent;
  if((mode==='scale' && amount===1) || (mode==='rotate' && Math.round(amount/90)===0))return parts.map(p=>({...p}));
  const basis=constraint?.local ? partQuaternion(parts[0]) : new THREE.Quaternion();
  const inverse=basis.clone().invert();
  const allowed=(axis:ModalAxis)=>!constraint || (constraint.plane ? axis!==constraint.axis : axis===constraint.axis);
  const delta=intent.delta.clone().applyQuaternion(inverse);
  for(const axis of axes)if(!allowed(axis))delta[axis]=0;
  delta.applyQuaternion(basis);
  const axis=new THREE.Vector3();axis[constraint?.axis || 'y']=1;
  axis.applyQuaternion(basis);
  const rotation=new THREE.Quaternion().setFromAxisAngle(axis,Math.round(amount/90)*Math.PI/2);
  const factors=new THREE.Vector3(...axes.map(a=>allowed(a)?amount:1));
  return parts.map(part=>{
    const next={...part};
    const origin=new THREE.Vector3(part.x,part.y,part.z);
    if(mode==='translate') {
      origin.add(delta);
      // An unconstrained ground move preserves furniture's exact support height.
      for(const a of axes)if(Math.abs(delta[a])>1e-9)next[a]=gridSnap(origin[a]);
      return next;
    }
    if(mode==='rotate') {
      origin.copy(partCenter(part));
      origin.sub(pivot).applyQuaternion(rotation).add(pivot);
      Object.assign(next,partOrientation(rotation.clone().multiply(partQuaternion(part))));
    }else{
      origin.copy(partCenter(part));
      origin.sub(pivot).applyQuaternion(inverse).multiply(factors).applyQuaternion(basis).add(pivot);
      const base=fixtureFor(part)?.dimensions || catalog.find(item=>item.id===part.kind)!.dimensions;
      const orientation=partQuaternion(part);
      next.scale=axes.map((a,i)=>{
        const direction=new THREE.Vector3();direction[a]=1;
        direction.applyQuaternion(orientation).applyQuaternion(inverse).multiply(factors);
        const factor=direction.length();
        if(Math.abs(factor-1)<1e-9)return part.scale?.[i] ?? 1;
        const dimension=base[i]*(part.scale?.[i] ?? 1)*factor;
        return Math.max(.25,gridSnap(dimension))/base[i];
      }) as [number,number,number];
    }
    // Meshes keep their bottom-origin storage convention. Rebase the transformed
    // centre to that origin after dimensions and orientation have changed.
    const offset=partCenter({...next,x:0,y:0,z:0});
    origin.sub(offset);
    next.x=origin.x;next.y=origin.y;next.z=origin.z;
    return snapPart(next);
  });
}
