import * as THREE from 'three';
import { anchorLabels, type BuildAnchor, type BuildPart } from './buildTypes';
import { anchorEdge } from './buildAnchors';
import { createGuideLabel, fitGuideLabel, guideLabelHeight } from './buildHints';

/**
 * 饼菜单式的方位槽（屏幕方向：右 = +x，上 = +y）。
 * 三条旋转提示各占一个方向，永远不叠在一起——用户要求「做成类似 blender 的饼状
 * 菜单的 ui 排列文字，不会重叠和干扰」。**不设正下方槽位**：画布底部压着建造工具栏
 * （DOM 覆盖层），贴片放那儿会被整条挡住。
 */
const SLOTS: [number,number][] = [[-1,0],[0,1],[1,0]];
/** 接点提示占右上斜槽：与"上""右"各差 45°，实测互不重叠。 */
const ANCHOR_SLOT:[number,number] = [Math.SQRT1_2,Math.SQRT1_2];
/** 槽位离中心多远（相对环半径）：推到部件轮廓之外，再留出横向余量给最宽的键帽。 */
const SLOT_REACH = 1.7;
/** 提示贴片永远画在部件与环线之上（用户：「不要遮住」）。 */
const HINT_ORDER = 900;

/** 贴片不吃深度：被部件挡掉一半就等于没提示。 */
function floatLabel(sprite:THREE.Sprite) {
  sprite.material.depthTest=false;
  sprite.material.depthWrite=false;
  sprite.renderOrder=HINT_ORDER;
  return sprite;
}

/** Rotation rings belong to the preview and never intercept picks. */
export class BuildRotationGuide {
  readonly root=new THREE.Group();
  private rings: {root:THREE.Group;label:THREE.Sprite;axis:THREE.Vector3}[]=[];
  private edge=new THREE.Line(new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({color:'#ffe19a',depthTest:true,toneMapped:false}));
  private anchorLabel?:THREE.Sprite;
  private anchor?:BuildAnchor;
  constructor(world:THREE.Scene) {
    this.root.add(this.edge);
    this.root.name='build-rotation-guide';this.root.userData.preview=true;
    for(const [key,text,color,axis] of [
      ['Q / R','左右转','#80e7a2',new THREE.Vector3(0,1,0)],
      ['X','前后翻','#ff9b8e',new THREE.Vector3(1,0,0)],
      ['Z','侧翻','#8ecfff',new THREE.Vector3(0,0,1)],
    ] as [string,string,string,THREE.Vector3][]) {
      const root=new THREE.Group();
      const points=Array.from({length:97},(_,i)=>new THREE.Vector3(Math.cos(i*Math.PI/48),Math.sin(i*Math.PI/48),0));
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({color,depthTest:true,depthWrite:false,toneMapped:false}));
      // 提示挂在 root 上（不受环的旋转/缩放影响），位置按屏幕方位摆。
      const tag=floatLabel(createGuideLabel(text,color,{key}));
      root.add(line);this.root.add(root,tag);this.rings.push({root,label:tag,axis});
    }
    this.root.traverse(o=>{o.raycast=()=>{};});
    world.add(this.root);this.hide();
  }
  show(part:BuildPart,ghost:THREE.Group,camera:THREE.Camera,anchor:BuildAnchor='auto') {
    const bounds=new THREE.Box3().setFromObject(ghost);
    bounds.getCenter(this.root.position);
    const size=bounds.getSize(new THREE.Vector3());
    const radius=Math.max(.6,size.length()*.53);
    const yaw=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),part.rotation*Math.PI/2);
    const pitch=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),(part.pitch || 0)*Math.PI/2);
    this.rings.forEach((ring,i)=>{
      const axis=ring.axis.clone();
      if(i===2)axis.applyQuaternion(pitch);
      if(i!==0)axis.applyQuaternion(yaw);
      ring.root.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),axis);
      ring.root.scale.setScalar(radius*(1+i*.06));
    });
    const distance=camera.position.distanceTo(this.root.position);
    const height=guideLabelHeight(distance);
    const right=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,0).normalize();
    const up=new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld,1).normalize();
    // 提示是 root 的子节点，root 本身就在 pivot 上（无旋转/缩放），所以这里给的是
    // 相对 pivot 的偏移：沿相机的右/上向量推到方位槽上。
    const place=(sprite:THREE.Sprite,slot:[number,number])=>{
      const reach=radius*SLOT_REACH;
      sprite.position.copy(right).multiplyScalar(slot[0]*reach).addScaledVector(up,slot[1]*reach);
    };
    this.rings.forEach((ring,i)=>{place(ring.label,SLOTS[i]);fitGuideLabel(ring.label,height);});
    if(this.anchor!==anchor) {
      this.anchorLabel?.removeFromParent();
      this.anchorLabel?.material.map?.dispose();this.anchorLabel?.material.dispose();
      this.anchorLabel=floatLabel(createGuideLabel(anchorLabels[anchor],'#ffe19a',{key:'C'}));
      this.anchorLabel.raycast=()=>{};
      this.root.add(this.anchorLabel);this.anchor=anchor;
    }
    const chosen=anchorEdge(bounds,part.rotation,anchor);
    this.edge.visible=Boolean(chosen);
    if(chosen) {
      const a=bounds.min.clone(),b=bounds.max.clone();
      a.y=b.y=bounds.min.y+.008;
      a[chosen.axis]=b[chosen.axis]=chosen.value;
      this.edge.geometry.dispose();
      this.edge.geometry=new THREE.BufferGeometry().setFromPoints([
        a.clone().sub(this.root.position),b.clone().sub(this.root.position)]);
    }
    // 接点提示也走方位槽（右上斜槽），这样四张贴片永远在同一圈上、互不遮挡，
    // 也不会像贴在高亮边那样掉进底部工具栏里。
    place(this.anchorLabel!,ANCHOR_SLOT);
    fitGuideLabel(this.anchorLabel!,height);
    this.root.visible=true;
  }
  hide(){this.root.visible=false;}
  dispose(){
    this.root.removeFromParent();
    this.root.traverse(o=>{
      if(o instanceof THREE.Line){o.geometry.dispose();(o.material as THREE.Material).dispose();}
      if(o instanceof THREE.Sprite){o.material.map?.dispose();o.material.dispose();}
    });
  }
}
