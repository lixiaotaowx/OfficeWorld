const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'add-menu-'));
  const store=createBuildStore(path.join(directory,'world.json'));
  const user={id:'add-menu',name:'快捷键验收',role:'visitor',lookConfirmed:true};
  const add=part=>store.mutate({action:'add',part:{rotation:0,...part}},user).changed;
  // 全部摆在初始岛屿之外的空地上：原场景的 67 件固定几何会挡住射线。
  const source=add({kind:'pillar',x:80,y:0,z:0,color:'#e9b8b5'});
  const other=add({kind:'pillar',x:84,y:0,z:0,color:'#b4c5a0'});
  let rejectMove=false;
  const commands=[];
  const probe=require('node:net').createServer();
  await new Promise(resolve=>probe.listen(0,'127.0.0.1',resolve));
  const port=probe.address().port;await new Promise(resolve=>probe.close(resolve));
  const vite=await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port,strictPort:true}});
  await vite.listen();
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
        if(cmd){commands.push(cmd);if(cmd.action==='duplicate')await new Promise(resolve=>setTimeout(resolve,250));}
        if(rejectMove && ['move','moveMany'].includes(cmd?.action))return r.fulfill({status:409,json:{error:'部件已更新，请重试'}});
        try{json=cmd?store.mutate(cmd,user):store.snapshot();}
        catch(e){return r.fulfill({status:400,json:{error:e.message}});}
      }
      await r.fulfill({json});
    });
    const base=process.env.BUILD_UI_SITE || 'http://127.0.0.1:'+vite.httpServer.address().port;
    await page.goto(base+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),source.id);
    // 正上方俯视：射线垂直落下，绝不会被原场景的横梁/立柱挡在中间。
    const aim=async(x,z)=>page.evaluate(([x,z])=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,0,z);c.position.set(x,14,z+.001);c.lookAt(k.target);c.updateMatrixWorld(true);
    },[x,z]);
    const point=async(x,y,z)=>{
      const p=await page.evaluate(([x,y,z])=>{
        const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();
        return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
      },[x,y,z]);
      await page.mouse.move(p.x,p.y);return p;
    };
    const click=async(x,y,z)=>{
      await point(x,y,z);
      // 组件自己的 pointerdown 处理要先记下指针位置；`mouse.click` 的两个事件挨太近会漏掉。
      await page.mouse.down();await page.mouse.up();
    };
    const handle=()=>page.evaluate(()=>{
      const g=window.__officeDebug.__scene.getObjectByName('build-move-handle');
      return {following:Boolean(g.userData.copyFollowing),drop:Boolean(g.userData.copyDrop),
        ids:[...g.userData.selectedIds],working:g.userData.working,modal:g.userData.modal,draft:g.userData.draft};
    });
    const menu=page.getByRole('menu',{name:'创建物体',exact:true});
    const baseline=store.snapshot().parts.length;
    const open=async()=>{
      await page.keyboard.press('Shift+a');await menu.waitFor();
      await page.waitForFunction(()=>{
        const images=[...document.querySelectorAll('.build-add-submenu img')];
        return images.length>0 && images.every(image=>image.complete && image.naturalWidth>0);
      });
    };
    assert.equal(await page.locator('.build-tools,.build-library').count(),0,'construction toolbar removed');
    // Tab enters editing; another Tab cancels preview and restores exploration.
    await aim(80,0);await click(80,1.5,.25);
    assert.equal((await handle()).ids.length,0,'exploration never selects objects');
    await page.keyboard.press('Shift+d');assert.equal(store.snapshot().parts.length,baseline);
    await open();await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
    await page.keyboard.press('Tab');await click(80,1.5,.25);
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length===1);
    await open();await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
    assert.equal((await handle()).ids.length,1,'creation menu preserves editing selection');
    await page.keyboard.press('g');await page.keyboard.press('x');await page.keyboard.press('2');
    await page.keyboard.press('Tab');
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length===0);
    assert.equal(store.snapshot().parts.find(p=>p.id===source.id).x,80,'Tab cancels unsaved transform');
    await click(80,1.5,.25);assert.equal((await handle()).ids.length,0);
    await page.keyboard.press('Shift+d');assert.equal(store.snapshot().parts.length,baseline);
    await open();
    await menu.getByRole('menuitem',{name:/建筑/}).hover();
    const rows=menu.locator('.build-add-submenu [data-item]');
    const rects=await rows.evaluateAll(nodes=>nodes.slice(0,3).map(n=>{
      const r=n.getBoundingClientRect();return {x:r.x,y:r.y,height:r.height};
    }));
    assert.ok(rects.every(r=>r.x===rects[0].x));assert.ok(rects[1].y>=rects[0].y+rects[0].height,'vertical rows');
    const count=require('../../build-catalog.json').reduce((set,p)=>set.add(p.category),new Set()).size;
    assert.equal(await menu.locator('[data-category]').count(),count,'every catalogue category is available');
    assert.equal(await menu.locator('.build-add-submenu img').evaluateAll(images=>images.every(i=>i.complete && i.naturalWidth>0)),true);
    await menu.getByRole('menuitem',{name:/家具/}).hover();
    await page.getByRole('menu',{name:'家具物体',exact:true}).waitFor();
    await page.screenshot({path:'../Build/build-add-menu-local.png'});
    await menu.getByRole('menuitem',{name:/宝箱/}).hover();
    await menu.getByRole('menuitem',{name:'创建共享宝箱',exact:true}).click();await menu.waitFor({state:'hidden'});
    assert.equal(store.snapshot().parts.length,baseline,'selection only starts a preview');
    await aim(88,0);await click(88,0,0);
    await page.waitForFunction(n=>window.__officeDebug.__scene.children.filter(o=>o.userData.buildId).length===n,baseline+1);
    assert.equal(store.snapshot().parts.at(-1).kind,'chest','click after selection creates the chosen object');

    // Place mode is covered too; dismissal consumes the click instead of placing.
    await open();const beforeDismiss=store.snapshot().parts.length;
    await point(90,0,0);await page.mouse.click(30,90);await menu.waitFor({state:'hidden'});
    assert.equal(store.snapshot().parts.length,beforeDismiss);
    await open();const search=menu.getByRole('textbox',{name:'搜索创建物体'});
    await search.fill('直梯');assert.equal(await rows.count(),1);
    await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await menu.waitFor({state:'hidden'});

    // Opening the menu cancels an unfinished G operator without changing stored positions.
    await page.keyboard.press('Tab');await aim(80,0);await click(80,1.5,.25);
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length===1);
    await page.keyboard.press('g');await page.keyboard.press('x');await page.keyboard.press('2');
    await open();assert.equal((await handle()).modal,undefined);assert.equal((await handle()).draft.x,80);
    await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});
    assert.equal((await handle()).ids.length,1);

    // Keyboard category navigation and viewport clamping.
    await page.setViewportSize({width:390,height:700});await page.mouse.move(380,680);await open();
    const bounds=await menu.boundingBox();assert.ok(bounds.x>=0 && bounds.y>=0);
    assert.ok(bounds.x+bounds.width<=390 && bounds.y+bounds.height<=700);
    await page.screenshot({path:'../Build/build-add-menu-narrow.png'});
    await page.keyboard.press('Home');await page.keyboard.press('ArrowRight');
    assert.equal(await page.evaluate(()=>document.activeElement.hasAttribute('data-item')),true);
    await page.keyboard.press('Enter');await menu.waitFor({state:'hidden'});

    await page.evaluate(()=>{
      const input=document.createElement('input');input.id='add-menu-input';document.body.append(input);input.focus();
    });
    await page.keyboard.press('Shift+a');assert.equal(await menu.count(),0);
    assert.equal((await page.locator('#add-menu-input').inputValue()).toLowerCase(),'a');
    await page.locator('#add-menu-input').evaluate(e=>e.remove());
    assert.deepEqual(errors,[]);
    console.log('PASS Tab editing/exploration, no toolbar, exploration blocks copy/selection, Shift+A in both modes, thumbnails, placement, cancellation and focus');
  } finally {await browser.close();await vite.close();fs.rmSync(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
