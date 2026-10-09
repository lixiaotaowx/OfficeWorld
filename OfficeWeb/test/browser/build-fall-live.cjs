// 正式站的掉落验收：真账号 + 真存档 + 真键盘，走一遍"掉到下层站住 → 掉进深渊宣布死亡 → 回到
// 掉落前的位置复活"。
//
//   node test/browser/build-fall-live.cjs
//
// **只许动自己那块地**（2026-10-09 的教训）：验收件一律摆在 PLOT=(64,64)（先量过那里半径 14m
// 内一件都没有），按位置筛、开头结尾核对世界总件数，收尾把自己那两件删掉。永远不要按 kind 批量删。
const {launch}=require('./playwright.cjs');
const assert=require('node:assert/strict');
const SITE='https://115.159.43.237';
const NAME='掉落上线验收',PASSWORD='falllive';
const PLOT={x:64,z:64};
const NEAR=12;
const HIGH_TOP=6.25, LOW_TOP=3.25;
const sleep=ms=>new Promise(done=>setTimeout(done,ms));

/** 点掉"先捏一下你的角色"（面板留着会挡住键盘和画布）。 */
async function confirmLook(page){
  const dialog=page.getByRole('dialog',{name:'设置我的角色'});
  if(!await dialog.count())return;
  await dialog.getByRole('button',{name:'就这样，进空间'}).click();
  await dialog.waitFor({state:'detached',timeout:15000});
  await sleep(500);
}

