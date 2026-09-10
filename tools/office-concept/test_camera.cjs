const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({headless:true,channel:'msedge'});const p=await b.newPage({viewport:{width:1500,height:950}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:5188/');await p.getByText('白模已就绪',{exact:false}).waitFor();await p.waitForTimeout(600);
 const canvas=p.locator('.scene canvas');
 const before=await canvas.screenshot();
 await p.mouse.move(660,450);await p.mouse.down({button:'middle'});await p.mouse.move(780,475,{steps:12});await p.mouse.up({button:'middle'});await p.waitForTimeout(700);
 const rotate=await canvas.screenshot();assert.ok(!before.equals(rotate),'Middle drag changes view');
 await p.keyboard.down('Shift');await p.mouse.move(650,450);await p.mouse.down({button:'middle'});await p.mouse.move(710,475,{steps:10});await p.mouse.up({button:'middle'});await p.keyboard.up('Shift');await p.waitForTimeout(700);
 const pan=await canvas.screenshot();assert.ok(!rotate.equals(pan),'Shift middle changes view');
 await p.mouse.move(740,480);await p.mouse.wheel(0,-350);await p.waitForTimeout(800);
 const zoom=await canvas.screenshot();assert.ok(!pan.equals(zoom),'Wheel zoom changes view');
 assert.ok(!(await p.locator('.actor-controls').innerText()).includes('行走中'),'Camera gestures do not start walking');assert.deepEqual(errors,[]);
 await p.screenshot({path:'Design/OfficeConcept/Web_Camera_Controls.png'});
 console.log('Middle rotate, Shift-middle pan, wheel zoom gestures passed; no avatar movement or browser errors');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
