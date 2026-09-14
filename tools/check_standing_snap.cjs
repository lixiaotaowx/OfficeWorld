const {chromium}=require('C:/Users/Administrator/AppData/Roaming/npm/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:900,height:850}});
  page.on('pageerror',e=>console.log('PAGE ERROR',e.message));
  await page.goto('http://127.0.0.1:5199/test/standing-snap.html');
  await page.waitForFunction(()=>window.standAudit,{timeout:30000});
  const result=await page.evaluate(async()=>{
   const a=window.standAudit,before=a.snapshot();
   a.avatar.standUp();const instant=a.snapshot();a.draw();
   a.avatar.update(1/60);const firstFrame=a.snapshot();
   await a.seated();a.avatar.moveTo(new a.THREE.Vector3(a.spot.stand.x+.2,0,a.spot.stand.z));
   const walkStart=a.snapshot();a.avatar.update(1/60);const walking=a.snapshot();
   const remote=new a.RemoteAvatars(a.world);
   const state={x:a.spot.chair.x,z:a.spot.chair.z,rot:a.spot.chair.angle,sitting:true,sittingSpot:'desk-0',moving:false,character:'man_suit'};
   remote.sync(new Map([['qa',state]]));
   while(!remote.counts.loaded)await new Promise(r=>setTimeout(r,30));
   remote.update(1/60);
   remote.sync(new Map([['qa',{...state,sitting:false,sittingSpot:null,x:a.spot.stand.x,z:a.spot.stand.z}]]));
   remote.update(1/60);
   const entry=remote.entries.get('qa');
   const other={x:entry.root.position.x,z:entry.root.position.z,y:entry.character.model.position.y,ground:entry.character.groundY,weight:entry.current.getEffectiveWeight()};
   remote.dispose();a.avatar.standUp();a.draw();
   return {before,instant,firstFrame,walkStart,walking,other,stand:a.spot.stand,reservations:a.reservations,reports:a.reports};
  });
  assert.equal(result.before.state.sitting,true);
  for(const state of [result.instant,result.firstFrame,result.walkStart]){
   assert.equal(state.blend,0);assert.equal(state.target,0);assert.equal(state.state.sitting,false);
   assert.equal(state.y,state.ground);assert.equal(state.weight,1);
  }
  assert.equal(result.instant.state.x,result.stand.x);assert.equal(result.instant.state.z,result.stand.z);
  assert.equal(result.walking.state.moving,true);
  assert.equal(result.other.x,result.stand.x);assert.equal(result.other.z,result.stand.z);
  assert.equal(result.other.y,result.other.ground);assert.equal(result.other.weight,1);
  assert.ok(!result.reports.includes('起身中…'));assert.ok(result.reservations.includes(null));
  await page.screenshot({path:'Build/standing-snap.png'});
  fs.writeFileSync('Build/standing-snap-validation.json',JSON.stringify(result,null,2));
  console.log('PASS immediate standing, full animation weight, correct ground/stand location, first-frame walking, remote snap, reservation released');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
