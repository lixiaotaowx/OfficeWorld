const { chromium } = require('C:/Users/Administrator/AppData/Roaming/npm/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const report={};
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    page.on('pageerror',error=>console.log('PAGE ERROR',error.message));
    await page.goto('http://127.0.0.1:5199/test/screen-click.html');
    await page.waitForFunction(()=>window.__officeDebug?.monitors?.seatsWithScreen.length===9,{timeout:90000});
    await page.locator('#member').click();
    await page.waitForTimeout(2200);
    const pose=()=>page.evaluate(()=>({position:window.clickAudit.camera.position.toArray(),quaternion:window.clickAudit.camera.quaternion.toArray()}));
    report.member=await pose();
    await page.mouse.move(1000,650);await page.mouse.down({button:'right'});
    await page.mouse.move(1070,680,{steps:8});await page.mouse.up({button:'right'});
    await page.waitForTimeout(450);
    report.beforeScreen=await pose();
    assert.ok(report.beforeScreen.position.some((v,i)=>Math.abs(v-report.member.position[i])>.01));
    const point=async (x=0,y=0)=>page.evaluate(([x,y])=>{
      const {THREE,camera}=window.clickAudit,mesh=window.__officeDebug.monitors.meshFor(0);
      const p=mesh.localToWorld(new THREE.Vector3(x,y,0)).project(camera);
      return {x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2};
    },[x,y]);
    // Physical inset and bezel share the same action, including when picking.
    let center=await point();
    await page.mouse.click(center.x,center.y);
    await page.waitForTimeout(2200);
    report.screen=await pose();
    assert.ok(report.screen.position.every((v,i)=>Math.abs(v-report.member.position[i])<.015));
    center=await point();
    await page.locator('#picking').click();
    const bezel=await point(0,.197);
    await page.mouse.click(bezel.x,bezel.y);
    await page.waitForTimeout(500);
    const counts=()=>page.evaluate(()=>({focus:window.clickAudit.calls.length,picks:window.clickAudit.picks.length,selected:window.clickAudit.selected.length}));
    report.afterBezel=await counts();
    assert.equal(report.afterBezel.focus,3);
    assert.equal(report.afterBezel.picks,0);
    assert.equal(report.afterBezel.selected,0);
    await page.mouse.move(center.x,center.y);await page.mouse.down();
    await page.mouse.move(center.x+30,center.y+20);await page.mouse.move(center.x,center.y);await page.mouse.up();
    await page.mouse.click(center.x,center.y,{button:'right'});
    assert.equal((await counts()).focus,3);
    // Insert a real visible occluder directly in front of the screen.
    await page.evaluate(()=>{
      const {THREE}=window.clickAudit,mesh=window.__officeDebug.monitors.meshFor(0);
      const blocker=new THREE.Mesh(new THREE.PlaneGeometry(.7,.45),new THREE.MeshBasicMaterial({color:0xcc4d36}));
      blocker.position.copy(mesh.position);blocker.quaternion.copy(mesh.quaternion);
      blocker.position.add(new THREE.Vector3(0,0,.02).applyQuaternion(blocker.quaternion));
      window.__officeDebug.__scene.add(blocker);window.clickAudit.blocker=blocker;
      blocker.updateMatrixWorld(true);
    });
    await page.mouse.click(center.x,center.y);
    assert.equal((await counts()).focus,3);
    await page.evaluate(()=>window.clickAudit.blocker.removeFromParent());
    await page.screenshot({path:'Build/screen-click-focus.png'});
    report.final=await counts();
    fs.writeFileSync('Build/screen-click-validation.json',JSON.stringify(report,null,2));
    console.log('PASS monitor and bezel focus, same member camera, no claiming, drag/right/occlusion ignored',JSON.stringify(report));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
