const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'wall-app-')),'build.json'));
  const user={id:'wall-qa',name:'墙面安装验收',role:'visitor',lookConfirmed:true};
  const underground=process.env.BOX_UNDERGROUND==='1';
  const bridge=process.env.BOX_BRIDGE==='1';
  const gap=process.env.BOX_GAP==='1';
  const back=process.env.BOX_BACK==='1';
  const high=process.env.BOX_HIGH==='1';
  const grid=process.env.BOX_GRID==='1';
  const top=high || process.env.BOX_TOP==='1';
  for(const x of gap?[10,12.5]:bridge?[10,14]:[10]) store.mutate({action:'add',part:{kind:bridge||gap||top?'pillar':'wall',x,y:high?10:underground?-4:0,z:0,rotation:0,color:'#f3dfc5'}},user);
  const vite=process.env.BOX_LIVE ? null : await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
  if(vite) await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.routeWebSocket('**/socket.io/**',s=>s.close());
    await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
    await page.route('**/api/**',async r=>{
      const url=new URL(r.request().url());
      let json={};
      if(url.pathname==='/api/auth/me') json={user};
      if(url.pathname==='/api/build') {
        try {json=r.request().method()==='POST' ? store.mutate(r.request().postDataJSON(),user) : store.snapshot();}
        catch(e){return r.fulfill({status:400,json:{error:e.message}});}
      }
      await r.fulfill({json});
    });
    const base=vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237';
    await page.goto(base+'/?debug=1');
    await page.waitForFunction(()=>Boolean(window.__officeDebug?.__scene));
    await page.getByRole('button',{name:'打开部件库'}).click();
    await page.getByLabel('搜索部件').fill(high?'阶梯':grid?'大地板':gap?'方形门框':bridge||top?'横梁':'相框');
    await page.locator('.build-part').first().click();
    await page.getByRole('button',{name:/收起部件/}).click();
    if(grid) await page.keyboard.press('c');
    if(underground) await page.getByRole('spinbutton',{name:'搭建高度'}).fill('-2.75');
    if(bridge) {
      for(const label of ['底边 1','底边 2','底边 3','底边 4','中心','自动']) {
        await page.keyboard.press('c');
        await page.getByRole('button',{name:'接点 '+label,exact:true}).waitFor();
      }
    }
    const point=await page.evaluate(({underground,bridge,gap,back,top,grid,high})=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      const y=grid?1.04:underground?-2.5:1.5;
      k.dispatchEvent({type:'start'});k.target.set(10,y,0);c.position.set(10,y,back?-7:7);
      if(bridge){k.target.set(12,2,0);c.position.set(12,8,8);}
      if(gap){k.target.set(11.25,3,0);c.position.set(11.25,7,10);}
      if(top){k.target.set(10,high?13:3,0);c.position.set(10,high?15:5,8);}
      c.lookAt(k.target);c.updateMatrixWorld(true);
      const p=c.position.clone();
      if(gap)p.set(11.25,3,0);else if(bridge)p.set(10.2,3,.2);else p.set(10,y,back?-.125:.125);
      if(top)p.set(10.25,high?13:3,0);
      p.project(c);
      const r=document.querySelector('.scene canvas').getBoundingClientRect();
      return {x:r.left+(p.x+1)*r.width/2+(top?6:0),y:r.top+(1-p.y)*r.height/2-(top?3:0)};
    },{underground,bridge,gap,back,top,grid,high});
    await page.mouse.move(point.x,point.y);
    await page.mouse.click(point.x,point.y);
    await page.getByText('已保存 · 所有人可见',{exact:true}).waitFor();
    const saved=store.snapshot().parts.at(-1);
    assert.equal(saved.kind,high?'stairs':grid?'floor':gap?'door':bridge||top?'beam':'photo-frame');
    assert.equal(saved.rotation,0,'wall contact must preserve chosen orientation');
    if(high)assert.equal(saved.y,13);
    else if(grid)assert.equal(saved.y,1);
    else if(top)assert.equal(saved.y,3);
    else if(gap)assert.deepEqual([saved.x,saved.y,saved.z],[11.25,3,0]);
    else if(bridge)assert.deepEqual([saved.x,saved.y,saved.z],[12,3,0]);
    else assert((underground?saved.y===-2.75:saved.y>1)&&(back?saved.z<-.125:saved.z>.125));
    await page.getByRole('button',{name:/漫游/}).click();
    await page.screenshot({path:'../Build/'+(high?'high-stairs':grid?'height-grid':top?'top-edge':gap?'gap':bridge?'bridge':'wall')+'-app-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
    await page.reload();
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),saved.id);
    assert.deepEqual(errors,[]);
    console.log('PASS actual app wall selection, server validation, save and reload',JSON.stringify(saved));
  }finally{await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
