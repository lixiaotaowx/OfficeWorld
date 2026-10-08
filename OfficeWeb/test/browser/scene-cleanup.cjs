const {launch}=require('./playwright.cjs');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
(async()=>{
 const {fixtureFor}=await import('../../scene-fixtures.mjs');
 const audit=JSON.parse(fs.readFileSync('../Build/scene-cleanup-audit.json'));
 const snapshot={revision:audit.revision,parts:audit.parts.map(p=>p.kind==='desk'
  ? {...p,seatIndex:fixtureFor(p)?.seat?.index ?? audit.seatIds[p.id]}:p)};
 const root=path.resolve('../Build/OfficeWebCompactCalls20260930');
 const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://local');
  const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}
  const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.glb':'model/gltf-binary'}[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime});fs.createReadStream(file).pipe(res);
 });
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await launch(),results={};
 try{
  for(const [name,url] of [['old','http://127.0.0.1:'+server.address().port],['live','https://115.159.43.237']]){
   const page=await browser.newPage({viewport:{width:1400,height:950}});
   await page.routeWebSocket('**/socket.io/**',s=>s.close());
   await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
   await page.route('**/api/**',r=>{
    const url=new URL(r.request().url());
    const json=url.pathname==='/api/build'?snapshot:url.pathname==='/api/auth/me'
     ?{user:{id:'cleanup-check',name:'清理验收',role:'visitor',lookConfirmed:true}}:{};
    return r.fulfill({json});
   });
   await page.goto(url+'/?debug=1');
   await page.waitForFunction(n=>window.__officeDebug?.__scene.children.filter(o=>o.userData.buildId).length===n,snapshot.parts.length);
   results[name]=await page.evaluate(()=>{
    const s=window.__officeDebug.__scene;let meshes=0;
    s.getObjectByName('box-island')?.traverse(o=>{if(o.isMesh)meshes++;});
    return {fixedMeshes:meshes,buildObjects:s.children.filter(o=>o.userData.buildId).length};
   });
   await page.screenshot({path:'../Build/scene-cleanup-'+name+'.png'});
   await page.close();
  }
  assert(results.old.fixedMeshes>0);
  assert.equal(results.live.fixedMeshes,0);
  assert.equal(snapshot.parts.filter(p=>/^(distant-|pillar-)/.test(p.fixture||'')).length,0);
  assert.equal(snapshot.parts.filter(p=>p.kind==='chair').length,0);
  assert.equal(snapshot.parts.filter(p=>p.kind==='desk').length,7);
  fs.writeFileSync('../Build/scene-cleanup-render-proof.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
