import * as THREE from 'three';
import { partSize, type BuildPart } from './buildTypes';
import { collisionBoxes } from './buildArch';

type Axis = 'x' | 'y' | 'z';
type Face = { axis: Axis; center: THREE.Vector3; width: number; height: number };
const axes: Axis[] = ['x','y','z'];
const tangents: Record<Axis,[Axis,Axis]> = {x:['z','y'],y:['x','z'],z:['x','y']};

/** Actual touching rectangles, including a single corner support or side seam. */
export function contactFaces(candidate: THREE.Box3[], solids: THREE.Box3[]) {
  const faces: Face[] = [];
  for (const a of candidate) for (const b of solids) {
    if (axes.some(axis => a.min[axis]>b.max[axis]+0.015 || b.min[axis]>a.max[axis]+0.015)) continue;
    for (const axis of axes) {
      const plane = Math.abs(a.min[axis]-b.max[axis])<0.015 ? a.min[axis]
        : Math.abs(a.max[axis]-b.min[axis])<0.015 ? a.max[axis] : null;
      if (plane === null) continue;
      const [u,v] = tangents[axis];
      const loU=Math.max(a.min[u],b.min[u]), hiU=Math.min(a.max[u],b.max[u]);
      const loV=Math.max(a.min[v],b.min[v]), hiV=Math.min(a.max[v],b.max[v]);
      if (hiU-loU<0.005 || hiV-loV<0.005) continue;
      const center=new THREE.Vector3();
      center[axis]=plane; center[u]=(loU+hiU)/2; center[v]=(loV+hiV)/2;
      faces.push({axis,center,width:hiU-loU,height:hiV-loV});
    }
  }
  return faces;
}

export class BuildPlacementGuide {
  readonly root = new THREE.Group();
  private plane = new THREE.PlaneGeometry(1,1);
  private edges = new THREE.EdgesGeometry(this.plane);
  private fill = new THREE.MeshBasicMaterial({color:'#55ffd1',transparent:true,opacity:0.27,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2,
    depthTest:true,depthWrite:false,side:THREE.DoubleSide,toneMapped:false});
  private edge = new THREE.LineBasicMaterial({color:'#9bffe5',depthTest:true,depthWrite:false,toneMapped:false});
  private border = new THREE.MeshBasicMaterial({color:'#9effdc',depthTest:true,depthWrite:false,
    side:THREE.DoubleSide,toneMapped:false});
  private footprintMaterial = new THREE.LineDashedMaterial({color:'#a5eeff',dashSize:0.12,gapSize:0.07,
    depthTest:true,depthWrite:false,toneMapped:false});
  private footprint = new THREE.LineSegments(this.edges,this.footprintMaterial);
  private markers: THREE.Group[] = [];
  constructor(world: THREE.Scene) {
    this.root.name='build-placement-guide';
    this.root.userData.preview=true;
    this.root.visible=false;
    this.footprint.computeLineDistances();
    this.footprint.renderOrder=1001;
    this.root.add(this.footprint);
    world.add(this.root);
    this.root.traverse(object=>{object.raycast=()=>{};});
  }
  private pose(object: THREE.Object3D, face: Face) {
    object.position.copy(face.center);
    object.rotation.set(face.axis==='y' ? -Math.PI/2 : 0,face.axis==='x' ? Math.PI/2 : 0,0);
    object.scale.set(face.width,face.height,1);
  }
  show(part: BuildPart, ghost: THREE.Group, solids: THREE.Box3[], invalid: boolean) {
    this.root.visible=true;
    this.fill.color.set(invalid ? '#ff685e' : '#55ffd1');
    this.edge.color.set(invalid ? '#ffb1a7' : '#c0ffee');
    this.border.color.set(invalid ? '#ff9a8d' : '#9effdc');
    this.footprintMaterial.color.set(invalid ? '#ff756b' : '#a5eeff');
    const [width,,height]=partSize(part);
    this.pose(this.footprint,{axis:'y',center:new THREE.Vector3(part.x,part.y+0.008,part.z),width,height});
    ghost.updateMatrixWorld(true);
    const boxes=collisionBoxes(ghost);
    const faces=contactFaces(boxes,solids).slice(0,64);
    this.root.userData.contactCount=faces.length;
    this.root.userData.invalid=invalid;
    this.root.userData.position=[part.x,part.y,part.z];
    for(let i=0;i<Math.max(faces.length,this.markers.length);i++) {
      let marker=this.markers[i];
      if(!marker) {
        marker=new THREE.Group();
        const surface=new THREE.Mesh(this.plane,this.fill);
        const outline=new THREE.LineSegments(this.edges,this.edge);
        surface.renderOrder=1002; outline.renderOrder=1003;
        surface.raycast=outline.raycast=()=>{};
        marker.add(surface,outline);
        for(let side=0;side<4;side++) {
          const bar=new THREE.Mesh(this.plane,this.border);
          bar.raycast=()=>{};bar.renderOrder=1004;marker.add(bar);
        }
        this.root.add(marker);this.markers.push(marker);
      }
      marker.visible=Boolean(faces[i]);
      if(faces[i]) {
        const face=faces[i];this.pose(marker,face);
        // Mesh strips stay visibly thick; WebGL lineWidth is often fixed at 1px.
        const tx=Math.min(.2,.035/face.width),ty=Math.min(.2,.035/face.height);
        marker.children[2].position.set(0,.5-ty/2,0);marker.children[2].scale.set(1,ty,1);
        marker.children[3].position.set(0,-.5+ty/2,0);marker.children[3].scale.set(1,ty,1);
        marker.children[4].position.set(.5-tx/2,0,0);marker.children[4].scale.set(tx,1,1);
        marker.children[5].position.set(-.5+tx/2,0,0);marker.children[5].scale.set(tx,1,1);
      }
    }
  }
  hide() { this.root.visible=false; }
  dispose() {
    this.root.removeFromParent();
    this.plane.dispose();this.edges.dispose();this.fill.dispose();this.edge.dispose();this.footprintMaterial.dispose();
    this.border.dispose();
    // computeLineDistances adds an attribute to the shared edges geometry.
  }
}
