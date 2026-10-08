// Visual + structural check of the move-mode gizmo (translate arrows, rotation
// rings, square-head scale). Screenshots land in ../Build/gizmo-*.png.
//
// The gizmo is styled by src/buildGizmoStyle.ts: muted axis palette, slim
// geometry, cream scale heads and a hover emphasis pass. This harness fails if
// the browser-default primaries (pure red/green/blue/yellow) come back.
const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const shot=name=>path.join('..','Build',(process.env.BOX_LIVE?'gizmo-live-':'gizmo-')+name+'.png');
// Expected colours are read from the styling module so palette tweaks keep the
// screenshots and the assertions in step, while the structure stays pinned.
const styleSource=fs.readFileSync(path.resolve(__dirname,'../../src/buildGizmoStyle.ts'),'utf8');
const paletteSource=styleSource.match(/GIZMO_COLORS\s*=\s*\{([^}]*)\}/)[1];
const palette=name=>paletteSource.match(new RegExp(name+":\\s*'#([0-9a-f]{6})'"))[1];
const activeSource=styleSource.match(/GIZMO_ACTIVE_COLORS[^=]*=\s*\{([^}]*)\}/)[1];
const activeColor=name=>activeSource.match(new RegExp(name+":\\s*'#([0-9a-f]{6})'"))[1];
const baseSource=styleSource.match(/BASE_OPACITY[^=]*=\s*\{([^}]*)\}/)[1];
const baseOpacity=kind=>Number(baseSource.match(new RegExp(kind+":\\s*([0-9.]+)"))[1]);
const handleColor=styleSource.match(/GIZMO_HANDLE_COLOR\s*=\s*'#([0-9a-f]{6})'/)[1];
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'gizmo-')),'world.json'));
  const user={id:'gizmo',name:'手感验收',role:'visitor',lookConfirmed:true};
  const pillar=store.mutate({action:'add',part:{kind:'pillar',x:20,y:0,z:0,rotation:0,color:'#e9b8b5'}},user).changed;
  // A small part floats clear of the scene: no body geometry hides the handles.
  const tiny=store.mutate({action:'add',part:{kind:'small',x:22,y:3.5,z:0,rotation:0,color:'#b4c5a0'}},user).changed;
  // BOX_LIVE runs the same checks against the deployed site (business APIs are
  // still mocked, so no real world data is touched).
  const vite=process.env.BOX_LIVE?null:await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
  if(vite)await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.routeWebSocket('**/socket.io/**',s=>s.close());
    await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
    await page.route('**/api/**',async r=>{
      const url=new URL(r.request().url());let json={};
      if(url.pathname==='/api/auth/me')json={user};
      if(url.pathname==='/api/build') {
        const cmd=r.request().method()==='POST'?r.request().postDataJSON():null;
        try{json=cmd?store.mutate(cmd,user):store.snapshot();}
        catch(e){return r.fulfill({status:400,json:{error:e.message}});}
      }
      await r.fulfill({json});
    });
    await page.goto((vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237')+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),pillar.id);
    const point=async(x,y,z)=>{
      const p=await page.evaluate(([x,y,z])=>{
        const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();
        return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
      },[x,y,z]);
      await page.mouse.move(p.x,p.y);return p;
    };
    const aim=async(target,camera)=>{
      await page.evaluate(([t,c])=>{
        const d=window.__officeDebug,k=d.controls();
        k.dispatchEvent({type:'start'});k.target.set(...t);
        d.__camera.position.set(...c);d.__camera.lookAt(k.target);d.__camera.updateMatrixWorld(true);
      },[target,camera]);
    };
    const select=async(x,y,z)=>{
      const p=await point(x,y,z);
      await page.mouse.click(p.x,p.y);
      await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds?.length===1);
    };
    const deselect=async()=>{
      await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds?.length);
    };
    const look=()=>page.evaluate(()=>{
      const g=window.__officeDebug.__scene.getObjectByName('build-move-handle');
      g.updateMatrixWorld(true);
      const label=g.children.find(c=>c.isSprite);
      return {label:label?{visible:label.visible,depthTest:label.material.depthTest,
        order:label.renderOrder}:null,
        controls:g.children.filter(h=>h.controls).map(helper=>{
        const c=helper.controls,lib=c._gizmo.materialLib,gizmo=c._gizmo.gizmo[c.mode];
        // Read the material each visible axis handle actually draws with.
        const drawn={};
        for(const letter of ['X','Y','Z']){
          const mesh=gizmo.children.find(ch=>ch.isMesh && ch.name===letter);
          drawn[letter]=mesh?mesh.material.color.getHexString():null;
        }
        return {mode:c.mode,size:c.size,drawn,active:lib.active.color.getHexString()};
      })};
    });
    const grip=async(mode,axis)=>page.evaluate(([mode,axis])=>{
      const d=window.__officeDebug,g=d.__scene.getObjectByName('build-move-handle');
      g.updateMatrixWorld(true);
      const pick=m=>g.children.map(h=>h.controls).find(c=>c.mode===m);
      const t=pick('translate'),r=pick('rotate'),s=pick('scale');
      const c=pick(mode);
      const rect=document.querySelector('.scene canvas').getBoundingClientRect();
      const center=d.__scene.getObjectByName('build-move-pivot').position.clone().project(d.__camera);
      const cx=rect.left+(center.x+1)*rect.width/2,cy=rect.top+(1-center.y)*rect.height/2;
      for(let dy=-260;dy<=260;dy+=5)for(let dx=-260;dx<=260;dx+=5){
        if(Math.hypot(dx,dy)<40)continue;
        const x=cx+dx,y=cy+dy,p={x:(x-rect.left)/rect.width*2-1,y:-(y-rect.top)/rect.height*2+1,button:0};
        t.pointerHover(p);r.pointerHover(p);s.pointerHover(p);
        if(c.axis===axis && (mode==='translate'||!['X','Y','Z'].includes(t.axis)) && (mode!=='rotate'||!['X','Y','Z'].includes(s.axis)))return{x,y};
      }
      throw Error('No visible handle '+mode+axis);
    },[mode,axis]);
    const crop=()=>page.evaluate(()=>{
      const d=window.__officeDebug,r=document.querySelector('.scene canvas').getBoundingClientRect();
      const p=d.__scene.getObjectByName('build-move-pivot').position.clone().project(d.__camera);
      return{x:Math.max(0,r.left+(p.x+1)*r.width/2-340),y:Math.max(0,r.top+(1-p.y)*r.height/2-250),
        width:680,height:500};
    });
    // Realistic framing first: the pillar inside the office, handles obeying depth.
    await aim([20,1.45,0],[21.7,2.9,3.1]);
    await page.getByRole('button',{name:/移动/}).click();
    await select(20,1.5,.25);
    await page.mouse.move(60,300);await page.waitForTimeout(250);
    await page.screenshot({path:shot('scene')});
    await deselect();
    // Detail framing: a small block floating in clear air, handles unobstructed.
    await aim([22,3.5,0],[25.4,6.6,6.2]);
    await page.getByRole('button',{name:/移动/}).click();
    await select(22,3.5,0);
    await page.mouse.move(60,300);await page.waitForTimeout(250);
    await page.screenshot({path:shot('idle')});
    await page.screenshot({path:shot('idle-zoom'),clip:await crop()});
    for(const [mode,axis,name] of [['translate','X','hover-x'],['translate','Y','hover-y'],
      ['rotate','Y','hover-ring'],['scale','Z','hover-scale']]) {
      const p=await grip(mode,axis);
      await page.mouse.move(p.x,p.y);await page.waitForTimeout(250);
      await page.screenshot({path:shot(name+'-zoom'),clip:await crop()});
      if(name==='hover-x') {
        // 抓住的轴：饱和色 + 放大；**其余轴保持原样**（用户明确"其他轴不要变色"，
        // 悬停不得把它们压暗或改色）。
        const hot=await page.evaluate(()=>{
          const g=window.__officeDebug.__scene.getObjectByName('build-move-handle');
          const pick=m=>g.children.map(h=>h.controls).find(c=>c&&c.mode===m);
          const mesh=(c,letter)=>c._gizmo.gizmo[c.mode].children.find(ch=>ch.isMesh&&ch.name===letter);
          const t=pick('translate'),r=pick('rotate'),s=pick('scale');
          return {x:mesh(t,'X').material.color.getHexString(),
            grown:mesh(t,'X').scale.x/mesh(t,'Z').scale.z,
            ringOpacity:mesh(r,'X').material.opacity,ringColor:mesh(r,'X').material.color.getHexString(),
            cubeOpacity:mesh(s,'X').material.opacity,cubeColor:mesh(s,'X').material.color.getHexString()};
        });
        assert.equal(hot.x,activeColor('x'),'grabbed axis uses the saturated tone');
        assert(hot.grown>1.1,'grabbed axis grows (ratio '+hot.grown.toFixed(3)+')');
        assert.equal(hot.ringOpacity,baseOpacity('rotate'),'rotate rings keep their idle opacity');
        assert.equal(hot.cubeOpacity,baseOpacity('scale'),'scale heads keep their idle opacity');
        assert.equal(hot.ringColor,palette('x'),'rotate ring keeps its idle colour');
        assert.equal(hot.cubeColor,handleColor,'scale head keeps its idle colour');
      }
    }
    await page.mouse.move(60,300);await page.waitForTimeout(250);
    const states=await look();
    if(process.env.GIZMO_DUMP)console.log(JSON.stringify(states,null,1));
    for(const state of states.controls){
      // Move and rotate speak the muted axis palette; resize heads stay cream.
      const expected=state.mode==='scale'
        ? {X:handleColor,Y:handleColor,Z:handleColor}
        : {X:palette('x'),Y:palette('y'),Z:palette('z')};
      assert.deepEqual(state.drawn,expected,state.mode+' handle colours');
      assert.equal(state.active,palette('active'),state.mode+' hover colour');
      // Regression: three.js defaults (pure primaries) must stay gone.
      for(const hex of Object.values(state.drawn))assert(!['ff0000','00ff00','0000ff','ffff00'].includes(hex),state.mode+' default primary');
    }
    // 移动模式不再有那句提示文字（用户要求去掉），手柄上不该有任何贴片。
    assert.equal(states.label,null,'move handle carries no hint sprite');
    assert.deepEqual(await page.evaluate(()=>{
      const g=window.__officeDebug.__scene.getObjectByName('build-move-handle');
      const modes=g.children.filter(h=>h.controls).map(h=>h.controls.mode);
      const drawn=g.children.filter(h=>h.controls).flatMap(h=>h.controls._gizmo.gizmo[h.controls.mode].children
        .filter(ch=>ch.isMesh&&!['XY','YZ','XZ','XYZ','E','XYZE'].includes(ch.name)));
      return [modes.length,drawn.every(m=>m.material.depthTest===false&&m.renderOrder>0),
        g.children.filter(c=>c.isSprite).length];
    }),[3,true,0]);
    assert.deepEqual(errors,[]);
    console.log('PASS gizmo palette, screenshots: '+['scene','idle','hover-x','hover-y','hover-ring','hover-scale'].join(', '));
  }finally{await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
