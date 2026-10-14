const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'modal-build-'));
  const store=createBuildStore(path.join(directory,'world.json'));
  const user={id:'modal-build',name:'快捷键验收',role:'visitor',lookConfirmed:true};
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
    const selected=n=>page.waitForFunction(n=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length===n,n);
    const idle=()=>page.waitForFunction(()=>!window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.working);
    const saved=id=>store.snapshot().parts.find(p=>p.id===id);
    const keys=async(...sequence)=>{for(const key of sequence)await page.keyboard.press(key);};
    await page.keyboard.press('Tab');await aim(82,0);
    await click(80,1.5,.25);await selected(1);

    const geometryCenter=()=>page.evaluate(()=>{
      const d=window.__officeDebug,g=d.__scene.getObjectByName('build-move-preview');
      const box=new d.__camera.position.constructor();
      // The visible selection outline owns the actual geometry bounds.
      const helper=d.__scene.children.find(o=>o.type==='Box3Helper' && o.visible && o.box?.containsPoint(g.position));
      if(!helper)throw Error('selection outline missing');
      return helper.box.getCenter(box).toArray();
    });
    const pivotBefore=await geometryCenter();
    for(const [operator,locked,numeric] of [['s',null,'2'],['r','x','90'],['r','z','90']]){
      await keys(operator);
      assert.deepEqual((await handle()).modal.pivot,pivotBefore,'operator starts at geometry centre');
      if(locked)await keys(locked);
      for(const digit of numeric)await keys(digit);
      const previewCenter=await geometryCenter();
      assert.ok(previewCenter.every((value,i)=>Math.abs(value-pivotBefore[i])<1e-7),'geometry centre stays fixed during preview');
      await keys('Enter');await idle();
      await keys('Control+z');
      await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).position.y===0 &&
        !window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.working,source.id);
      await click(80,1.5,.25);await selected(1);
    }

    const colorButton=page.getByRole('button',{name:'更改颜色',exact:true});
    await colorButton.waitFor();
    const anchor=await page.evaluate(()=>{
      const d=window.__officeDebug,p=d.__scene.getObjectByName('build-move-pivot').position.clone().project(d.__camera);
      const r=document.querySelector('.scene canvas').getBoundingClientRect();
      return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};
    });
    const colorBounds=await colorButton.boundingBox();
    assert.ok(colorBounds.x>anchor.x && colorBounds.y<anchor.y,'color control is upper right of gizmo');
    await page.screenshot({path:'../Build/build-selected-color.png'});
    await colorButton.click();await page.getByRole('button',{name:'改为鼠尾草',exact:true}).click();
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.version>1,source.id);
    await idle();assert.equal(saved(source.id).color,'#b4c5a0');
    await colorButton.click();await page.keyboard.press('Escape');
    assert.equal((await handle()).ids.length,1,'palette Esc retains selection');
    await keys('Control+z');
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).children[0].material.color.getHexString()==='f2aaa6',source.id);
    await click(80,1.5,.25);await selected(1);

    await keys('g','x','2');
    assert.equal((await handle()).draft.x,82,'numeric preview');
    assert.equal(saved(source.id).x,80,'no store mutation before confirmation');
    await keys('Enter');await idle();assert.equal(saved(source.id).x,82);
    await keys('Control+z');await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).position.x===80,source.id);
    await click(80,1.5,.25);await selected(1);
    await keys('s','x','2','Enter');await idle();assert.deepEqual(saved(source.id).scale,[2,1,1]);
    await keys('2','y','9','0','Enter');await idle();assert.equal(saved(source.id).rotation,1,'2 starts rotation');
    await keys('r','4','5','Enter');assert.ok((await handle()).modal,'45 degrees rejected');
    await keys('Escape');assert.equal((await handle()).ids.length,1,'first Esc preserves move mode selection');
    assert.equal(saved(source.id).rotation,1);

    // Real mouse movement through an oblique camera, world and local locks.
    await page.evaluate(()=>{
      const d=window.__officeDebug,k=d.controls();k.target.set(82,1,0);
      d.__camera.position.set(88,14,12);d.__camera.lookAt(k.target);d.__camera.updateMatrixWorld(true);
    });
    const originalMousePart={...saved(source.id)};
    const pointerOrigin=await point(originalMousePart.x,1.5,originalMousePart.z);
    await keys('g','x');await page.mouse.move(pointerOrigin.x+80,pointerOrigin.y-35);
    let draft=(await handle()).draft;
    assert.notEqual(draft.x,originalMousePart.x);assert.equal(draft.y,0);assert.equal(draft.z,0);
    await keys('Escape');
    await point(originalMousePart.x,1.5,originalMousePart.z);await keys('g','y');await page.mouse.move(pointerOrigin.x,pointerOrigin.y-80);
    draft=(await handle()).draft;assert.notEqual(draft.y,0);assert.equal(draft.x,originalMousePart.x);assert.equal(draft.z,0);
    await keys('Escape');
    await point(originalMousePart.x,1.5,originalMousePart.z);await keys('g','x','x');await page.mouse.move(pointerOrigin.x+80,pointerOrigin.y-35);
    draft=(await handle()).draft;assert.equal(draft.x,originalMousePart.x);assert.equal(draft.y,0);assert.notEqual(draft.z,0);
    await keys('Escape');
    await point(originalMousePart.x,1.5,originalMousePart.z);await keys('g','Shift+z');await page.mouse.move(pointerOrigin.x+80,pointerOrigin.y-60);
    draft=(await handle()).draft;assert.equal(draft.z,0);assert.ok(draft.x!==originalMousePart.x || draft.y!==0);
    await keys('Escape');await aim(82,0);

    const beforeCancel={...saved(source.id)};
    await point(beforeCancel.x,1.5,beforeCancel.z);
    await keys('g','z','3');await page.mouse.down({button:'right'});await page.mouse.up({button:'right'});
    assert.deepEqual(saved(source.id),beforeCancel);assert.equal((await handle()).modal,undefined);
    await keys('g','x','3');await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
    assert.deepEqual(saved(source.id),beforeCancel);assert.equal((await handle()).working,false);

    // Include the other pillar and ensure an atomic moveMany, not one request per part.
    await page.keyboard.down('Shift');await click(84,1.5,.25);await page.keyboard.up('Shift');await selected(2);
    await colorButton.click();await page.getByRole('button',{name:'改为雾蓝',exact:true}).click();
    await page.waitForFunction(()=>!window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.working);
    assert.equal(saved(source.id).color,'#b9c9df');assert.equal(saved(other.id).color,'#b9c9df','selected group changes color atomically');
    const beforeGroup=[saved(source.id),saved(other.id)];
    await keys('g','z','-','2','Enter');await idle();
    assert.equal(saved(source.id).z,beforeGroup[0].z-2);assert.equal(saved(other.id).z,beforeGroup[1].z-2);
    assert.equal(commands.at(-1).action,'moveMany');assert.equal(commands.at(-1).items.length,2);
    await keys('s','2','Enter');await idle();
    assert.equal(Math.abs(saved(other.id).x-saved(source.id).x),8,'group spacing scales with dimensions');

    // Duplicate round trip intentionally delayed: X and the numeric value arrive first.
    const count=store.snapshot().parts.length;
    const copiedStart=[saved(source.id),saved(other.id)];
    await keys('Shift+d','x','2','Enter');
    await page.waitForFunction(n=>window.__officeDebug.__scene.children.filter(o=>o.userData.buildId).length===n,count+2);
    await idle();
    assert.equal(store.snapshot().parts.length,count+2);
    assert.equal(saved(source.id).x,copiedStart[0].x+2);assert.equal(saved(other.id).x,copiedStart[1].x+2);
    assert.equal(saved(source.id).z,copiedStart[0].z);assert.equal((await handle()).ids.length,2);
    await keys('Shift+d','Escape');
    await page.waitForFunction(n=>window.__officeDebug.__scene.children.filter(o=>o.userData.buildId).length===n,count+4);
    await idle();assert.equal(saved(source.id).x,copiedStart[0].x+2,'cancel duplicate movement keeps it at its origin');

    // Rejected save rolls back every member of the selected group.
    const rejected=[{...saved(source.id)},{...saved(other.id)}];rejectMove=true;
    await colorButton.click();await page.getByRole('button',{name:'改为奶油',exact:true}).click();await idle();
    assert.deepEqual(saved(source.id),rejected[0]);assert.deepEqual(saved(other.id),rejected[1],'failed color save rolls back the group');
    await keys('g','y','2','Enter');await idle();
    assert.deepEqual(saved(source.id),rejected[0]);assert.deepEqual(saved(other.id),rejected[1]);
    assert.equal((await handle()).draft.y,rejected[0].y);rejectMove=false;
    await keys('Alt+a');await selected(0);await keys('a');await selected(store.snapshot().parts.length);
    await keys('Alt+a');await selected(0);

    // Left click confirms the modal without changing selection or starting orbit.
    await aim(saved(source.id).x,saved(source.id).z);
    await click(saved(source.id).x,saved(source.id).y+1.5,saved(source.id).z+.25);await selected(1);
    const clickStart=saved(source.id).x;await keys('g','x','1');
    const cursor=await point(clickStart,0,saved(source.id).z);
    await page.mouse.click(cursor.x,cursor.y);await idle();
    assert.equal(saved(source.id).x,clickStart+1);assert.equal((await handle()).ids.length,1);

    // Input focus must leave text shortcuts alone, including rotation alias 2.
    await page.evaluate(()=>{
      const input=document.createElement('input');input.id='modal-focus-check';document.body.append(input);input.focus();
    });
    const version=saved(source.id).version;
    await page.keyboard.type('gsr2');assert.equal(await page.locator('#modal-focus-check').inputValue(),'gsr2');
    assert.equal((await handle()).modal,undefined);assert.equal(saved(source.id).version,version);
    await page.locator('#modal-focus-check').evaluate(e=>e.remove());
    await keys('f');await page.screenshot({path:'../Build/blender-shortcuts-local.png'});
    assert.deepEqual(errors,[]);
    console.log('PASS Blender shortcuts: modal preview/confirm/cancel, numeric scale/rotation, group atomic move, delayed duplicate axis lock, focus and rollback');
  } finally {await browser.close();await vite.close();fs.rmSync(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
