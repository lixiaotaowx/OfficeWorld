import * as THREE from 'three';
import { createPart } from './buildMeshes';
import { catalog, placementError, type BuildPart, type BuildSettings } from './buildTypes';
import { setBuildClimbs, setBuildSolids, supportHeight, type Climb, type Solid } from './buildNavigation';
import { snapPart } from './buildGrid';
import { isTeleport, landingHeight, teleportTarget } from './buildTeleport';
import { fixtureSeat } from './buildFixtures';
import { setBuildSeats, type SittingSpot } from './sittingSpots';
import { BuildPlacementGuide } from './buildPlacementGuide';
import { collisionBoxes, climbColumns } from './buildArch';
import { fitToSurface, fitToPlane } from './buildSurface';
import { gapPlacement } from './buildGapPlacement';
import { topPlacement } from './buildTopPlacement';
import { BuildRotationGuide } from './buildRotationGuide';
import { BuildMoveHandle } from './buildMoveHandle';
import { BuildSelection } from './buildSelection';
import { BuildChestPeople } from './buildChestPeople';
import { BuildChestUnread } from './buildChestUnread';
import type { BuildColorTarget } from './buildColorTarget';
import { BuildCinemaScreens } from './BuildCinemaScreens';

type Options = {
  accountId?: string;
  settings: () => BuildSettings;
  lock?: (locked:boolean) => void;
  change: (command: Record<string, unknown>) => unknown;
  sample?: (part: BuildPart) => void;
  orient?: (part: BuildPart) => void;
  focus?: (box: THREE.Box3) => void;
  open: (id: string) => void;
  hint: (text: string) => void;
  /** 单击传送点：立刻站到**点的那一块**上（任何地点都能点，一块就够）。 */
  teleport?: (target: { x: number; y: number; z: number; heading: number }) => void;
  /** 自己现在站在哪里（判断"是不是已经站在这一块上了"，用来决定去下一块还是给提示）。 */
  position?: () => { x: number; z: number } | undefined;
};
export class BuildInteraction {
  private cinema:BuildCinemaScreens;
  private parts: BuildPart[] = [];
  private objects = new Map<string, THREE.Group>();
  private ghost?: THREE.Group;
  private ghostKey = '';
  private ghostMaterial = new THREE.MeshBasicMaterial({ color: '#7bc8da', depthTest: true, depthWrite: true });
  private picked?: BuildPart;
  private candidate?: BuildPart;
  private pointer?: { x: number; y: number };
  private ray = new THREE.Raycaster();
  private lastHint = '';
  private guide: BuildPlacementGuide;
  private selection: BuildSelection;
  private chestPeople: BuildChestPeople;
  private chestUnread: BuildChestUnread;
  private rotationGuide: BuildRotationGuide;
  private saving=false;
  private copying=false;
  private copyKeys:Pick<KeyboardEvent,'key'|'shiftKey'|'repeat'|'altKey'>[]=[];
  private handle: BuildMoveHandle;
  private colorPoint=new THREE.Vector3();
  private contactSolids: {id:string;box:THREE.Box3}[] = [];
  constructor(private world: THREE.Scene, private camera: THREE.Camera, private element: HTMLElement, private options: Options) {
    this.handle=new BuildMoveHandle(world,camera,element,options);
    this.guide=new BuildPlacementGuide(world);
    this.selection=new BuildSelection(world);
    this.cinema=new BuildCinemaScreens(camera);
    this.chestPeople=new BuildChestPeople(world);
    this.chestUnread=new BuildChestUnread(world, options.accountId || '');
    this.rotationGuide=new BuildRotationGuide(world);
  }
  sync(parts: BuildPart[]) {
    this.parts = parts;
    const live = new Set(parts.map(p => p.id));
    for (const [id, object] of this.objects) {
      if (!live.has(id)) { object.removeFromParent(); this.objects.delete(id); }
    }
    for (const part of parts) {
      const previous = this.objects.get(part.id);
      if (previous?.userData.version === part.version) continue;
      previous?.removeFromParent();
      const object = createPart(part);
      object.userData.version = part.version;
      this.objects.set(part.id, object);
      this.world.add(object);
      object.updateMatrixWorld(true);
    }
    this.chestPeople.sync(parts,this.objects);
    this.chestUnread.sync(parts,this.objects);
    this.cinema.sync(parts,this.objects);
    const seats: SittingSpot[] = [];
    for (const p of parts) {
      if (p.pitch || p.roll || !['desk','chair','sofa'].includes(p.kind)) continue;
      const rotation = p.rotation * Math.PI / 2;
      const angle = rotation + (p.kind === 'desk' ? Math.PI : 0);
      const offset = p.kind === 'desk' ? 0.6*(p.scale?.[2] ?? 1) : 0;
      const x = p.x + Math.sin(rotation)*offset;
      const z = p.z + Math.cos(rotation)*offset;
      const spot: SittingSpot = { id: p.seatIndex===undefined ? `build-seat-${p.id}` : `desk-${p.seatIndex}`, label: p.seatIndex===undefined ? '自建座位' : `自建工位 ${p.seatIndex-8}`, family: 'build', workstation:p.seatIndex,
        chair: { x, y:p.y, z, angle }, stand: { y:p.y, x: x-Math.sin(angle)*1.2*(p.scale?.[2] ?? 1), z: z-Math.cos(angle)*1.2*(p.scale?.[2] ?? 1) }, height:0.57*(p.scale?.[1] ?? 1) };
      Object.assign(spot,fixtureSeat(p) || {});
      seats.push(spot);
      if(p.seatIndex!==undefined)this.objects.get(p.id)!.userData.seat=p.seatIndex;
      this.objects.get(p.id)!.userData.sittingSpots = [spot];
    }
    setBuildSeats(seats);
    const solids: Solid[] = [];
    for (const object of this.objects.values()) for(const bounds of collisionBoxes(object)) {
      solids.push({min:bounds.min,max:bounds.max});
    }
    setBuildSolids(solids);
    // 可攀爬柱体（直梯）不进 `solids`：它不是地面，是"抓着爬"的通道。
    const climbs: Climb[] = [];
    for (const object of this.objects.values()) for (const column of climbColumns(object)) {
      climbs.push({min:column.min,max:column.max,normalX:column.normalX,normalZ:column.normalZ});
    }
    setBuildClimbs(climbs);
    this.contactSolids=[];
    for(const [id,object] of this.objects) for(const box of collisionBoxes(object))
      this.contactSolids.push({id,box});
    if (this.picked && !live.has(this.picked.id)) this.cancelMove();
    this.handle.sync(parts,this.objects);
    this.refresh();
  }
  move(event: PointerEvent) {
    this.pointer = { x: event.clientX, y: event.clientY };
    this.refresh();
  }
  isEditing() { return this.options.settings().mode !== 'explore'; }
  colorTarget():BuildColorTarget | undefined {
    if(this.options.settings().mode!=='move')return;
    const part=this.handle.selectedPart;
    if(!part)return;
    const point=this.colorPoint.copy(this.handle.anchor).project(this.camera);
    if(point.z < -1 || point.z > 1 || Math.abs(point.x)>1 || Math.abs(point.y)>1)return;
    const rect=this.element.getBoundingClientRect();
    return {id:this.handle.selectedIds.join(','),color:part.color,busy:this.handle.working || this.saving,
      x:rect.left+(point.x+1)*rect.width/2,y:rect.top+(1-point.y)*rect.height/2};
  }
  cancelMove() {
    this.handle.clear();
    if(this.picked) { const object=this.objects.get(this.picked.id);if(object)object.visible=true; }
    this.picked=undefined;
    this.refresh();
  }
  shortcut(event:KeyboardEvent) {
    if(this.copying){
      if(!event.repeat && this.copyKeys.length<32)this.copyKeys.push({key:event.key,
        shiftKey:event.shiftKey,repeat:false,altKey:event.altKey});
      return true;
    }
    if(this.handle.shortcut(event))return true;
    if(event.key==='.' || event.code==='NumpadDecimal'){
      if(!event.repeat)this.focusHovered();return true;
    }
    return false;
  }
  cancelTransform(){
    if(this.copying){this.copyKeys=[{key:'Escape',shiftKey:false,repeat:false,altKey:false}];return true;}
    return this.handle.cancelTransform();
  }
  async duplicateSelected() {
    const source=this.handle.selectedPart;
    if(!source || this.saving || this.handle.working)return;
    this.saving=true;this.copying=true;this.copyKeys=[];
    try {
      // 副本沿用原件的 id，所以"这一组"必须**先记下来**：复制一件之后 handle 里已经是新版了，
      // 再按 id 重新筛会一直复制同一件（整组复制会变成把第一件复制两遍）。
      const plan=this.handle.selectedIds.map(id=>({id,version:this.parts.find(part=>part.id===id)?.version ?? 0}));
      let last:{parts:BuildPart[];changed?:BuildPart}|false|undefined;
      for(const step of plan){
        const result=await this.options.change({action:'duplicate',id:step.id,version:step.version}) as
          {parts:BuildPart[];changed?:BuildPart} | false;
        if(!result || !result.changed){last=undefined;break;}
        this.sync(result.parts);
        last=result;
      }
      if(!last){this.hint('复制未完成，请重试');return;}
      const copies=this.parts.filter(part=>plan.some(step=>step.id===part.id));      if(this.options.settings().mode==='move'&&copies.length&&copies.every(part=>this.objects.has(part.id))){
        this.handle.selectCopies(copies);
        if(this.handle.startFollow(copies)){
          for(const key of this.copyKeys){this.handle.shortcut(key);if(key.key==='Escape')break;}
          return;
        }
      }
      this.hint('已复制 · 拖动手柄移动副本 · Ctrl+Z 撤销');
    } finally {this.saving=false;this.copying=false;this.copyKeys=[];}
  }
  /**
   * 删除选中的这一组（移动模式下按 Delete / Backspace）。
   *
   * 和复制对称：一组里每一件都要单独发一次 `remove`（服务端没有批量删除），
   * 所以**先把 id/version 记下来**再逐件删——删掉第一件之后按 id 重新筛会漏掉后面的。
   * 每删一件都会进历史，Ctrl+Z 按逆序把整组恢复回来。
   */
  async removeSelected() {
    if(this.saving || this.handle.working)return false;
    const ids=this.handle.selectedIds;
    if(!ids.length){this.hint('先点选要删除的部件（Shift 点击可多选）');return false;}
    const plan=ids.map(id=>({id,version:this.parts.find(part=>part.id===id)?.version ?? 0}));
    this.saving=true;
    let removed=0;
    try {
      for(const step of plan){
        const result=await this.options.change({action:'remove',id:step.id,version:step.version}) as
          {parts:BuildPart[]} | false;
        if(!result){continue;}
        removed++;
        this.sync(result.parts);
      }
      if(!removed){this.hint('删除未完成，请重试');return false;}
      this.hint(`已删除 ${removed} 件 · Ctrl+Z 撤销`);
      return true;
    } finally {this.saving=false;}
  }
  sampleHovered() {
    const part=this.hitPart(this.hits()[0]);
    if(part) {this.cancelMove();this.options.sample?.(part);}
  }
  focusHovered() {
    const selected=this.handle.selectionBounds;
    if(selected){this.options.focus?.(selected);return;}
    const part=this.hitPart(this.hits()[0]);
    const object=part?this.objects.get(part.id):this.ghost?.visible?this.ghost:undefined;
    if(object)this.options.focus?.(new THREE.Box3().setFromObject(object));
  }
  leave() {
    this.pointer=undefined;
    this.candidate=undefined;
    this.guide.hide();
    this.rotationGuide.hide();
    this.selection.show(undefined,false);
    if(this.ghost) this.ghost.visible=false;
    this.hint('');
  }
  private hits() {
    if (!this.pointer) return [];
    const rect = this.element.getBoundingClientRect();
    this.ray.setFromCamera(new THREE.Vector2((this.pointer.x-rect.left)/rect.width*2-1,
      -(this.pointer.y-rect.top)/rect.height*2+1), this.camera);
    return this.ray.intersectObjects([...this.objects.entries()]
      .filter(([id]) => id !== this.picked?.id).map(([, object]) => object), true);
  }
  /**
   * 指针下的传送点：单击立刻传过去。**点哪一块就到哪一块**（用户：「不是一对一，是任何地点
   * 直接传送到点击处，只需要创建一个就行」）；已经站在这一块上再点它就去最近的另一块。
   */
  private teleportAt(part: BuildPart | undefined) {
    if (!part || !isTeleport(part.kind) || this.saving) return undefined;
    const target = teleportTarget(this.parts, part, this.options.position?.());
    if (!target) { this.hint('你已经站在这个传送点上了 · 想去别处就再放一块'); return undefined; }
    // 落点用"脚下能站的那一层"重算一次：存档里的 y 是原点，不一定就是脚底。
    target.y = landingHeight(supportHeight, target, part.y);
    return target;
  }
  private travel(target: { x: number; y: number; z: number; heading: number }) {
    this.cancelMove();
    this.options.hint('已传送 · 面向来路');
    this.options.teleport?.(target);
  }
  private hitPart(hit?: THREE.Intersection) {
    let object = hit?.object;
    while (object && !object.userData.buildId) object = object.parent || undefined;
    return this.parts.find(p => p.id === object?.userData.buildId);
  }
  refresh() {
    const settings = this.options.settings();
    // 漫游/拆除不该留着安装预览：那圈浅蓝既不是部件也不是可点的东西，留在场上会挡住射线。
    if(settings.mode==='explore' && this.ghost) this.ghost.visible=false;
    if(settings.mode!=='move' && this.handle.selected)this.handle.clear();
    if(settings.mode==='move' && this.handle.selected) {
      this.handle.settings(settings);
      this.guide.hide();this.rotationGuide.hide();this.selection.show(undefined,false);
      if(this.ghost)this.ghost.visible=false;
      return;
    }
    const hit = this.hits()[0];
    const hovered = this.hitPart(hit);
    if (settings.mode !== 'move' && this.picked) {
      const object=this.objects.get(this.picked.id);if(object)object.visible=true;
      this.picked=undefined;
    }
    this.candidate = undefined;
    this.guide.hide();
    this.rotationGuide.hide();
    this.selection.show(!this.picked && hovered && ['move','remove'].includes(settings.mode) ? this.objects.get(hovered.id) : undefined,
      settings.mode==='remove');
    const active = settings.mode === 'place' || (settings.mode === 'move' && this.picked);
    if (!active || !this.pointer) {
      if (this.ghost) this.ghost.visible = false;
      const label=catalog.find(item=>item.id===hovered?.kind)?.label || '';
      const action=settings.mode === 'remove' ? '点击拆除'
        : settings.mode === 'move' ? (hovered && isTeleport(hovered.kind) ? '点击传送' : '点击显示移动手柄')
        : hovered?.kind === 'cinema-screen' ? '点击设置影院屏幕' : hovered?.kind === 'chest' ? '点击打开宝箱'
        : hovered && isTeleport(hovered.kind) ? '点击传送'
        : 'E 取同款 · F 聚焦';
      const hint = hovered ? `${label} · ${action}` : '';
      this.hint(hint);
      return;
    }
    const source = this.picked;
    let height = settings.height;
    // Aim at top faces to stack; the height stepper provides exact manual layers.
    if (!height && hit?.face && hit.face.normal.clone().transformDirection(hit.object.matrixWorld).y > 0.9 && hovered?.id !== source?.id)
      height = Math.round(hit.point.y * 1000) / 1000;
    const template: BuildPart = {id:source?.id || 'preview',version:source?.version || 0,
      kind:source?.kind || settings.kind,color:source?.color || settings.color,
      x:0,y:height,z:0,rotation:settings.rotation,pitch:settings.pitch,roll:settings.roll};
    const supports=this.contactSolids.filter(s=>s.id!==source?.id);
    const gap=!settings.height ? gapPlacement(template,this.ray.ray,supports,hit?.distance,settings.anchor) : undefined;
    const rect=this.element.getBoundingClientRect();
    const top=!settings.height ? topPlacement(template,this.ray.ray,supports,this.camera,
      rect.width,rect.height,hit?.distance,hovered?.id,settings.anchor,hit?.point) : undefined;
    if(!hit && !gap && !top && Math.abs(this.ray.ray.direction.y)<.06){
      if(this.ghost)this.ghost.visible=false;
      this.hint('请指向部件表面或地面');return;
    }
    const point = new THREE.Vector3();
    if (!this.ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0), -height), point)) {
      if (hit) point.copy(hit.point);
      else if(gap) point.set(gap.x,gap.y,gap.z);
      else if(top) point.set(top.x,top.y,top.z);
      else {if(this.ghost)this.ghost.visible=false;this.hint('请指向部件表面或地面');return;}
    }
    let part: BuildPart = { id: source?.id || 'preview', version: source?.version || 0,
      kind: source?.kind || settings.kind, color: source?.color || settings.color,
      x: Math.round(point.x*4)/4, z: Math.round(point.z*4)/4, y: height, rotation: settings.rotation, pitch:settings.pitch, roll:settings.roll };
    if (hit) part = fitToSurface(part, hit, settings.height, settings.anchor);
    else part = fitToPlane(part,point,settings.anchor);
    if(top)part=top;
    else if(gap) part=gap;
    if ((!settings.anchor || settings.anchor==='auto') && !gap && part.kind === 'floor' && !part.pitch && !part.roll && !hovered?.pitch && !hovered?.roll && !settings.height && hovered?.kind === 'floor' && hit && !source) {
      // Clicking an existing floor extends its nearest edge at the same level.
      // Manual height still allows making a separate upper storey.
      const dx = hit.point.x-hovered.x, dz = hit.point.z-hovered.z;
      part.x = hovered.x + (Math.abs(dx)>=Math.abs(dz) ? Math.sign(dx || 1)*4 : 0);
      part.z = hovered.z + (Math.abs(dx)<Math.abs(dz) ? Math.sign(dz || 1)*4 : 0);
      part.y = hovered.y;
    }
    // **唯一的放置出口**：贴面（接触轴原来是毫米级）、顶面辅助吸附、两侧搭桥、地板续铺算完之后
    // 一律把水平两轴落回 0.25 网格——预览与存档因此永远一致（用户 2026-10-09：「确保不会有步长
    // 不统一的部件…根源修复，而不是打补丁」）。y 不动：接触高度是毫米级的。
    part = snapPart(part);
    const key = `${part.kind}:${part.color}:${part.pitch || 0}:${part.roll || 0}`;
    if (key !== this.ghostKey) {
      this.ghost?.removeFromParent();
      this.ghost = createPart(part);
      delete this.ghost.userData.buildId;
      this.ghost.userData.preview = true;
      this.ghost.traverse(object => {
        // 传送点的粒子条是加法混合的点云：预览里直接藏掉（保留形状与接触标记就够了）。
        if (object.userData.teleportBeam) { object.visible = false; return; }
        if (!(object instanceof THREE.Mesh)) return;
        // 流动箭头的光晕壳是加法混合的半透明层：预览必须是不透明实体，所以直接藏掉它
        // （它的材质不能被换成 ghost 材质，否则会在预览外圈糊一层实心轮廓）。
        if (object.userData.glowHalo) { object.visible = false; return; }
        object.material = this.ghostMaterial;
        object.castShadow = false;
      });
      // 预览不是场景里的部件：不参与拾取。否则它会挡住自身位置上的真部件——
      // 典型现象是"明明看到传送点就在那儿，点下去却被预览吃掉、根本不传送"。
      this.ghost.traverse(object => { object.raycast = () => {}; });
      this.world.add(this.ghost);
      this.ghostKey = key;
    }
    this.ghost!.visible = true;
    this.ghost!.position.set(part.x,part.y,part.z);
    this.ghost!.rotation.y = part.rotation*Math.PI/2;
    const error = placementError(part);
    this.ghostMaterial.color.set(error ? '#ef7b75' : '#79c8dc');
    this.candidate = error ? undefined : part;
    this.rotationGuide.show(part,this.ghost!,this.camera,settings.anchor);
    this.guide.show(part,this.ghost!,supports.map(s=>s.box),Boolean(error));
    this.guide.root.userData.gapSnap=Boolean(gap && !top);
    this.guide.root.userData.topSnap=Boolean(top);
    this.hint(error || `${top ? '已对齐顶面 · ' : gap ? '已对齐两侧支撑 · ' : ''}高度 ${part.y} m${part.kind === 'floor' ? ' · 点击地板边缘继续铺设' : ''}`);
  }
  private hint(text: string) {
    if (text === this.lastHint) return;
    this.lastHint = text;
    this.options.hint(text);
  }
  click(event: PointerEvent) {
    this.move(event);
    const mode = this.options.settings().mode;
    const all = this.hits();
    const hit = all[0];
    const part = this.hitPart(hit);
    const teleport = this.teleportAt(part);
    // 漫游与**安装**模式里，点传送点就是"传过去"——安装模式也算，因为很多人刚放下传送点
    // 还在安装模式，那一下要是去放新部件，就会觉得"鼠标只能继续创建、出不来"（用户反馈）。
    // 移动/拆除模式里传送点是普通部件（能选中、挪动、删除）。
    if (mode === 'explore' || mode === 'place') {
      if (teleport) { this.travel(teleport); return true; }
      if (part && isTeleport(part.kind)) return true;
      if (mode === 'explore' && part && ['chest','cinema-screen'].includes(part.kind)) { this.options.open(part.id); return true; }
      if (mode === 'explore') return false;
    }
    if(mode === 'move') {
      // Shift+D 跟着鼠标的副本：这一下是"放下"，不是改选。
      if(this.handle.following) { this.handle.commitDuplicate(); return true; }
      if(part)this.handle.select(part,this.objects.get(part.id)!,event.shiftKey,this.handle.justDropped);
      else if(!event.shiftKey)this.handle.clear();
      return true;
    }
    if(this.saving){this.hint('正在保存，请稍候');return true;}
    if (mode === 'remove' && part) void this.submit({ action: 'remove', id: part.id, version: part.version });
    if (this.candidate) {
      const command = this.picked ? { action: 'move', id: this.picked.id, version: this.picked.version, part: this.candidate }
        : { action: 'add', part: this.candidate };
      void this.submit(command);
    }
    return true;
  }
  private async submit(command: Record<string, unknown>) {
    this.saving=true;
    const picked=this.picked;
    try {
      const success=await this.options.change(command);
      if(success!==false && this.picked===picked) this.cancelMove();
      if(success===false)this.hint('尚未保存 · 可重试，Esc 取消');
    } catch {this.hint('尚未保存 · 可重试，Esc 取消');}
    finally {this.saving=false;}
  }
  dispose() {
    this.cinema.dispose();
    this.chestPeople.dispose();
    this.chestUnread.dispose();
    this.handle.dispose();
    this.rotationGuide.dispose();
    this.selection.dispose();
    this.guide.dispose();
    this.ghost?.removeFromParent();
    this.ghostMaterial.dispose();
    for (const object of this.objects.values()) object.removeFromParent();
    setBuildSolids(null);
    setBuildClimbs(null);
    setBuildSeats([]);
  }
}
