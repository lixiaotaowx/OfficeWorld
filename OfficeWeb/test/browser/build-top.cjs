const {createServer}=require('vite');
const {launch}=require('./playwright.cjs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
  const vite=await createServer({configFile:false,root:path.resolve('.'),server:{host:'127.0.0.1',port:0}});
  await vite.listen();const browser=await launch();
  try{
    const page=await browser.newPage({viewport:{width:800,height:600}});
    await page.goto('http://127.0.0.1:'+vite.httpServer.address().port+'/test/build-surface-harness.html');
    await page.waitForFunction(()=>Boolean(window.qa));
    for(const pitch of [0,1])for(const y of [0,-6]){
      const point=await page.evaluate(({pitch,y})=>{
        const {controller,settings,camera,THREE}=qa;
        controller.leave();controller.sync([]);controller.sync([{id:'single-post',kind:'pillar',x:10,y,z:0,rotation:0,color:'#f3dfc5',version:1}]);
        Object.assign(settings,{kind:'beam',rotation:1,pitch,roll:0,height:0,anchor:'auto',mode:'place'});
        camera.position.set(10,y+5,8);camera.lookAt(10,y+3,0);camera.updateMatrixWorld(true);
        const v=new THREE.Vector3(10.25,y+3,0).project(camera);
        return {x:(v.x+1)*400+6,y:(1-v.y)*300-3};
      },{pitch,y});
      await page.mouse.move(point.x,point.y);
      const before=await page.evaluate(()=>qa.world.getObjectByName('build-placement-guide').userData);
      assert.equal(before.topSnap,true);
      await page.mouse.click(point.x,point.y);
      const p=await page.evaluate(()=>qa.commands.at(-1).part);
      assert.equal(p.y,y+3);assert.equal(p.rotation,1);assert.equal(p.pitch,pitch);
    }
    const blocked=await page.evaluate(async()=>{
      const {topPlacement}=await import('/src/buildTopPlacement.ts');
      const {THREE,camera}=qa;
      camera.position.set(10,5,8);camera.lookAt(10,3,0);camera.updateMatrixWorld(true);
      const target=new THREE.Vector3(10.25,3,0),ray=new THREE.Ray(camera.position.clone(),target.sub(camera.position).normalize());
      const box=new THREE.Box3(new THREE.Vector3(9.75,0,-.25),new THREE.Vector3(10.25,3,.25));
      const part={kind:'beam',x:0,y:0,z:0,rotation:2,pitch:1,color:'#f3dfc5'};
      return !topPlacement(part,ray,[{id:'p',box}],camera,800,600,1,'near-wall');
    });
    assert(blocked,'nearer walls occlude magnetic top targets');
    await page.evaluate(()=>{
      const {controller,settings,camera}=qa;controller.sync([]);
      settings.height=0;camera.position.set(10,3,8);camera.lookAt(10,3,0);camera.updateMatrixWorld(true);
    });
    await page.mouse.move(400,300);
    assert.equal(await page.evaluate(()=>qa.world.getObjectByName('build-preview').visible),false);
    console.log('PASS single narrow top edge, gap cursor, tilted part, underground, occlusion and horizon no-flyaway');
  }finally{await browser.close();await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
