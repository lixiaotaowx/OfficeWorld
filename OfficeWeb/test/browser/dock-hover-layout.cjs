const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
  let vite,browser;
  try {
    let base=process.env.DOCK_UI_SITE;
    if(!base){vite=await createServer({configFile:false,root:process.cwd(),plugins:[react()],
      server:{host:'127.0.0.1',port:0,strictPort:true}});await vite.listen();base='http://127.0.0.1:'+vite.httpServer.address().port;}
    browser=await launch();const page=await browser.newPage({viewport:{width:540,height:520},ignoreHTTPSErrors:true});
    let target='/test/dock-harness.html';
    if(process.env.DOCK_UI_SITE){
      const html=await(await page.request.get(base+'/dock.html')).text();
      const scripts=html.match(/<script[^>]*src="([^"]+)"/)[1];
      const css=[...html.matchAll(/<link[^>]*href="([^"]+\.css)"/g)].map(m=>`<link rel="stylesheet" href="${m[1]}">`).join('');
      const fixture=fs.readFileSync('test/dock-harness.html','utf8').replace('<script type="module" src="/src/dock.tsx"></script>',`${css}<script type="module" src="${scripts}"></script>`);
      target='/hover-layout-regression';await page.route(base+target,r=>r.fulfill({contentType:'text/html',body:fixture}));
    }
    await page.goto(base+target);
    const avatar=page.getByRole('button',{name:'同事乙',exact:true});await avatar.waitFor();
    await page.evaluate(()=>{
      document.querySelector('[data-person-id="p1"]').addEventListener('mouseenter',()=>{
        window.__entered=performance.now();
        const observer=new MutationObserver(()=>{if(document.querySelector('.dock-card')){window.__opened=performance.now();observer.disconnect();}});
        observer.observe(document.getElementById('root'),{childList:true,subtree:true});
      },{once:true});
    });
    await avatar.hover();await page.locator('.dock-card').waitFor();
    await page.waitForFunction(()=>window.__opened>0);
    const delay=await page.evaluate(()=>window.__opened-window.__entered);assert.ok(delay<250,'hover should open promptly: '+delay);
    await page.waitForTimeout(160);
    const buttons=await page.locator('.dock-card-actions button').evaluateAll(nodes=>nodes.map(n=>{
      const r=n.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};}));
    assert.equal(buttons.length,3);assert.ok(buttons.every(b=>Math.abs(b.x-buttons[0].x)<1),'actions share a right-side column');
    assert.ok(buttons[0].y+buttons[0].h<=buttons[1].y && buttons[1].y+buttons[1].h<=buttons[2].y,'buttons do not overlap');
    await page.screenshot({path:'../Build/dock-hover-right.png'});
    for(const name of ['同事乙','客户丙','小李']) {
      for(const [width,height] of [[1920,1080],[1080,1920],[800,800]]) {
        await page.evaluate(({name,width,height})=>{
          const person=window.__dockState.people.find(p=>p.name===name);
          const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
          canvas.getContext('2d').fillRect(0,0,width,height);
          window.__pushPreview({id:person.id,image:canvas.toDataURL('image/png')});
        },{name,width,height});
        await page.getByRole('button',{name,exact:true}).hover();
        await page.getByRole('dialog',{name:name+' 的屏幕预览'}).waitFor();
        await page.waitForFunction(({width,height})=>{
          const image=document.querySelector('.dock-shot img');
          return image?.naturalWidth===width && image.naturalHeight===height;
        },{width,height});
        const layout=await page.locator('.dock-card').evaluate(e=>{
          const picture=e.querySelector('.dock-shot').getBoundingClientRect();
          const buttons=[...e.querySelectorAll('.dock-card-actions button')].map(b=>b.getBoundingClientRect());
          return {ratio:picture.width/picture.height,right:buttons.every(b=>b.left>=picture.right && b.top>=picture.top && b.bottom<=picture.bottom+1),columns:new Set(buttons.map(b=>Math.round(b.left))).size};
        });
        assert.equal(layout.right,true,name+' actions right of '+width+'x'+height+' preview');
        assert.equal(layout.columns,1,name+' actions remain in one column');
        assert.ok(Math.abs(layout.ratio-16/9)<.01,'preview stays 16:9 regardless of source ratio');
      }
    }
    await page.setViewportSize({width:540,height:180});
    await page.evaluate(()=>window.__pushState({...window.__dockState,people:window.__dockState.people.map(p=>
      p.id==='p1'?{...p,status:'周五之前准备好报销材料，今天下午暂时外出处理事情，请先留言。'}:p)}));
    await avatar.hover();await page.locator('.dock-person-status').waitFor();
    await page.waitForFunction(()=>{
      const stack=document.querySelector('.dock-popup-stack');
      return window.__layouts.at(-1)?.cardPx>=stack.scrollHeight+18;
    });
    const full=await page.locator('.dock-popup-stack').evaluate(e=>({full:e.scrollHeight,clipped:e.getBoundingClientRect().height}));
    assert.ok(full.full>full.clipped,'fixture reproduces a card taller than the small window');
    const count=await page.evaluate(()=>window.__layouts.length);
    await page.waitForTimeout(600);
    assert.ok(await page.evaluate(()=>window.__layouts.length)-count<=2,'stable status must not cause a layout-report loop');
    const requested=await page.evaluate(()=>window.__layouts.at(-1).cardPx);
    await page.setViewportSize({width:540,height:requested+40});
    await avatar.hover();await page.locator('.dock-person-status').waitFor();
    await page.waitForTimeout(180);
    await page.screenshot({path:'../Build/dock-hover-status-16x9.png'});
    for(const [text,command] of [['看屏幕','watch'],['分享屏幕','share'],['语音通话','call']]){
      await avatar.hover();await page.getByRole('button',{name:text,exact:true}).click();
      assert.equal(await page.evaluate(()=>window.__actions.at(-1)[0]),command);
    }
    console.log('PASS hover latency '+Math.round(delay)+'ms; right-side actions and all commands');
  }finally{await browser?.close();await vite?.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
