import * as THREE from 'three';\
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';\
 private target:CatState|null=null;\
 private geometry=new THREE.BoxGeometry(1,1,1);\
 private staticGeometry:THREE.BufferGeometry[]=[];\
 private targetPosition=new THREE.Vector3();\
  const part=(w:number,h:number,d:number,x:number,y:number,z:number,mat=this.fur)=>{\
  const part=(w:number,h:number,d:number,x:number,y:number,z:number,mat=this.fur)=>{\
   const m=new THREE.Mesh(this.geometry,mat);m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;this.body.add(m);return m;\
  };\
  for(const x of [-.10,.10])for(const z of [-.16,.15])this.legs.push(part(.065,.20,.065,x,.10,z));\
  const tail=part(.065,.065,.36,0,.36,-.37);tail.rotation.x=-.4;\
  // The head, body and tail never move relative to each other. Combine each\
  // material into one mesh; the four independently animated legs stay separate.\
  for(const material of [this.fur,this.dark]){\
   const pieces=this.body.children.filter((object):object is THREE.Mesh=>object instanceof THREE.Mesh&&object.material===material&&!this.legs.includes(object));\
   const geometries=pieces.map(mesh=>{mesh.updateMatrix();return this.geometry.clone().applyMatrix4(mesh.matrix);});\
   const merged=mergeGeometries(geometries);geometries.forEach(geometry=>geometry.dispose());\
   if(!merged)continue;\
   pieces.forEach(mesh=>this.body.remove(mesh));\
   const mesh=new THREE.Mesh(merged,material);mesh.castShadow=true;this.body.add(mesh);this.staticGeometry.push(merged);\
  }\
  this.root.position.lerp(new THREE.Vector3(s.x,s.y,s.z),1-Math.exp(-dt*12));\
  this.root.position.lerp(this.targetPosition.set(s.x,s.y,s.z),1-Math.exp(-dt*12));\
 dispose(){this.root.removeFromParent();this.geometry.dispose();this.fur.dispose();this.dark.dispose();}\
 dispose(){this.root.removeFromParent();this.geometry.dispose();this.staticGeometry.forEach(geometry=>geometry.dispose());this.fur.dispose();this.dark.dispose();}\
}\
