const {chromium}=require('C:/Users/Administrator/AppData/Roaming/npm/node_modules/playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1800,height:850}});
  page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
  await page.goto('http://127.0.0.1:5199/test/screen-bezel.html');
  await page.waitForFunction(()=>document.querySelector('#report').textContent.startsWith('['));
  const results=await page.evaluate(()=>{
   const {THREE,originalGeometry,monitors}=window.screenFitAudit;
   const rows=[];
   for(const [mesh,original] of originalGeometry) {
    const old=original.geometry,newGeometry=mesh.geometry;
    const a=old.attributes.position,b=newGeometry.attributes.position;
    let changed=0,changedBelowScreen=0,minNormalDot=1,minArea=Infinity;
    for(let i=0;i<a.count;i++) {
      const p=new THREE.Vector3().fromBufferAttribute(a,i),q=new THREE.Vector3().fromBufferAttribute(b,i);
      if(p.distanceTo(q)>1e-7) {
       changed++;
       if(p.applyMatrix4(mesh.matrixWorld).y<.89)changedBelowScreen++;
      }
    }
    const count=old.index?.count??a.count;
    const triangle=(geometry,offset)=>[0,1,2].map(corner=>new THREE.Vector3()
      .fromBufferAttribute(geometry.attributes.position,geometry.index?geometry.index.getX(offset+corner):offset+corner));
    for(let offset=0;offset<count;offset+=3) {
      const p=triangle(old,offset),q=triangle(newGeometry,offset);
      const n=p[1].sub(p[0]).cross(p[2].sub(p[0]));
      const m=q[1].sub(q[0]).cross(q[2].sub(q[0]));
      if(n.length()<1e-10)continue;
      minArea=Math.min(minArea,m.length());
      minNormalDot=Math.min(minNormalDot,n.normalize().dot(m.normalize()));
    }
    const unchangedAttribute=name=>JSON.stringify(Array.from(old.getAttribute(name).array))===JSON.stringify(Array.from(newGeometry.getAttribute(name).array));
    const oldBox=new THREE.Box3().setFromBufferAttribute(a),newBox=new THREE.Box3().setFromBufferAttribute(b);
    const screen=monitors.meshFor(mesh.userData.seat??rows.length);
    rows.push({name:mesh.name,report:mesh.userData.narrowBezel,changed,changedBelowScreen,minNormalDot,minArea,
      sourceRetained:old!==newGeometry,materialSame:mesh.material===original.material,
      uvSame:unchangedAttribute('uv'),normalsSame:unchangedAttribute('normal'),
      transformsSame:mesh.matrixWorld.equals(original.matrix),outerBoundsSame:oldBox.equals(newBox),
      newScreen:[screen.geometry.parameters.width,screen.geometry.parameters.height],
    });
   }return rows;
  });
  assert.equal(results.length,9);
  for(const row of results) {
   assert.equal(row.changed,24);assert.equal(row.changedBelowScreen,0);
   for(const key of ['sourceRetained','materialSame','uvSame','normalsSame','transformsSame','outerBoundsSame'])assert.equal(row[key],true,key);
   assert.ok(row.minNormalDot>.999999);assert.ok(row.minArea>0);
   assert.equal(row.report.border.left,.005);assert.equal(row.report.border.top,.004);
   assert.ok(Math.abs(row.newScreen[0]-.655656558)<1e-5);
   assert.ok(Math.abs(row.newScreen[1]-.391921246)<1e-5);
  }
  await page.locator('#front').click();
  await page.evaluate(()=>window.screenFitAudit.preview(960,540));
  await page.screenshot({path:'Build/bezel-front-compare.png'});
  await page.locator('#side').click();
  await page.screenshot({path:'Build/bezel-side-compare.png'});
  for(const seat of ['b','manager']) {
   await page.locator('#'+seat).click();
   await page.screenshot({path:`Build/bezel-${seat}-compare.png`});
  }
  fs.writeFileSync('Build/bezel-validation.json',JSON.stringify(results,null,2));
  console.log('PASS nine real meshes: 24 inner-ring vertices moved each, 5/4/6mm borders, normal/UV/material/topology/bounds/stand preserved');
  console.log(JSON.stringify(results[0]));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
