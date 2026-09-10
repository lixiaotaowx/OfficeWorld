const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});const p=await b.newPage();await p.goto('http://127.0.0.1:5188/');console.log(await p.evaluate(async()=>{
 const THREE=await import('/@fs/G:/C/wendang/ChatGPT/youxi/tools/WebRuntime/node_modules/three/build/three.module.js');
 const {OfficeAvatar}=await import('/src/OfficeAvatar.ts');
 const a=new OfficeAvatar(new THREE.Scene(),new THREE.PerspectiveCamera(),()=>{});
 await a.load('woman');a.sit(0);
 for(let i=0;i<500;i++){a.clock.getDelta=()=>.05;a.update();}
 const first={pos:a.root.position.toArray(),sit:a.sitting};
 a.standUp();a.keys.add('KeyD');for(let i=0;i<18;i++)a.update();a.keys.clear();
 const moved=a.root.position.toArray();await a.load('man');a.sit(0);
 const path=a.path.map(v=>v.toArray());
 for(let i=0;i<500;i++)a.update();
 const result={first,moved,path,final:a.root.position.toArray(),sit:a.sitting,left:a.path.map(v=>v.toArray())};a.dispose();return result;
}));await b.close();})();
