import * as THREE from 'three';

// Square outside (3 × 3 m), a 2 m wide opening and a true semicircular crown.
// Only the opening curves. The extrusion has hard, square edges and no bevel.
const outline = new THREE.Shape();
outline.moveTo(-1.5,0);
outline.lineTo(-1.5,3);
outline.lineTo(1.5,3);
outline.lineTo(1.5,0);
outline.lineTo(1,0);
outline.lineTo(1,1.5);
outline.absarc(0,1.5,1,0,Math.PI,false);
outline.lineTo(-1,0);
outline.closePath();
const geometry = new THREE.ExtrudeGeometry(outline,{depth:0.5,steps:1,bevelEnabled:false,curveSegments:48});
geometry.translate(0,0,-0.25);
geometry.computeBoundingBox();

export function createArch(material: THREE.Material) {
  const mesh=new THREE.Mesh(geometry,material);
  mesh.name='square-outside-round-inside-arch';
  mesh.castShadow=mesh.receiveShadow=true;
  // Navigation/contact proxies must not use the full bounding box: that would
  // block the door opening and highlight imaginary contact across the hole.
  const boxes: number[][]=[[-1.5,0,-.25,-1,3,.25],[1,0,-.25,1.5,3,.25]];
  const crown=(x:number)=>1.5+Math.sqrt(Math.max(0,1-x*x));
  for(let i=0;i<64;i++) {
    const left=-1+i/32,right=left+1/32;
    boxes.push([left,Math.min(crown(left),crown(right)),-.25,right,3,.25]);
  }
  mesh.userData.localSolids=boxes;
  return mesh;
}

/** Bounds for regular boxes, hollow shape proxies for the rounded arch. */
export function collisionBoxes(object: THREE.Object3D) {
  const boxes: THREE.Box3[]=[];
  object.updateWorldMatrix(true,true);
  object.traverse(child=>{
    if(!(child instanceof THREE.Mesh) || child.userData.noBuildCollision) return;
    const custom=child.userData.localSolids as number[][] | undefined;
    if(custom) for(const [x,y,z,a,b,c] of custom)
      boxes.push(new THREE.Box3(new THREE.Vector3(x,y,z),new THREE.Vector3(a,b,c)).applyMatrix4(child.matrixWorld));
    else boxes.push(new THREE.Box3().setFromObject(child));
  });
  return boxes;
}

/**
 * 可攀爬柱体（直梯）：部件本地点写在 `userData.localClimb` 里，跟着部件的移动/旋转/缩放走。
 * 除了世界盒，还要把**梯面法线**（本地 +Z）一起旋转到世界坐标——爬梯时人就朝这个方向看；
 * 直接按世界盒的长宽猜"哪根轴薄"会被缩放误导，所以用部件自己声明的轴。
 */
export function climbColumns(object: THREE.Object3D) {
  const local=object.userData.localClimb as {min:number[];max:number[];normal?:number[]} | undefined;
  if(!local) return [];
  object.updateWorldMatrix(true,false);
  const scale=(object.userData.buildScale as number[] | undefined) ?? [1,1,1];
  const point=(row:number[],i:number)=>row[i]*scale[i];
  // 盒必须走 `Box3.applyMatrix4`（它会取 8 个角的轴对齐包围盒）；只把 min/max 两个角转过去，
  // 旋转 90° 后 z 区间会反过来，`climbAt` 就永远判定"不在梯子里"（踩过）。
  const box=new THREE.Box3(
    new THREE.Vector3(point(local.min,0),point(local.min,1),point(local.min,2)),
    new THREE.Vector3(point(local.max,0),point(local.max,1),point(local.max,2)),
  ).applyMatrix4(object.matrixWorld);
  const normal=new THREE.Vector3(...((local.normal ?? [0,0,1]) as [number,number,number]))
    .transformDirection(object.matrixWorld).setY(0);
  if(normal.lengthSq()<1e-9) normal.set(0,0,1);
  normal.normalize();
  return [{min:box.min,max:box.max,normalX:normal.x,normalZ:normal.z}];
}
