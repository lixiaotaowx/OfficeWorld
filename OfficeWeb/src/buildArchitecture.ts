import * as THREE from 'three';
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
