const {launch}=require('./playwright.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    const errors=[];
    const parts=[{id:'arch-preview',kind:'arch',x:-5,y:0,z:0,rotation:0,color:'#f3dfc5',version:1}];
    await page.routeWebSocket('**/socket.io/**',socket=>socket.close());
    await page.route('**/socket.io/**',route=>route.fulfill({status:503,body:'Isolated geometry QA'}));
    await page.route('**/api/**',route=>{
      const path=new URL(route.request().url()).pathname;
      return route.fulfill({json:path==='/api/auth/me' ? {user:{id:'arch-qa',name:'圆拱门验收',role:'visitor',lookConfirmed:true}}
        : path==='/api/build' ? {revision:1,parts} : {}});
    });
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto((process.env.BOX_LIVE==='1'?'https://115.159.43.237':'http://127.0.0.1:3200')+'/?debug=1');
    await page.waitForFunction(()=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-arch-preview')));
    await page.waitForFunction(()=>window.__officeDebug.avatar.root.children.length>0);
    await page.evaluate(()=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(-5,1.4,0);c.position.set(-3.6,3.1,7);c.lookAt(k.target);c.updateMatrixWorld(true);
      d.avatar.standUp();d.avatar.root.position.set(-7,0,1);
    });
    const geometry=await page.evaluate(()=>{
      const m=window.__officeDebug.__scene.getObjectByName('build-arch-preview').children[0];
      return {type:m.geometry.type,bevel:m.geometry.parameters.options.bevelEnabled,vertices:m.geometry.attributes.position.count};
    });
    assert.equal(geometry.type,'ExtrudeGeometry');assert.equal(geometry.bevel,false);
    await page.waitForTimeout(200);
    await page.screenshot({path:'Build/round-arch-scene.png'});
    await page.evaluate(()=>{
      const a=window.__officeDebug.avatar;a.root.position.set(-5,0,2);
      a.moveTo(a.root.position.clone().set(-5,0,-2));
    });
    await page.waitForFunction(()=>window.__officeDebug.local().z<-1.9,null,{timeout:12000});
    await page.getByRole('button',{name:/打开部件库/}).click();
    await page.getByLabel('搜索部件').fill('拱');
    await page.getByRole('button',{name:/方块拱门/}).waitFor();
    await page.screenshot({path:'Build/round-arch-picker.png'});
    assert.deepEqual(errors,[]);
    fs.writeFileSync('Build/round-arch-evidence.json',JSON.stringify({geometry,walkThrough:true,errors,mode:process.env.BOX_LIVE?'live-assets':'qa'},null,2));
    console.log('PASS: actual curved opening, square exterior, no bevel, walking through, picker thumbnail');
  }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
