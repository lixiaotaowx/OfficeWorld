// 掉落机制（用户 2026-10-09）：「可以走下去掉落到最低的部件组合之下就宣布死亡，然后再掉落前的
// 位置，也就是可以跳到下一层建筑上原地复活」。
//
// 真浏览器 + 真键盘 + 真存档：走出来 → 掉到下层建筑上站住；再走出来 → 掉过最低部件 → 宣布死亡
// → 回到掉落前的位置复活。单测（`test/avatar-fall.test.mjs`）覆盖规则，这里验**接线**：
// 键盘 → `OfficeAvatar` → `avatarWalk.walkStep` → `avatarFall.FallRig` → 场景位置与死亡卡片。
//
// 场地（x=100 这一带，远离初始岛屿；存档里本来就有起始世界，最深处 -7.5 ⇒ 判死线 -8.0）：
//   高台 block(100,6,0) scale[4,0.25,4] → 顶面 6.25（z ∈ [-2,2]）
//   下层 block(100,3,4) scale[4,0.25,4] → 顶面 3.25（z ∈ [2,6]）
//   两层之间是空的：走出高台边缘就会掉，正下方接住人的是下层平台。
const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'fall-'));
  const store=createBuildStore(path.join(directory,'world.json'));
  const user={id:'fall-check',name:'掉落验收',role:'visitor',lookConfirmed:true};
  const add=part=>store.mutate({action:'add',part:{rotation:0,...part}},user).changed;
  const high=add({kind:'block',x:100,y:6,z:0,color:'#f3dfc5',scale:[4,0.25,4]});
  add({kind:'block',x:100,y:3,z:4,color:'#b4c5a0',scale:[4,0.25,4]});
  const HIGH_TOP=6.25, LOW_TOP=3.25;
  const probe=require('node:net').createServer();
  await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
  const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  const vite=await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port,strictPort:true}});
  await vite.listen();
  const browser=await launch();
  try{
    const page=await browser.newPage({viewport:{width:1280,height:860},ignoreHTTPSErrors:true});
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
    const base=process.env.BUILD_UI_SITE || 'http://127.0.0.1:'+vite.httpServer.address().port;
    await page.goto(base+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),high.id);
    // 角色模型挂上来之前按键不算数（`OfficeAvatar` 只在有 model 时走路）。
    await page.waitForFunction(()=>Boolean(window.__officeDebug?.avatar?.root.children.length),null,{timeout:60000});

    const look=(x,z)=>page.evaluate(([x,z])=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});
      k.target.set(x,1.4,z+6);c.position.set(x,3.2,z-2);c.lookAt(k.target);c.updateMatrixWorld(true);
    },[x,z]);
    const place=async(x,y,z)=>{await page.evaluate(([x,y,z])=>{
      const d=window.__officeDebug;
      d.avatar.teleportTo({x,y,z},0);
    },[x,y,z]);await look(x,z);};
    const where=()=>page.evaluate(()=>{
      const p=window.__officeDebug.avatar.root.position;
      return [+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)];
    });
    const fall=()=>page.evaluate(()=>window.__officeDebug.avatar.fallDiagnostics());
    /** 等位置满足条件（`where()` 是 [x,y,z]）。 */
    const settle=async(want,ms=15000)=>{
      const deadline=Date.now()+ms;
      while(Date.now()<deadline){
        const point=await where();
        if(want(point))return point;
        await page.waitForTimeout(80);
      }
      return where();
    };
    const settleFall=async(ms=15000)=>{
      const deadline=Date.now()+ms;
      while(Date.now()<deadline){
        if((await fall()).falling)return true;
        await page.waitForTimeout(50);
      }
      return false;
    };

    // 起始地板的椅面挡住身体净空，不能因此反复穿过脚下地板。
    await place(0,0,0);await page.waitForTimeout(2500);
    assert.equal((await fall()).falling,false,'furniture cannot remove floor support');
    assert.equal((await fall()).deaths,0);assert.equal((await where())[1],0);

    // ① 从高台走出去：踏空 → 掉到下层建筑上 → 站住（不掉死）。
    await place(100,HIGH_TOP,0);
    await page.waitForTimeout(200);
    await page.keyboard.down('w');
    assert.equal(await settleFall(),true,'走出高台边缘就该开始下落');
    // 刚报"踏空"的那一帧高度还没变（重力从下一帧开始），等它真的掉下去再看读数。
    const midAir=await settle(p=>p[1]<HIGH_TOP-0.2,5000);
    assert.ok(midAir[1]<HIGH_TOP,`下落中高度要变小（y=${midAir[1]}）`);
    await page.keyboard.up('w');
    const landed=await settle(p=>!p[1]||Math.abs(p[1]-LOW_TOP)<0.02);
    const afterLand=await fall();
    console.log('landed:',JSON.stringify({at:landed,deaths:afterLand.deaths}));
    assert.equal(+landed[1].toFixed(3),LOW_TOP,'要正好落在下层平台的顶面');
    assert.equal(afterLand.deaths,0,'掉到下层建筑上不算死');

    // ② 再从下层边缘走出去：下面什么都没有 → 掉过最低部件 → 死 → 回到掉落前的位置复活。
    await place(100,LOW_TOP,5.6);
    await page.waitForTimeout(200);
    const before=await where();
    await page.keyboard.down('w');
    assert.equal(await settleFall(),true,'走出下层平台的边缘也要开始下落');
    await page.keyboard.up('w');
    const died=await (async()=>{
      const deadline=Date.now()+20000;
      while(Date.now()<deadline){
        if((await fall()).deaths>=1)return true;
        await page.waitForTimeout(80);
      }
      return false;
    })();
    const back=await where();
    const info=await fall();
    console.log('died:',JSON.stringify({back,deaths:info.deaths,lastFrom:info.last?.from,spot:info.last?.spot,deathY:info.last?.deathY}));
    assert.equal(died,true,'掉过最低部件就该宣布死亡');
    assert.equal(info.falling,false);
    assert.equal(+back[1].toFixed(3),LOW_TOP,'复活在下层平台那一层');
    assert.ok(back[2]<=6.02&&back[2]>=before[2]-2.5,`回到掉落前的位置附近（掉落前 z=${before[2]}，现在 z=${back[2]}）`);
    assert.ok(info.last.deathY<0,'判死线在最低部件底面之下');
    // "宣布死亡"那张卡片要真的出来（2.6 秒后自己消失）。
    await page.waitForSelector('.scene-fall',{timeout:4000});
    const toast=await page.locator('.scene-fall').innerText();
    console.log('toast:',JSON.stringify(toast.replace(/\s+/g,' ')));
    assert.match(toast,/掉下去/,'画面上要写明掉下去了');
    assert.match(toast,/复活/,'并说明已经复活');
    await page.screenshot({path:path.resolve('../Build/build-fall.png')});

    assert.deepEqual(errors,[]);
    console.log('PASS 掉落机制：走到边缘会掉、掉到下层站住、掉过最低部件宣布死亡并在掉落前的位置复活');
  } finally {
    await browser.close();
    await vite.close();
    fs.rmSync(directory,{recursive:true,force:true});
  }
})().catch(error=>{console.error(error);process.exitCode=1;});
