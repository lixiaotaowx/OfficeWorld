import * as THREE from 'three';
import { fitToSurface } from './buildSurface';
import type { BuildAnchor, BuildPart } from './buildTypes';

type Support={id:string;box:THREE.Box3};
const surface=new THREE.Object3D();

/** Thin top edges remain targetable even when the centre ray falls into a gap. */
export function topPlacement(part:BuildPart,ray:THREE.Ray,supports:Support[],camera:THREE.Camera,
  width:number,height:number,hitDistance=Infinity,hitId?:string,anchor:BuildAnchor='auto',hitPoint?:THREE.Vector3) {
  if(ray.direction.y>=-.015)return;
  const cursor=ray.origin.clone().addScaledVector(ray.direction,1).project(camera);
  const onRay=new THREE.Vector3(),onEdge=new THREE.Vector3();
  let best:{part:BuildPart;pixels:number;distance:number}|undefined;
  for(const {id,box} of supports){
    if(id==='island')continue;
    const y=box.max.y;
    const corners=[new THREE.Vector3(box.min.x,y,box.min.z),new THREE.Vector3(box.max.x,y,box.min.z),
      new THREE.Vector3(box.max.x,y,box.max.z),new THREE.Vector3(box.min.x,y,box.max.z)];
    for(let i=0;i<4;i++){
      ray.distanceSqToSegment(corners[i],corners[(i+1)%4],onRay,onEdge);
      const distance=onEdge.clone().sub(ray.origin).dot(ray.direction);
      const sameSurface=id===hitId && hitPoint && box.distanceToPoint(hitPoint)<.02;
      if(distance<=0 || (!sameSurface && distance>hitDistance+.02))continue;
      const screen=onEdge.clone().project(camera);
      if(screen.z<-1 || screen.z>1)continue;
      const pixels=Math.hypot((screen.x-cursor.x)*width/2,(screen.y-cursor.y)*height/2);
      if(pixels>14 || (best && (pixels>best.pixels+.5 || (Math.abs(pixels-best.pixels)<=.5 && distance>=best.distance))))continue;
      const hit={point:onEdge.clone(),object:surface,face:{normal:new THREE.Vector3(0,1,0)}} as THREE.Intersection;
      const next=fitToSurface(part,hit,0,anchor,box);
      best={part:next,pixels,distance};
    }
  }
  return best?.part;
}
