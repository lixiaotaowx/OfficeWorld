const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5188/');
 const results=await page.evaluate(async()=>{
  const source=await (await fetch('/src/characterModel.ts')).text();
  const THREE=await import(source.match(/from "([^"]*three[^" ]*)"/)[1]);
  const {loadCharacter,releaseCharacter}=await import('/src/characterModel.ts');
  const {applySitPose,SIT_POSES}=await import('/src/sitPoses.ts');
  const {groundSeatedFeet}=await import('/src/seatedFeet.ts');
  const {CHARACTERS}=await import('/src/characters.ts');const results=[];
  for(const def of CHARACTERS){
   const c=await loadCharacter(def.id);const root=new THREE.Group();root.rotation.y=Math.PI;root.add(c.model);
   const point=name=>c.bones.get(name).getWorldPosition(new THREE.Vector3());
   root.updateMatrixWorld(true);
   const length=point('LowerLegL').distanceTo(point('FootL'));
   for(const pose of Object.values(SIT_POSES)){
    applySitPose(root,c.bones,c.rest,pose,0);
    c.model.position.y=c.groundY+.58+pose.hipDrop-c.restHipHeight;root.updateMatrixWorld(true);
    groundSeatedFeet(root,c,pose.id);
    const a=point('FootL');
    applySitPose(root,c.bones,c.rest,pose,0);root.updateMatrixWorld(true);groundSeatedFeet(root,c,pose.id);
    const drift=a.distanceTo(point('FootL'));
    const error=Math.abs(point('LowerLegL').distanceTo(point('FootL'))-length);
    const bend=point('LowerLegL').sub(point('UpperLegL')).normalize().dot(point('FootL').sub(point('LowerLegL')).normalize());
    const floorError=Math.abs(point('FootL').y-c.groundFootHeights.get('L'));
    const bendLimit=pose.id==='standard' ? .7 : .95;
    results.push({id:def.id,pose:pose.id,footY:point('FootL').y,drift,error,bend,floorError,ok:drift<1e-5&&error<1e-5&&floorError<1e-5&&Number.isFinite(bend)&&Math.abs(bend)<bendLimit});
   }
   releaseCharacter(c);
  }
  return results;
 });
 require('fs').writeFileSync('Design/OfficeConcept/Sitting_Rig_Checks.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify({total:results.length,failed:results.filter(r=>!r.ok),standardFootRange:results.filter(r=>r.pose==='standard').map(r=>[r.id,r.footY])}));
 await browser.close();if(results.some(r=>!r.ok))process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
