const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict');
(async()=>{
 const {createBuildStore}=await import('../../build-store.mjs');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'architecture-')),file=path.join(dir,'world.json');
 fs.writeFileSync(file,JSON.stringify({revision:0,parts:[],chests:{}}));
 const store=createBuildStore(file),user={id:'architecture',name:'建筑验收',role:'visitor',lookConfirmed:true};
 const vite=process.env.BOX_LIVE?null:await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
 if(vite)await vite.listen();const browser=await launch();
 try{
  const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.routeWebSocket('**/socket.io/**',s=>s.close());
  await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
  await page.route('**/api/**',async r=>{
   const url=new URL(r.request().url());let json={};
   if(url.pathname==='/api/auth/me')json={user};
   if(url.pathname==='/api/build')json=r.request().method()==='POST'?store.mutate(r.request().postDataJSON(),user):store.snapshot();
   await r.fulfill({json});
  });
  await page.goto((vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237')+'/?debug=1');
  await page.waitForFunction(()=>window.__officeDebug?.__scene);
  // 默认模板（迁移过来的静态几何）本身就是一批 buildId 节点，计数要从它开始。
  await page.waitForFunction(()=>window.__officeDebug.__scene.children.some(c=>c.userData.buildId));
  const base=await page.evaluate(()=>window.__officeDebug.__scene.children.filter(c=>c.userData.buildId).length);
  assert(base>0,'default template parts are present before placing');
  const templateCount=store.snapshot().parts.length;
  for(const [i,label] of ['窄楼梯','高楼梯','窄高楼梯','双坡屋顶','飘旗屋顶','流动箭头'].entries()) {
   await page.getByRole('button',{name:/打开部件库/}).click();
   await page.getByLabel('搜索部件').fill(label);
   await page.locator('.build-part').filter({hasText:label}).first().click();
   await page.getByRole('button',{name:'颜色 '+['奶油','陶粉','雾蓝','淡紫','原木','鼠尾草'][i],exact:true}).click();
   await page.getByRole('button',{name:/收起部件/}).click();
   const point=await page.evaluate(x=>{
    const d=window.__officeDebug,c=d.__camera,k=d.controls();
    k.dispatchEvent({type:'start'});k.target.set(x,0,0);c.position.set(x+4,7,8);c.lookAt(k.target);c.updateMatrixWorld(true);
    const p=c.position.clone().set(x,0,0).project(c),r=document.querySelector('.scene canvas').getBoundingClientRect();
    return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};
   },20+i*6);
   await page.mouse.click(point.x,point.y);
   await page.waitForFunction(n=>window.__officeDebug.__scene.children.filter(c=>c.userData.buildId).length===n,base+i+1);
  }
  const placed=store.snapshot().parts.slice(-6);
  assert.deepEqual(placed.map(p=>p.kind),['stairs-narrow','stairs-tall','stairs-narrow-tall','roof','roof-flag','flow-arrow']);
  assert.equal(store.snapshot().parts.length,templateCount+6,'只在模板之上追加六件');
  const id=placed.find(p=>p.kind==='roof-flag').id;
  const arrowId=placed.at(-1).id;
  const arrow=()=>page.evaluate(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.arrowPanels.map(p=>p.position.z),arrowId);
  assert.equal((await arrow()).length,1);
  const first=await arrow();await page.waitForTimeout(350);assert.notDeepEqual(await arrow(),first);
  assert.equal(await page.evaluate(()=>{let count=0;window.__officeDebug.__scene.getObjectByName('box-island').traverse(o=>{if(o.type==='GridHelper')count++;});return count;}),0);
  await page.getByRole('button',{name:/漫游/}).click();
  const flag=()=>page.evaluate(id=>window.__officeDebug.__scene.getObjectByName('build-'+id).userData.flagPanels.map(p=>p.position.z),id);
  const before=await flag();await page.waitForTimeout(350);assert.notDeepEqual(await flag(),before);
  assert.equal(store.snapshot().parts.at(-1).rotation,0);
  await page.reload();await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),id);
  await page.evaluate(id=>{
   const d=window.__officeDebug,c=d.__camera,k=d.controls(),a=d.__scene.getObjectByName('build-'+id);
   k.dispatchEvent({type:'start'});k.target.copy(a.position);c.position.copy(a.position).add({x:1,y:1.5,z:1.5});
   c.lookAt(k.target);c.updateMatrixWorld(true);
  },arrowId);await page.waitForTimeout(200);
  await page.screenshot({path:'../Build/small-arrow-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
  await page.evaluate(()=>{
   const d=window.__officeDebug,c=d.__camera,k=d.controls();
   k.dispatchEvent({type:'start'});k.target.set(32,1,0);c.position.set(36,21,29);c.lookAt(k.target);c.updateMatrixWorld(true);
  });await page.waitForTimeout(350);
  await page.screenshot({path:'../Build/architecture-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
  assert.deepEqual(errors,[]);console.log('PASS six architectural parts, placement/save/reload, flag and arrow animation, clean floor');
 }finally{await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
