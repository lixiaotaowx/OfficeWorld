const {chromium}=require('C:/Users/Administrator/AppData/Roaming/npm/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:5199/test/screen-fit.html');
  await page.waitForFunction(()=>window.screenFitAudit?.monitors?.seatsWithScreen.length===9);
  const info=await page.evaluate(()=>{
   const {THREE,asset}=window.screenFitAudit;
   const shell=asset.getObjectByName('Island_A_Seat_1_approved_monitor');
   const rows=[];shell.traverse(o=>{
    if(!o.isMesh)return;
    const pos=o.geometry.attributes.position;
    rows.push({name:o.name,world:o.matrixWorld.toArray(),vertices:Array.from({length:pos.count},(_,i)=>new THREE.Vector3().fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld).toArray()),indices:o.geometry.index?Array.from(o.geometry.index.array):null});
   });return rows;
  });
  fs.writeFileSync('Build/monitor-geometry-audit.json',JSON.stringify(info,null,2));
  for(const mesh of info) {
   const unique=mesh.vertices.filter(v=>v[1]>.89).map(v=>v.map(x=>+x.toFixed(6)));
   console.log(mesh.name,mesh.vertices.length);
   for(let axis=0;axis<3;axis++)console.log(axis,[...new Set(unique.map(v=>v[axis]))].sort((a,b)=>a-b));
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
