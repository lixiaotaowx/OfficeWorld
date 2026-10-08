const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
(async()=>{
 const {createOfficeServer}=await import('../../server.mjs');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'built-seats-browser-'));
 const part=(id,kind,x,y,z)=>({id,kind,x,y,z,rotation:0,color:'#f3dfc5',version:1});
 fs.writeFileSync(path.join(dir,'build-world.json'),JSON.stringify({revision:1,parts:[part('floor','floor',20,13,0),part('desk','desk',20,13.25,0)],chests:{}}));
 const server=createOfficeServer({statePath:path.join(dir,'state.json'),accountsPath:path.join(dir,'accounts.json'),secureCookies:false});
 await new Promise(r=>server.http.listen(0,'127.0.0.1',r));
 const target='http://127.0.0.1:'+server.http.address().port;
 const vite=await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0,proxy:{'/socket.io':{target,ws:true},'/api':{target}}}});
 await vite.listen();const origin='http://127.0.0.1:'+vite.httpServer.address().port;
 const browser=await launch();
 try{
  const page=await browser.newPage({viewport:{width:1500,height:950}});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  if(process.env.BOX_LIVE)await page.route('**/*',async route=>{
    const u=new URL(route.request().url());
    if(u.pathname==='/' || /^\/assets\/.*\.(js|css)$/.test(u.pathname)) {
      const response=await route.fetch({url:'https://115.159.43.237'+u.pathname});
      return route.fulfill({response});
    }
    return route.continue();
  });
  await page.goto(origin+'/?debug=1');
  await page.evaluate(async()=>{
   for(const [url,body] of [['register',{name:'自建工位验证',password:'test'}],['role',{role:'employee'}]]) {
    const r=await fetch('/api/auth/'+url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok)throw Error(await r.text());
   }
  });
  await page.reload();
  await page.getByRole('button',{name:'下一步：选配件',exact:true}).click();
  await page.getByRole('button',{name:'确认，去选工位',exact:true}).click();
  await page.waitForFunction(()=>window.__officeDebug?.avatar?.model && window.__officeDebug.__scene.getObjectByName('build-desk'));
  const point=await page.evaluate(()=>{
   const d=window.__officeDebug,c=d.__camera,k=d.controls();
   d.avatar.root.position.set(20,13.25,1.85);
   k.dispatchEvent({type:'start'});k.target.set(20,14,0);c.position.set(23,17,6);c.lookAt(k.target);c.updateMatrixWorld(true);
   const p=c.position.clone().set(20,13.8,.6).project(c),r=document.querySelector('.scene canvas').getBoundingClientRect();
   return {x:r.left+(p.x+1)*r.width/2,y:r.top+(1-p.y)*r.height/2};
  });
  await page.mouse.click(point.x,point.y);
  await page.waitForFunction(()=>window.__officeDebug.avatar.getState().sitting,null,{timeout:20000});
  const state=await page.evaluate(()=>({local:window.__officeDebug.avatar.getState(),screen:Boolean(window.__officeDebug.__scene.getObjectByName('seatScreen_build-desk'))}));
  assert.equal(state.local.y,13.25);assert.equal(state.local.sittingSpot,'desk-9');assert(state.screen);
  const roster=JSON.parse(fs.readFileSync(path.join(dir,'state.json'),'utf8'));assert(roster.seats['9']);
  const denied=await page.evaluate(async()=>{
   const r=await fetch('/api/build',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'remove',id:'desk',version:1})});return r.status;
  });assert.equal(denied,409);
  const intro=page.getByRole('button',{name:'就这样，进空间',exact:true});
  if(await intro.isVisible())await intro.click();
  await page.evaluate(()=>{
    const d=window.__officeDebug,c=d.__camera,k=d.controls();
    k.dispatchEvent({type:'start'});k.target.set(20,14,0);c.position.set(23,17,6);c.lookAt(k.target);c.updateMatrixWorld(true);
  });
  await page.waitForTimeout(300);
  await page.screenshot({path:'../Build/built-seat-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
  await page.evaluate(()=>window.__officeDebug.avatar.standUp());
  assert.equal(await page.evaluate(()=>window.__officeDebug.avatar.root.position.y),13.25);
  assert.deepEqual(errors,[]);console.log('PASS built workstation click/claim, elevated sit/stand, screen, occupied removal protection');
 }finally{await browser.close();await vite.close();await new Promise(r=>server.io.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});


