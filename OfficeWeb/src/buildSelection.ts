import * as THREE from 'three';

export class BuildSelection {
  private box=new THREE.Box3();
  readonly outline=new THREE.Box3Helper(this.box,0xf7ce77);
  private material=this.outline.material as THREE.LineBasicMaterial;
  constructor(world: THREE.Scene) {
    this.outline.name='build-hover-outline';
    this.outline.visible=false;
    this.outline.raycast=()=>{};
    this.material.depthTest=true;
    world.add(this.outline);
  }
  show(object: THREE.Object3D|undefined, remove: boolean) {
    this.outline.visible=Boolean(object);
    if(!object) return;
    this.box.setFromObject(object).expandByScalar(.012);
    this.material.color.set(remove?'#ff8074':'#f7ce77');
  }
  dispose() {
    this.outline.removeFromParent();this.outline.geometry.dispose();this.material.dispose();
  }
}
