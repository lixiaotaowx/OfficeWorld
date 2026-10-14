const {chromium}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const {createServer:portServer}=require('node:net');
const {readFileSync}=require('node:fs');
const {resolve}=require('node:path');
const assert=require('node:assert/strict');

(async()=>{
  let vite, browser;
  try {
    let base=process.env.DOCK_UI_SITE;
    if(!base){
      const probe=portServer(); await new Promise(done=>probe.listen(0,'127.0.0.1',done));
      const port=probe.address().port; await new Promise(done=>probe.close(done));
      vite=await createServer({configFile:false,root:resolve('.'),plugins:[react()],
        server:{host:'127.0.0.1',port,strictPort:true}});
      await vite.listen();base=`http://127.0.0.1:${port}`;
    }
    browser=await chromium.launch({channel:'msedge',headless:true});
    const page=await browser.newPage({viewport:{width:540,height:820},ignoreHTTPSErrors:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    let target='/test/dock-meeting-harness.html';
    if(process.env.DOCK_UI_SITE){
      const entry=await (await page.request.get(base+'/dock.html')).text();
      const script=entry.match(/<script[^>]*src="([^"]+)"/)[1];
      const css=[...entry.matchAll(/<link[^>]*href="([^"]+\.css)"/g)].map(m=>`<link rel="stylesheet" href="${m[1]}">`).join('');
      let html=readFileSync('test/dock-meeting-harness.html','utf8');
      html=html.replace('<script type="module" src="/src/dock.tsx"></script>',`${css}<script type="module" src="${script}"></script>`);
      target='/dock-controls-regression';
      await page.route(base+target,route=>route.fulfill({contentType:'text/html',body:html}));
    }
    await page.goto(base+target);
    await page.waitForFunction(()=>typeof window.__pushState==='function');
    for(const count of [6,12,24]){
      await page.evaluate(count=>window.__pushState({...window.__dockState,meeting:{...window.__dockState.meeting,
        active:true,id:'layout-test',host:true,mic:false,
        members:Array.from({length:count},(_,i)=>({id:'member-'+i,name:'会议成员'+(i+1),status:'joined'})),screens:[]}}),count);
      await page.waitForFunction(count=>document.querySelectorAll('.dock-meeting-member').length===count,count);
      const layout=await page.locator('.dock-meeting-members').evaluate(e=>{
        const box=e.getBoundingClientRect();const children=[...e.children].map(n=>n.getBoundingClientRect());
        return {height:e.clientHeight,scroll:e.scrollHeight,overflow:getComputedStyle(e).overflowY,
          rows:new Set(children.map(r=>Math.round(r.top))).size,
          allInside:children.every(r=>r.bottom<=box.bottom+.5&&r.right<=box.right+.5)};
      });
      assert.equal(layout.height,layout.scroll,'members must not scroll');
      assert.equal(layout.allInside,true,'all members remain visible');
      assert.equal(layout.overflow,'visible');
      if(count>=12)assert.ok(layout.rows>=3,'more members add rows');
    }
    await page.screenshot({path:resolve('../Build/dock-meeting-members.png')});
    const mic=page.locator('.dock-meeting-mic');
    assert.equal(await mic.textContent(),'','microphone has no visible text');
    assert.equal(await mic.locator('path[stroke="#df4b4b"]').count(),1,'muted microphone has red slash');
    // 静音时**一点都不画**波纹（那正是"没在收音"最直白的表示）。
    assert.equal(await mic.locator('.dock-mic-wave').count(),0,'静音时不该画波纹');
    await mic.click();assert.equal(await page.evaluate(()=>window.__actions.at(-1)[0]),'meeting-mute');
    await page.evaluate(()=>window.__pushState({...window.__dockState,meeting:{...window.__dockState.meeting,
      active:true,id:'layout-test',mic:true,members:[],screens:[]}}));
    await page.getByRole('button',{name:'麦克风已开启，点击静音',exact:true}).waitFor();
    assert.equal(await mic.locator('path[stroke="#df4b4b"]').count(),0);
    // 静音按钮外面那圈音量波纹（用户 2026-10-14：「状态栏静音按钮需要一个声音波纹来看麦的
    // 音量」）：开麦以后圈的大小跟着音量长。
    const waveAt=async level=>{
      await page.evaluate(level=>window.__pushState({...window.__dockState,meeting:{...window.__dockState.meeting,
        active:true,id:'layout-test',mic:true,micLevel:level,members:[],screens:[]}}),level);
      await page.waitForTimeout(150);
      return mic.locator('.dock-mic-wave').evaluate(node=>({
        width:Number(node.getAttribute('width')),
        level:Number(node.closest('button').getAttribute('data-mic-level')),
      }));
    };
    const quiet=await waveAt(0);
    const loud=await waveAt(0.34);
    const louder=await waveAt(1);
    console.log('mic wave:',JSON.stringify({quiet,loud,louder}));
    assert.equal(quiet.level,0,'没有音量时 data-mic-level 是 0');
    assert.equal(loud.level,0.34);
    assert.ok(loud.width>quiet.width,`有声音时波纹要大一圈 (${quiet.width} -> ${loud.width})`);
    assert.ok(louder.width>loud.width,`越响越大 (${loud.width} -> ${louder.width})`);
    assert.ok(louder.width<=44,`波纹不能无限长 (${louder.width})`);
    await page.screenshot({path:resolve('../Build/dock-mic-wave.png')});
    await page.getByRole('button',{name:'屏幕分享',exact:true}).click();
    assert.equal(await page.evaluate(()=>window.__actions.at(-1)[0]),'meeting-share');
    async function receivesMouse(button) {
      await page.waitForFunction(label => {
        const button = [...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === label || b.textContent === label);
        if (!button) return false;
        const r = button.getBoundingClientRect(), x = r.x+r.width/2, y = r.y+r.height/2;
        return window.__layouts.at(-1)?.hitRegions?.some(h => x>=h.x && y>=h.y && x<h.x+h.width && y<h.y+h.height);
      }, await button.getAttribute('aria-label') || await button.textContent());
    }
    for (let i=0;i<8;i++) {
      const fold=page.getByRole('button',{name:'折叠会议小窗口'});
      await receivesMouse(fold); await fold.click();
      const expand=page.getByRole('button',{name:'展开会议小窗口'});
      await receivesMouse(expand); await expand.click();
      await page.evaluate(() => {
        // Frequent main-window updates must not cancel the pending region report.
        for(let n=0;n<30;n++) window.__pushState({...window.__dockState,
          meeting:{...window.__dockState.meeting,active:true,id:'layout-test',host:true,mic:true,members:[],screens:[]}});
      });
      for (const [button, command] of [[mic, 'meeting-mute'],
        [page.getByRole('button',{name:'屏幕分享',exact:true}), 'meeting-share']]) {
        await receivesMouse(button); await button.click();
        assert.equal(await page.evaluate(()=>window.__actions.at(-1)[0]),command);
      }
    }
    await page.evaluate(()=>window.__pushState({...window.__dockState,meeting:{...window.__dockState.meeting,
      active:true,id:'layout-test',host:true,mic:false,sharing:true,members:[],screens:[]}}));
    for (const [button,command] of [[page.getByRole('button',{name:'麦克风已静音，点击开启'}),'meeting-mute'],
      [page.getByRole('button',{name:'停止共享',exact:true}),'meeting-share']]) {
      await receivesMouse(button); await button.click();
      assert.equal(await page.evaluate(()=>window.__actions.at(-1)[0]),command);
    }
    const leave=page.getByRole('button',{name:'离开会议',exact:true});
    await receivesMouse(leave); await leave.click();
    const confirm=page.getByRole('button',{name:'确认离开',exact:true});
    await receivesMouse(confirm); await confirm.click();
    assert.equal(await page.evaluate(()=>window.__actions.at(-1)[0]),'meeting-leave');
    await page.screenshot({path:resolve('../Build/dock-meeting-controls.png')});
    assert.deepEqual(errors,[]);
    console.log('PASS: multi-row members without scrollbar, muted red slash, icon-only microphone, volume wave, share label and commands');
  } finally {await browser?.close();await vite?.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
