const {launch}=require('./playwright.cjs'),{createServer}=require('vite'),react=require('@vitejs/plugin-react');
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict');
(async()=>{
 const {createBuildStore}=await import('../../build-store.mjs');
 const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'people-ui-')),'world.json'));
 const user={id:'reader',name:'读者',role:'visitor',lookConfirmed:true,appearance:{color:'blue'}};
 const part=store.mutate({action:'add',part:{kind:'chest',x:20,y:0,z:0,rotation:0,color:'#f3dfc5'}},
  {id:'owner',name:'创建者',appearance:{color:'kraft'}}).changed;
 for(let i=0;i<12;i++)store.mutate({action:'put',id:part.id,entry:{type:'note',title:'内容 '+i,value:'这是宝箱中的内容，需要滚动才能看到后面的项目。'.repeat(3)}},user);
 const vite=process.env.BOX_LIVE?null:await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
 if(vite)await vite.listen();const browser=await launch();
 try {
  const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});page.setDefaultTimeout(15000);
  // 打开面板时会自动下滚 90px 再回顶：这是瞬时动画，从 driver 侧轮询会漏掉
  // （正式站加载慢的时候实测漏过）。改成页面内的峰值探针，断言的是"确实滚过"。
  await page.addInitScript(()=>{
   window.__chestPeak=0;
   const watch=()=>{
    const list=document.querySelector('.build-chest-items');
    if(list)window.__chestPeak=Math.max(window.__chestPeak,list.scrollTop);
    requestAnimationFrame(watch);
   };
   requestAnimationFrame(watch);
  });
  await page.routeWebSocket('**/socket.io/**',s=>s.close());
  await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
  await page.route('**/api/**',r=>{
   const url=new URL(r.request().url());let json={};
   if(url.pathname==='/api/auth/me')json={user};
   if(url.pathname==='/api/build')json=r.request().method()==='POST'?store.mutate(r.request().postDataJSON(),user)
    :url.searchParams.has('chest')?{entries:store.chest(part.id),people:store.people(part.id)}:store.snapshot();
   return r.fulfill({json});
  });
  await page.goto((vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237')+'/?debug=1');
  await page.waitForFunction(id=>window.__officeDebug?.__scene.getObjectByName('chest-people-'+id)?.visible,part.id);
  const aim=async()=>page.evaluate(()=>{
   const d=window.__officeDebug,c=d.__camera,k=d.controls();k.dispatchEvent({type:'start'});k.target.set(20,.5,0);
   c.position.set(20,4,6);c.lookAt(k.target);c.updateMatrixWorld(true);
   const v=c.position.clone().set(20,.5,0).project(c),r=document.querySelector('.scene canvas').getBoundingClientRect();
   return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
  });
  let p=await aim();await page.mouse.click(p.x,p.y);
  await page.getByText('还有更多内容',{exact:false}).waitFor();
  await page.waitForFunction(()=>window.__chestPeak>5);
  await page.waitForFunction(()=>document.querySelector('.build-chest-items')?.scrollTop===0);
  await page.getByAltText('创建人：创建者',{exact:true}).waitFor();
  await page.getByAltText('已读：读者',{exact:true}).waitFor();
  assert.equal(store.people(part.id).readers.length,1);
  await page.getByRole('button',{name:'关闭宝箱',exact:true}).click();
  await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('chest-people-'+id)?.scale.x===.8,part.id);
  await page.screenshot({path:'../Build/chest-people-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
  await page.reload();await page.waitForFunction(id=>window.__officeDebug?.__scene.getObjectByName('chest-people-'+id)?.visible,part.id);
  p=await aim();await page.mouse.click(p.x,p.y);await page.getByAltText('已读：读者',{exact:true}).waitFor();
  assert.equal(store.people(part.id).readers.length,1);
  console.log('PASS scene avatars, creator then reader, open records read, reload deduplicates');
 } finally {await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
