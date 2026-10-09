// 移动模式下**多选之后也能旋转和缩放**（用户 2026-10-09：「请移动工具下在多选之后也可以旋转和缩放」）。
//
// 语义按 Blender 的 median pivot：整组绕"这一组的中心"转 yaw / 按同一组因子摊开缩放，每件自身的朝向和
// 尺寸跟着变。两个刻意的取舍（写在 `buildMoveHandle.posed()` 里）：
//  ① 只有 yaw 会转位置——绕组中心转 90° 是刚性变换，位置仍是 0.25 的整数倍（中心取在格点上）、高度不变，
//     "整格"那条不变量不受影响；翻面（pitch/roll）按件**原地**应用，只改朝向不动位置。
//  ② 缩放时各件的**间距一起放大**（否则只会各自长大、挤在一起），每件自身的尺寸按同一因子取整到 0.25。
// 这条用例真按手柄：Shift 多选两根立柱 → 拖旋转环 → 拖缩放方头 → 断言两件同步、间距按同一比例、
// 位置仍在网格上，最后 Ctrl+Z 逐次还原。
const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'group-xform-')),'world.json'));
  const user={id:'group-xform',name:'整组变换验收',role:'visitor',lookConfirmed:true};
  const add=part=>store.mutate({action:'add',part:{rotation:0,...part}},user).changed;
  // 两根立柱摆在一起（4m 间距，都在格上），周围没有别的东西抢射线。
  const a=add({kind:'pillar',x:80,y:0,z:0,color:'#e9b8b5'});
  const b=add({kind:'pillar',x:84,y:0,z:0,color:'#b4c5a0'});
  const vite=await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
  await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1400,height:900},ignoreHTTPSErrors:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.routeWebSocket('**/socket.io/**',s=>s.close());
    await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
    await page.route('**/api/**',async r=>{
      const url=new URL(r.request().url());let json={};
      if(url.pathname==='/api/auth/me')json={user};
      if(url.pathname==='/api/build') {
        const cmd=r.request().method()==='POST'?r.request().postDataJSON():null;
        try{json=cmd?store.mutate(cmd,user):store.snapshot();}
        catch(e){return r.fulfill({status:400,json:{error:e.message}});}
      }
      await r.fulfill({json});
    });
    await page.goto('http://127.0.0.1:'+vite.httpServer.address().port+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),a.id);
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),b.id);
    // 正上方俯视：射线垂直落下，不会被别的几何挡在中间。
    const aim=async(x,z)=>page.evaluate(([x,z])=>{const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,1,z);c.position.set(x,14,z+.001);c.lookAt(k.target);c.updateMatrixWorld(true);},[x,z]);
    const click=async(x,y,z)=>{
      const p=await page.evaluate(([x,y,z])=>{
        const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();
        return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},[x,y,z]);
      await page.mouse.move(p.x,p.y);await page.waitForTimeout(120);
      await page.mouse.down();await page.mouse.up();
    };
    const handle=()=>page.evaluate(()=>{
      const g=window.__officeDebug.__scene.getObjectByName('build-move-handle');
      return {ids:[...g.userData.selectedIds],working:Boolean(g.userData.working)};});
    const saved=id=>store.snapshot().parts.find(p=>p.id===id);
    // 手柄的拾取点：和 `build-experience.cjs` 同一套（扫一圈找可见的轴/环/方头）。
    const grip=async(mode,axis)=>page.evaluate(([mode,axis])=>{
      const d=window.__officeDebug,g=d.__scene.getObjectByName('build-move-handle');
      g.updateMatrixWorld(true);
      const t=g.children[0].controls,r=g.children[1].controls,s=g.children[2].controls;
      const c=mode==='translate'?t:mode==='scale'?s:r;
      const rect=document.querySelector('.scene canvas').getBoundingClientRect();
      const center=d.__scene.getObjectByName('build-move-pivot').position.clone().project(d.__camera);
      const cx=rect.left+(center.x+1)*rect.width/2,cy=rect.top+(1-center.y)*rect.height/2;
      for(let dy=-150;dy<=150;dy+=5)for(let dx=-150;dx<=150;dx+=5){
        if(Math.hypot(dx,dy)<40)continue;
        const x=cx+dx,y=cy+dy,p={x:(x-rect.left)/rect.width*2-1,y:-(y-rect.top)/rect.height*2+1,button:0};
        t.pointerHover(p);r.pointerHover(p);s.pointerHover(p);
        if(c.axis===axis && (mode==='translate'||!['X','Y','Z'].includes(t.axis)) && (mode!=='rotate'||!['X','Y','Z'].includes(s.axis)))return{x,y};
      }
      throw Error('No visible handle '+mode+axis);
    },[mode,axis]);
    const drag=async(mode,axis,dx,dy)=>{
      await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.working===false);
      const p=await grip(mode,axis);
      await page.mouse.move(p.x,p.y);await page.mouse.down();
      await page.mouse.move(p.x+dx,p.y+dy,{steps:12});
      await page.mouse.up();
      await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.working===false);
    };
    const onGrid=v=>Math.abs(v*4-Math.round(v*4))<1e-9;
    const span=()=>Math.abs(saved(a.id).x-saved(b.id).x);

    // ① Shift 多选两件：**三个手柄都必须在**（以前多选只给平移）。
    await page.getByRole('button',{name:/移动/}).click();
    await aim(82,0);
    await click(80,1.5,0);
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.includes(id),a.id);
    await page.keyboard.down('Shift');
    await click(84,1.5,0);
    await page.keyboard.up('Shift');
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length===2);
    assert.deepEqual((await handle()).ids,[a.id,b.id],'两件都要选中');
    for(const [mode,axis] of [['translate','X'],['rotate','Y'],['scale','X']]){
      const at=await grip(mode,axis);
      assert.ok(at&&at.x>0,`多选时 ${mode} ${axis} 手柄要能抓到`);
    }
    const before={a:{...saved(a.id)},b:{...saved(b.id)}};
    assert.equal(span(),4,'起点间距 4m');

    // ② 拖旋转环：两件一起转，位置绕组的中心（x=82）转 90°，间距不变、仍在格上。
    await drag('rotate','Y',160,0);
    await page.waitForFunction(({x,y})=>window.__officeDebug.__scene.getObjectByName('build-'+x).userData.version>y,
      {x:a.id,y:before.a.version});
    await page.waitForFunction(({x,y})=>window.__officeDebug.__scene.getObjectByName('build-'+x).userData.version>y,
      {x:b.id,y:before.b.version});
    const rotated=[saved(a.id),saved(b.id)];
    assert.equal(rotated[0].rotation,rotated[1].rotation,'整组旋转后两件朝向一致');
    assert.notEqual(rotated[0].rotation,before.a.rotation,'朝向确实变了');
    assert.equal(Math.abs(rotated[0].x-rotated[1].x)<1e-9||Math.abs(rotated[0].z-rotated[1].z)<1e-9,true,
      '转 90° 后两件仍然共线');
    assert.equal(Math.abs(Math.hypot(rotated[0].x-rotated[1].x,rotated[0].z-rotated[1].z)-4)<1e-9,true,
      '整组旋转是刚性的：间距不变');
    assert.equal((rotated[0].x+rotated[1].x)/2,82,'绕组的中心转（中心 x 仍是 82）');
    for(const p of rotated){assert.equal(onGrid(p.x)&&onGrid(p.z),true,`位置仍在网格上（${p.x},${p.z}）`);assert.equal(p.y,0,'高度不变');}
    console.log('整组旋转 → '+JSON.stringify(rotated.map(p=>[p.x,p.z,'rot'+p.rotation])));

    // ③ 拖缩放方头：间距按同一因子摊开，两件的尺寸也按同一因子变（尺寸再按 0.25 取整）。
    //    因子在**松手之前**从手柄上读（`userData.group.scale`），断言因此是确定性的、不靠猜像素。
    const spanBeforeScale=Math.abs(rotated[0].x-rotated[1].x)+Math.abs(rotated[0].z-rotated[1].z);
    // 目录里的原始尺寸（立柱 0.5m）与拖动前的 scale：尺寸按 0.25 取整的那条规则要用它们算期望值。
    const pillarBase=require('../../build-catalog.json').find(item=>item.id==='pillar').dimensions[0];
    const startScale=saved(a.id).scale?.[0] ?? 1;
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.working===false);
    const grab=await grip('scale','X');
    await page.mouse.move(grab.x,grab.y);await page.mouse.down();
    await page.mouse.move(grab.x+120,grab.y,{steps:12});
    const factor=await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.group.scale[0]);
    await page.mouse.up();
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.working===false);
    await page.waitForTimeout(400);
    const scaled=[saved(a.id),saved(b.id)];
    const spanAfterScale=Math.abs(scaled[0].x-scaled[1].x)+Math.abs(scaled[0].z-scaled[1].z);
    console.log('整组缩放 → '+JSON.stringify(scaled.map(p=>[p.x,p.z,'scale'+(p.scale?.[0]??1)]))
      +` 间距 ${spanBeforeScale} → ${spanAfterScale}（位置因子 ${factor}）`);
    assert.notEqual(factor,1,'缩放确实生效了');
    assert.equal(factor>0,true,'因子必须为正（拖过头不能把整组镜像，只会缩到下限）');
    assert.equal(scaled[1].scale?.[0],scaled[0].scale?.[0],'两件尺寸按同一因子变');
    // 尺寸按 0.25 取整（和单件缩放同一条规则）；位置用原始因子再落格，最多差半格。
    const expectedScale=Math.max(.25,Math.round(pillarBase*startScale*factor*4)/4)/pillarBase;
    assert.equal(Math.abs((scaled[0].scale?.[0] ?? 1)-expectedScale)<1e-9,true,
      `尺寸要按因子取整到 0.25（得到 ${scaled[0].scale?.[0]}，期望 ${expectedScale}）`);
    assert.equal(Math.abs(spanAfterScale-spanBeforeScale*factor)<0.26,true,
      `间距也要按同一因子摊开（${spanBeforeScale} → ${spanAfterScale}，因子 ${factor}）`);
    for(const p of scaled){assert.equal(onGrid(p.x)&&onGrid(p.z),true,`缩放后位置仍在网格上（${p.x},${p.z}）`);}
    await page.screenshot({path:'../Build/group-transform-'+(process.env.BOX_LIVE?'live':'local')+'.png'});

    // ④ Ctrl+Z 逐步还原（缩放一次、旋转一次）。
    await page.keyboard.press('Control+z');await page.waitForTimeout(700);
    await page.keyboard.press('Control+z');await page.waitForTimeout(900);
    assert.deepEqual([saved(a.id).x,saved(a.id).z,saved(a.id).rotation],[before.a.x,before.a.z,before.a.rotation],
      '撤销要把整组旋转/缩放放回原位');
    assert.deepEqual([saved(b.id).x,saved(b.id).z,saved(b.id).rotation],[before.b.x,before.b.z,before.b.rotation]);
    assert.deepEqual(errors,[],'页面不该有报错：'+errors.join(' | '));
    console.log('PASS 多选后整组旋转/缩放：两件同步、间距按比例、位置仍在网格、Ctrl+Z 还原');
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(error=>{console.error(error);process.exit(1);});
