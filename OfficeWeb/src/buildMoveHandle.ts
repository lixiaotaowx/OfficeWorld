import { fixtureFor } from './buildFixtures';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { createPart } from './buildMeshes';

import { applyGizmoLook, styleGizmo, type GizmoKind } from './buildGizmoStyle';
import { collisionBoxes } from './buildArch';
import { BuildPlacementGuide } from './buildPlacementGuide';
import { snapMove } from './buildMoveSnap';
import { catalog, placementError, type BuildPart, type BuildSettings } from './buildTypes';

const quarter=Math.PI/2;
const quaternion=(p:BuildPart)=>new THREE.Quaternion().setFromEuler(new THREE.Euler(
  (p.pitch || 0)*quarter,p.rotation*quarter,(p.roll || 0)*quarter,'YXZ'));
function orientation(q:THREE.Quaternion) {
  let best={rotation:0,pitch:0,roll:0},score=-1,cost=Infinity;
  for(let rotation=0;rotation<4;rotation++)for(let pitch=0;pitch<4;pitch++)for(let roll=0;roll<4;roll++) {
    const next={rotation,pitch,roll};
    const dot=Math.abs(q.dot(quaternion(next as BuildPart)));
    const nextCost=Math.min(pitch,4-pitch)+Math.min(roll,4-roll);
    if(dot>score+1e-8 || (Math.abs(dot-score)<1e-8 && nextCost<cost)){score=dot;cost=nextCost;best=next;}
  }
  return best;
}
type Options={
  change:(command:Record<string,unknown>)=>unknown;
  hint:(text:string)=>void;
  orient?:(part:BuildPart)=>void;
  lock?:(locked:boolean)=>void;
};

