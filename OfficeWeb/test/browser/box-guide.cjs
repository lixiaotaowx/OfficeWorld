const {chromium}=require('./playwright.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base='http://127.0.0.1:3200';
(async()=>{
  const browser=await chromium.launch({channel:'msedge',args:['--no-proxy-server']});
  const context=await browser.newContext({viewport:{width:1600,height:1080},ignoreHTTPSErrors:true});
  const errors=[];
  const page=await context.newPage();
  try {
    const login=await context.request.post(base+'/api/auth/login',{headers:{origin:base},data:{name:'搭建甲BoxWorldQA',password:'boxqa'}});
    assert.equal(login.status(),200);
    if(process.env.BOX_LIVE==='1') {
      await page.routeWebSocket('**/socket.io/**',socket=>socket.close());
      await page.route('https://115.159.43.237/**',async route=>{
        const req=route.request(),u=new URL(req.url());
        if(!u.pathname.startsWith('/api/')&&!u.pathname.startsWith('/socket.io/')) return route.continue();
        try {
          const res=await context.request.fetch(base+u.pathname+u.search,{method:req.method(),maxRetries:3,
            headers:{origin:base,'content-type':req.headers()['content-type']||'application/json'},
            ...(req.postDataBuffer()?{data:req.postDataBuffer()}:{})});
          await route.fulfill({response:res});
        }catch{await route.abort();}
      });
    }
    const add=async(kind,x,y,z)=>{
      await new Promise(r=>setTimeout(r,150));
      const res=await context.request.post(base+'/api/build',{headers:{origin:base},data:{action:'add',part:{kind,x,y,z,rotation:0,color:'#cabddd'}}});
      assert.equal(res.status(),200);
      return (await res.json()).changed;
    };
    const pillar=await add('pillar',10,0,-1);
    const floor=await add('floor',16,0,8);
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto((process.env.BOX_LIVE==='1'?'https://115.159.43.237':base)+'/?debug=1');
    await page.waitForFunction(()=>Boolean(window.__officeDebug?.__scene));
    await page.waitForFunction(id=>Boolean(window.__officeDebug.__scene.getObjectByName('build-'+id)),floor.id);
    const aim=async(x,y,z)=>page.evaluate(([x,y,z])=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,y,z);c.position.set(x+8,y+8,z+12);c.lookAt(k.target);c.updateMatrixWorld(true);
    },[x,y,z]);
    const hover=async(x,y,z)=>{
      const p=await page.evaluate(([x,y,z])=>{
        const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
      },[x,y,z]);
      await page.mouse.move(p.x,p.y);
      await page.waitForTimeout(100);
    };
    const guide=()=>page.evaluate(()=>{
      const g=window.__officeDebug.__scene.getObjectByName('build-placement-guide');
      return {visible:g.visible,...g.userData,faces:g.children.slice(1).filter(c=>c.visible).map(c=>({position:c.position.toArray(),scale:c.scale.toArray(),color:c.children[0].material.color.getHexString()}))};
    });
    await page.getByRole('button',{name:'打开部件库'}).click();
    await page.getByRole('button',{name:/大地板/}).click();
    await page.getByRole('spinbutton',{name:'搭建高度'}).fill('3');
    await page.getByRole('button',{name:/收起部件/}).click();
    await aim(11,2,0);
    await hover(11.75,3,.75);
    let state=await guide();
    assert(state.visible&&!state.invalid);
    assert(state.faces.some(f=>f.position[0]===10&&f.position[1]===3&&f.scale[0]===.5&&f.scale[1]===.5),'only the column corner contact must light up');
    await page.screenshot({path:'Build/box-guide-corner.png'});
    await page.getByRole('spinbutton',{name:'搭建高度'}).fill('');
    await aim(18,0,8);
    await hover(17.5,.25,8);
    state=await guide();
    assert.deepEqual(state.position,[20,0,8]);
    assert(state.faces.some(f=>f.position[0]===18&&f.scale[0]===4&&f.scale[1]===.25),'shared floor edge must light up');
    await page.screenshot({path:'Build/box-guide-edge.png'});
    await aim(0,0,4);
    await hover(0,0,4);
    state=await guide();
    assert(state.invalid&&state.faces.every(f=>f.color==='ff685e'));
    await page.screenshot({path:'Build/box-guide-invalid.png'});
    await page.getByRole('button',{name:/漫游/}).click();
    assert.equal((await guide()).visible,false);
    assert.deepEqual(errors,[]);
    fs.writeFileSync('Build/box-guide-evidence.json',JSON.stringify({corner:true,sideSeam:true,invalid:true,hiddenInExplore:true,errors,mode:process.env.BOX_LIVE?'live-assets':'qa'},null,2));
    console.log('PASS: corner support contact, side seam, invalid red placement and guide hiding');
    for(const part of [pillar,floor]) {
      await new Promise(r=>setTimeout(r,150));
      await context.request.post(base+'/api/build',{headers:{origin:base},data:{action:'remove',id:part.id,version:1}});
    }
  } catch(e) {
    await page.screenshot({path:'Build/box-guide-failure.png'});
    throw e;
  } finally {await browser.close();}
})().catch(e=>{console.error(e.message.split('Call log:')[0]);process.exitCode=1;});
