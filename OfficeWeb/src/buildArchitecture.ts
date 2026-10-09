import * as THREE from 'three';
import { createTeleportBeam, updateTeleportBeams } from './buildBeam';
type Box=(size:number[],position:number[],color?:string)=>THREE.Mesh;
// One conventional arrow silhouette, with a thin shaft and a crisp triangular tip.
const outline=new THREE.Shape();
outline.moveTo(-.07,-.375);
for(const [x,z] of [[.07,-.375],[.07,.075],[.25,.075],[0,.375],[-.25,.075],[-.07,.075]])outline.lineTo(x,z);
outline.closePath();
const arrowGeometry=new THREE.ExtrudeGeometry(outline,{depth:.125,bevelEnabled:false,steps:1});
arrowGeometry.rotateX(Math.PI/2);
arrowGeometry.translate(0,.125,0);

// 流动箭头是唯一会"亮"的部件：其他部件按颜色共用一份材质，它单独一份自发光材质，
// 外面再套一层加法混合的光晕壳，两者一起呼吸（用户：「箭头…发光…一闪一闪的」）。
const PULSE_SECONDS=1.3;
const arrowMaterials=new Map<string,THREE.MeshStandardMaterial>();
const haloMaterials=new Map<string,THREE.MeshBasicMaterial>();
const GLOW_WHITE=new THREE.Color('#ffffff');
/** 呼吸曲线：0 = 最暗，1 = 最亮，周期 PULSE_SECONDS。 */
export function arrowPulse(time:number) {
  return .5-.5*Math.cos(time*Math.PI*2/PULSE_SECONDS);
}
function arrowLook(source:THREE.MeshStandardMaterial) {
  const key=source.color.getHexString();
  if(!arrowMaterials.has(key))arrowMaterials.set(key,new THREE.MeshStandardMaterial({
    color:source.color.clone(),roughness:.45,metalness:0,
    // 发光用比本体更饱和的同色光：直接拿本体色当自发光会一路推到白，签面就"烧掉"了。
    emissive:source.color.clone().offsetHSL(0,.18,-.06),emissiveIntensity:.8,
  }));
  if(!haloMaterials.has(key))haloMaterials.set(key,new THREE.MeshBasicMaterial({
    color:source.color.clone().lerp(GLOW_WHITE,.3),
    transparent:true,opacity:.2,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,
  }));
  return {body:arrowMaterials.get(key)!,shell:haloMaterials.get(key)!};
}

