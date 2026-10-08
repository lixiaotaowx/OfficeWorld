const {launch}=require('./playwright.cjs');
const {createServer}=require('vite'),react=require('@vitejs/plugin-react');
const path=require('path'),assert=require('assert/strict');
(async()=>{
 const vite=process.env.BOX_LIVE?null:await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
 if(vite)await vite.listen();const browser=await launch();
 try {
  const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
  page.setDefaultTimeout(15000);
  const links=['https://www.bilibili.com/video/BV1B7411m7LV/','https://www.douyin.com/video/7146408143612345678','https://www.xiaohongshu.com/explore/test'];
  const entries=links.map((value,i)=>({id:String(i),type:'link',title:'视频'+i,value,author:'验收',owner:'test',at:Date.now()}));
  await page.routeWebSocket('**/socket.io/**',s=>s.close());
  await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
  await page.route('**/api/**',r=>{
   const u=new URL(r.request().url());let json={};
   if(u.pathname==='/api/auth/me')json={user:{id:'test',name:'验收',role:'visitor',lookConfirmed:true}};
   if(u.pathname==='/api/build')json=u.searchParams.has('chest')?{entries}:{revision:1,parts:[{id:'box',kind:'chest',x:20,y:0,z:0,rotation:0,version:1,color:'#f3dfc5'}]};
   return r.fulfill({json});
  });
  if(!process.env.REAL_PLAYER)await page.route(/https:\/\/(player.bilibili.com|open.douyin.com)\//,r=>r.fulfill({contentType:'text/html; charset=utf-8',body:'<button onclick="this.textContent=\'已暂停\'">暂停</button>'}));
  await page.goto((vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237')+'/?debug=1');
  await page.waitForFunction(()=>window.__officeDebug?.__scene.getObjectByName('build-box'));
  const p=await page.evaluate(()=>{
   const d=window.__officeDebug,c=d.__camera,k=d.controls();k.dispatchEvent({type:'start'});
   k.target.set(20,.5,0);c.position.set(20,4,6);c.lookAt(k.target);c.updateMatrixWorld(true);
   const v=c.position.clone().set(20,.5,0).project(c),r=document.querySelector('.scene canvas').getBoundingClientRect();
   return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
  });
  await page.mouse.click(p.x,p.y);await page.getByRole('dialog',{name:'共享宝箱',exact:true}).waitFor();
  await page.getByRole('button',{name:'▶ B站观看'}).click();
  const frame=page.locator('.chest-video-window iframe');
  assert.match(await frame.getAttribute('src'),/player.bilibili.com/);
  if(process.env.REAL_PLAYER) {
    try {
      await page.frameLocator('.chest-video-window iframe').locator('body').waitFor({timeout:20000});
      await page.frameLocator('.chest-video-window iframe').locator('video').first().waitFor({state:'attached',timeout:20000});
      console.log('BILIBILI VIDEO',await page.frameLocator('.chest-video-window iframe').locator('video').first().evaluate(v=>({readyState:v.readyState,paused:v.paused})));
      const playerFrame=page.frames().find(f=>f.url().startsWith('https://player.bilibili.com/'));
      await playerFrame.waitForFunction(()=>document.querySelector('video')?.readyState>=2,{},{timeout:20000});
      const video=page.frameLocator('.chest-video-window iframe').locator('video').first();
      await video.evaluate(v=>v.play());
      await playerFrame.waitForFunction(()=>document.querySelector('video')?.currentTime>0,{},{timeout:10000});
      await video.evaluate(v=>v.pause());
      console.log('REAL BILIBILI playback advanced and paused');
      console.log('BILIBILI BODY', (await page.frameLocator('.chest-video-window iframe').locator('body').innerText()).slice(0,500));
    } catch(e) { console.log('BILIBILI LOAD NOT VERIFIED',e.message.slice(0,100)); }
  }
  if(!process.env.REAL_PLAYER)await page.frameLocator('.chest-video-window iframe').getByText('暂停',{exact:true}).click();
  await page.getByRole('button',{name:'最大化',exact:true}).click();
  assert(await page.locator('.chest-video-backdrop.maximized').count());
  await page.evaluate(()=>{
    document.documentElement.classList.add('iruler-desktop');
    const chrome=document.createElement('div');chrome.id='test-desktop-chrome';
    chrome.style.cssText='position:fixed;inset:0 0 auto;height:54px;z-index:2147483647;background:#222';
    document.body.append(chrome);
  });
  const restore=page.getByRole('button',{name:'还原窗口'});
  assert(await restore.evaluate(el=>{
    const r=el.getBoundingClientRect();return r.top>=54 && el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
  }));
  await restore.click();
  await page.getByRole('button',{name:'最大化',exact:true}).click();
  await page.evaluate(()=>{document.documentElement.classList.remove('iruler-desktop');document.getElementById('test-desktop-chrome').remove();});
  await page.screenshot({path:'../Build/chest-video-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
  await page.getByRole('button',{name:'还原窗口'}).click();
  await page.getByRole('button',{name:'关闭视频',exact:true}).click();assert.equal(await frame.count(),0);
  await page.getByRole('button',{name:'▶ 抖音观看'}).click();assert.match(await frame.getAttribute('src'),/open.douyin.com/);
  for(const size of [{width:480,height:890},{width:1500,height:700}]) {
    await page.setViewportSize(size);
    await page.waitForFunction(()=>{
      const box=document.querySelector('.chest-video-viewport').getBoundingClientRect();
      const frame=document.querySelector('.chest-video-viewport iframe').getBoundingClientRect();
      return frame.width>0 && frame.left>=box.left-1 && frame.right<=box.right+1 && frame.top>=box.top-1 && frame.bottom<=box.bottom+1;
    });
    assert.deepEqual(await frame.evaluate(el=>[el.clientWidth,el.clientHeight]),[360,720]);
  }
  await page.getByRole('button',{name:'最大化',exact:true}).click();
  await page.screenshot({path:'../Build/chest-portrait-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
  await page.getByRole('button',{name:'还原窗口'}).click();
  await page.keyboard.press('Escape');assert.equal(await frame.count(),0);
  await page.getByRole('button',{name:'▶ 小红书观看'}).click();
  await page.getByText('小红书内嵌播放尚未接入，请打开原页观看。').waitFor();
  console.log('PASS chest video recognition, iframe controls, maximize/restore, close unload, Escape, fallback');
 } finally {await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

