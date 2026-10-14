const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const {createCinemaMedia}=await import('../../cinema-media.mjs');
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cinema-browser-'));
  const store=createBuildStore(path.join(dir,'world.json')),media=createCinemaMedia(path.join(dir,'media'));
  const user={id:'cinema-browser',name:'影院验收',role:'visitor',lookConfirmed:true};
  const screen=store.mutate({action:'add',part:{kind:'cinema-screen',color:'#f3dfc5',x:80,y:0,z:0,rotation:0}},user).changed;
  const probe=require('node:net').createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));
  const port=probe.address().port;await new Promise(r=>probe.close(r));
  const vite=await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port,strictPort:true}});
  await vite.listen();const browser=await launch();const errors=[];
  try{
    const context=await browser.newContext({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    const page=await context.newPage();
    await context.route('**/download/latest.json*',r=>r.fulfill({json:{version:'999.0.0',file:'test.exe',url:'/download/test.exe',size:1000,sha256:'a'.repeat(64),notes:'更新遮挡回归',releasedAt:new Date().toISOString()}}));
    await context.routeWebSocket('**/socket.io/**',s=>s.close());await context.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
    await context.route(/https:\/\/(?:player\.bilibili\.com|open\.douyin\.com)\//,r=>r.fulfill({contentType:'text/html',body:'<p>平台播放器契约验证</p>'}));
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6WQAAAABJRU5ErkJggg==','base64');
    await context.route('**/api/**',async r=>{
      const url=new URL(r.request().url());
      try{
        if(url.pathname==='/api/auth/me')return r.fulfill({json:{user}});
        if(url.pathname!=='/api/build')return r.fulfill({json:{}});
        if(url.searchParams.has('cover'))return r.fulfill({contentType:'image/png',body:png});
        if(url.searchParams.has('cinemaFile'))return r.fulfill({contentType:'video/mp4',body:fs.readFileSync(path.join(dir,'media',url.searchParams.get('cinemaFile')))});
        if(url.searchParams.has('cinemaUpload'))return r.fulfill({json:media.upload(screen.id,user,r.request().postDataJSON())});
        if(url.searchParams.has('resolveLink'))return r.fulfill({json:{url:'https://www.bilibili.com/video/BV1xx411c7mD'}});
        if(url.searchParams.has('cinema'))return r.fulfill({json:store.screen(url.searchParams.get('cinema'))});
        const cmd=r.request().method()==='POST'?r.request().postDataJSON():null;
        return r.fulfill({json:cmd?store.mutate(cmd,user):store.snapshot()});
      }catch(e){return r.fulfill({status:400,json:{error:e.message}});}
    });
    page.on('pageerror',e=>errors.push(e.message));
    const base=process.env.BUILD_UI_SITE || `http://127.0.0.1:${port}`;
    await page.goto(base+'/?debug=1');
    await page.waitForFunction(id=>window.__officeDebug?.__scene.getObjectByName('build-'+id),screen.id);
    await page.evaluate(()=>{
      const d=window.__officeDebug,k=d.controls();k.dispatchEvent({type:'start'});k.target.set(80,1.175,0);
      d.__camera.position.set(80,2,9);d.__camera.lookAt(k.target);d.__camera.updateMatrixWorld(true);
    });
    const open=async()=>{
      const p=await page.evaluate(()=>{const d=window.__officeDebug,v=d.__camera.position.clone().set(80,1.175,.13).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};});
      await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.up();
      await page.getByRole('dialog',{name:'影院屏幕设置'}).waitFor();
      await page.getByRole('button',{name:'保存到屏幕'}).waitFor();
    };
    await open();
    assert.equal(await page.locator('.cinema-panel select').count(),0,'no manual image/video selector');
    for(const [width,height] of [[1500,950],[1000,650],[390,740],[900,500]]){
      await page.setViewportSize({width,height});
      const bounds=await page.getByRole('dialog',{name:'影院屏幕设置'}).boundingBox();
      assert.ok(bounds.x>=0 && bounds.y>=0 && bounds.x+bounds.width<=width+.5 && bounds.y+bounds.height<=height+.5,'dialog stays in viewport');
      for(const label of ['关闭影院屏幕','保存到屏幕']){
        const button=await page.getByRole('button',{name:label,exact:true}).boundingBox();
        assert.ok(button.x>=0 && button.y>=0 && button.x+button.width<=width+.5 && button.y+button.height<=height+.5,'close/save remain visible');
        assert.equal(await page.getByRole('button',{name:label,exact:true}).evaluate(e=>{
          const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
        }),true,'update notice cannot cover modal controls');
      }
      assert.ok(await page.locator('.cinema-panel').evaluate(e=>e.scrollWidth<=e.clientWidth),'no horizontal clipping');
      await page.locator('.cinema-fit').scrollIntoViewIfNeeded();
      const fitBounds=await page.locator('.cinema-fit').boundingBox(),footer=await page.locator('.cinema-footer').boundingBox();
      assert.ok(fitBounds.y+fitBounds.height<=footer.y+.5,'display choices can be fully seen above pinned footer');
      await page.screenshot({path:path.resolve('../Build/cinema-panel-'+width+'x'+height+'.png')});
    }
    await page.setViewportSize({width:1500,height:950});
    const image=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=100;c.height=200;
      const ctx=c.getContext('2d');ctx.fillStyle='#e43a3a';ctx.fillRect(0,0,100,200);return c.toDataURL('image/png').split(',')[1];});
    await page.locator('.cinema-panel input[type=file]').setInputFiles({name:'影院图片.png',mimeType:'image/png',buffer:Buffer.from(image,'base64')});
    await page.getByRole('status').filter({hasText:'已准备好'}).waitFor();
    for(const fit of ['contain','cover','stretch']){
      await page.getByRole('radio',{name:{contain:'自适应',cover:'填充',stretch:'拉伸'}[fit],exact:true}).check();
      await page.getByRole('button',{name:'保存到屏幕'}).click();
      await page.getByRole('status').filter({hasText:'已保存'}).waitFor();
      assert.equal(store.screen(screen.id).content.fit,fit);
    }
    await page.getByRole('button',{name:'关闭影院屏幕'}).click();
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.cinemaFrame>0,screen.id);
    await page.screenshot({path:path.resolve('../Build/cinema-image.png')});
    const viewer=await context.newPage();await viewer.goto(base+'/?debug=1');
    await viewer.waitForFunction(id=>window.__officeDebug?.__scene.getObjectByName('build-'+id)?.userData.cinemaFrame>0,screen.id);
    assert.equal(await viewer.evaluate(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.cinema.fit,screen.id),'stretch','another client receives configured content');
    await viewer.close();
    await open();
    await context.route('https://cinema-media.test/**',route=>route.fulfill({
      contentType:route.request().url().includes('image')?'image/png':'video/mp4',headers:{'Access-Control-Allow-Origin':'*'},
      body:route.request().url().includes('image')?Buffer.from(image,'base64'):fs.readFileSync(path.resolve('../Build/cinema-test.mp4'))}));
    for(const type of ['image','video']){
      await page.getByLabel('内容链接',{exact:true}).fill('https://cinema-media.test/resource?token='+type);
      await page.waitForFunction(type=>document.querySelector('.cinema-recognition')?.textContent.includes('已识别为'+(type==='image'?'图片':'视频')),type);
      await page.getByRole('button',{name:'保存到屏幕'}).click();await page.getByRole('status').filter({hasText:'已保存'}).waitFor();
      assert.equal(store.screen(screen.id).content.type,type,'extensionless URL is identified by decoded content');
    }
    await page.locator('.cinema-panel input[type=file]').setInputFiles(path.resolve('../Build/cinema-test.mp4'));
    await page.getByRole('status').filter({hasText:'已准备好'}).waitFor();
    await page.getByRole('button',{name:'保存到屏幕'}).click();await page.getByRole('status').filter({hasText:'已保存'}).waitFor();
    assert.ok(store.screen(screen.id).content.src.startsWith('/api/build?cinemaFile='));
    await page.getByRole('button',{name:'关闭影院屏幕'}).click();
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.cinema?.type==='video' &&
      window.__officeDebug.__scene.getObjectByName('build-'+id).userData.cinemaFrame>2,screen.id);
    await page.screenshot({path:path.resolve('../Build/cinema-video.png')});
    await page.evaluate(()=>{const d=window.__officeDebug;d.controls().target.set(0,1,0);d.__camera.position.set(0,2,9);d.__camera.lookAt(d.controls().target);d.__camera.updateMatrixWorld(true);});
    await page.waitForTimeout(300);
    const frames=await page.evaluate(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.cinemaFrame,screen.id);
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.cinemaFrame,screen.id),frames,'offscreen video pauses and stops texture uploads');
    await page.evaluate(()=>{const d=window.__officeDebug;d.controls().target.set(80,1.175,0);d.__camera.position.set(80,2,9);d.__camera.lookAt(d.controls().target);d.__camera.updateMatrixWorld(true);});
    await open();
    for(const [src,host] of [['https://b23.tv/test','player.bilibili.com'],['https://www.douyin.com/video/7123456789012345678','open.douyin.com']]){
      await page.getByLabel('内容链接',{exact:true}).fill(host==='open.douyin.com'?'复制打开抖音，看看这个视频 '+src:src);
      await page.getByRole('button',{name:'保存到屏幕'}).click();await page.getByRole('status').filter({hasText:'已保存'}).waitFor();
      await page.waitForFunction(host=>document.querySelector('.cinema-preview iframe')?.src.includes(host),host);
    }
    await page.getByRole('button',{name:'清空屏幕'}).click();await page.getByRole('status').filter({hasText:'已清空'}).waitFor();
    assert.equal(store.screen(screen.id).content,null);
    assert.deepEqual(errors,[]);console.log('PASS cinema: roam click, image upload and fit modes, persistent local video, real texture frames, B站/抖音 official player URLs, clear');
  }finally{await browser.close();await vite.close();fs.rmSync(dir,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
