// 直梯真的能爬：真浏览器 + 真按键 + 真寻路。
//
// 用户要求：「新增直梯是可以通行的，不管是上和下，可以用方向键通行，就类似于游戏，以及自动寻路也可以」。
// 单测（`test/build-ladder.test.mjs`）已经把规则、几何、寻路都覆盖了，这里验的是**接线**：
// 键盘事件 → `OfficeAvatar` → `avatarWalk.walkStep` → 真的爬上去；以及 `moveTo()` 的路径
// 能顺着梯子爬到 3.75m 的平台上。
//
// 场地（全在初始岛屿之外的 x=100，免得被原场景几何挡住射线）：
//   地板 floor(100,0,-2) 顶面 0.25 → 直梯 (100,0.25,0) → 平台 pillar(100,0.25,1) scale[4,1.25,4]（顶面 4.0）
const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'ladder-climb-')),'world.json'));
  const user={id:'ladder-climb',name:'直梯验收',role:'visitor',lookConfirmed:true};
  const add=part=>store.mutate({action:'add',part:{rotation:0,...part}},user).changed;
  add({kind:'floor',x:100,y:0,z:-2,color:'#f3dfc5'});
  const ladder=add({kind:'ladder',x:100,y:0.25,z:0,color:'#e9b8b5'});
  // 平台 = 放大到 3.75m 高的立柱：顶面 0.25+3.75 = 4.0，和梯子的净爬升一样高。
  add({kind:'pillar',x:100,y:0.25,z:1,color:'#b4c5a0',scale:[4,1.25,4]});
  const TOP=4;
  const vite=await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
  await vite.listen();
  const browser=await launch();
  try {
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
    const base='http://127.0.0.1:'+vite.httpServer.address().port;
    await page.goto(base+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),ladder.id);
    // 面向 +Z（梯子在玩家的 +z 方向），相机略高一点俯视梯子。
    const look=(x,z)=>page.evaluate(([x,z])=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});
      k.target.set(x,1.4,z+6);c.position.set(x,3.2,z-2);c.lookAt(k.target);c.updateMatrixWorld(true);
    },[x,z]);
    const place=(x,y,z)=>page.evaluate(([x,y,z])=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      d.avatar.teleportTo({x,y,z},0);
      k.dispatchEvent({type:'start'});
      k.target.set(x,1.4,z+6);c.position.set(x,3.2,z-2);c.lookAt(k.target);c.updateMatrixWorld(true);
    },[x,y,z]);
    const heading=()=>page.evaluate(()=>+window.__officeDebug.avatar.getState().rot.toFixed(3));
    const where=()=>page.evaluate(()=>{
      const p=window.__officeDebug.avatar.root.position;
      return [+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)];
    });
    // 等位置满足条件（`where()` 是 [x,y,z]）。
    const settle=async(want,ms=10000)=>{
      const deadline=Date.now()+ms;
      while(Date.now()<deadline){
        const point=await where();
        if(want(point))return point;
        await page.waitForTimeout(100);
      }
      return where();
    };

    // ① 键盘爬梯：站到梯子前面，按住 W（方向键 ↑ 同理），一路爬到 4.0m 的平台上。
    await place(100,0.25,-2.5);
    await page.waitForTimeout(200);
    await page.keyboard.down('w');
    // 爬到一半把镜头甩到**侧面**（看向 +X）再继续按 W：人还要在爬，而且**面朝梯子**（约 0 弧度，
    // 也就是朝着 +Z 的梯面），不能被相机拧过去；这正是用户报的"爬梯子时面朝向不对"。
    await settle(p=>p[1]>1.2);
    await page.evaluate(()=>{const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(108,2,0);c.position.set(92,3.4,0);c.lookAt(k.target);c.updateMatrixWorld(true);});
    await page.waitForTimeout(700);
    const midClimb=await where();
    const faced=await heading();
    assert(midClimb[1]>1.4,`镜头甩到侧面后还要继续往上爬（现在 y=${midClimb[1]}）`);
    assert(Math.abs(faced)<0.05,`爬梯时面朝梯子（+Z，约 0 弧度），现在 ${faced}`);
    await look(100,0);   // 镜头转回 +Z，接着爬上平台
    await page.waitForTimeout(200);
    // 爬到梯顶还不算完：继续按 W 会朝相机方向迈出去，踏上 4.0m 的平台。
    const up=await settle(p=>Math.abs(p[1]-TOP)<0.05&&p[2]>0.2);
    await page.keyboard.up('w');
    assert(Math.abs(up[1]-TOP)<0.05,`按 W 要爬到平台高度 ${TOP}（现在 ${JSON.stringify(up)}）`);
    assert(up[2]>0.2,`爬完要踏上平台（现在 z=${up[2]}）`);
    const shot='../Build/ladder-climb-'+(process.env.BOX_LIVE?'live':'local')+'.png';

    // ② 方向键 ↓ 退回地面：站在梯子上按 S / ↓ 要能一级级退下来。
    await place(100,TOP,0);
    await page.waitForTimeout(200);
    await page.keyboard.down('ArrowDown');
    const down=await settle(p=>p[1]<0.3);
    await page.keyboard.up('ArrowDown');
    assert(down[1]<0.3,`按 ↓ 要退到地面（现在 ${JSON.stringify(down)}）`);

    // ③ 自动寻路：从地面 moveTo 到平台顶，路径要顺着梯子爬上去（不是"点不到"）。
    await place(100,0.25,-2.5);
    await page.waitForTimeout(200);
    await page.evaluate(([x,y,z])=>window.__officeDebug.avatar.moveTo({x,y,z}),[100,TOP,1.2]);
    // 找不到路时 `moveTo` 会把提示留在底部、而且不会动；`moving` 变真就说明路径真的有了。
    await page.waitForFunction(()=>window.__officeDebug.avatar.getState().moving===true,{timeout:4000});
    // 顺路采一次"爬梯中"的朝向：自动寻路爬梯时也要面朝梯子（不能因为纯竖直位移被拧到 +Z/别处）。
    let pathFace=null;
    for(let i=0;i<60&&pathFace===null;i++){
      const [y,rot]=await page.evaluate(()=>{const a=window.__officeDebug.avatar;return [a.root.position.y,a.getState().rot];});
      if(y>1.2&&y<TOP-0.5)pathFace=+rot.toFixed(3);
      else if(y>TOP-0.5)break;
      else await page.waitForTimeout(100);
    }
    const walked=await settle(p=>Math.abs(p[1]-TOP)<0.05&&Math.abs(p[2]-1.2)<0.3,12000);
    const [,wy,wz]=walked;
    assert(Math.abs(wy-TOP)<0.05,`跟着路径要爬到 ${TOP}（现在 ${JSON.stringify(walked)}）`);
    assert(Math.abs(wz-1.2)<0.3,`最后要走到点击的平台位置（现在 z=${wz}）`);
    assert(pathFace!==null&&Math.abs(pathFace)<0.08,`寻路爬梯时也要面朝梯子（+Z；采到 ${pathFace}）`);

    assert.deepEqual(errors,[],'页面不该有报错：'+errors.join(' | '));
    await page.screenshot({path:shot});
    console.log('PASS 直梯能爬：W/↑ 上、S/↓ 下，moveTo 也能顺着梯子寻路到 4.0m 平台');
  } finally {
    await browser.close();
    await vite.close();
  }
})().catch(error=>{console.error(error);process.exit(1);});
