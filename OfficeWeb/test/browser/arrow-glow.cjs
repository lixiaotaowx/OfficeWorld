// 流动箭头（flow-arrow）的"发光、一闪一闪"验收。
//
//   node test/browser/arrow-glow.cjs
//
// 用与办公室一致的渲染设置（AgX + 曝光 1.11）逐相位渲染箭头、回读真实像素，断言：
//   * 箭头中心确实在呼吸（最亮相位比最暗相位亮 ≥ 6 级）；
//   * 一个周期（1.3s）后回到起点 → 是持续闪烁，不是一次性变化；
//   * 光晕（加法混合壳）真的在轮廓外发光：把它藏掉后，变亮的像素明显变少；
//   * 安装预览那种共享 MeshBasicMaterial **绝不被点亮**、保持不透明（AGENTS 里的老坑）。
// 截图：../Build/arrow-glow-dark.png / -bright.png
const {createServer}=require('vite');
const {launch}=require('./playwright.cjs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
  const vite=await createServer({configFile:false,root:path.resolve('.'),server:{host:'127.0.0.1',port:0}});
  await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:700,height:540}});
    page.setDefaultTimeout(15000);
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+vite.httpServer.address().port+'/test/arrow-glow-harness.html');
    await page.waitForFunction(()=>Boolean(window.qa));
    // 箭头中心的平均亮度：最直接的"它亮不亮"读数。
    const center=(time)=>page.evaluate(async time=>{
      const {renderer,render,arrowRoot,camera,THREE}=window.qa;
      render(time);
      const image=new Image();
      image.src=renderer.domElement.toDataURL();
      await image.decode();
      const canvas=document.createElement('canvas');
      canvas.width=image.width;canvas.height=image.height;
      const ctx=canvas.getContext('2d');
      ctx.drawImage(image,0,0);
      const center=new THREE.Box3().setFromObject(arrowRoot).getCenter(new THREE.Vector3()).project(camera);
      const w=image.width,h=image.height,size=28;
      const x=Math.round(Math.max(0,Math.min(w-size,(center.x+1)*w/2-size/2)));
      const y=Math.round(Math.max(0,Math.min(h-size,(1-center.y)*h/2-size/2)));
      const data=ctx.getImageData(x,y,size,size).data;
      let sum=0;
      for(let i=0;i<data.length;i+=4)sum+=(data[i]+data[i+1]+data[i+2])/3;
      return Math.round(sum/(data.length/4)*10)/10;
    },time);
    // 两帧之间"变了多少像素、最亮变化多少"；可以把光晕藏掉再比一次。
    const compare=(a,b,haloOn)=>page.evaluate(async([a,b,haloOn])=>{
      const {renderer,render,arrow}=window.qa;
      const halo=arrow.userData.glowHalo;
      const grab=async(t,on)=>{
        halo.visible=on;
        render(t);
        const image=new Image();
        image.src=renderer.domElement.toDataURL();
        await image.decode();
        const canvas=document.createElement('canvas');
        canvas.width=image.width;canvas.height=image.height;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(image,0,0);
        return ctx.getImageData(0,0,image.width,image.height).data;
      };
      const before=await grab(a,haloOn),after=await grab(b,haloOn);
      halo.visible=true;
      let changed=0,max=0;
      for(let i=0;i<before.length;i+=4) {
        const d=Math.abs((before[i]+before[i+1]+before[i+2])/3-(after[i]+after[i+1]+after[i+2])/3);
        if(d>8)changed++;
        if(d>max)max=d;
      }
      return {changed,max:Math.round(max)};
    },[a,b,haloOn]);
    // 相位取在上升段、峰顶、下降段：峰顶附近被色调映射压平，比较要避开那一段。
    const phases=[0,.2,.4,.65,1,1.1,1.3];
    const samples=[];
    for(const t of phases)samples.push({time:t,center:await center(t)});
    const at=t=>samples.find(s=>s.time===t);
    const low=at(0).center,high=at(.65).center;
    assert(high-low>=6,'箭头中心确实在呼吸（'+low+' → '+high+'，差 '+(high-low).toFixed(1)+'）');
    assert(at(.2).center>low&&at(.4).center>at(.2).center,'半周期前越来越亮');
    assert(at(1).center<at(.4).center&&at(1.1).center<at(1).center,'过了半周期后回落');
    assert(Math.abs(at(1.3).center-low)<=2.5,'一个周期后回到最暗（'+at(1.3).center+' vs '+low+'）');
    // 光晕：同一对相位，藏掉光晕壳后变亮的像素变少 → 光真的溢出到本体之外；
    // 再单独量"光晕自己发出了多少光"（同相位，有壳/无壳两帧之差）。
    const haloContribution=(time)=>page.evaluate(async time=>{
      const {renderer,render,arrow}=window.qa;
      const halo=arrow.userData.glowHalo;
      const grab=async on=>{
        halo.visible=on;
        render(time);
        const image=new Image();
        image.src=renderer.domElement.toDataURL();
        await image.decode();
        const canvas=document.createElement('canvas');
        canvas.width=image.width;canvas.height=image.height;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(image,0,0);
        return ctx.getImageData(0,0,image.width,image.height).data;
      };
      const withShell=await grab(true),withoutShell=await grab(false);
      halo.visible=true;
      let changed=0,max=0;
      for(let i=0;i<withShell.length;i+=4) {
        const d=Math.abs((withShell[i]+withShell[i+1]+withShell[i+2])/3-(withoutShell[i]+withoutShell[i+1]+withoutShell[i+2])/3);
        if(d>8)changed++;
        if(d>max)max=d;
      }
      return {changed,max:Math.round(max)};
    },time);
    const withHalo=await compare(0,.65,true);
    const withoutHalo=await compare(0,.65,false);
    const haloOff=await haloContribution(.65);
    assert(withHalo.changed>withoutHalo.changed*1.1,
      '光晕把发光范围撑出本体（有壳 '+withHalo.changed+' px / 无壳 '+withoutHalo.changed+' px）');
    assert(haloOff.changed>=400&&haloOff.max>=25,
      '光晕本身在发光（藏掉它 '+haloOff.changed+' px 变暗，最多 -'+haloOff.max+' 级）');
    assert(withHalo.max>=20,'最亮处的变化足够明显（+'+withHalo.max+' 级）');
    await page.evaluate(()=>window.qa.render(0));
    await page.locator('canvas').screenshot({path:path.join('..','Build','arrow-glow-dark.png')});
    await page.evaluate(()=>window.qa.render(0.65));
    await page.locator('canvas').screenshot({path:path.join('..','Build','arrow-glow-bright.png')});
    // 安装预览：整个预览被换成共享的 MeshBasicMaterial，动画不许碰它。
    const preview=await page.evaluate(()=>{
      const {THREE,createPart,updateBuildFlags,world}=window.qa;
      const ghost=createPart({id:'ghost',kind:'flow-arrow',color:'#e9b8b5',x:6,y:0.4,z:0,rotation:0,version:1});
      const material=new THREE.MeshBasicMaterial({color:'#79c8dc'});
      ghost.traverse(o=>{if(o instanceof THREE.Mesh)o.material=material;});
      world.add(ghost);
      updateBuildFlags(world,.65);      // 最亮相位
      return {isBasic:material.isMeshBasicMaterial===true,
        touched:typeof material.emissiveIntensity!=='undefined',opacity:material.opacity};
    });
    assert(preview.isBasic&&!preview.touched,'预览的共享材质没有 emissiveIntensity（不被点亮）');
    assert.equal(preview.opacity,1,'预览材质保持不透明');
    assert.deepEqual(errors,[]);
    console.log('PASS arrow glow',JSON.stringify({samples,withHalo,withoutHalo}));
  } finally {await browser.close();await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
