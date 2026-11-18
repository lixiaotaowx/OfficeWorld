import { frameBilliardsPlayer, turnBilliardsAim } from './billiardsCamera';\
import { billiardsEdgeSpeed, frameBilliardsPlayer, turnBilliardsAim } from './billiardsCamera';\
  private billiardsPointer:number|null=null;\
  private billiardsEdgeX:number|null=null;\
  private billiardsLookHeight=0;\
  private billiardsMouseRequest=false;\
  private billiardsWasLocked=false;\
  private billiardsUnlockedAt=0;\
  billiardsMouseFallback=false;\
  get billiardsMouseLocked(){return document.pointerLockElement===this.renderer.domElement;}\
  onBilliardsMouseChange:()=>void=()=>{};\
  dispose() {\
    this.releaseBilliardsMouse();\
    document.removeEventListener('pointerlockchange',this.billiardsLockChange);\
    document.removeEventListener('pointerlockerror',this.billiardsLockError);\
    window.removeEventListener('blur',this.billiardsBlur);\
    this.billiardsView='player';this.billiardsPointer=null;\
    this.billiardsMouseFallback=false;this.billiardsLookHeight=0;this.billiardsEdgeX=null;\
  setBilliardsView(mode:'overhead'|'player') {\
    if(!this.billiards)return;\
    this.billiardsView=mode;this.billiardsPointer=null;\
    this.billiardsView=mode;this.billiardsPointer=null;this.billiardsEdgeX=null;\
    if(mode==='overhead')this.releaseBilliardsMouse();\
      ?'台球真人视角：左右移动鼠标瞄准，长按左键或空格蓄力，松开击球'\
      ?'台球游戏模式：点击锁定鼠标，移动鼠标自由转向，长按左键或空格蓄力，Esc释放鼠标'\
  closeBilliards() {\
    this.releaseBilliardsMouse();\
      const target=frameBilliardsPlayer(c,table.root,table.eyeBall,table.angle,this.host.clientWidth,this.host.clientHeight);\
      const target=frameBilliardsPlayer(c,table.root,table.eyeBall,table.angle,this.host.clientWidth,this.host.clientHeight,this.billiardsLookHeight);\
      if(e.key==='Escape'){e.preventDefault();this.onBilliardsClose();}\
      if(e.key==='Escape'){\
        e.preventDefault();\
        if(this.billiardsMouseLocked||performance.now()-this.billiardsUnlockedAt<250)this.releaseBilliardsMouse();\
        else this.onBilliardsClose();\
      }\
  private keyup = (e: KeyboardEvent) => this.keys.delete(e.key.toLowerCase());\
  async captureBilliardsMouse() {\
    if(!this.billiards||this.billiardsView!=='player'||this.billiardsMouseLocked||this.billiardsMouseRequest)return;\
    this.billiardsMouseRequest=true;this.billiardsPointer=null;this.billiardsEdgeX=null;\
    try{await this.renderer.domElement.requestPointerLock();}\
    catch{if(this.billiards&&this.billiardsView==='player')this.billiardsLockError();}\
    finally{this.billiardsMouseRequest=false;}\
  }\
  releaseBilliardsMouse() {\
    this.billiardsPointer=null;this.billiardsEdgeX=null;\
    if(this.billiardsMouseLocked)document.exitPointerLock();\
  }\
  private billiardsLockChange=()=>{\
    const locked=this.billiardsMouseLocked;\
    if(this.billiardsWasLocked&&!locked)this.billiardsUnlockedAt=performance.now();\
    this.billiardsWasLocked=locked;this.billiardsPointer=null;this.billiardsEdgeX=null;\
    if(locked)this.billiardsMouseFallback=false;\
    if(locked&&(!this.billiards||this.billiardsView!=='player'))this.releaseBilliardsMouse();\
    this.onBilliardsMouseChange();\
  };\
  private billiardsLockError=()=>{this.billiardsMouseFallback=true;this.onBilliardsMouseChange();};\
  private billiardsBlur=()=>{this.keys.clear();this.releaseBilliardsMouse();};\
  private aimBilliards(e:PointerEvent,moving=false) {\
    const table=this.billiards;if(!table)return;\
    if(this.billiardsView==='player'){\
      if(moving&&this.billiardsPointer!==null&&table.canShoot)table.angle=turnBilliardsAim(table.angle,e.clientX-this.billiardsPointer,this.host.clientWidth);\
      this.billiardsPointer=e.clientX;\
      if(this.billiardsMouseLocked){\
        if(moving){table.angle=turnBilliardsAim(table.angle,e.movementX,1280);this.billiardsLookHeight=THREE.MathUtils.clamp(this.billiardsLookHeight-e.movementY*.0012,-.15,.30);}\
      }else{\
        if(moving&&this.billiardsPointer!==null&&table.canShoot)table.angle=turnBilliardsAim(table.angle,e.clientX-this.billiardsPointer,this.host.clientWidth);\
        this.billiardsPointer=e.clientX;this.billiardsEdgeX=e.clientX-this.renderer.domElement.getBoundingClientRect().left;\
      }\
    el.addEventListener('pointerleave', () => { this.billiardsPointer=null;this.ring.visible = false; this.onHover(null); });\
    el.addEventListener('pointerleave', () => { this.billiardsPointer=null;this.billiardsEdgeX=null;this.ring.visible = false; this.onHover(null); });\
    window.addEventListener('blur', () => this.keys.clear());\
    window.addEventListener('blur',this.billiardsBlur);\
    document.addEventListener('pointerlockchange',this.billiardsLockChange);\
    document.addEventListener('pointerlockerror',this.billiardsLockError);\
    const dt = Math.min(0.05, this.clock.getDelta());\
    if(this.billiards?.canShoot&&this.billiardsView==='player'&&!this.billiardsMouseLocked)\
      this.billiards.angle+=billiardsEdgeSpeed(this.billiardsEdgeX,this.host.clientWidth)*dt;\
