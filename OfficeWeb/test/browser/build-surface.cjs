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
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto('http://127.0.0.1:'+vite.httpServer.address().port+'/test/build-surface-harness.html');
    await page.waitForFunction(()=>Boolean(window.qa));
    await page.mouse.move(400,300);
    await page.mouse.click(400,300);
    const first=await page.evaluate(()=>window.qa.commands[0]);
    assert.equal(first.action,'add');
    assert(first.part.y>1 && first.part.z>.125,'wall click keeps height, pushes prop out to wall face');
    const geometry=await page.evaluate(()=>{
      const {THREE,fitToSurface,createPart}=qa;
      const base={id:'p',version:1,kind:'photo-frame',color:'#cabddd',x:10,y:0,z:0,rotation:0};
      const checks=[];
      for(const rotation of [0,1,2,3]) {
        const wall=createPart({...base,kind:'wall',rotation});
        wall.updateMatrixWorld(true);
        const normal=new THREE.Vector3(0,0,1).transformDirection(wall.matrixWorld);
        const point=new THREE.Vector3(10,1.5,0).addScaledVector(normal,.125);
        const from=point.clone().addScaledVector(normal,5);
        const hit=new THREE.Raycaster(from,normal.clone().negate()).intersectObject(wall,true)[0];
        const part=fitToSurface(base,hit,0);
        const bounds=new THREE.Box3().setFromObject(createPart(part));
        const axis=Math.abs(normal.x)>.9?'x':'z';
        const edge=normal[axis]>0?bounds.min[axis]:bounds.max[axis];
        checks.push({gap:Math.abs(edge-point[axis]),rotation:part.rotation,x:part.x,z:part.z});
      }
      return checks;
    });
    // 贴面不再"精确到毫米"：水平两轴要落 0.25 网格（用户 2026-10-09 要求"部件永远整格"），
    // 所以离墙面的缝最多半格 0.125；换来的是世界里再也不会出现 0.125/0.0625 这种半格偏置。
    for(const c of geometry) assert(c.gap<.126,JSON.stringify(c));
    for(const c of geometry) assert(Math.abs(c.x*4-Math.round(c.x*4))<1e-9&&Math.abs(c.z*4-Math.round(c.z*4))<1e-9,
      '贴面落点也要在网格上 '+JSON.stringify(c));
    assert.deepEqual(geometry.map(c=>c.rotation),[0,0,0,0]);
    const unchanged=await page.evaluate(()=>{
      const {THREE,fitToSurface,createPart}=qa;
      const base={id:'p',version:1,kind:'beam',color:'#cabddd',x:10,y:0,z:0};
      for(let face=0;face<4;face++)for(let rotation=0;rotation<4;rotation++)for(let pitch=0;pitch<4;pitch++)for(let roll=0;roll<4;roll++){
        const wall=createPart({...base,kind:'wall',rotation:face});wall.updateMatrixWorld(true);
        const normal=new THREE.Vector3(0,0,1).transformDirection(wall.matrixWorld);
        const point=new THREE.Vector3(10,1.5,0).addScaledVector(normal,.125);
        const hit=new THREE.Raycaster(point.clone().addScaledVector(normal,5),normal.clone().negate()).intersectObject(wall,true)[0];
        const result=fitToSurface({...base,rotation,pitch,roll},hit,0);
        if(result.rotation!==rotation||result.pitch!==pitch||result.roll!==roll)return false;
      }
      return true;
    });
    assert(unchanged,'all wall directions preserve all three user-selected angles');
    const edges=await page.evaluate(async()=>{
      const {THREE,fitToSurface,createPart}=qa;
      const {nextAnchor}=await import('/src/buildTypes.ts');
      const {anchorEdge}=await import('/src/buildAnchors.ts');
      const cycle=[];let choice='auto';
      for(let i=0;i<6;i++){choice=nextAnchor(choice);cycle.push(choice);}
      const point=new THREE.Vector3(10,3,0);
      const support=new THREE.Object3D();support.updateMatrixWorld(true);
      const hit={point,object:support,face:{normal:new THREE.Vector3(0,1,0)}};
      let count=0;
      for(const kind of ['beam','floor','pillar','photo-frame'])
      for(let rotation=0;rotation<4;rotation++)for(let pitch=0;pitch<4;pitch++)for(let roll=0;roll<4;roll++) {
        const positions=new Set();
        for(const anchor of ['start','side-start','end','side-end']) {
          const part={id:'edge',version:1,kind,color:'#cabddd',x:0,y:0,z:0,rotation,pitch,roll};
          const result=fitToSurface(part,hit,0,anchor,new THREE.Box3(new THREE.Vector3(-100,2,-100),new THREE.Vector3(100,3,100)));
          const bounds=new THREE.Box3().setFromObject(createPart(result));
          const edge=anchorEdge(bounds,rotation,anchor);
          const other=edge.axis==='x'?'z':'x';
          // 抓某条底边贴过去：**边缘最多偏半格**。落点现在一律吸 0.25 网格（用户 2026-10-09
          // 「部件永远整格 … 根源修复」），所以"边缘像素级贴住光标"让位给整格；y（顶面高度）照旧精确。
          if(Math.abs(edge.value-point[edge.axis])>.126 || Math.abs(bounds.min.y-3)>.002 ||
            Math.abs(bounds.getCenter(new THREE.Vector3())[other]-point[other])>.126)
            throw Error(JSON.stringify({part,anchor,result,bounds}));
          if(result.rotation!==rotation||result.pitch!==pitch||result.roll!==roll)throw Error('angle changed');
          positions.add(result.x+':'+result.z);count++;
        }
        // 四条边吸到网格后可能有两三个落在同一个格点上（原本相差 0.125），但绝不能全挤成一个。
        if(positions.size<2)throw Error('four edges must still place the part differently');
      }
      return {cycle,count};
    });
    assert.deepEqual(edges.cycle,['start','side-start','end','side-end','center','auto']);
    assert.equal(edges.count,1024);
    const heights=await page.evaluate(async()=>{
      const {THREE,fitToSurface}=qa;
      const object=new THREE.Object3D();object.updateMatrixWorld(true);
      const result=[];
      for(const anchor of ['start','side-start','end','side-end']) {
        for(const y of [.97,1.02,1.07,-1.03,-.96]) {
          const part={id:'grid',version:1,kind:'stairs',color:'#cabddd',x:10,y:0,z:0,rotation:0};
          const hit={point:new THREE.Vector3(10,y,0),object,face:{normal:new THREE.Vector3(1,0,0)}};
          const target=new THREE.Box3(new THREE.Vector3(9,-10,-2),new THREE.Vector3(10,10,2));
          const placed=fitToSurface(part,hit,0,anchor,target);
          if(placed.y!==Math.round(y*4)/4)throw Error('side height escaped grid '+JSON.stringify(placed));
          const manual=fitToSurface(part,hit,-2.75,anchor,target);
          if(manual.y!==-2.75)throw Error('manual height lost');
          result.push(placed.y);
        }
        const part={id:'floor',version:1,kind:'floor',color:'#cabddd',x:10,y:0,z:0,rotation:0};
        const hit={point:new THREE.Vector3(10,1.04,0),object,face:{normal:new THREE.Vector3(1,0,0)}};
        const target=new THREE.Box3(new THREE.Vector3(9,1,-2),new THREE.Vector3(10,1.25,2));
        const floor=fitToSurface(part,hit,0,anchor,target);
        if(floor.y!==1)throw Error('adjacent floors not level');
        // Exact support heights remain exact even for deliberately offset furniture.
        hit.point.y=1.037;hit.face.normal.set(0,1,0);
        if(fitToSurface(part,hit,0,anchor,target).y!==1.037)throw Error('surface gap introduced');
      }
      return result.length;
    });
    assert.equal(heights,20);
    const joining=await page.evaluate(()=>{
      const {THREE,fitToSurface,createPart}=qa;
      const base={id:'p',version:1,kind:'pillar',color:'#cabddd',x:10,y:0,z:0,rotation:0};
      const pillar=createPart(base);pillar.updateMatrixWorld(true);
      const point=new THREE.Vector3(10.2,3,.2);
      const hit=new THREE.Raycaster(point.clone().add(new THREE.Vector3(0,5,0)),new THREE.Vector3(0,-1,0)).intersectObject(pillar,true)[0];
      const column=fitToSurface({...base,x:10.25,z:.25},hit,0);
      const beams=[];
      for(const rotation of [0,1,2,3]) for(const anchor of ['auto','end']) {
        const p=fitToSurface({...base,kind:'beam',rotation},hit,0,anchor);
        const b=new THREE.Box3().setFromObject(createPart(p));
        const a=rotation%2?'z':'x',contact=a==='x'?10:0;
        beams.push(Math.min(Math.abs(b.min[a]-contact),Math.abs(b.max[a]-contact)));
      }
      return {column,beams};
    });
    assert.deepEqual([joining.column.x,joining.column.y,joining.column.z],[10,3,0]);
    assert(joining.beams.every(gap=>gap<.126),'each rotated beam is grabbed by its end（整格吸附后半格以内）');
    await page.screenshot({path:'../Build/wall-mounted-preview.png'});
    const occlusion=await page.evaluate(()=>{
      const {world,renderer,render,THREE}=qa;
      const ghost=world.getObjectByName('build-preview');
      const guide=world.getObjectByName('build-placement-guide');
      ghost.position.set(10,1,-1);
      guide.position.z=-2;
      ghost.visible=false;guide.visible=false;render();
      const baseline=renderer.domElement.toDataURL();
      ghost.visible=true;guide.visible=true;render();
      const hidden=renderer.domElement.toDataURL();
      const materials=[];
      guide.traverse(o=>{if(o.material)materials.push(o.material.depthTest);});
      return {same:baseline===hidden,materials,opaque:!ghost.children[0].material.transparent};
    });
    assert(occlusion.same,'preview and markers behind the wall must not change visible pixels');
    assert(occlusion.opaque&&occlusion.materials.every(Boolean));
    const projection=await page.evaluate(()=>{
      const {camera,controller,settings,THREE}=qa;
      qa.world.getObjectByName('build-placement-guide').position.set(0,0,0);
      const p={kind:'pillar',color:'#f3dfc5',y:0,z:0,rotation:0,version:1};
      controller.sync([{...p,id:'left',x:10},{...p,id:'right',x:14}]);
      settings.kind='beam';settings.height=0;settings.rotation=0;
      camera.position.set(12,8,8);camera.lookAt(12,2,0);camera.updateMatrixWorld(true);
      const v=new THREE.Vector3(10.2,3,.2).project(camera);
      return{x:(v.x+1)*400,y:(1-v.y)*300};
    });
    await page.mouse.move(projection.x,projection.y);
    await page.mouse.click(projection.x,projection.y);
    const bridge=await page.evaluate(()=>({part:qa.commands.at(-1).part,
      contacts:qa.world.getObjectByName('build-placement-guide').userData.contactCount}));
    assert.deepEqual([bridge.part.x,bridge.part.y,bridge.part.z],[12,3,0]);
    assert.equal(bridge.contacts,2,'beam rests on both posts from one mouse click');
    await page.screenshot({path:'../Build/two-pillar-beam-preview.png'});
    assert.deepEqual(errors,[]);
    console.log('PASS wall/occlusion regressions, aligned columns, rotated endpoints and mouse placement across two pillars');
  } finally {await browser.close();await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

