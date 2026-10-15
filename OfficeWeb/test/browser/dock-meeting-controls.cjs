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
    // 静音时**一点都不填**（那正是"没在收音"最直白的表示）。
    assert.equal(await mic.locator('.dock-mic-fill').count(),0,'静音时不该有填充');
    await mic.click();assert.equal(await page.evaluate(()=>window.__actions.at(-1)[0]),'meeting-mute');
    await page.evaluate(()=>window.__pushState({...window.__dockState,meeting:{...window.__dockState.meeting,
      active:true,id:'layout-test',mic:true,members:[],screens:[]}}));
    await page.getByRole('button',{name:'麦克风已开启，点击静音',exact:true}).waitFor();
    assert.equal(await mic.locator('path[stroke="#df4b4b"]').count(),0);
    // 音量指示是**图标里面从下往上涨的一层填充**（用户 2026-10-14：「麦克风图标里面会根据音量
    // 的大小来填充颜色的高度，就像腾讯会议那样的功能」）：液面越高，填充的可见高度越大。
    const fillAt=async level=>{
      await page.evaluate(level=>window.__pushState({...window.__dockState,meeting:{...window.__dockState.meeting,
        active:true,id:'layout-test',mic:true,micLevel:level,members:[],screens:[]}}),level);
      await page.waitForTimeout(150);
      return page.evaluate(()=>{
        const button=document.querySelector('.dock-meeting-mic');
        const fill=button.querySelector('.dock-mic-fill');
        const box=button.getBoundingClientRect();
        if(!fill) return {level:Number(button.getAttribute('data-mic-level')),height:0,
          behind:true,clipped:true};
        const f=fill.getBoundingClientRect();
        // 液面高度 = 被按钮裁掉之后还剩多少（`overflow: hidden` 负责裁）。
        const height=Math.max(0,Math.min(f.bottom,box.bottom)-Math.max(f.top,box.top));
        return {level:Number(button.getAttribute('data-mic-level')),height,
          // 左右要比按钮宽（铺满按钮），但**不能**横向溢出 —— 溢出的部分必须被裁掉。
          spans:f.left<=box.left+1&&f.right>=box.right-1,
          clipped:getComputedStyle(button).overflow==='hidden',
          behind:getComputedStyle(fill).zIndex==='0'};
      });
    };
    const quiet=await fillAt(0);
    const loud=await fillAt(0.34);
    const louder=await fillAt(1);
    console.log('mic fill:',JSON.stringify({quiet,loud,louder}));
    assert.equal(quiet.level,0,'没有音量时 data-mic-level 是 0');
    assert.equal(quiet.height,0,'没有音量时填充为 0 高（静音不画）');
    assert.equal(loud.level,0.34);
    assert.ok(loud.height>0,`有声音要填起来 (${loud.height}px)`);
    assert.ok(louder.height>loud.height,`越响液面越高 (${loud.height} -> ${louder.height})`);
    assert.equal(louder.spans,true,'填充要铺满按钮宽度');
    assert.equal(louder.clipped,true,'溢出按钮的部分要被裁掉（圆角）');
    assert.equal(louder.behind,true,'填充要在图标后面，别把话筒形状糊掉');
    // 从**底部**涨：液面下边要贴在按钮底部（`bottom: -6px` 正是为了抵消按钮的 padding，
    // 让液面从按钮的底边起、而不是从 padding 内边起）。
    const geometry=await page.evaluate(()=>{
      const button=document.querySelector('.dock-meeting-mic');
      const fill=button.querySelector('.dock-mic-fill');
      if(!fill) return null;
      const style=getComputedStyle(button);
      const box=button.getBoundingClientRect();
      const f=fill.getBoundingClientRect();
      const padTop=parseFloat(style.paddingTop)||0;
      const padBottom=parseFloat(style.paddingBottom)||0;
      const padBox={top:box.top+padTop,bottom:box.bottom-padBottom,height:box.height-padTop-padBottom};
      return {
        // >0 = 液面下边在按钮底边之上（悬空）；<0 = 越过底边（会被 overflow 裁掉）。
        bottomGap:Math.round(box.bottom-f.bottom),
        padBoxHeight:Math.round(padBox.height),
        visibleHeight:Math.round(Math.max(0,Math.min(f.bottom,padBox.bottom)-Math.max(f.top,padBox.top))),
      };
    });
    console.log('mic fill geometry:',JSON.stringify(geometry));
    assert.ok(geometry&&geometry.bottomGap<=0&&geometry.bottomGap>=-12,
      `液面要贴住按钮底边（下边差 ${geometry&&geometry.bottomGap}px；正数说明悬空了）`);
    // 满音量的液面高度 = 按钮可用高度（±3px 容差）。
    assert.ok(Math.abs(geometry.visibleHeight-geometry.padBoxHeight)<3,
      `满音量要填满按钮 (${geometry.visibleHeight}/${geometry.padBoxHeight}px)`);
    await page.screenshot({path:resolve('../Build/dock-mic-fill.png')});
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
