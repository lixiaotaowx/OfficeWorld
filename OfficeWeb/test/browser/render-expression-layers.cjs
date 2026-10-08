const { chromium } = require('./playwright.cjs');
const { createServer } = require('vite');
const react = require('@vitejs/plugin-react');
const fs = require('node:fs');
const { resolve } = require('node:path');
(async()=>{
 const vite=await createServer({configFile:false,root:resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
 await vite.listen();
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage();
  await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/`);
  const layers=await page.evaluate(async()=>{
   const THREE=await import('/node_modules/three/build/three.module.js');
   const {loadCharacter}=await import('/src/characterModel.ts');
   const {ACCESSORIES,SLOT_ORDER}=await import('/src/look.ts');
   const {portraitLighting}=await import('/src/portraitLighting.ts');
   const character=await loadCharacter();
   const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});
   renderer.setSize(1024,1024,false);
   renderer.outputColorSpace=THREE.SRGBColorSpace;
   const scene=new THREE.Scene();
   scene.add(character.model);
   portraitLighting(renderer,scene);
   character.model.updateMatrixWorld(true);
   let eye=new THREE.Box3();
   character.model.traverse(o=>{
    if(o.isMesh && ['材质.005','材质.006'].includes(o.material?.name)) eye.union(new THREE.Box3().setFromObject(o,true));
   });
   const center=eye.getCenter(new THREE.Vector3());
   const camera=new THREE.OrthographicCamera(-.48,.48,.48,-.48,.1,20);
   camera.position.set(center.x,center.y,3);
   camera.lookAt(center.x,center.y,0);
   const meshes=[];
   character.model.traverse(o=>{if(o.isMesh){o.visible=false;meshes.push(o);}});
   const result={};
   for(const slot of SLOT_ORDER) for(const item of ACCESSORIES[slot]) {
    if(!item.mesh) continue;
    const mesh=character.look.accessories.get(item.mesh);
    mesh.visible=true;
    const viewY=center.y+(slot==='hat'?.20:0);
    camera.position.y=viewY;
    camera.lookAt(center.x,viewY,0);
    renderer.render(scene,camera);
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;
    const context=canvas.getContext('2d');
    context.translate(1024*.54,1024*(slot==='hat'?.205:slot==='hair'?.435:.475));
    context.rotate(-.12);
    if(slot==='hat' && item.id==='party') context.scale(1,.48);
    if(slot==='hat' && item.id==='tophat') context.scale(1,.85);
    // Narrower spectacle spacing matches this portrait's less widely spaced eyes.
    if(slot==='glasses') context.scale(.84,1.13);
    context.drawImage(renderer.domElement,-512,-512);
    result[`${slot}-${item.id}`]=canvas.toDataURL('image/png');
    mesh.visible=false;
   }
   renderer.dispose();
   return result;
  });
  const dir=resolve('public/assets/avatars/expressions-v2/layers');fs.mkdirSync(dir,{recursive:true});
  for(const [name,url] of Object.entries(layers)) fs.writeFileSync(resolve(dir,name+'.png'),Buffer.from(url.split(',')[1],'base64'));
  console.log('Rendered',Object.keys(layers).length,'independent RGBA accessory layers');
 } finally {await browser.close();await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
