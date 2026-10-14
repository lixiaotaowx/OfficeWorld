import * as THREE from 'three';
import { createPart } from './buildMeshes';
import { angleKey } from './buildPartPose';
import type { BuildPart } from './buildTypes';

type PreviewRow={part:BuildPart;preview:THREE.Group;outline:THREE.Box3Helper};
export function updateMovePreview(row:PreviewRow,target:BuildPart,world:THREE.Scene) {
  const key=`${target.kind}:${target.color}:${angleKey(target)}:${target.scale?.join(',') || ''}`;
  if(row.preview.userData.partKey!==key) {
    row.preview.removeFromParent();
    row.preview.traverse(o=>{if(o instanceof THREE.Mesh&&o.geometry.type!=='BoxGeometry')o.geometry.dispose();});
    row.preview=createPart({...target,color:row.part.color});delete row.preview.userData.buildId;
    row.preview.name='build-multi-preview';row.preview.userData.preview=true;
    row.preview.userData.partColor=row.part.color;row.preview.userData.partKey=key;
    row.preview.traverse(o=>{o.raycast=()=>{};});world.add(row.preview);
  }
  row.preview.position.set(target.x,target.y,target.z);
  row.preview.rotation.y=target.rotation*Math.PI/2;
  row.outline.box.setFromObject(row.preview);row.outline.updateMatrixWorld(true);
}

export function createCompanion(row:{part:BuildPart;object:THREE.Group},world:THREE.Scene) {
  const preview=createPart(row.part);delete preview.userData.buildId;
  preview.name='build-multi-preview';preview.userData.preview=true;
  preview.traverse(o=>{o.raycast=()=>{};});row.object.visible=false;
  const outline=new THREE.Box3Helper(new THREE.Box3(),0xffd280);outline.raycast=()=>{};
  world.add(preview,outline);return {...row,preview,outline};
}

export function moveBounds(preview:THREE.Group,companions:{preview:THREE.Group}[]) {
  const bounds=new THREE.Box3().setFromObject(preview);
  for(const row of companions)bounds.union(new THREE.Box3().setFromObject(row.preview));
  return bounds;
}

export function renderMainPreview(preview:THREE.Group|undefined,previousKey:string,part:BuildPart,world:THREE.Scene) {
  const key=`${part.kind}:${part.color}:${angleKey(part)}:${part.scale?.join(',') || ''}`;
  if(!preview || previousKey!==key){
    preview?.removeFromParent();
    preview?.traverse(o=>{if(o instanceof THREE.Mesh && o.geometry.type!=='BoxGeometry')o.geometry.dispose();});
    preview=createPart(part);
    preview.name='build-move-preview';
    delete preview.userData.buildId;preview.userData.preview=true;
    preview.traverse(o=>{o.raycast=()=>{};});world.add(preview);
  }else preview.position.set(part.x,part.y,part.z);
  return {preview,key};
}