(async()=>{
  const browser=await launch();
  let world=null;
  const created=[];
  try{
    const context=await browser.newContext({viewport:{width:1400,height:900},ignoreHTTPSErrors:true});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const build={
      get:async()=>await (await context.request.get(SITE+'/api/build')).json(),
      post:async data=>await (await context.request.post(SITE+'/api/build',{headers:{origin:SITE},data})).json(),
    };
    const near=part=>Math.hypot(part.x-PLOT.x,part.z-PLOT.z)<NEAR;
    const mine=snapshot=>(snapshot.parts||[]).filter(near);

    await page.goto(SITE+'/?debug=1');
    await page.waitForSelector('.account-card, .scene-shell',{timeout:40000});
    if(await page.locator('.account-card').count()){
      const res=await context.request.post(SITE+'/api/auth/register',{headers:{origin:SITE},data:{name:NAME,password:PASSWORD}});
      if(res.status()!==200){
        const login=await context.request.post(SITE+'/api/auth/login',{headers:{origin:SITE},data:{name:NAME,password:PASSWORD}});
        assert.equal(login.status(),200,'验收账号要能登录');
      }
      await page.goto(SITE+'/?debug=1');
      await sleep(1500);
    }
    const visitor=page.locator('.role-option').filter({hasText:'访问人'});
    await page.waitForSelector('.role-option, .scene-shell',{timeout:60000});
    if(await visitor.count())await visitor.click();
    if(!await page.evaluate(()=>Boolean(window.__officeDebug))){
      await page.goto(SITE+'/?debug=1');
      await sleep(1500);
    }
    await page.waitForFunction(()=>window.__officeDebug?.__scene,{timeout:60000});
    await page.waitForFunction(()=>window.__officeDebug.__scene.children.some(c=>c.userData.buildId),{timeout:60000});
    await page.waitForFunction(()=>Boolean(window.__officeDebug?.avatar?.root.children.length),null,{timeout:60000});
    await sleep(1000);
    await confirmLook(page);

    // 只清自己那块地上的残留，并记下"自己那块地之外"的件数当基线。
    world=await build.get();
    const strays=mine(world);
    for(const part of strays){await build.post({action:'remove',id:part.id,version:part.version});await sleep(400);}
    world=await build.get();
    assert.equal(mine(world).length,0,'开跑前自己那块地上不该有残留');
    const baseline=(world.parts||[]).filter(p=>!near(p)).length;
    console.log('正式世界 '+world.parts.length+' 件；自己那块地之外 '+baseline+' 件');

    // 高台 + 下层（都在自己那块地上）。
    // 写接口有每账号节流（120ms 起步，实测连发会回「操作太快，请稍候」）：两次写入之间要留间隔。
    const high=await build.post({action:'add',part:{kind:'block',x:PLOT.x,y:6,z:PLOT.z,rotation:0,color:'#f3dfc5',scale:[4,0.25,4]}});
    await sleep(500);
    const low=await build.post({action:'add',part:{kind:'block',x:PLOT.x,y:3,z:PLOT.z+4,rotation:0,color:'#b4c5a0',scale:[4,0.25,4]}});
    await sleep(500);
    const highId=high.changed?.id, lowId=low.changed?.id;
    assert.ok(highId&&lowId,'两件验收平台要真的落进正式存档（后端目录旧了会回 400「没有这个部件」）');
    created.push([highId,high.changed.version],[lowId,low.changed.version]);
    await page.waitForFunction(id=>Boolean(window.__officeDebug.__scene.getObjectByName('build-'+id)),highId,{timeout:30000});
    await page.waitForFunction(id=>Boolean(window.__officeDebug.__scene.getObjectByName('build-'+id)),lowId,{timeout:30000});

    const look=(x,z)=>page.evaluate(([x,z])=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});
      k.target.set(x,1.4,z+6);c.position.set(x,3.2,z-2);c.lookAt(k.target);c.updateMatrixWorld(true);
    },[x,z]);
    const place=async(x,y,z)=>{await page.evaluate(([x,y,z])=>window.__officeDebug.avatar.teleportTo({x,y,z},0),[x,y,z]);await look(x,z);};
    const where=()=>page.evaluate(()=>{const p=window.__officeDebug.avatar.root.position;
      return [+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)];});
    const fall=()=>page.evaluate(()=>window.__officeDebug.avatar.fallDiagnostics());
    const settle=async(want,ms=15000)=>{const deadline=Date.now()+ms;
      while(Date.now()<deadline){const point=await where();if(want(point))return point;await sleep(80);}return where();};
    const settleFall=async(ms=15000)=>{const deadline=Date.now()+ms;
      while(Date.now()<deadline){if((await fall()).falling)return true;await sleep(50);}return false;};

    // ① 走出高台 → 掉到下层建筑上 → 站住。
    await place(PLOT.x,HIGH_TOP,PLOT.z);
    await sleep(300);
    await page.keyboard.down('w');
    assert.equal(await settleFall(),true,'走出高台边缘就该开始下落');
    const midAir=await settle(p=>p[1]<HIGH_TOP-0.2,5000);
    assert.ok(midAir[1]<HIGH_TOP,`下落中高度要变小（y=${midAir[1]}）`);
    await page.keyboard.up('w');
    const landed=await settle(p=>Math.abs(p[1]-LOW_TOP)<0.02);
    assert.equal(+landed[1].toFixed(3),LOW_TOP,'要正好落在下层平台的顶面');
    assert.equal((await fall()).deaths,0,'掉到下层建筑上不算死');

    // ② 走出下层边缘 → 掉过最低部件 → 死亡 → 回到掉落前的位置复活。
    await place(PLOT.x,LOW_TOP,PLOT.z+5.6);
    await sleep(300);
    const before=await where();
    await page.keyboard.down('w');
    assert.equal(await settleFall(),true,'走出下层平台的边缘也要开始下落');
    await page.keyboard.up('w');
    const died=await (async()=>{const deadline=Date.now()+25000;
      while(Date.now()<deadline){if((await fall()).deaths>=1)return true;await sleep(80);}return false;})();
    const back=await where();
    const info=await fall();
    console.log('died: '+JSON.stringify({back,deaths:info.deaths,lastFrom:info.last?.from,spot:info.last?.spot,deathY:info.last?.deathY}));
    assert.equal(died,true,'掉过最低部件就该宣布死亡');
    assert.equal(info.falling,false);
    assert.equal(+back[1].toFixed(3),LOW_TOP,'复活在下层平台那一层');
    assert.ok(back[2]<=PLOT.z+6.02&&back[2]>=before[2]-2.5,'回到掉落前的位置附近');
    await page.waitForSelector('.scene-fall',{timeout:4000});
    const toast=(await page.locator('.scene-fall').innerText()).replace(/\s+/g,' ');
    console.log('toast: '+JSON.stringify(toast));
    assert.match(toast,/掉下去/,'画面上要写明掉下去了');
    assert.match(toast,/复活/,'并说明已经复活');
    await page.screenshot({path:'../Build/build-fall-live.png'});

    // 收尾：只删自己那两件，并核对世界总件数回到基线。
    for(const [id,version] of created){await build.post({action:'remove',id,version});await sleep(400);}
    const after=await build.get();
    assert.equal(mine(after).length,0,'收尾要把自己那两件都删掉');
    assert.equal((after.parts||[]).filter(p=>!near(p)).length,baseline,'别人的件一件都不许动');
    console.log('收尾：正式世界回到 '+after.parts.length+' 件');
    assert.deepEqual(errors,[]);
    console.log('PASS 正式站掉落机制：掉到下层站住、掉过最低部件宣布死亡、在掉落前的位置复活');
  } finally {
    // 失败时自己那两件会留在那块地上（和 build-parts-live 一样）：下一次跑开头的"清残留"会收掉。
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
