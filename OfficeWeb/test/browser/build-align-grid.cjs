// 「对齐网格」：把**已经创建好的**离格部件一键收拾（用户：「是不是因为我已经创建的就不行？」）。
//
// 正式世界实测 179 件里 63 件离格（早期贴面/双柱桥接留下的毫米偏置）。拖动现在会把它们拉回网格，
// 但几十件挨个拖不现实，所以移动模式工具栏加了「对齐网格」：对选中的（可 Shift 多选）逐件对齐，
// 只动水平两轴（y 是接触高度，强行取整会让叠着的东西浮起/陷进去），Ctrl+Z 按逆序还原。
const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'align-grid-')),'world.json'));
  const user={id:'align-grid',name:'对齐验收',role:'visitor',lookConfirmed:true};
  const add=part=>store.mutate({action:'add',part:{rotation:0,...part}},user).changed;
  // 两块"老存档式"的离格方块（x/z 都带毫米偏置，y 也刻意离格），摆在岛屿之外。
  // 两件必须拉开一格以上：方块是 1×1×1，贴着放会相互重叠，斜视时第二下点到的其实是第一件
  // （Shift 点已选中的部件是"取消选择"，于是永远等不到选中 2 件——踩过）。
  const off1=add({kind:'block',x:60.11,y:0.105,z:20.06,color:'#e9b8b5'});
  const off2=add({kind:'block',x:62.37,y:0.105,z:20.19,color:'#b4c5a0'});
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
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),off1.id);
    // 正上方俯视：射线几乎垂直落下，不会被别的几何挡在中间，落点就是"看到的那一件"。
    const aim=async(x,z)=>{await page.evaluate(([x,z])=>{const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,0,z);c.position.set(x,16,z+.001);c.lookAt(k.target);c.updateMatrixWorld(true);},[x,z]);
      await page.waitForTimeout(250);};
    const click=async(x,y,z)=>{
      const p=await page.evaluate(([x,y,z])=>{
        const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();
        return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},[x,y,z]);
      await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.up();
    };
    const selected=()=>page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds);
    const onGrid=part=>Math.abs(part.x*4-Math.round(part.x*4))<1e-9&&Math.abs(part.z*4-Math.round(part.z*4))<1e-9;
    const saved=id=>store.snapshot().parts.find(p=>p.id===id);

    // ① 两块都在选中的情况下点「对齐网格」（Shift 加选，模拟用户收拾一整个结构）。
    await page.getByRole('button',{name:/移动/}).click();
    await aim(61.2,20.1);
    await click(60.11,0.6,20.06);
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.includes(id),off1.id);
    await page.keyboard.down('Shift');
    await click(62.37,0.6,20.19);
    await page.keyboard.up('Shift');
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length===2);
    await page.getByRole('button',{name:/对齐网格/}).click();
    await page.waitForFunction(()=>document.querySelector('.build-live')?.textContent?.includes('已保存'),{timeout:15000});
    await page.waitForTimeout(600);
    const a=saved(off1.id),b=saved(off2.id);
    assert(onGrid(a),`第一件要回到网格（现在 ${a.x},${a.z}）`);
    assert(onGrid(b),`第二件要回到网格（现在 ${b.x},${b.z}）`);
    assert.equal(a.y,0.105,'高度不动（接触高度是毫米级精度，强行取整会让叠着的东西浮起/陷进去）');
    assert.equal(b.y,0.105);
    // ② Ctrl+Z 逐件回退到原来的毫米偏置。
    await page.keyboard.press('Control+z');await page.waitForTimeout(600);
    await page.keyboard.press('Control+z');await page.waitForTimeout(900);
    assert.equal(saved(off1.id).x,60.11,'撤销要把第一件放回原位');
    assert.equal(saved(off2.id).x,62.37,'撤销要把第二件放回原位');
    assert.deepEqual(errors,[],'页面不该有报错：'+errors.join(' | '));
    await page.screenshot({path:'../Build/align-grid-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
    console.log('PASS 对齐网格：选中的离格部件一键回到 0.25 网格、高度不动、Ctrl+Z 还原');
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(error=>{console.error(error);process.exit(1);});
