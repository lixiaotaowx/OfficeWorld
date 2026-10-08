const assert=require('node:assert/strict');
const fs=require('node:fs');
module.exports=async function expansion({a,b,command,snapshot,clickPoint}) {
  const page=a.page;
  await page.setViewportSize({width:1600,height:1080});
  await page.bringToFront();
  if(await page.getByRole('button',{name:/收起部件/}).isVisible())
    await page.getByRole('button',{name:/收起部件/}).click();
  await page.getByRole('button',{name:/漫游/}).click();
  const add=async(kind,x,y,z,rotation=0)=>{
    const answer=await command(a.context,{action:'add',part:{kind,x,y,z,rotation,color:'#e9b8b5'}});
    const data=await answer.json();
    assert(data.changed,JSON.stringify(data));
    return data.changed;
  };
  const stairs=await add('stairs',-5,0,1);
  await add('floor',-5,1,-2);
  const arch=await add('arch',-5,0,4);
  await add('floor',16,0,0);
  await add('floor',20,0,0);
  // No load-bearing validation: a single corner support and a floating slab save.
  await add('pillar',24,0,0);
  await add('floor',25.75,3,1.75);
  await add('floor',30,6,0);
  await page.waitForFunction(id=>Boolean(window.__officeDebug.__scene.getObjectByName('build-'+id)),arch.id);
  const aim=async(x,y,z)=>page.evaluate(([x,y,z])=>{
    const d=window.__officeDebug,c=d.__camera,controls=d.controls();
    controls.dispatchEvent({type:'start'});
    controls.target.set(x,y,z);
    c.position.set(x+7,y+10,z+12);
    c.lookAt(controls.target);c.updateMatrixWorld(true);
  },[x,y,z]);
  const placeAvatar=async(x,y,z)=>page.evaluate(([x,y,z])=>{
    const d=window.__officeDebug;
    d.avatar.standUp();d.avatar.root.position.set(x,y,z);
  },[x,y,z]);
  await aim(-5,1,0);
  await placeAvatar(-5,0,3);
  await clickPoint(page,-5,1.25,-2);
  await page.waitForFunction(()=>{
    const s=window.__officeDebug.local();return s.y===1.25&&s.z<-1.8;
  },null,{timeout:15000});
  await b.page.waitForFunction(()=>window.__officeDebug.remotes.snapshot().some(p=>p.y>1.2&&p.z<-1.8),null,{timeout:10000});
  await page.screenshot({path:'Build/box-expansion-upstairs.png'});
  await clickPoint(page,-5,0,3);
  await page.waitForFunction(()=>{
    const s=window.__officeDebug.local();return s.y===0&&s.z>2.8;
  },null,{timeout:15000});
  // Walk through the arch (not over its bounding box).
  await clickPoint(page,-5,0,5);
  await page.waitForFunction(()=>window.__officeDebug.local().z>4.8,null,{timeout:10000});
  // Keyboard traversal uses the same collision/height path as clicks.
  await placeAvatar(-5,0,3);
  await page.evaluate(()=>{
    const d=window.__officeDebug;d.__camera.position.set(-5,9,14);d.controls().target.set(-5,0,0);
  });
  await page.keyboard.down('w');
  await page.waitForFunction(()=>window.__officeDebug.local().y>=1,null,{timeout:8000});
  await page.keyboard.up('w');
  assert((await page.evaluate(()=>window.__officeDebug.local())).y>=1);
  // Past the old island boundary, then onto a newly extended floor via the UI.
  await aim(18,0,0);
  await placeAvatar(13,0,0);
  await clickPoint(page,20,.25,0);
  await page.waitForFunction(()=>window.__officeDebug.local().x>19.8,null,{timeout:12000});
  assert.equal((await page.evaluate(()=>window.__officeDebug.local())).y,.25);
  await page.getByRole('button',{name:'打开部件库'}).click();
  await page.getByRole('tab',{name:'建筑',exact:true}).click();
  await page.getByRole('button',{name:/大地板/}).click();
  await clickPoint(page,21.5,.25,0);
  await page.waitForFunction(()=>window.__officeDebug.__scene.children.some(p=>p.userData.buildId&&p.position.x===24&&p.position.y===0&&p.children[0]?.scale.x===4));
  assert((await snapshot()).parts.some(p=>p.kind==='floor'&&p.x===24&&p.y===0));
  const sizes=[];
  for(const width of [1600,1000]) {
    await page.setViewportSize({width,height:width===1600?1080:800});
    const size=await page.locator('.build-ui').boundingBox();
    assert(size.height<=170,`expanded toolbar too tall: ${size.height}`);
    sizes.push({width,height:size.height});
    await page.screenshot({path:`Build/box-expansion-ui-${width}.png`});
  }
  await page.getByRole('button',{name:/收起部件/}).click();
  const compact=await page.locator('.build-ui').boundingBox();
  assert(compact.height<=80,`collapsed toolbar too tall: ${compact.height}`);
  fs.writeFileSync('Build/box-expansion-evidence.json',JSON.stringify({stairs:stairs.id,arch:arch.id,
    clickUpDown:true,keyboardUp:true,remoteHeight:true,archPassage:true,outsideIsland:true,
    cantileverAndFloating:true,edgeFloorPlacement:true,toolbar:sizes,collapsedHeight:compact.height},null,2));
  console.log('PASS: arch, upstairs/downstairs, keyboard stairs, remote height, extended floors, floating build, compact UI');
};