/** A selected part stays put until an axis or ring is dragged. */
export class BuildMoveHandle {
  readonly root=new THREE.Group();
  private pivot=new THREE.Group();
  private translate:TransformControls;
  private rotate:TransformControls;
  private resize:TransformControls;
  private active?:TransformControls;
  private part?:BuildPart;
  private draft?:BuildPart;
  private original?:THREE.Group;
  private preview?:THREE.Group;
  private previewKey='';
  private pending=false;
  private pointerId?:number;
  private angles='';
  private startPosition=new THREE.Vector3();
  private startPart?:BuildPart;
  private localBoxes:THREE.Box3[]=[];
  private targets:THREE.Box3[]=[];
  private guide:BuildPlacementGuide;
  private companions:{part:BuildPart;object:THREE.Group;preview:THREE.Group;outline:THREE.Box3Helper}[]=[];
  private outline=new THREE.Box3Helper(new THREE.Box3(),0xffd280);
  constructor(private world:THREE.Scene,private camera:THREE.Camera,private element:HTMLElement,private options:Options) {
    this.guide=new BuildPlacementGuide(world);
    this.guide.root.name='build-move-contact-guide';
    this.root.name='build-move-handle';this.root.userData.preview=true;
    this.pivot.name='build-move-pivot';
    this.translate=new TransformControls(camera);
    this.rotate=new TransformControls(camera);
    this.resize=new TransformControls(camera);
    const controls:[GizmoKind,TransformControls][]=[
      ['translate',this.translate],['rotate',this.rotate],['scale',this.resize]];
    for(const [kind,control] of controls) {
      // Events are routed here so orbit/selection never start on a handle drag.
      control.domElement=element;
      control.setSpace('world');
      control.setSize(kind==='translate'? .7:kind==='scale'?1.15:.9);
      styleGizmo(control,kind);
      const helper=control.getHelper();
      const update=helper.updateMatrixWorld.bind(helper);
      helper.updateMatrixWorld=(force?:boolean)=>{
        update(force);
        // Single axes only: hidden plane slabs, free-rotation ball and the drag
        // helper lines stay out of the way. The translate centre diamond is kept
        // as the styled pivot hub.
        helper.traverse(o=>{
          if(kind==='translate' && o.name==='XYZ')return;
          if(['XY','YZ','XZ','XYZ','E','XYZE','START','END','DELTA','AXIS'].includes(o.name))o.visible=false;
        });
        applyGizmoLook(control);
      };
      helper.traverse(o=>{
        const material=(o as THREE.Mesh).material;
        // Handles draw over their own part: depthTest off keeps them grabbable
        // even when the selected geometry would swallow them.
        if(material)for(const m of Array.isArray(material)?material:[material]){m.depthTest=false;m.depthWrite=false;}
      });
      this.root.add(helper);
    }
    this.translate.setMode('translate');this.translate.setTranslationSnap(null);
    this.rotate.setMode('rotate');this.rotate.setRotationSnap(quarter);
    this.resize.setMode('scale');this.resize.setSpace('local');
    this.outline.raycast=()=>{};this.world.add(this.outline);this.outline.visible=false;
    world.add(this.root,this.pivot);this.root.visible=false;
    element.addEventListener('pointerdown',this.down,true);
    element.addEventListener('pointermove',this.move,true);
    element.addEventListener('pointerup',this.up,true);
    element.addEventListener('pointercancel',this.cancel,true);
    window.addEventListener('blur',this.cancel);
  }
  get selectedPart(){return this.part ? {...this.part} : undefined;}
  get selected(){return Boolean(this.part);}
  get working(){return Boolean(this.active)||this.pending;}
  select(part:BuildPart,object:THREE.Group,additive=false) {
    if(this.pending)return;
    let rows=additive && this.part && this.original ? [{part:this.part,object:this.original},...this.companions] : [];
    if(rows.some(row=>row.part.id===part.id))rows=rows.filter(row=>row.part.id!==part.id);
    else rows.push({part,object});
    this.clear();if(!rows.length)return;
    ({part,object}=rows[0]);this.part={...part};this.draft={...part};this.original=object;
    for(const row of rows.slice(1)){
      const preview=createPart(row.part);delete preview.userData.buildId;
      preview.name='build-multi-preview';preview.userData.preview=true;
      preview.traverse(o=>{o.raycast=()=>{};});row.object.visible=false;
      const outline=new THREE.Box3Helper(new THREE.Box3(),0xffd280);outline.raycast=()=>{};
      this.world.add(preview,outline);this.companions.push({...row,preview,outline});
    }
    this.original.visible=false;this.angles=this.angleKey(part);
    this.draw();this.pose();
    this.translate.attach(this.pivot);this.rotate.attach(this.pivot);this.root.visible=true;
    this.resize.attach(this.pivot);this.resize.enabled=!this.companions.length;
    if(this.companions.length)this.resize.detach();
    this.rotate.enabled=!this.companions.length;
    if(this.companions.length)this.rotate.detach();
    this.options.orient?.(part);
    this.options.hint(`已选 ${rows.length} 件 · Shift 点击增减选择 · 拖动时 Shift 关闭贴面吸附`);
  }
  private angleKey(p:{rotation:number;pitch?:number;roll?:number}){return `${p.rotation}:${p.pitch || 0}:${p.roll || 0}`;}
  settings(settings:BuildSettings) {
    if(!this.part || this.working)return;
    if(settings.color!==this.part.color) {
      this.draft={...this.part,color:settings.color};
      this.draw();void this.save(settings.color);return;
    }
    if(this.companions.length)return;
    const key=this.angleKey(settings);
    if(key!==this.angles) {
      this.angles=key;
      this.draft={...this.part,rotation:settings.rotation,pitch:settings.pitch,roll:settings.roll};
      this.draw();this.pose();void this.save();
    }
  }
  sync(parts:BuildPart[],objects:Map<string,THREE.Group>) {
    if(!this.part)return;
    for(const row of this.companions){
      const next=parts.find(p=>p.id===row.part.id);
      if(!next || (!this.pending && next.version!==row.part.version)){
        this.clear();this.options.hint('所选部件已更新，请重新选择');return;
      }
      row.object=objects.get(next.id)!;row.object.visible=false;
    }
    const next=parts.find(p=>p.id===this.part!.id);
    if(!next){this.clear();return;}
    if(next.version!==this.part.version && !this.pending){
      this.clear();this.options.hint('部件已更新，请重新选择');return;
    }
    this.original=objects.get(next.id);
    if(this.original)this.original.visible=false;
    if(this.pending){this.part={...next};}
  }
  private draw() {
    const key=`${this.draft!.kind}:${this.draft!.color}:${this.angleKey(this.draft!)}:${this.draft!.scale?.join(',') || ''}`;
    if(!this.preview || this.previewKey!==key){
      this.releasePreview();this.preview=createPart(this.draft!);this.previewKey=key;
      this.preview.name='build-move-preview';
      delete this.preview.userData.buildId;this.preview.userData.preview=true;
      this.preview.traverse(o=>{o.raycast=()=>{};});this.world.add(this.preview);
    }else this.preview.position.set(this.draft!.x,this.draft!.y,this.draft!.z);
    const delta=new THREE.Vector3(this.draft!.x-this.part!.x,this.draft!.y-this.part!.y,this.draft!.z-this.part!.z);
    for(const row of this.companions){
      if(row.preview.userData.partColor!==row.part.color) {
        row.preview.removeFromParent();
        row.preview.traverse(o=>{if(o instanceof THREE.Mesh&&o.geometry.type!=='BoxGeometry')o.geometry.dispose();});
        row.preview=createPart(row.part);delete row.preview.userData.buildId;
        row.preview.name='build-multi-preview';row.preview.userData.preview=true;
        row.preview.userData.partColor=row.part.color;
        row.preview.traverse(o=>{o.raycast=()=>{};});this.world.add(row.preview);
      }
      row.preview.position.set(row.part.x+delta.x,row.part.y+delta.y,row.part.z+delta.z);
      row.outline.box.setFromObject(row.preview);row.outline.updateMatrixWorld(true);
    }
    this.outline.box.setFromObject(this.preview);this.outline.visible=true;this.outline.updateMatrixWorld(true);
    this.root.userData.draft={...this.draft};
    this.root.userData.selectedIds=[this.part!.id,...this.companions.map(row=>row.part.id)];
    this.busy();
  }
  /** Automation hook: a drag is refused while a previous save is in flight, so
   *  harnesses wait for this flag instead of racing the round trip. */
  private busy(){this.root.userData.working=Boolean(this.active)||this.pending;}
  private releasePreview(){
    this.preview?.removeFromParent();
    this.preview?.traverse(o=>{if(o instanceof THREE.Mesh && o.geometry.type!=='BoxGeometry')o.geometry.dispose();});
    this.preview=undefined;this.previewKey='';
  }
  private pose(){
    if(!this.preview||!this.draft)return;
    const bounds=new THREE.Box3().setFromObject(this.preview);
    for(const row of this.companions)bounds.union(new THREE.Box3().setFromObject(row.preview));
    bounds.getCenter(this.pivot.position);
    this.pivot.quaternion.copy(quaternion(this.draft));
    this.pivot.scale.set(1,1,1);
    this.pivot.updateMatrixWorld(true);this.root.updateMatrixWorld(true);
  }
  private point(e:PointerEvent,button=e.button) {
    const r=this.element.getBoundingClientRect();
    return {x:(e.clientX-r.left)/r.width*2-1,y:-(e.clientY-r.top)/r.height*2+1,button} as PointerEvent;
  }
  private down=(e:PointerEvent)=>{
    if(!this.part||e.button!==0)return;
    this.root.updateMatrixWorld(true);
    const pointer=this.point(e);
    this.translate.pointerHover(pointer);this.rotate.pointerHover(pointer);this.resize.pointerHover(pointer);
    // Only individual axes/rings: no free-rotation ball or invisible planar slabs.
    const valid=(c:TransformControls)=>['X','Y','Z'].includes(c.axis || '');
    const control=valid(this.translate)?this.translate:!this.companions.length&&valid(this.resize)?this.resize:!this.companions.length&&valid(this.rotate)?this.rotate:undefined;
    if(!control)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(this.pending)return;
    this.active=control;this.busy();this.startPart={...this.part};this.startPosition.copy(this.pivot.position);
    const offset=new THREE.Vector3(this.part.x,this.part.y,this.part.z).negate();
    this.localBoxes=collisionBoxes(this.preview!).map(box=>box.translate(offset));
    for(const row of this.companions)this.localBoxes.push(...collisionBoxes(row.preview).map(box=>box.translate(offset)));
    this.targets=[];
    const selected=new Set([this.part.id,...this.companions.map(row=>row.part.id)]);
    for(const object of this.world.children)if(object.userData.buildId && !selected.has(object.userData.buildId))
      this.targets.push(...collisionBoxes(object));
    this.options.lock?.(true);control.pointerDown(pointer);
    this.pointerId=e.pointerId;this.element.setPointerCapture(e.pointerId);
  };
  private move=(e:PointerEvent)=>{
    if(!this.active){
      if(this.part && !this.pending){
        const pointer=this.point(e);
        this.translate.pointerHover(pointer);this.rotate.pointerHover(pointer);
        this.resize.pointerHover(pointer);
        if(this.translate.axis || !['X','Y','Z'].includes(this.resize.axis || ''))this.resize.axis=null;
        if(!['X','Y','Z'].includes(this.translate.axis || ''))this.translate.axis=null;
        if(this.translate.axis || !['X','Y','Z'].includes(this.rotate.axis || ''))this.rotate.axis=null;
      }
      return;
    }
    if(!this.startPart)return;
    e.preventDefault();
    this.active.pointerMove(this.point(e,-1));
    if(this.active===this.translate){
      const delta=this.pivot.position.clone().sub(this.startPosition);
      const axis=this.active.axis!.toLowerCase() as 'x'|'y'|'z';
      const snapped=snapMove(this.startPart,delta[axis],axis,this.localBoxes,this.targets,e.shiftKey);
      this.draft=snapped.part;
      this.pivot.position.copy(this.startPosition);
      this.pivot.position[axis]+=this.draft[axis]-this.startPart[axis];
      this.root.userData.moveSnap={step:snapped.step,aligned:snapped.aligned};
    }else if(this.active===this.resize){
      const index=['X','Y','Z'].indexOf(this.active.axis!);
      const base=fixtureFor(this.startPart)?.dimensions || catalog.find(p=>p.id===this.startPart!.kind)!.dimensions;
      const scale:[number,number,number]=[...(this.startPart.scale || [1,1,1])];
      const factor=this.pivot.scale.getComponent(index);
      scale[index]=Math.max(.25,Math.round(base[index]*scale[index]*factor*4)/4)/base[index];
      this.draft={...this.startPart,scale};
    }else{
      this.draft={...this.startPart,...orientation(this.pivot.quaternion)};
      const probe=createPart({...this.draft,x:0,y:0,z:0});
      const center=new THREE.Box3().setFromObject(probe).getCenter(new THREE.Vector3());
      probe.traverse(o=>{if(o instanceof THREE.Mesh && o.geometry.type!=='BoxGeometry')o.geometry.dispose();});
      this.draft.x=Math.round((this.startPosition.x-center.x)*1000)/1000;
      this.draft.y=Math.round((this.startPosition.y-center.y)*1000)/1000;
      this.draft.z=Math.round((this.startPosition.z-center.z)*1000)/1000;
    }
    this.draw();
    this.guide.show(this.draft!,this.preview!,this.targets,Boolean(placementError(this.draft!)));
    const moveHint=e.shiftKey?'25 厘米步长（不吸附）':'25 厘米步长 · 靠近边缘自动贴合';
    this.options.hint(placementError(this.draft!) || `${this.active===this.translate?moveHint:'90°旋转'} · 松手保存 · Esc 取消`);
  };
  private finish(){
    this.guide.hide();
    this.active?.pointerUp({button:0} as PointerEvent);this.active=undefined;this.busy();
    if(this.pointerId!==undefined && this.element.hasPointerCapture(this.pointerId))this.element.releasePointerCapture(this.pointerId);
    this.pointerId=undefined;this.options.lock?.(false);
  }
  private up=(e:PointerEvent)=>{
    if(!this.active)return;
    e.preventDefault();e.stopImmediatePropagation();this.finish();void this.save();
  };
  private cancel=()=>{
    if(!this.active)return;
    this.finish();this.draft={...this.part!};this.draw();this.pose();
  };
  private async save(color?:string){
    if(!this.part||!this.draft||this.pending)return;
    const delta=new THREE.Vector3(this.draft.x-this.part.x,this.draft.y-this.part.y,this.draft.z-this.part.z);
    const extras=this.companions.map(row=>({...row.part,color:color || row.part.color,x:Math.round((row.part.x+delta.x)*1000)/1000,
      y:Math.round((row.part.y+delta.y)*1000)/1000,z:Math.round((row.part.z+delta.z)*1000)/1000}));
    const error=[this.draft,...extras].map(placementError).find(Boolean);
    if(error){this.options.hint(error);this.draft={...this.part};this.draw();this.pose();return;}
    const previous=this.part,next={...this.draft};
    if(JSON.stringify(previous.scale)===JSON.stringify(next.scale) && ['x','y','z','rotation','pitch','roll','color'].every(k=>(previous[k as keyof BuildPart] || 0)===(next[k as keyof BuildPart] || 0)))return;
    this.pending=true;this.busy();
    try{
      const items=[next,...extras].map(part=>({id:part.id,version:part.version,part}));
      const ok=await this.options.change(extras.length?{action:'moveMany',items}:
        {action:'move',id:previous.id,version:previous.version,part:next});
      if(!this.part)return;
      if(ok===false)throw Error('未保存，已恢复原位置');
      this.part={...next,version:previous.version+1};this.options.hint('已保存 · 可继续拖动手柄');
      for(const row of this.companions){const next=extras.find(p=>p.id===row.part.id)!;row.part={...next,version:next.version+1};}
    }catch{if(this.part){this.part=previous;this.options.hint('未保存，已恢复原位置，请重新调整');}}
    finally{
      this.pending=false;this.busy();
      if(this.part){this.draft={...this.part};this.angles=this.angleKey(this.part);this.draw();this.pose();this.options.orient?.(this.part);}
    }
  }
  clear(){
    this.finish();if(this.original)this.original.visible=true;
    for(const row of this.companions){
      row.object.visible=true;row.preview.removeFromParent();row.outline.removeFromParent();
      row.outline.geometry.dispose();(row.outline.material as THREE.Material).dispose();
      row.preview.traverse(o=>{if(o instanceof THREE.Mesh&&o.geometry.type!=='BoxGeometry')o.geometry.dispose();});
    }
    this.companions=[];this.outline.visible=false;this.root.userData.selectedIds=[];
    this.part=undefined;this.draft=undefined;this.original=undefined;
    this.releasePreview();
    this.translate.detach();this.rotate.detach();this.root.visible=false;
    this.resize.detach();
  }
  dispose(){
    this.clear();this.translate.dispose();this.rotate.dispose();this.resize.dispose();
    this.guide.dispose();
    this.outline.removeFromParent();this.outline.geometry.dispose();(this.outline.material as THREE.Material).dispose();

    this.root.removeFromParent();this.pivot.removeFromParent();
    this.element.removeEventListener('pointerdown',this.down,true);
    this.element.removeEventListener('pointermove',this.move,true);
    this.element.removeEventListener('pointerup',this.up,true);
    this.element.removeEventListener('pointercancel',this.cancel,true);
    window.removeEventListener('blur',this.cancel);
  }
}
