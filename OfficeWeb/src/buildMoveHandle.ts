import { fixtureFor } from './buildFixtures';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { createPart } from './buildMeshes';
import { partQuaternion, angleKey, partOrientation } from './buildPartPose';
import { catalog, placementError } from './buildTypes';
import type { BuildPart, BuildSettings } from './buildTypes';
import { collisionBoxes } from './buildArch';
import { copyDropPoint, keepsOriginalSpot, type DropPlane, type DropPoint } from './buildCopyDrop';

import { applyGizmoLook, styleGizmo, type GizmoKind } from './buildGizmoStyle';
import { BuildPlacementGuide } from './buildPlacementGuide';
import { snapMove } from './buildMoveSnap';
import { gridSnap, isStructural, snapPart } from './buildGrid';
const quaternion = partQuaternion;
type Options={
  change:(command:Record<string,unknown>)=>unknown;
  hint:(text:string)=>void;
  orient?:(part:BuildPart)=>void;
  lock?:(locked:boolean)=>void;
};
type Row={part:BuildPart;object:THREE.Group};

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
  private follow?:{sources:BuildPart[];plane:DropPlane;anchor:DropPoint;since:DropPoint};
  /** 服务端最新的一份部件表与它们的场景节点：重装整组时按 id 取。 */
  private parts:BuildPart[]=[];
  private objects=new Map<string,THREE.Group>();
  /** Shift+D 之后各副本的"身份"：整组复制时每次重选都得把整组重新装回来。 */
  private copies:BuildPart[]=[];
  private frozen=false;
  /** 副本已存好、正在收尾：这一段里服务端还会重放一次"旧版本"，别把选中清掉。 */
  private settling=false;
  private ray=new THREE.Raycaster();
  private companions:{part:BuildPart;object:THREE.Group;preview:THREE.Group;outline:THREE.Box3Helper}[]=[];
  private outline=new THREE.Box3Helper(new THREE.Box3(),0xffd280);
  /** 多选整体变换的状态：绕 `groupPivot` 转 `groupRotate`×90°，翻面按件原地，缩放绕中心摊开。 */
  private groupPivot=new THREE.Vector3();
  private groupRotate=0;
  private groupTilt={pitch:0,roll:0};
  private groupScale:[number,number,number]=[1,1,1];
  private startOrientation={rotation:0,pitch:0,roll:0};
  private startPivotScale=new THREE.Vector3(1,1,1);
  constructor(private world:THREE.Scene,private camera:THREE.Camera,private element:HTMLElement,private options:Options) {
    this.guide=new BuildPlacementGuide(world);
    this.guide.root.name='build-move-contact-guide';
    this.root.name='build-move-handle';this.root.userData.preview=true;
    this.root.userData.selectedIds=[];
    // 手柄只是交互层：命中检测由 TransformControls 自己那套隐形 picker 负责，
    // 视觉网格一律不吃射线——否则选中后它们会挡住"点空白/点别处"，改选就点不动了。
    this.root.traverse(object=>{object.raycast=()=>{};});
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
    this.rotate.setMode('rotate');this.rotate.setRotationSnap(Math.PI/2);
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
  /** 当前选中的整组 id（主选中在前）；没选中时是空数组。 */
  get selectedIds(){return this.part ? [this.part.id,...this.companions.map(row=>row.part.id)] : [];}
  get working(){return Boolean(this.active)||this.pending;}
  /** Shift+D 已建好副本，正等鼠标把它放到想要的位置。 */
  get following(){return Boolean(this.follow);}
  /** 副本刚放下：紧接着的这一次点击该保留整组，而不是改选成单件。 */
  get justDropped(){return this.frozen;}
  select(part:BuildPart,object:THREE.Group,additive=false,keep=false) {
    if(this.pending)return;
    const previous=this.part&&this.original?{part:this.part,object:this.original}:undefined;
    // `copies` 是"刚复制出来的那一组"：整组装回来，不要走下面的增减逻辑——那一步本意是
    // "点已选中的那件就取消它"，而副本的 id 与主选中相同，会把刚落下的副本自己删掉。
    if(keep&&this.copies.length){
      const rows:Row[]=this.copies.filter(copy=>this.objects.has(copy.id))
        .map(copy=>({part:copy,object:this.objects.get(copy.id)!}));
      if(rows.length){this.copies=[];this.frozen=false;this.selectRows(rows);return;}
    }
    const rows:Row[]=(additive||keep)&&previous ? [previous,...this.companions] : [];
    this.copies=[];
    this.frozen=false;
    if(rows.some(row=>row.part.id===part.id))rows.splice(rows.findIndex(row=>row.part.id===part.id),1);
    else rows.push({part,object});
    this.selectRows(rows);
  }
  /** 真正装好这一组：清掉上一组，重建预览与手柄。 */
  private selectRows(rows:Row[]) {
    this.clear();if(!rows.length)return;
    let {part,object}=rows[0];this.part={...part};this.draft={...part};this.original=object;
    for(const row of rows.slice(1)){
      const preview=createPart(row.part);delete preview.userData.buildId;
      preview.name='build-multi-preview';preview.userData.preview=true;
      preview.traverse(o=>{o.raycast=()=>{};});row.object.visible=false;
      const outline=new THREE.Box3Helper(new THREE.Box3(),0xffd280);outline.raycast=()=>{};
      this.world.add(preview,outline);this.companions.push({...row,preview,outline});
    }
    this.original.visible=false;this.angles=this.angleKey(part);
    this.draw();this.pose();
    // 多选也要能转/能缩放（用户 2026-10-09：「请移动工具下在多选之后也可以旋转和缩放」）：
    // 三个手柄一律挂上，整组的旋转/缩放按"绕组中心"算（见 `posed()`）。
    this.translate.attach(this.pivot);this.rotate.attach(this.pivot);this.root.visible=true;
    this.resize.attach(this.pivot);
    this.options.orient?.(part);
    this.options.hint(rows.length>1
      ? `已选 ${rows.length} 件 · Shift 点击增减 · 轴＝整体平移 · 环＝整体绕中心旋转 · 方头＝整体缩放 · Delete 删除`
      : '已选 1 件 · Shift 点击增减选择 · Delete 删除 · 拖动时 Shift 关闭贴面吸附');
  }
  private angleKey(p:{rotation:number;pitch?:number;roll?:number}){return `${p.rotation}:${p.pitch || 0}:${p.roll || 0}`;}
  /**
   * **多选的整体变换**（Blender 的 median-pivot 语义）：绕"这一组的中心"转 yaw、按同一组因子摊开缩放；
   * 每件自身的朝向/尺寸也跟着改。用户 2026-10-09：「请移动工具下在多选之后也可以旋转和缩放」。
   *
   * 几个刻意的取舍：
   * - **yaw 才转位置**：绕组中心转 90° 是刚性变换，位置仍然是 0.25 的整数倍（中心取在格点上），
   *   高度也不变，所以"整格"那条不变量不受影响；把位置绕水平轴翻会改变高度、还可能是半格，
   *   所以 **pitch/roll（翻面）按件原地应用**，只改朝向、不动位置。
   * - **缩放绕中心摊开**：整组放大时各件之间的距离一起放大（否则只会各自长大、挤在一起），
   *   每件自身的尺寸按同一个因子走并按 0.25 取整；最后一律过 `snapPart()` 收口。
   */
  private posed(start:BuildPart):BuildPart {
    const turn=this.groupRotate*Math.PI/2;
    const cos=Math.cos(turn),sin=Math.sin(turn);
    const dx=start.x-this.groupPivot.x,dz=start.z-this.groupPivot.z;
    const scaled=this.groupScale.some(value=>value!==1);
    let x=this.groupPivot.x+dx*cos+dz*sin;
    let z=this.groupPivot.z-dx*sin+dz*cos;
    let y=start.y;
    if(scaled) {
      x=this.groupPivot.x+(x-this.groupPivot.x)*this.groupScale[0];
      y=this.groupPivot.y+(start.y-this.groupPivot.y)*this.groupScale[1];
      z=this.groupPivot.z+(z-this.groupPivot.z)*this.groupScale[2];
    }
    const next:BuildPart={...start,x,y,z,
      rotation:(((start.rotation+this.groupRotate)%4)+4)%4,
      pitch:start.pitch?(start.pitch+this.groupTilt.pitch)%4:undefined,
      roll:start.roll?(start.roll+this.groupTilt.roll)%4:undefined};
    if(this.groupTilt.pitch)next.pitch=(((next.pitch||0)+this.groupTilt.pitch)%4+4)%4;
    if(this.groupTilt.roll)next.roll=(((next.roll||0)+this.groupTilt.roll)%4+4)%4;
    if(scaled) {
      const base=fixtureFor(start)?.dimensions || catalog.find(item=>item.id===start.kind)!.dimensions;
      const scale:[number,number,number]=[...(start.scale || [1,1,1])];
      for(const index of [0,1,2]) {
        const factor=this.groupScale[index];
        if(factor===1)continue;
        // 和单件缩放同一条规则：乘完之后仍按 0.25 格取整（缩放尺寸必须整格）。
        scale[index]=Math.max(.25,Math.round(base[index]*scale[index]*factor*4)/4)/base[index];
      }
      next.scale=scale;
    }
    return snapPart(next);
  }
  /** 这一组当前的整体变换是否生效（平移不算：平移由主选中的磁吸结果反推给同伴）。 */
  private get groupTransforming(){
    return this.groupRotate!==0 || this.groupTilt.pitch!==0 || this.groupTilt.roll!==0
      || this.groupScale.some(value=>value!==1);
  }
  /** 变换已经落进存档之后必须清掉，否则 `draw()` 会拿新状态再乘一次（双重变换）。 */
  private resetGroupTransform(){
    this.groupRotate=0;this.groupTilt={pitch:0,roll:0};this.groupScale=[1,1,1];
  }
  /** 组的中心：所有选中件预览的包围盒中心，**取到格点上**（旋转后位置才仍然是整数格）。 */
  private groupCenter() {
    const bounds=new THREE.Box3();
    if(this.preview)bounds.setFromObject(this.preview);
    else bounds.set(new THREE.Vector3(),new THREE.Vector3());
    for(const row of this.companions)bounds.union(new THREE.Box3().setFromObject(row.preview));
    const center=bounds.getCenter(new THREE.Vector3());
    return new THREE.Vector3(gridSnap(center.x),gridSnap(center.y),gridSnap(center.z));
  }
  settings(settings:BuildSettings) {
    if(!this.part || this.working)return;
    if(settings.color!==this.part.color) {
      this.draft={...this.part,color:settings.color};
      this.draw();void this.save(settings.color);return;
    }
    const key=this.angleKey(settings);
    if(key!==this.angles) {
      this.angles=key;
      if(this.companions.length){
        // 键盘 Q/R/X/Z 也要能转整组（和手柄同一套 `posed()`）：yaw 绕组中心转、翻面按件原地。
        const from=this.part;
        const steps=((settings.rotation-from.rotation)%4+4)%4;
        const pitch=(((settings.pitch||0)-(from.pitch||0))%4+4)%4;
        const roll=(((settings.roll||0)-(from.roll||0))%4+4)%4;
        if(!steps&&!pitch&&!roll)return;
        this.groupPivot.copy(this.groupCenter());
        this.groupRotate=steps;this.groupTilt={pitch,roll};this.groupScale=[1,1,1];
        this.draft=this.posed(from);
        this.draw();this.pose();void this.save();
        return;
      }
      this.draft={...this.part,rotation:settings.rotation,pitch:settings.pitch,roll:settings.roll};
      this.draw();this.pose();void this.save();
    }
  }
  sync(parts:BuildPart[],objects:Map<string,THREE.Group>) {
    this.parts=parts;this.objects=objects;
    if(!this.part)return;
    for(const row of this.companions){
      const next=this.has(row.part.id);
      if(!next){this.clear();this.options.hint('所选部件已更新，请重新选择');return;}
      row.object=objects.get(next.id)!;row.object.visible=false;
    }
    const next=this.has(this.part.id);
    if(!next){this.clear();return;}
    // 同事改过这一件：正在保存时让服务端去判版本，否则退出编辑让用户重选。
    if(!this.owns()){this.clear();this.options.hint('部件已更新，请重新选择');return;}
    this.original=objects.get(next.id);
    if(this.original)this.original.visible=false;
    if(this.pending)this.reconcile();
  }
  private has(id:string){return this.parts.find(part=>part.id===id);}
  /** 版本变了就是同事改过：拖手柄/复制都不是在改这个版本，应该退出让用户重选。 */
  private owns(){return this.pending||this.has(this.part!.id)?.version===this.part!.version;}
  /** 把"我这边记的版本"和服务端对齐：整组保存后主选中会落后同伴一个版本。 */
  private reconcile(){
    if(!this.part)return;
    const rows:BuildPart[]=[this.part,...this.companions.map(row=>row.part)];
    let changed=false;
    for(const row of rows){
      const next=this.has(row.id);
      if(next&&next.version!==row.version){row.version=next.version;changed=true;}
    }
    if(changed&&this.draft)this.draft={...this.draft,version:this.part.version};
  }
  /** 副本建好了：整组选中它们开始跟随鼠标（`copies` 就是刚复制出来的那几件）。 */
  selectCopies(copies:BuildPart[]) {
    this.copies=[...copies];
    // 加选语义：`select` 会先清空再把 rows 装回来，第一个参数那件不能被丢掉。
    try{this.select(copies[0],this.objects.get(copies[0].id)!,true,true);}
    catch(error){this.options.hint('复制后重选失败：'+String(error));}
  }
  /**
   * 开始跟随鼠标摆放刚复制出来的副本：移动鼠标换位置，单击确认。
   * `copies` 是**副本**（它们的 id 与原件相同，只是新版本）。
   */
  startFollow(copies?:BuildPart[]) {
    if(!this.part||!this.preview)return false;
    const sources=copies?.length?copies:[this.part];
    if(sources.some(source=>!this.parts.some(p=>p.id===source.id)))return false;
    const anchor={x:this.part.x,y:this.part.y,z:this.part.z};
    this.follow={sources,plane:'ground',anchor,since:anchor};
    this.frozen=false;
    this.options.hint(`已复制 ${sources.length} 件 · 移动鼠标摆位置 · 单击放下 · Esc 取消`);
    this.busy();
    return true;
  }
  /**
   * 放下副本：冻结跟随（`frozen`）并把它存到服务端。
   *
   * 一次点击会先后触发 `pointerup`（这里放一次）和随后的 `click`，两次都带着同一个
   * 鼠标位置；不冻住的话第二次会把副本挪回鼠标下、把刚落好的位置覆盖掉。
   * 位置就是最后一帧的 `draft`：没有挪动时它等于原件位置（原位放下，Blender 同样）。
   */
  commitDuplicate() {
    if(!this.follow||this.frozen)return false;
    this.frozen=true;
    this.busy();
    void this.save();
    return true;
  }
  private followMove(pointer:PointerEvent) {
    const follow=this.follow;if(!follow||this.frozen||!this.part||!this.draft)return;
    const rect=this.element.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2((pointer.clientX-rect.left)/rect.width*2-1,
      -(pointer.clientY-rect.top)/rect.height*2+1),this.camera);
    const at=copyDropPoint(follow.anchor,this.ray.ray,follow.plane);
    if(!at)return;
    const x=follow.since.x+(at.x-follow.anchor.x);
    const z=follow.since.z+(at.z-follow.anchor.z);
    if(x===this.draft.x&&z===this.draft.z)return;
    this.draft={...this.draft,x,z};
    this.draw();this.pose();
    // `copyDrop` 给浏览器用例读：鼠标没挪出半格时是 false（等于原位放下）。
    this.root.userData.copyDrop=!keepsOriginalSpot(follow.since,{x,y:follow.since.y,z});
    this.options.hint(placementError(this.draft) || (this.frozen
      ? '副本已放下 · 拖动手柄微调 · Ctrl+Z 撤销'
      : '移动鼠标摆位置 · 单击放下 · Esc 取消'));
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
      // 多选整体旋转/缩放：同伴走 `posed()`（绕组的中心转/摊开）；纯平移时跟主选中的同一个位移。
      const target=this.groupTransforming?this.posed(row.part)
        :{...row.part,x:row.part.x+delta.x,y:row.part.y+delta.y,z:row.part.z+delta.z};
      const key=`${target.kind}:${target.color}:${this.angleKey(target)}:${target.scale?.join(',') || ''}`;
      if(row.preview.userData.partKey!==key) {
        row.preview.removeFromParent();
        row.preview.traverse(o=>{if(o instanceof THREE.Mesh&&o.geometry.type!=='BoxGeometry')o.geometry.dispose();});
        row.preview=createPart({...target,color:row.part.color});delete row.preview.userData.buildId;
        row.preview.name='build-multi-preview';row.preview.userData.preview=true;
        row.preview.userData.partColor=row.part.color;row.preview.userData.partKey=key;
        row.preview.traverse(o=>{o.raycast=()=>{};});this.world.add(row.preview);
      }
      row.preview.position.set(target.x,target.y,target.z);
      row.preview.rotation.y=target.rotation*Math.PI/2;
      row.outline.box.setFromObject(row.preview);row.outline.updateMatrixWorld(true);
    }
    this.outline.box.setFromObject(this.preview);this.outline.visible=true;this.outline.updateMatrixWorld(true);
    this.root.userData.draft={...this.draft};
    this.root.userData.selectedIds=[this.part!.id,...this.companions.map(row=>row.part.id)];
    // 多选整体变换的状态（测试/排查用）：绕哪个格点转、转了几步、各轴因子多少。
    this.root.userData.group={pivot:[this.groupPivot.x,this.groupPivot.y,this.groupPivot.z],
      rotate:this.groupRotate,scale:[...this.groupScale]};
    this.busy();
  }
  /** Automation hook: a drag is refused while a previous save is in flight, so
   *  harnesses wait for this flag instead of racing the round trip. */
  private busy(){
    this.root.userData.working=Boolean(this.active)||this.pending;
    // 浏览器用例读这个标记等"跟随摆放"结束（等 userData.working 会一直被 true 挡住）。
    this.root.userData.copyFollowing=this.following;
  }
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
    // Only individual axes/rings: no free-rotation ball or invisible planar slabs. Multi-selection also
    // gets the rings and the scale squares (整体旋转/缩放，用户 2026-10-09 要求)。
    const valid=(c:TransformControls)=>['X','Y','Z'].includes(c.axis || '');
    const control=valid(this.translate)?this.translate:valid(this.resize)?this.resize:valid(this.rotate)?this.rotate:undefined;
    if(!control)return;
    e.preventDefault();e.stopImmediatePropagation();
    if(this.pending)return;
    this.active=control;this.busy();this.startPart={...this.part};this.startPosition.copy(this.pivot.position);
    // 整组变换的起点：组的中心（取到格点）、初始朝向与初始缩放（用来算增量）。
    this.groupPivot.copy(this.groupCenter());
    this.startOrientation=partOrientation(this.pivot.quaternion);
    this.startPivotScale.copy(this.pivot.scale);
    this.groupRotate=0;this.groupTilt={pitch:0,roll:0};this.groupScale=[1,1,1];
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
      if(this.follow)this.followMove(e);
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
      // 拖过头（越过手柄原点）时 TransformControls 会给**负**因子：那会把整组镜像，而部件尺寸不能是负的
      // （服务端只收正数），于是位置被镜像、尺寸却被下限夹住，整组看上去就塌了。所以取绝对值并给 25% 下限
      // ——继续拖就是"缩到最小"，不会翻面（浏览器用例实测踩到：120px 的拖动正好越过原点）。
      const factor=Math.max(.25,Math.abs(this.pivot.scale.getComponent(index)/(this.startPivotScale.getComponent(index) || 1)));
      if(this.companions.length){
        // 多选：整组按同一组因子摊开（每件自身的尺寸也乘这个因子），主选中也用同一套算法算。
        // 缩放方头用的是手柄的**局部**轴（跟着整组朝向转），所以 yaw 是奇数步时要把 X/Z 换过来。
        const flipped=partOrientation(this.pivot.quaternion).rotation%2===1;
        const world=index===1?1:(flipped?(index===0?2:0):index);
        this.groupScale=[1,1,1];this.groupScale[world]=factor;
        this.draft=this.posed(this.startPart);
      }else{
        const base=fixtureFor(this.startPart)?.dimensions || catalog.find(p=>p.id===this.startPart!.kind)!.dimensions;
        const scale:[number,number,number]=[...(this.startPart.scale || [1,1,1])];
        scale[index]=Math.max(.25,Math.round(base[index]*scale[index]*factor*4)/4)/base[index];
        this.draft={...this.startPart,scale};
      }
    }else{
      const orientation=partOrientation(this.pivot.quaternion);
      const steps=((orientation.rotation-this.startOrientation.rotation)%4+4)%4;
      if(this.companions.length){
        // 多选：yaw 绕组中心转（位置仍是整数格），翻面按件原地。
        this.groupRotate=steps;
        this.groupTilt={pitch:((orientation.pitch-this.startOrientation.pitch)%4+4)%4,
          roll:((orientation.roll-this.startOrientation.roll)%4+4)%4};
        this.draft=this.posed(this.startPart);
      }else{
        // 单件旋转要保持"围着原来的落脚点转"：非对称模型的局部中心可以是毫米级，所以这里的位置要落格
        // ——不然"转一下"就会把部件带离网格，正好违反"部件永远整格"这条不变量（用户 2026-10-09）。
        // 结构件连高度一起落格（否则两件永远对不齐），家具/摆件的 y 保留毫米贴面。
        this.draft={...this.startPart,...orientation};
        const probe=createPart({...this.draft,x:0,y:0,z:0});
        const center=new THREE.Box3().setFromObject(probe).getCenter(new THREE.Vector3());
        probe.traverse(o=>{if(o instanceof THREE.Mesh && o.geometry.type!=='BoxGeometry')o.geometry.dispose();});
        this.draft.x=gridSnap(this.startPosition.x-center.x);
        this.draft.y=isStructural(this.draft.kind)?gridSnap(this.startPosition.y-center.y)
          :Math.round((this.startPosition.y-center.y)*1000)/1000;
        this.draft.z=gridSnap(this.startPosition.z-center.z);
      }
    }
    this.draw();
    this.guide.show(this.draft!,this.preview!,this.targets,Boolean(placementError(this.draft!)));
    const moveHint=e.shiftKey?'25 厘米步长（不吸附）':'25 厘米步长 · 靠近边缘自动贴合';
    const groupHint=this.companions.length?(this.active===this.translate?'整组平移':this.active===this.resize?'整组缩放':'整组旋转（绕组的中心）'):'';
    this.options.hint(placementError(this.draft!) || `${this.active===this.translate?moveHint:'90°旋转'}${groupHint?' · '+groupHint:''} · 松手保存 · Esc 取消`);
  };
  private finish(){
    this.guide.hide();
    this.active?.pointerUp({button:0} as PointerEvent);this.active=undefined;
    if(this.follow)this.commitDuplicate();
    this.busy();
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
    // 整组：平移时同伴跟同一个 delta；旋转/缩放时同伴走 `posed()`（和预览完全同一套算法），
    // 最后都过 `snapPart()` 收口——"跟着动的同伴"也不可能离格（不变量面前不留例外，用户 2026-10-09）。
    const extras=this.companions.map(row=>snapPart(this.groupTransforming
      ? {...this.posed(row.part),color:color || row.part.color}
      : {...row.part,color:color || row.part.color,
        x:Math.round((row.part.x+delta.x)*1000)/1000,
        y:Math.round((row.part.y+delta.y)*1000)/1000,z:Math.round((row.part.z+delta.z)*1000)/1000}));
    // 变换已经算进 `extras`/`draft` 了：立刻清掉状态，后面 draw()/pose() 才不会再乘一次。
    this.resetGroupTransform();
    const error=[this.draft,...extras].map(placementError).find(Boolean);
    if(error){this.options.hint(error);this.draft={...this.part};this.draw();this.pose();return;}
    const previous=this.part,next={...this.draft};
    // 没挪动就没有要保存的；但"放下副本"必须收尾（退出跟随），原位放下也是合法结果。
    if(JSON.stringify(previous.scale)===JSON.stringify(next.scale) && ['x','y','z','rotation','pitch','roll','color'].every(k=>(previous[k as keyof BuildPart] || 0)===(next[k as keyof BuildPart] || 0))){
      if(this.frozen)this.settleCopy();
      return;
    }
    this.pending=true;this.settling=true;this.busy();
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
      if(this.part)this.settleCopy();
      if(this.part){this.draft={...this.part};this.angles=this.angleKey(this.part);this.draw();this.pose();this.options.orient?.(this.part);}
      this.settling=false;this.busy();
    }
  }
  /** 副本存好了：退出"跟着鼠标"，把它当成普通选中的一组。存不上就放回跟随，让用户接着摆。 */
  private settleCopy(){
    if(!this.follow)return;
    this.follow=undefined;
    this.options.hint('副本已放下 · 拖动手柄微调 · Ctrl+Z 撤销');
    this.busy();
  }
  clear(){
    this.finish();this.follow=undefined;this.frozen=false;this.resetGroupTransform();
    if(this.original)this.original.visible=true;
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
