// 传送点：粒子条 + **点到哪一块就传到那一块**（用户：「不是一对一 是任何地点直接传送到点击处，
// 只需要创建一个就行，创建后不要鼠标只能继续创建从而出不来」）。
//
// 这里验三件事：
//   ① 粒子条在往上冒（共用几何，见 `src/buildBeam.ts`）；
//   ② **一块就够**：从老远点它，直接站到那一块上；
//   ③ 安装传送点之后自动回到漫游（不会"只能继续创建、出不来"），并且站在这一块上再点它
//      会去最近的那一块（有第二块时）。
const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'pad-beam-')),'world.json'));
  const user={id:'pad-beam',name:'传送点验收',role:'visitor',lookConfirmed:true};
  // 复刻正式站那一眼：**一块**传送点摆在空地上（一块就该能用）。
  const pad=store.mutate({action:'add',user,part:{kind:'teleport-pad',rotation:0,x:100,y:0,z:0,color:'#e9b8b5'}}).changed;
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
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),pad.id);
    const beam=()=>page.evaluate(id=>{
      const root=window.__officeDebug.__scene.getObjectByName('build-'+id);
      const points=root.userData.teleportBeam??root.getObjectByName('teleport-beam');
      if(!points)return null;
      const position=points.geometry.getAttribute('position');
      const ys=Array.from({length:position.count},(_,i)=>+position.getY(i).toFixed(3));
      return {type:points.type,count:position.count,ys,low:Math.min(...ys),high:Math.max(...ys)};
    },pad.id);
    const point=async(x,y,z)=>{
      const p=await page.evaluate(([x,y,z])=>{
        const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();
        return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},[x,y,z]);
      await page.mouse.move(p.x,p.y);return p;
    };
    const aim=async(x,z)=>{await page.evaluate(([x,z])=>{const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,0.5,z);c.position.set(x,6,z+7);c.lookAt(k.target);c.updateMatrixWorld(true);},[x,z]);
      await page.waitForTimeout(250);};
    const avatar=()=>page.evaluate(()=>{const p=window.__officeDebug.avatar.root.position;
      return {x:+p.x.toFixed(2),y:+p.y.toFixed(2),z:+p.z.toFixed(2)};});
    const mode=()=>page.evaluate(()=>Array.from(document.querySelectorAll('.build-modes button'))
      .find(b=>b.getAttribute('aria-pressed')==='true')?.textContent?.trim());

    // ① 粒子条真的在冒：18 个点、从底座铺到 2.3m 左右、每帧都在往上走。
    await page.waitForTimeout(600);
    const first=await beam();
    assert(first,'传送点要挂粒子条');
    assert.equal(first.type,'Points');
    assert.equal(first.count,18);
    assert(first.low>0.2&&first.high<2.4,`粒子在柱体里（${first.low}~${first.high}）`);
    assert(first.high-first.low>1.5,`要拉成一根柱子，不是一团（${first.low}~${first.high}）`);
    await page.waitForTimeout(700);
    const later=await beam();
    assert(later.ys.some((y,i)=>Math.abs(y-first.ys[i])>0.05),'每个粒子都要往上走（绕回去也算动）');

    // ② 一块就够：站到老远的地方，点它 → 直接站到那一块上（这就是用户要的"任何地点传到点击处"）。
    await page.evaluate(()=>window.__officeDebug.avatar.teleportTo({x:92,y:0,z:-6},0));
    await aim(100,0);
    await point(100,0.3,0);
    await page.mouse.down();await page.mouse.up();
    await page.waitForFunction(()=>Math.abs(window.__officeDebug.avatar.root.position.x-100)<.01,{timeout:4000});
    const landed=await avatar();
    assert.equal(landed.x,100);assert.equal(landed.z,0,`点它就要站到它上面（现在 ${JSON.stringify(landed)}）`);

    // ③ 站在这一块上再点它：世界上只有这一块 → 给一句提示，而不是静默失败。
    await point(100,0.3,0);
    await page.mouse.down();await page.mouse.up();
    await page.waitForTimeout(400);
    const hints=await page.evaluate(()=>document.querySelector('.build-hint')?.textContent??'');
    assert(hints.includes('你已经站在这个传送点上了'),`站在上面再点要有说明（现在 ${JSON.stringify(hints)}）`);

    // ④ 安装第二块后**自动回到漫游**（用户报「创建后鼠标只能继续创建从而出不来」），
    //    然后站在第一块上点它 → 去第二块。
    await page.getByRole('button',{name:/安装/}).click();
    await page.getByRole('tab',{name:'玩法',exact:true}).click();
    await page.getByRole('button',{name:'传送点',exact:true}).click();
    await aim(100,6);
    await point(100,0,6);
    await page.mouse.down();await page.mouse.up();
    await page.getByText('已保存 · 所有人可见',{exact:true}).waitFor({timeout:15000});
    await page.waitForTimeout(500);
    assert.equal(store.snapshot().parts.filter(p=>p.kind==='teleport-pad').length,2,'第二块要落进存档');
    assert.equal(await mode(),'↗漫游','放下传送点后要自动回到漫游，不能困在安装模式里继续创建');
    await aim(100,0);
    await point(100,0.3,0);
    await page.mouse.down();await page.mouse.up();
    await page.waitForFunction(()=>Math.abs(window.__officeDebug.avatar.root.position.z-6)<.01,{timeout:4000});
    const hopped=await avatar();
    assert.equal(hopped.z,6,`站在这一块上再点它 → 去最近的那一块（现在 ${JSON.stringify(hopped)}）`);
    assert.deepEqual(errors,[],'页面不该有报错：'+errors.join(' | '));
    await page.screenshot({path:'../Build/teleport-beam-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
    console.log('PASS 传送点：粒子条在冒、一块就够（点哪去哪）、装在传送点后自动回漫游');
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(error=>{console.error(error);process.exit(1);});
