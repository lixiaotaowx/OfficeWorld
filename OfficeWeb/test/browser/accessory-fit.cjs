const {chromium}=require('./playwright.cjs');
const {createServer}=require('vite');const react=require('@vitejs/plugin-react');const {resolve}=require('node:path');
(async()=>{const vite=await createServer({configFile:false,root:resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});await vite.listen();const browser=await chromium.launch({channel:'msedge',headless:true});try{
const page=await browser.newPage({viewport:{width:1200,height:680}});await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/`);
const shots=await page.evaluate(async()=>{const T=await import('/node_modules/three/build/three.module.js');const {loadCharacter}=await import('/src/characterModel.ts');const {portraitLighting}=await import('/src/portraitLighting.ts');const out=[];
for(const hair of ['short','long','bob']){const c=await loadCharacter({color:'kraft',accessories:{hair,beard:'full',glasses:'none',hat:'none'}});const s=new T.Scene();s.add(c.model);const r=new T.WebGLRenderer({alpha:true,antialias:true});r.setSize(380,540);portraitLighting(r,s);c.model.updateMatrixWorld(true);
const cam=new T.OrthographicCamera(-.45,.45,.6,-.6,.1,10);cam.position.set(2,1.52,2);cam.lookAt(0,1.52,0);r.render(s,cam);out.push(r.domElement.toDataURL());r.dispose();}return out;});
await page.setContent(`<style>body{background:#e9e8e2;display:flex}img{width:380px}</style>${shots.map(src=>`<img src="${src}">`).join('')}`);await page.screenshot({path:resolve('../Build/accessory-fit-side.png')});
}finally{await browser.close();await vite.close();}})().catch(e=>{console.error(e);process.exitCode=1});
