// 流动箭头在**真实应用**里的一闪一闪（补 arrow-glow.cjs 的孤立渲染）：
// 用真实页面 + 真实动画循环，隔一段时间抓一张箭头所在区域，断言亮度确实在起伏。
//
//   node test/browser/arrow-office.cjs
//   BOX_LIVE=1 node test/browser/arrow-office.cjs     # 打正式站
//
// 截图：../Build/arrow-office-dim.png / -lit.png
const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const live=process.env.BOX_LIVE?'live':'local';
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'arrow-')),'world.json'));
  const user={id:'arrow',name:'箭头验收',role:'visitor',lookConfirmed:true};
  const arrow=store.mutate({action:'add',part:{kind:'flow-arrow',x:20,y:0,z:0,rotation:1,color:'#e9b8b5'}},user).changed;
  const vite=live==='local'?await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}}):null;
  if(vite)await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1200,height:800},ignoreHTTPSErrors:true});
    page.setDefaultTimeout(15000);
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
    await page.goto((vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237')+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),arrow.id);
    // 镜头对准箭头，取它周围的裁剪框。
    const clip=await page.evaluate(()=>{
      const d=window.__officeDebug,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(20,.3,0);
      d.__camera.position.set(17.4,3.2,5.6);d.__camera.lookAt(k.target);d.__camera.updateMatrixWorld(true);
      const at=d.__camera.position.clone().set(20,.35,0).project(d.__camera);
      const r=document.querySelector('.scene canvas').getBoundingClientRect();
      const w=220,h=170;
      return {x:Math.max(r.left,Math.min(r.right-w,r.left+(at.x+1)*r.width/2-w/2)),
        y:Math.max(r.top,Math.min(r.bottom-h,r.top+(1-at.y)*r.height/2-h/2)),width:w,height:h};
    });
    // 连拍若干张，再把它们交回页面解码：算各帧平均亮度，以及"最暗帧 vs 最亮帧"
    // 变了多少像素（在明亮的办公室里，均值会被地板稀释，变化面积才说明问题）。
    const shots=[];
    await page.screenshot({path:path.join('..','Build','arrow-office-full-'+live+'.png')});
    for(let i=0;i<10;i++){shots.push(await page.screenshot({clip}));await page.waitForTimeout(110);}
    const stats=await page.evaluate(async frames=>{
      const read=async base64=>{
        const image=new Image();
        image.src='data:image/png;base64,'+base64;
        await image.decode();
        const canvas=document.createElement('canvas');
        canvas.width=image.width;canvas.height=image.height;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(image,0,0);
        return ctx.getImageData(0,0,image.width,image.height).data;
      };
      const decoded=[];
      for(const frame of frames)decoded.push(await read(frame));
      const mean=data=>{let sum=0;for(let i=0;i<data.length;i+=4)sum+=(data[i]+data[i+1]+data[i+2])/3;return Math.round(sum/(data.length/4)*10)/10;};
      const means=decoded.map(mean);
      const lowAt=means.indexOf(Math.min(...means)),highAt=means.indexOf(Math.max(...means));
      let changed=0,max=0;
      const dim=decoded[lowAt],lit=decoded[highAt];
      for(let i=0;i<dim.length;i+=4) {
        const d=Math.abs((dim[i]+dim[i+1]+dim[i+2])/3-(lit[i]+lit[i+1]+lit[i+2])/3);
        if(d>8)changed++;
        if(d>max)max=d;
      }
      return {means,lowAt,highAt,changed,max:Math.round(max)};
    },shots.map(s=>s.toString('base64')));
    assert(stats.changed>=1500,'真实应用里箭头确实在一闪一闪（最暗/最亮两帧有 '+stats.changed+' px 变化）');
    assert(stats.max>=25,'最亮处的变化足够明显（+'+stats.max+' 级）');
    fs.writeFileSync(path.join('..','Build','arrow-office-dim-'+live+'.png'),shots[stats.lowAt]);
    fs.writeFileSync(path.join('..','Build','arrow-office-lit-'+live+'.png'),shots[stats.highAt]);
    assert.deepEqual(errors,[]);
    console.log('PASS arrow office glow',JSON.stringify({live,...stats}));
  } finally {await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