/** Metre-scale structural modules made only from hard-edged shared boxes. */
export function buildArchitecture(kind:string,root:THREE.Group,box:Box) {
  if(kind==='flow-arrow') {
    const arrow=box([1,1,1],[0,0,0]);
    arrow.geometry=arrowGeometry;
    const look=arrowLook(arrow.material as THREE.MeshStandardMaterial);
    arrow.material=look.body;
    const halo=new THREE.Mesh(arrowGeometry,look.shell);
    halo.scale.setScalar(1.3);
    // 光晕只是"光"：给一个空包围盒，让它不参与任何 Box3 计算——目录实测尺寸、选中框、
    // 旋转环半径都不该被壳撑大（three 的 expandByObject 认这个自定义 boundingBox）。
    (halo as THREE.Mesh&{boundingBox?:THREE.Box3}).boundingBox=new THREE.Box3();
    halo.raycast=()=>{};
    halo.userData.noBuildCollision=true;
    halo.userData.glowHalo=true;
    arrow.add(halo);
    arrow.userData.glowHalo=halo;
    arrow.userData.arrowNudge=true;
    // A directional sign is decorative; its tiny animation must not push avatars.
    arrow.userData.noBuildCollision=true;
    root.userData.arrowPanels=[arrow];
    return true;
  }
  if(['stairs-narrow','stairs-tall','stairs-narrow-tall'].includes(kind)) {
    const steps=kind.includes('tall')?8:4,width=kind.includes('narrow')?1:2;
    for(let i=0;i<steps;i++)box([width,(i+1)*.25,.5],[0,(i+1)*.125,steps*.25-.25-i*.5]);
    return true;
  }
  if(kind==='ladder') {
    // 直梯：**真的能爬的梯子**（用户：「新增直梯是可以通行的，不管是上和下，可以用方向键通行，
    // 就类似于游戏，以及自动寻路也可以」）。
    //
    // 两根立柱是实心碰撞（能贴墙放置、能选中、有实测尺寸），横档只是外观（`noBuildCollision`），
    // 因为"能站人的踏面"不是梯子的玩法——`buildNavigation` 的 0.255m 抬腿高度走不上去，
    // 叠在同一个 z 上时上面那级还会把下面那级封死。所以梯子改成**可攀爬柱体**
    // （`root.userData.localClimb`）：进了这个柱体就是抓着梯子，W/↑ 往上爬、S/↓ 往下退，
    // 寻路在同一格上也能一级级上下（见 `buildNavigation` 的爬梯边、`buildClimb.ts`）。
    for(const x of [-.26,.26]) box([.08,3.78,.08],[x,1.89,0]);
    for(let i=0;i<15;i++){
      const rung=box([.6,.06,.06],[0,.25+i*.25,0]);
      rung.userData.noBuildCollision=true;
    }
    // 净爬升 3.75m（15 档 × 0.25m），柱体留一点余量让人能走近它（别开太宽，
    // 否则从梯子旁边走过按 W 也会被"抓"上去）。`normal` 是梯面法线（本地 +Z，梯子很薄的那一轴）：
    // 爬梯时人朝它看，由 `buildArch.climbColumns` 跟着旋转一起变换到世界坐标。
    root.userData.localClimb={min:[-.35,0,-.25],max:[.35,3.75,.25],normal:[0,0,1]};
    return true;
  }
  if(kind==='teleport-pad') {
    // 传送点：底座 + 会发光的面板 + 四角立柱。发光由 createPart 单独给材质，
    // 这里只把形状摆好（与其他部件一样，原点在底面中心）。
    box([1.5,.18,1.5],[0,.09,0]);
    box([1.24,.08,1.24],[0,.21,0]);
    for(const x of [-.62,.62]) for(const z of [-.62,.62]) box([.1,.34,.1],[x,.17,z]);
    // 往上冒的粒子条（共用几何/材质，见 `buildBeam.ts`）。
    createTeleportBeam(root);
    // 一个**看不见但吃拾取**的盒子：传送点只有 0.34m 高，隔着几步点它很容易差一点点
    // 打到旁边的地板，看上去就是"传送点无效"。它有空包围盒（不进实测尺寸）也不参与碰撞。
    const pick=box([1.7,.9,1.7],[0,.45,0]);
    pick.name='teleport-pick';
    pick.visible=false;
    pick.userData.noBuildCollision=true;
    // 明说这是"拾取助手"：它比部件本身大，不能算进目录实测尺寸/声明范围（测试按这个标记跳过）。
    pick.userData.pickHelper=true;
    (pick as THREE.Mesh&{boundingBox?:THREE.Box3}).boundingBox=new THREE.Box3();
    return true;
  }
  if(kind!=='roof' && kind!=='roof-flag')return false;
  for(let i=0;i<4;i++)box([4-i,.25,4],[0,.125+i*.25,0]);
  if(kind==='roof-flag') {
    box([.08,1.25,.08],[0,1.625,0],'#596679');
    const panels:THREE.Mesh[]=[];
    for(let i=0;i<8;i++) {
      const panel=box([.1,.4,.015],[.09+i*.1,2.05,0],'#e9b8b5');
      panel.userData.flagPanel=i;panel.userData.noBuildCollision=true;panels.push(panel);
    }
    root.userData.flagPanels=panels;
  }
  return true;
}

/** Animate decoration only; the roof's collision and placement origin never move. */
export function updateBuildFlags(world:THREE.Scene,time:number) {
  const pulse=arrowPulse(time);
  // 传送点的粒子条用**共享几何**，所以一帧只算一次（世界上一块都没有时它是空转，立刻返回）。
  updateTeleportBeams(world,time);
  for(const root of world.children) {
    const arrows=root.userData.arrowPanels as THREE.Mesh[]|undefined;
    if(arrows)for(const panel of arrows) {
      // Keep the saved root/installation point fixed; only the local sign nudges.
      const phase=(time%1.4)/1.4;
      panel.position.z=.08*Math.pow(Math.sin(Math.PI*phase),4);
      const body=panel.material as THREE.MeshStandardMaterial;
      // 安装预览把这些网格换成了共享的 MeshBasicMaterial（没有 emissive）：绝不能被点亮，
      // 也不能改它的透明度——预览必须保持不透明（见 AGENTS「不要让安装预览进入 emissive 更新」）。
      if(body.emissive)body.emissiveIntensity=.9*pulse;
      const shell=(panel.userData.glowHalo as THREE.Mesh|undefined)?.material as THREE.MeshBasicMaterial|undefined;
      // 光晕从全灭到最亮：一闪一闪主要靠它（本体颜色会被色调映射压住，动态范围小）。
      if(shell?.transparent)shell.opacity=.5*pulse;
    }
    const panels=root.userData.flagPanels as THREE.Mesh[]|undefined;
    if(!panels)continue;
    const wave=(i:number)=>Math.sin(time*3-i*.65)*.1*i/8;
    panels.forEach((p,i)=>{
      const a=wave(i),b=wave(i+1);
      p.position.z=(a+b)/2;
      p.rotation.y=-Math.atan2(b-a,.1);
      p.scale.x=Math.hypot(.1,b-a);
    });
  }
}
