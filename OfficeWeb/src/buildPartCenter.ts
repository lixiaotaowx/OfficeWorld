import * as THREE from 'three';
import { createPart } from './buildMeshes';
import type { BuildPart } from './buildTypes';

// Measure each geometry template once. Quarter-turn rotations preserve exact
// bounds, so subsequent previews need only the centre and half dimensions.
const templates = new Map<string, {center:THREE.Vector3;half:THREE.Vector3}>();
function template(part:BuildPart) {
  const key=`${part.fixture ? 'fixture' : 'kind'}:${part.fixture || part.kind}`;
  let bounds=templates.get(key);
  if(!bounds) {
    const mesh=createPart({...part,x:0,y:0,z:0,rotation:0,pitch:0,roll:0,scale:undefined});
    const box=new THREE.Box3().setFromObject(mesh);
    bounds={center:box.getCenter(new THREE.Vector3()),half:box.getSize(new THREE.Vector3()).multiplyScalar(.5)};
    mesh.traverse(object=>{
      if(object instanceof THREE.Mesh && object.geometry.type!=='BoxGeometry')object.geometry.dispose();
    });
    templates.set(key,bounds);
  }
  return bounds;
}

/** World-space geometry centre, including bottom-origin rebasing of tilted parts. */
export function partCenter(part:BuildPart) {
  const bounds=template(part),scale=new THREE.Vector3(...(part.scale || [1,1,1]));
  const offset=bounds.center.clone().multiply(scale);
  if(part.pitch || part.roll) {
    const half=bounds.half.clone().multiply(scale);
    const rotation=new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(
      (part.pitch || 0)*Math.PI/2,0,(part.roll || 0)*Math.PI/2,'XYZ')).elements;
    // tiltContents centres X/Z and puts the lowest point at local Y=0.
    offset.set(0,Math.abs(rotation[1])*half.x+Math.abs(rotation[5])*half.y+Math.abs(rotation[9])*half.z,0);
  }
  offset.applyAxisAngle(new THREE.Vector3(0,1,0),part.rotation*Math.PI/2);
  return offset.add(new THREE.Vector3(part.x,part.y,part.z));
}
