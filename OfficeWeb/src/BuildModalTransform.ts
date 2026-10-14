import * as THREE from 'three';
import type { BuildPart } from './buildTypes';
import { copyDropPoint } from './buildCopyDrop';
import { modalParts, nextConstraint, numericError, type ModalMode, type ModalConstraint, type ModalAxis } from './buildModalRules';
import { partQuaternion } from './buildPartPose';

type Port = {
  selection:()=>BuildPart[];
  pivot:()=>THREE.Vector3;
  preview:(parts:BuildPart[])=>void;
  commit:()=>void;
  rollback?:()=>void;
  lock:(locked:boolean)=>void;
  hint:(text:string)=>void;
  state:(state:Record<string,unknown>|undefined)=>void;
};
type Session = {
  mode:ModalMode;parts:BuildPart[];pivot:THREE.Vector3;copied:boolean;
  pointer:{x:number;y:number};constraint?:ModalConstraint;input:string;
  delta:THREE.Vector3;amount:number;
  rawDelta:THREE.Vector3;appliedDelta:THREE.Vector3;rawAmount:number;appliedAmount:number;
};

/** Temporary operator state. The store changes only on explicit confirmation. */
export class BuildModalTransform {
  private session?:Session;
  private pointer?:{x:number;y:number};
  constructor(private camera:THREE.Camera,private element:HTMLElement,private port:Port) {}
  get active(){return Boolean(this.session);}
  get copied(){return Boolean(this.session?.copied);}
  begin(mode:ModalMode,copied=false) {
    const parts=this.port.selection();if(!parts.length)return false;
    const rect=this.element.getBoundingClientRect();
    const pointer=this.pointer || {x:rect.left+rect.width/2,y:rect.top+rect.height/2};
    this.session={mode,parts:parts.map(p=>({...p})),pivot:this.port.pivot(),copied,pointer,
      input:'',delta:new THREE.Vector3(),amount:mode==='scale'?1:0,
      rawDelta:new THREE.Vector3(),appliedDelta:new THREE.Vector3(),
      rawAmount:mode==='scale'?1:0,appliedAmount:mode==='scale'?1:0};
    this.port.lock(true);this.update();return true;
  }
  key(event:Pick<KeyboardEvent,'key'|'shiftKey'|'repeat'>) {
    const s=this.session;if(!s)return false;
    if(event.repeat && !['Backspace','ArrowLeft','ArrowRight'].includes(event.key))return true;
    const key=event.key.toLowerCase();
    if(key==='escape'){this.cancel();return true;}
    if(key==='enter'){this.confirm();return true;}
    if(['x','y','z'].includes(key)) {
      if(s.mode==='rotate' && event.shiftKey){this.port.hint('旋转请选择单一轴 X / Y / Z');return true;}
      s.constraint=nextConstraint(s.constraint,key as ModalAxis,event.shiftKey);this.update();return true;
    }
    if(/^[0-9]$/.test(key))s.input+=key;
    else if(key==='.' && !s.input.includes('.'))s.input+='.';
    else if(key==='-')s.input=s.input.startsWith('-')?s.input.slice(1):'-'+s.input;
    else if(key==='backspace')s.input=s.input.slice(0,-1);
    else if(['g','s','r'].includes(key)) {
      this.cancel(false);this.begin(key==='g'?'translate':key==='s'?'scale':'rotate',s.copied);return true;
    }else return true;
    this.update();return true;
  }
  move(event:PointerEvent) {
    this.pointer={x:event.clientX,y:event.clientY};
    const s=this.session;if(!s)return;
    const rect=this.element.getBoundingClientRect();
    const rayAt=(p:{x:number;y:number})=>{
      const ray=new THREE.Raycaster();
      ray.setFromCamera(new THREE.Vector2((p.x-rect.left)/rect.width*2-1,-(p.y-rect.top)/rect.height*2+1),this.camera);
      return ray.ray;
    };
    const current=rayAt(this.pointer),start=rayAt(s.pointer);
    if(s.mode==='translate') {
      const normal=this.camera.getWorldDirection(new THREE.Vector3());
      const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,s.pivot);
      const a=start.intersectPlane(plane,new THREE.Vector3()),b=current.intersectPlane(plane,new THREE.Vector3());
      if(a&&b)s.delta.copy(b).sub(a);
      if(!s.constraint) {
        const origin=s.parts[0];
        const at=copyDropPoint(origin,current,'ground'),from=copyDropPoint(origin,start,'ground');
        if(at && (s.copied || from))s.delta.set(at.x-(s.copied?origin.x:from!.x),0,at.z-(s.copied?origin.z:from!.z));
        else s.delta.y=0;
      }else if(!s.constraint.plane) {
        // Project onto the chosen axis, not a view-plane component: an oblique
        // camera otherwise attenuates movement and a vertical axis feels wrong.
        const axis=new THREE.Vector3();axis[s.constraint.axis]=1;
        if(s.constraint.local)axis.applyQuaternion(partQuaternion(s.parts[0]));
        const projected=axis.clone().add(s.pivot).project(this.camera).sub(s.pivot.clone().project(this.camera));
        const dx=projected.x*rect.width/2,dy=-projected.y*rect.height/2;
        const length=dx*dx+dy*dy;
        if(length>1)s.delta.copy(axis).multiplyScalar(((event.clientX-s.pointer.x)*dx+(event.clientY-s.pointer.y)*dy)/length);
      }
    }else if(s.mode==='scale') {
      s.amount=Math.max(.01,1+(event.clientX-s.pointer.x-(event.clientY-s.pointer.y))/180);
    }else s.amount=(event.clientX-s.pointer.x-(event.clientY-s.pointer.y))/60*90;
    // Incremental precision keeps the object continuous when Shift is pressed
    // or released halfway through a move, rather than jumping back to 10%.
    const precision=event.shiftKey?.1:1;
    const rawDelta=s.delta.clone(),rawAmount=s.amount;
    s.delta.copy(s.appliedDelta).addScaledVector(rawDelta.clone().sub(s.rawDelta),precision);
    s.amount=s.appliedAmount+(rawAmount-s.rawAmount)*precision;
    s.rawDelta.copy(rawDelta);s.appliedDelta.copy(s.delta);
    s.rawAmount=rawAmount;s.appliedAmount=s.amount;
    this.update();
  }
  confirm() {
    const s=this.session;if(!s)return false;
    const error=numericError(s.mode,s.input);
    if(error){this.port.hint(error);return true;}
    this.update();this.session=undefined;this.port.state(undefined);this.port.lock(false);this.port.commit();return true;
  }
  cancel(announce=true) {
    const s=this.session;if(!s)return false;
    this.session=undefined;this.port.preview(s.parts);this.port.rollback?.();this.port.state(undefined);this.port.lock(false);
    if(announce)this.port.hint(s.copied?'已取消移动 · 副本保留原位 · Ctrl+Z 撤销复制':'已取消变换 · 保留选择');
    return true;
  }
  /** Selection removed or mode changed: no preview callback into disposed nodes. */
  discard(){this.session=undefined;this.port.state(undefined);}
  private update() {
    const s=this.session;if(!s)return;
    let delta=s.delta.clone(),amount=s.amount;
    const error=numericError(s.mode,s.input);
    if(s.input && !error) {
      amount=Number(s.input);
      if(s.mode==='translate') {
        const basis=s.constraint?.local?partQuaternion(s.parts[0]):new THREE.Quaternion();
        delta.applyQuaternion(basis.clone().invert());
        if(s.constraint && !s.constraint.plane){delta.set(0,0,0);delta[s.constraint.axis]=1;}
        else {
          if(s.constraint)delta[s.constraint.axis]=0;
          if(delta.lengthSq()<1e-8){delta.set(0,0,0);delta[s.constraint?.axis==='x'?'z':'x']=1;}
        }
        delta.normalize().multiplyScalar(amount).applyQuaternion(basis);
      }
    }
    if(!error)this.port.preview(modalParts(s.parts,s.pivot,{mode:s.mode,constraint:s.constraint,delta,amount}));
    const axis=s.constraint ? `${s.constraint.local?'局部':'世界'} ${s.constraint.plane?'排除 ':''}${s.constraint.axis.toUpperCase()}` : s.mode==='translate'?'地面 XZ':s.mode==='rotate'?'Y 轴':'均匀';
    this.port.state({mode:s.mode,constraint:s.constraint,input:s.input,copied:s.copied,pivot:s.pivot.toArray()});
    const name=s.mode==='translate'?'移动':s.mode==='scale'?'缩放':'旋转';
    this.port.hint(error || `${name} · ${axis}${s.input?` · ${s.input}${s.mode==='translate'?' m':s.mode==='rotate'?'°':' 倍'}`:''} · X/Y/Z 锁轴 · 左键/Enter 确认 · 右键/Esc 取消`);
  }
}
