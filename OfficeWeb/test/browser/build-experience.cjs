const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'experience-')),'world.json'));
  const user={id:'experience',name:'体验验收',role:'visitor',lookConfirmed:true};
  const original=store.mutate({action:'add',part:{kind:'pillar',x:20,y:0,z:0,rotation:1,color:'#e9b8b5'}},user).changed;
  let failMove=false;
  const vite=process.env.BOX_LIVE?null:await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
  if(vite)await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.routeWebSocket('**/socket.io/**',s=>s.close());
    await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
    await page.route('**/api/**',async r=>{
      const url=new URL(r.request().url());let json={};
      if(url.pathname==='/api/auth/me')json={user};
      if(url.pathname==='/api/build') {
        const cmd=r.request().method()==='POST'?r.request().postDataJSON():null;
        if(['move','moveMany'].includes(cmd?.action)&&failMove){failMove=false;return r.fulfill({status:409,json:{error:'测试：保存冲突'}});}
        try{json=cmd?store.mutate(cmd,user):store.snapshot();}
        catch(e){return r.fulfill({status:400,json:{error:e.message}});}
      }
      await r.fulfill({json});
    });
    const base=vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237';
    await page.goto(base+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),original.id);
    if(process.env.WHEEL_ONLY) {
      await page.getByRole('button',{name:/打开部件库/}).click();
      const row=page.locator('.build-parts');
      await row.hover();
      const camera=await page.evaluate(()=>window.__officeDebug.__camera.position.toArray());
      await page.mouse.wheel(0,240);
      await page.waitForFunction(()=>document.querySelector('.build-parts').scrollLeft>0);
      const right=await row.evaluate(el=>el.scrollLeft);
      await page.mouse.wheel(0,-120);
      await page.waitForFunction(x=>document.querySelector('.build-parts').scrollLeft<x,right);
      assert.deepEqual(await page.evaluate(()=>window.__officeDebug.__camera.position.toArray()),camera);
      await page.getByRole('button',{name:/收起部件/}).click();
      await page.getByRole('button',{name:/打开部件库/}).click();
      await row.hover();await page.mouse.wheel(160,0);
      await page.waitForFunction(()=>document.querySelector('.build-parts').scrollLeft>0);
      assert.deepEqual(errors,[]);
      console.log('PASS vertical wheel scrolls parts both ways, camera unchanged, horizontal wheel after reopen');
      return;
    }
    const aim=async x=>page.evaluate(x=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,1.5,0);c.position.set(x,6,8);c.lookAt(k.target);c.updateMatrixWorld(true);
    },x);
    const point=async(x,y,z)=>{
      const p=await page.evaluate(([x,y,z])=>{
        const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();
        return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
      },[x,y,z]);
      await page.mouse.move(p.x,p.y);return p;
    };
    const click=async(x,y,z)=>{const p=await point(x,y,z);await page.mouse.click(p.x,p.y);};
    await aim(20);await point(20,1.5,.25);
    const initialCount=store.snapshot().parts.length;
    assert.equal(await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-hover-outline').visible),false);
    await click(20,1.5,.25);
    await page.keyboard.press('e');
    assert.equal(await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-hover-outline').visible),false);
    assert.equal(store.snapshot().parts.length,initialCount);
    await page.getByRole('button',{name:/移动/}).click();
    await point(20,1.5,.25);
    assert(await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-hover-outline').visible));
    await page.getByRole('button',{name:/漫游/}).click();
    await point(20,1.5,.25);
    assert.equal(await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-hover-outline').visible),false);
    if(process.env.ROAM_ONLY) {
      assert.deepEqual(errors,[]);
      console.log('PASS roam hover/click/E: no selection; edit highlight and return-to-roam clear');
      return;
    }
    await page.getByRole('button',{name:/移动/}).click();
    await point(20,1.5,.25);
    await page.keyboard.press('e');
    await page.getByRole('button',{name:/安装/}).waitFor();
    await page.keyboard.press('Shift+r');
    assert.equal(await page.locator('.build-rotation').innerText(),'↻ 0° / 0° / 0°');
    await page.keyboard.press('q');
    await page.waitForFunction(()=>document.querySelector('.build-rotation').textContent.includes('270°'));
    const beforeWalk=await page.evaluate(()=>window.__officeDebug.local());
    await page.keyboard.down('w');
    await page.waitForFunction(before=>{
      const now=window.__officeDebug.local();
      return Math.hypot(now.x-before.x,now.z-before.z)>.1;
    },beforeWalk);
    await page.keyboard.up('w');
    assert.equal(await page.locator('.build-rotation').innerText(),'↻ 270° / 0° / 0°');
    assert.equal(await page.locator('.build-shortcuts,.build-help').count(),0);
    assert.deepEqual(await page.evaluate(()=>{const g=window.__officeDebug.__scene.getObjectByName('build-rotation-guide');const labels=g.children.filter(c=>c.isSprite).map(c=>c.userData.shortcut);return [g.visible,...labels.filter(s=>!s.startsWith('C · '))];}),[true,'Q / R · 左右转','X · 前后翻','Z · 侧翻']);
    for(const label of ['底边 1','底边 2','底边 3','底边 4','中心','自动']) {
      await page.keyboard.press('c');
      await page.getByRole('button',{name:'接点 '+label,exact:true}).waitFor();
      await page.waitForFunction(label=>{
        const g=window.__officeDebug.__scene.getObjectByName('build-rotation-guide');
        return g.children.some(c=>c.userData.shortcut==='C · '+label);
      },label);
      assert.equal(await page.locator('.build-rotation').innerText(),'↻ 270° / 0° / 0°');
    }
    await page.keyboard.press('r');
    await page.keyboard.press('x');
    await page.keyboard.press('z');
    assert.equal(await page.locator('.build-rotation').innerText(),'↻ 0° / 90° / 90°');
    await page.keyboard.press('Shift+x');
    await page.keyboard.press('Shift+z');
    await page.keyboard.press('f');
    await page.waitForFunction(()=>window.__officeDebug.__camera.position.distanceTo(window.__officeDebug.controls().target)<7.1);
    await aim(22);await click(23,0,0);
    await page.getByText('已保存 · 所有人可见',{exact:true}).waitFor();
    let added=store.snapshot().parts.at(-1);
    assert.equal(added.kind,'pillar');assert.equal(added.color,'#e9b8b5');assert.equal(added.rotation,0);
    const count=store.snapshot().parts.length;
    await page.keyboard.press('Control+z');
    await page.waitForFunction(id=>!window.__officeDebug.__scene.getObjectByName('build-'+id),added.id);
    assert.equal(store.snapshot().parts.length,count-1);
    await page.keyboard.press('Control+Shift+z');
    await page.waitForFunction(n=>window.__officeDebug.__scene.children.filter(c=>c.userData.buildId).length===n,count);
    added=store.snapshot().parts.at(-1);
    await page.getByRole('button',{name:/移动/}).click();
    await aim(23);await click(23,1.5,.25);
    assert.equal(await page.evaluate(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).visible,added.id),false);
    await page.keyboard.press('Escape');
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).visible,added.id);
    await page.getByRole('button',{name:/移动/}).click();
    await click(23,1.5,.25);
    const beforeColor=store.snapshot().parts.find(p=>p.id===added.id);
    await page.getByRole('button',{name:'颜色 雾蓝',exact:true}).click();
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.draft.color==='#b9c9df');
    await page.getByText('已保存 · 所有人可见',{exact:true}).waitFor();
    await page.waitForFunction(version=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.draft.version===version,beforeColor.version+1);
    assert.deepEqual(store.snapshot().parts.find(p=>p.id===added.id),{...beforeColor,color:'#b9c9df',version:beforeColor.version+1});
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(200);
    assert.equal(store.snapshot().parts.find(p=>p.id===added.id).color,beforeColor.color);
    await click(23,1.5,.25);
    const grip=async(mode,axis)=>page.evaluate(([mode,axis])=>{
      const d=window.__officeDebug,g=d.__scene.getObjectByName('build-move-handle');
      g.updateMatrixWorld(true);
      const t=g.children[0].controls,r=g.children[1].controls;
      const s=g.children[2].controls;
      const c=mode==='translate'?t:mode==='scale'?s:r;
      const rect=document.querySelector('.scene canvas').getBoundingClientRect();
      const center=d.__scene.getObjectByName('build-move-pivot').position.clone().project(d.__camera);
      const cx=rect.left+(center.x+1)*rect.width/2,cy=rect.top+(1-center.y)*rect.height/2;
      for(let dy=-150;dy<=150;dy+=5)for(let dx=-150;dx<=150;dx+=5){
        if(Math.hypot(dx,dy)<40)continue;
        const x=cx+dx,y=cy+dy,p={x:(x-rect.left)/rect.width*2-1,y:-(y-rect.top)/rect.height*2+1,button:0};
        t.pointerHover(p);r.pointerHover(p);s.pointerHover(p);
        if(c.axis===axis && (mode==='translate'||!['X','Y','Z'].includes(t.axis)) && (mode!=='rotate'||!['X','Y','Z'].includes(s.axis)))return{x,y};
      }
      throw Error('No visible handle '+mode+axis);
    },[mode,axis]);
    const drag=async(mode,axis,dx,dy,cancel=false,fine=false)=>{
      // A drag is refused while the previous save is still in flight, so wait for
      // the handle to be idle instead of racing the round trip.
      await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.working===false);
      const p=await grip(mode,axis);
      if(fine)await page.keyboard.down('Shift');
      await page.mouse.move(p.x,p.y);await page.mouse.down();
      assert.equal(await page.evaluate(()=>window.__officeDebug.controls().enabled),false);
      await page.mouse.move(p.x+dx,p.y+dy,{steps:12});
      if(mode==='translate')assert.equal(await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.moveSnap.step),.25);
      if(cancel)await page.keyboard.press('Escape');
      await page.mouse.up();
      if(fine)await page.keyboard.up('Shift');
    };
    if(process.env.SCALE_ONLY) {
      const version=store.snapshot().parts.find(p=>p.id===added.id).version;
      await drag('scale','X',120,0);
      await page.waitForFunction(({id,version})=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.version>version,{id:added.id,version});
      const scaled=store.snapshot().parts.find(p=>p.id===added.id);
      assert(scaled.scale && scaled.scale[0]!==1);
      assert.equal((scaled.scale[0]*.5*4)%1,0);
      assert.equal(scaled.x,23);assert.equal(scaled.y,0);
      await page.screenshot({path:'../Build/scale-handle-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
      await page.keyboard.press('Control+z');
      await page.waitForFunction(({id,version})=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.version>version,{id:added.id,version:scaled.version});
      assert.equal(store.snapshot().parts.find(p=>p.id===added.id).scale,undefined);
      console.log('PASS scale axis drag, quarter-metre dimensions, stable origin, undo');return;
    }
    failMove=true;await drag('translate','X',100,0);
    await page.getByText('测试：保存冲突',{exact:true}).waitFor();
    assert.equal(store.snapshot().parts.find(p=>p.id===added.id).x,23);
    await drag('translate','X',100,0);
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).position.x!==23,added.id);
    const moved=store.snapshot().parts.find(p=>p.id===added.id);
    assert.equal(moved.y,0);assert.equal(moved.z,0);
    await page.screenshot({path:'../Build/move-handle-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
    await drag('rotate','Y',160,0);
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.version>=3,added.id);
    const rotated=store.snapshot().parts.find(p=>p.id===added.id);
    assert.notEqual(rotated.rotation,moved.rotation);
    await drag('translate','Y',0,-80,true,true);
    assert.deepEqual(store.snapshot().parts.find(p=>p.id===added.id),rotated);
    await page.getByRole('button',{name:/移动/}).click();
    await aim(moved.x);await click(moved.x,1.5,.25);
    await page.keyboard.down('Shift');await click(20,1.5,.25);await page.keyboard.up('Shift');
    assert.equal(await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length),2);
    await page.keyboard.down('Shift');await click(20,1.5,.25);await page.keyboard.up('Shift');
    assert.equal(await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length),1);
    await page.keyboard.down('Shift');await click(20,1.5,.25);await page.keyboard.up('Shift');
    const beforePaint=store.snapshot().parts.filter(p=>[added.id,original.id].includes(p.id));
    await page.getByRole('button',{name:'颜色 淡紫',exact:true}).click();
    await page.getByText('已保存 · 所有人可见',{exact:true}).waitFor();
    await page.waitForTimeout(150);
    for(const previous of beforePaint) {
      assert.deepEqual(store.snapshot().parts.find(p=>p.id===previous.id),{...previous,color:'#cabddd',version:previous.version+1});
    }
    const groupBefore=store.snapshot().parts.filter(p=>[added.id,original.id].includes(p.id));
    await drag('translate','X',70,0);
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).position.x!==20,original.id);
    const groupAfter=store.snapshot().parts.filter(p=>[added.id,original.id].includes(p.id));
    assert(Math.abs((groupAfter[0].x-groupBefore[0].x)-(groupAfter[1].x-groupBefore[1].x))<.0001);
    assert.notEqual(groupAfter[0].x,groupBefore[0].x);
    await page.screenshot({path:'../Build/multi-move-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
    await page.keyboard.press('Control+z');
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).position.x===20,original.id);
    assert.equal(store.snapshot().parts.find(p=>p.id===added.id).x,moved.x);
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:/拆除/}).click();
    await aim(moved.x);await point(moved.x,1.5,.25);
    assert.equal(await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-hover-outline').material.color.getHexString()),'ff8074');
    await page.keyboard.press('e');
    await page.keyboard.press('z');
    await aim(29);await click(29,0,0);
    await page.waitForFunction(()=>Boolean(window.__officeDebug.__scene.children.find(c=>c.userData.buildId&&c.position.x===29)));
    const tilted=store.snapshot().parts.at(-1);
    assert.equal(tilted.roll,1);
    assert.equal(tilted.y,0);
    await page.reload();
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),tilted.id);
    assert.equal(await page.evaluate(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).children[0].rotation.z,tilted.id),Math.PI/2);
    await aim(29);
    await page.waitForTimeout(1200);
    await point(29,.25,.25);
    await page.keyboard.press('e');
    assert.equal(await page.locator('.build-shortcuts,.build-help').count(),0);
    const toolbar=page.locator('.build-tools');
    const beforeHover=await toolbar.boundingBox();
    for(let i=0;i<4;i++) {
      await page.mouse.move(beforeHover.x+20,beforeHover.y-30);
      await page.mouse.move(beforeHover.x+20,beforeHover.y+15);
    }
    assert.deepEqual(await toolbar.boundingBox(),beforeHover,'hover must not shift toolbar');
    await page.waitForTimeout(400);
    await page.screenshot({path:'../Build/build-experience-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
    // 环线遵守深度遮挡；提示贴片不吃深度、浮在最上层（用户：「不要遮住」）。
    assert.deepEqual(await page.evaluate(()=>{
      const g=window.__officeDebug.__scene.getObjectByName('build-rotation-guide');
      const lines=g.children.filter(c=>c.isGroup).flatMap(r=>r.children).filter(c=>c.isLine);
      const labels=g.children.filter(c=>c.isSprite);
      return [lines.length,lines.every(l=>l.material.depthTest),labels.length,
        labels.every(l=>l.material.depthTest===false&&l.renderOrder>=900)];
    }),[3,true,3,true]);
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!window.__officeDebug.__scene.getObjectByName('build-rotation-guide').visible);
    assert.deepEqual(errors,[]);
    console.log('PASS sample, reverse rotate, focus, keyboard undo/redo, cancel move, failed-save retry and remove target highlight');
  }finally{await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

