const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
 const page=await browser.newPage({viewport:{width:1200,height:900}});
 await page.goto('http://127.0.0.1:5188/test/media-harness.html');
 const result=await page.evaluate(async()=>{
  const source=await (await fetch('/src/characterModel.ts')).text();
  const THREE=await import(source.match(/from "([^"]*three[^" ]*)"/)[1]);
  const {loadCharacter,releaseCharacter}=await import('/src/characterModel.ts');
  const {applySitPose,SIT_POSES}=await import('/src/sitPoses.ts');
  const {groundSeatedFeet}=await import('/src/seatedFeet.ts');
  const {placeSeatedHands}=await import('/src/seatedHands.ts');
  const {CHARACTERS}=await import('/src/characters.ts');
  const results=[];
  for(const def of CHARACTERS){
   const c=await loadCharacter(def.id),root=new THREE.Group();root.add(c.model);
   const point=n=>c.bones.get(n).getWorldPosition(new THREE.Vector3());
   for(const angle of [0,Math.PI])for(const pose of ['standard','forward']){
    root.rotation.y=angle;applySitPose(root,c.bones,c.rest,SIT_POSES[pose],0);
    c.model.position.y=c.groundY+.58+SIT_POSES[pose].hipDrop-c.restHipHeight;
    groundSeatedFeet(root,c,pose);
    const before=point('UpperArmL').distanceTo(point('LowerArmL'));
    placeSeatedHands(root,c,pose);root.updateMatrixWorld(true);
    for(const side of ['L','R']){
     const p=root.worldToLocal(point('Wrist'+side));
     results.push({id:def.id,pose,angle,side,point:p.toArray(),ok:Math.abs(p.y-.842)<.035&&Math.abs(p.z-.435)<.035&&Math.abs(p.x-(side==='L'?.095:-.095))<.035});
    }
    if(Math.abs(before-point('UpperArmL').distanceTo(point('LowerArmL')))>1e-5)throw Error('Arm stretched');
   }
   releaseCharacter(c);
  }
  const officeSource=await (await fetch('/src/OfficeScene.tsx')).text();
  const imported=name=>officeSource.match(new RegExp('import \\{ '+name+' \\} from "([^"]+)"'))[1];
  const {GLTFLoader}=await import(imported('GLTFLoader'));
  const {DRACOLoader}=await import(imported('DRACOLoader'));
  const {bakedAwareMaterial}=await import('/src/bakedMaterials.ts');
  const office=await new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath('/assets/draco/')).loadAsync('/assets/office-baked.glb');
  const scene=new THREE.Scene();scene.background=new THREE.Color('#dedbd2');
  office.scene.traverse(o=>{if(o.isMesh)o.material=bakedAwareMaterial(o.material);});scene.add(office.scene);
  scene.add(new THREE.HemisphereLight(0xffffff,0x797265,1.5));
  const c=await loadCharacter('woman_casual'),root=new THREE.Group();root.position.set(.267,0,4.98);root.rotation.y=Math.PI;root.add(c.model);scene.add(root);
  applySitPose(root,c.bones,c.rest,SIT_POSES.standard,0);c.model.position.y=c.groundY+.58-c.restHipHeight;
  groundSeatedFeet(root,c,'standard');placeSeatedHands(root,c,'standard');
  const camera=new THREE.PerspectiveCamera(42,1200/900,.01,100);camera.position.set(1.45,1.65,5.5);camera.lookAt(.27,.82,4.46);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(1200,900);renderer.toneMapping=THREE.ACESFilmicToneMapping;
  document.body.innerHTML='';document.body.appendChild(renderer.domElement);renderer.render(scene,camera);
  return results;
 });
 require('fs').writeFileSync('Design/OfficeConcept/Keyboard_Hands_Check.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify({total:result.length,failed:result.filter(r=>!r.ok)}));
 await page.screenshot({path:'Design/OfficeConcept/Keyboard_Hands_Check.png'});
 if(result.some(r=>!r.ok))process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
