import * as THREE from 'three';
import { createPart } from './buildMeshes';
import { catalog, placementError, type BuildPart, type BuildSettings } from './buildTypes';
import { setBuildSolids, type Solid } from './buildNavigation';
import { fixtureSeat } from './buildFixtures';
import { setBuildSeats, type SittingSpot } from './sittingSpots';
import { BuildPlacementGuide } from './buildPlacementGuide';
import { collisionBoxes } from './buildArch';
import { fitToSurface, fitToPlane } from './buildSurface';
import { gapPlacement } from './buildGapPlacement';
import { topPlacement } from './buildTopPlacement';
import { BuildRotationGuide } from './buildRotationGuide';
import { BuildMoveHandle } from './buildMoveHandle';
import { BuildSelection } from './buildSelection';
import { BuildChestPeople } from './buildChestPeople';

type Options = {
  settings: () => BuildSettings;
  lock?: (locked:boolean) => void;
  change: (command: Record<string, unknown>) => unknown;
  sample?: (part: BuildPart) => void;
  orient?: (part: BuildPart) => void;
  focus?: (box: THREE.Box3) => void;
  open: (id: string) => void;
  hint: (text: string) => void;
};
export class BuildInteraction {
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
  private rotationGuide: BuildRotationGuide;
  private saving=false;
  private handle: BuildMoveHandle;
  private contactSolids: {id:string;box:THREE.Box3}[] = [];
  constructor(private world: THREE.Scene, private camera: THREE.Camera, private element: HTMLElement, private options: Options) {
    this.handle=new BuildMoveHandle(world,camera,element,options);
    this.guide=new BuildPlacementGuide(world);
    this.selection=new BuildSelection(world);
    this.chestPeople=new BuildChestPeople(world);
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
  cancelMove() {
    this.handle.clear();
    if(this.picked) { const object=this.objects.get(this.picked.id);if(object)object.visible=true; }
    this.picked=undefined;
    this.refresh();
  }
  async duplicateSelected() {
    const source=this.handle.selectedPart;
    if(!source || this.saving || this.handle.working)return;
    this.saving=true;
    try {
      const result=await this.options.change({action:'duplicate',id:source.id,version:source.version}) as
        {parts:BuildPart[];changed?:BuildPart} | false;
      if(!result || !result.changed)return;
      this.sync(result.parts);
      if(this.options.settings().mode==='move' && this.handle.selectedPart?.id===source.id){
        const copy=this.parts.find(p=>p.id===result.changed!.id)!;
        this.handle.select(copy,this.objects.get(copy.id)!);
        this.hint('已复制 · 拖动手柄移动副本 · Ctrl+Z 撤销');
      }
    } finally {this.saving=false;}
  }
  sampleHovered() {
    const part=this.hitPart(this.hits()[0]);
    if(part) {this.cancelMove();this.options.sample?.(part);}
  }
  focusHovered() {
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
  private hitPart(hit?: THREE.Intersection) {
    let object = hit?.object;
    while (object && !object.userData.buildId) object = object.parent || undefined;
    return this.parts.find(p => p.id === object?.userData.buildId);
  }
  refresh() {
    const settings = this.options.settings();
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
      const hint = hovered ? `${label} · ${settings.mode === 'remove' ? '点击拆除' : settings.mode === 'move' ? '点击显示移动手柄' : hovered.kind === 'chest' ? '点击打开宝箱' : 'E 取同款 · F 聚焦'}` : '';
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
    const key = `${part.kind}:${part.color}:${part.pitch || 0}:${part.roll || 0}`;
    if (key !== this.ghostKey) {
      this.ghost?.removeFromParent();
      this.ghost = createPart(part);
      delete this.ghost.userData.buildId;
      this.ghost.userData.preview = true;
      this.ghost.traverse(object => {
        if (!(object instanceof THREE.Mesh)) return;
        // 流动箭头的光晕壳是加法混合的半透明层：预览必须是不透明实体，所以直接藏掉它
        // （它的材质不能被换成 ghost 材质，否则会在预览外圈糊一层实心轮廓）。
        if (object.userData.glowHalo) { object.visible = false; return; }
        object.material = this.ghostMaterial;
        object.castShadow = false;
      });
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
    const part = this.hitPart(this.hits()[0]);
    if (mode === 'explore') {
      if (part?.kind === 'chest') { this.options.open(part.id); return true; }
      return false;
    }
    if(mode === 'move') {
      if(part)this.handle.select(part,this.objects.get(part.id)!,event.shiftKey);
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
    this.chestPeople.dispose();
    this.handle.dispose();
    this.rotationGuide.dispose();
    this.selection.dispose();
    this.guide.dispose();
    this.ghost?.removeFromParent();
    this.ghostMaterial.dispose();
    for (const object of this.objects.values()) object.removeFromParent();
    setBuildSolids(null);
    setBuildSeats([]);
  }
}
