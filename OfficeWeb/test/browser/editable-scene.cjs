const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
 const {createBuildStore}=await import('../../build-store.mjs');
 const {createBuildWorkstations}=await import('../../build-workstations.mjs');
 const file=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'scene-browser-')),'world.json');
 let store=createBuildStore(file);
 const registry=createBuildWorkstations(file+'.seats.json',()=>store.snapshot().parts);
 const user={id:'scene-test',name:'场景验收',role:'visitor',lookConfirmed:true};
 const vite=process.env.BOX_LIVE?null:await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
 if(vite)await vite.listen();
 const browser=await launch();
 try{
  const page=await browser.newPage({viewport:{width:1500,height:950}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.routeWebSocket('**/socket.io/**',s=>s.close());
  await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
  await page.route('**/api/**',async r=>{
   const url=new URL(r.request().url());let json={};
   if(url.pathname==='/api/auth/me')json={user};
   if(url.pathname==='/api/build'){
    try{json=registry.decorate(r.request().method()==='POST'?store.mutate(r.request().postDataJSON(),user):store.snapshot());}
    catch(e){return r.fulfill({status:400,json:{error:e.message}});}
   }
   await r.fulfill({json});
  });
  const base=vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237';
  await page.goto(base+'/?debug=1');
  const ready=()=>page.waitForFunction(()=>window.__officeDebug?.__scene.getObjectByName('build-scene-island'));
  await ready();
  async function focus(part){
   await page.evaluate(p=>{
    const d=window.__officeDebug,k=d.controls(),c=d.__camera;
    k.dispatchEvent({type:'start'});k.target.set(p.x,p.y+.5,p.z);
    c.position.set(p.x+3,p.y+4,p.z+6);c.lookAt(k.target);c.updateMatrixWorld(true);
   },part);
   await page.waitForTimeout(150);
  }
  async function click(part,height=.5){
   const p=await page.evaluate(({part,height})=>{
    const d=window.__officeDebug,v=d.__camera.position.clone().set(part.x,part.y+height,part.z).project(d.__camera);
    const r=document.querySelector('.scene canvas').getBoundingClientRect();
    return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
   },{part,height});
   await page.mouse.click(p.x,p.y);
  }
  const chair=store.snapshot().parts.find(p=>p.fixture==='sofa-0');
  await page.getByRole('button',{name:/移动/}).click();
  await focus(chair);await click(chair);
  await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds?.includes(id),chair.id);
  if(process.env.COPY_ONLY){
   const count=store.snapshot().parts.length;
   await page.keyboard.press('Shift+d');
   await page.waitForFunction(n=>window.__officeDebug.__scene.children.filter(o=>o.userData.buildId).length===n,count+1);
   const copy=store.snapshot().parts.at(-1);
   assert.notEqual(copy.id,chair.id);assert.equal(copy.fixture,chair.fixture);assert.equal(copy.fixtureCopy,true);
   await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds?.[0]===id,copy.id);
   await page.getByRole('button',{name:'颜色 雾蓝',exact:true}).click();
   await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.version===2,copy.id);
   assert.equal(store.snapshot().parts.find(p=>p.id===chair.id).color,chair.color);
   await page.keyboard.press('Control+z');
   await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.version===3,copy.id);
   await page.keyboard.press('Control+z');
   await page.waitForFunction(id=>!window.__officeDebug.__scene.getObjectByName('build-'+id),copy.id);
   assert.equal(store.snapshot().parts.length,count);
   await page.keyboard.press('Control+Shift+z');
   await page.waitForFunction(n=>window.__officeDebug.__scene.children.filter(o=>o.userData.buildId).length===n,count+1);
   await page.getByRole('button',{name:/漫游/}).click();await page.keyboard.press('Shift+d');
   await page.waitForTimeout(250);assert.equal(store.snapshot().parts.length,count+1);
   assert.deepEqual(errors,[]);console.log('PASS Shift+D copy, automatic selection, independent edit, undo/redo, explore guard');return;
  }
  await page.getByRole('button',{name:'颜色 雾蓝',exact:true}).click();
  await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.version===2,chair.id);
  assert.equal(store.snapshot().parts.find(p=>p.id===chair.id).fixture,chair.fixture);
  await page.keyboard.press('Escape');
  const distant=store.snapshot().parts.find(p=>p.fixture==='distant-0-plant');
  await page.getByRole('button',{name:/移动/}).click();
  await focus(distant);await click(distant,.8);
  await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds?.includes(id),distant.id);
  const grip=await page.evaluate(()=>{
   const d=window.__officeDebug,g=d.__scene.getObjectByName('build-move-handle');g.updateMatrixWorld(true);
   const t=g.children[0].controls,r=document.querySelector('.scene canvas').getBoundingClientRect();
   const center=d.__scene.getObjectByName('build-move-pivot').position.clone().project(d.__camera);
   const cx=r.left+(center.x+1)*r.width/2,cy=r.top+(1-center.y)*r.height/2;
   for(let dy=-140;dy<=140;dy+=4)for(let dx=-140;dx<=140;dx+=4){
    if(Math.hypot(dx,dy)<40)continue;
    const x=cx+dx,y=cy+dy;t.pointerHover({x:(x-r.left)/r.width*2-1,y:-(y-r.top)/r.height*2+1,button:0});
    if(t.axis==='X')return{x,y};
   }
   throw Error('No X handle');
  });
  await page.keyboard.down('Shift');await page.mouse.move(grip.x,grip.y);await page.mouse.down();
  await page.mouse.move(grip.x+80,grip.y,{steps:10});
  assert.equal(await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.moveSnap.step),.25);
  await page.mouse.up();await page.keyboard.up('Shift');
  await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.version===2,distant.id);
  const moved=store.snapshot().parts.find(p=>p.id===distant.id);
  assert.notEqual(moved.x,distant.x);assert.equal((moved.x-distant.x)*4%1,0);
  await page.screenshot({path:'../Build/editable-scene-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
  await page.keyboard.press('Escape');await focus(moved);
  await page.getByRole('button',{name:/拆除/}).click();await click(moved,.8);
  await page.waitForFunction(id=>!window.__officeDebug.__scene.getObjectByName('build-'+id),distant.id);
  store=createBuildStore(file);await page.reload();await ready();
  assert(!store.snapshot().parts.some(p=>p.fixture===distant.fixture));
  assert(!await page.evaluate(id=>Boolean(window.__officeDebug.__scene.getObjectByName('build-'+id)),distant.id));
  // The original desk is selectable, and a colour edit retains protocol seat 0.
  const desk=store.snapshot().parts.find(p=>p.fixture==='desk-0');
  await page.getByRole('button',{name:/移动/}).click();await focus(desk);await click(desk,.75);
  await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds?.includes(id),desk.id);
  assert.equal(registry.index(desk.id),0);
  await page.keyboard.press('Escape');
  await page.getByRole('button',{name:/拆除/}).click();await click(desk,.75);
  await page.waitForFunction(id=>!window.__officeDebug.__scene.getObjectByName('build-'+id),desk.id);
  await page.waitForFunction(()=>!window.__officeDebug.__scene.children.some(o=>o.name.startsWith('seatScreen_') && o.userData.seat===0));
  assert.equal(registry.valid(0),false);
  await page.keyboard.press('Control+z');
  await page.waitForFunction(()=>window.__officeDebug.__scene.children.some(o=>o.name.startsWith('seatScreen_') && o.userData.seat===0));
  assert.equal(registry.valid(0),true);
  assert.deepEqual(errors,[]);
  console.log('PASS chair edit, original desk selection, distant object drag at 25cm, delete, persisted reload');
 }finally{await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
