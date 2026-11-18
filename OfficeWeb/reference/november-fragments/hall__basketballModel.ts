import * as THREE from 'three';\
import { ownModelGeometry } from './modelResources';\
    if(board||rail){object.geometry=object.geometry.clone();object.geometry.scale(1,board ? .96 : 1,board ? .97 : .955);object.userData.modelOwnedGeometry=true;}\
    if(board||rail){object.geometry=ownModelGeometry(object.geometry.clone());object.geometry.scale(1,board ? .96 : 1,board ? .97 : .955);}\
  stand.position.y = size[1] / 2; stand.userData.token = 'model';stand.userData.modelOwnedGeometry=true;stand.userData.modelOwnedMaterial=true;root.add(stand);\
  const stand = new THREE.Mesh(ownModelGeometry(new THREE.BoxGeometry(size[0], size[1], size[2])),\
    ownModelMaterial(new THREE.MeshStandardMaterial({ color: '#d8cbb6', transparent: true, opacity: 0.45, roughness: 1 })));\
  stand.position.y = size[1] / 2; stand.userData.token = 'model';root.add(stand);\
