const {createServer}=require('vite');
const {launch}=require('./playwright.cjs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
  const vite=await createServer({configFile:false,root:path.resolve('.'),server:{host:'127.0.0.1',port:0}});
  await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:800,height:600}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+vite.httpServer.address().port+'/test/build-surface-harness.html');
    await page.waitForFunction(()=>Boolean(window.qa));
    for(const kind of ['door','arch']) for(const rotation of [0,1]) for(const height of [0,-6]) {
      const point=await page.evaluate(({kind,rotation,height})=>{
        const {controller,settings,camera,THREE}=qa;
        const p={kind:'pillar',color:'#f3dfc5',y:height,rotation:0,version:1};
        const posts=rotation ? [{...p,id:'a',x:10,z:-1.25},{...p,id:'b',x:10,z:1.25}]
          : [{...p,id:'a',x:8.75,z:0},{...p,id:'b',x:11.25,z:0}];
        controller.leave();controller.sync([]);controller.sync(posts);
        Object.assign(settings,{kind,rotation,height:0,mode:'place',anchor:'auto'});
        camera.position.set(rotation?20:10,height+7,rotation?0:10);
        camera.lookAt(10,height+3,0);camera.updateMatrixWorld(true);
        const v=new THREE.Vector3(10,height+3,0).project(camera);
        return{x:(v.x+1)*400,y:(1-v.y)*300};
      },{kind,rotation,height});
      await page.mouse.move(point.x,point.y);
      await page.mouse.click(point.x,point.y);
      const placed=await page.evaluate(()=>({part:qa.commands.at(-1).part,
        guide:qa.world.getObjectByName('build-placement-guide').userData}));
      assert.deepEqual([placed.part.x,placed.part.y,placed.part.z],[10,height+3,0]);
      assert(placed.guide.gapSnap&&placed.guide.contactCount>=2,JSON.stringify(placed));
      if(kind==='door'&&rotation===0&&height===0) await page.screenshot({path:'../Build/hollow-gap-preview.png'});
    }
    const boundary=await page.evaluate(async()=>{
      const {gapPlacement}=await import('/src/buildGapPlacement.ts');
      const {THREE}=qa;
      const box=(x)=>new THREE.Box3(new THREE.Vector3(x-.25,0,-.25),new THREE.Vector3(x+.25,3,.25));
      const supports=[{id:'a',box:box(8.75)},{id:'b',box:box(11.25)}];
      const ray=new THREE.Ray(new THREE.Vector3(10,7,10),new THREE.Vector3(0,-4,-10).normalize());
      const part={id:'p',kind:'door',rotation:0,x:0,y:0,z:0,version:1,color:'#f3dfc5'};
      return {far:gapPlacement(part,ray,supports,30),blocked:gapPlacement(part,ray,supports,3),
        one:gapPlacement(part,ray,supports.slice(0,1)),
        empty:gapPlacement(part,ray,[])};
    });
    assert.equal(boundary.far.y,3,'far hit must not pull preview away from columns');
    assert.equal(boundary.blocked,undefined,'near opaque obstruction must win');
    assert.equal(boundary.one,undefined);assert.equal(boundary.empty,undefined);
    assert.deepEqual(errors,[]);
    console.log('PASS cursor aimed directly into hollow gap: door/arch, rotated, underground, two contacts, far hit and occlusion');
  }finally{await browser.close();await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
