const { chromium } = require('./playwright.cjs');
const { createServer } = require('vite');
const react = require('@vitejs/plugin-react');
const { resolve } = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const vite = await createServer({ configFile:false,root:resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0} });
  await vite.listen();
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage();
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/`);
    const result = await page.evaluate(async () => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { OfficeAvatar } = await import('/src/OfficeAvatar.ts');
      const { RemoteAvatars } = await import('/src/RemoteAvatars.ts');
      const { DEFAULT_APPEARANCE } = await import('/src/look.ts');
      const { renderPortrait } = await import('/src/portraitRenderer.ts');
      const { decodeDockAppearance } = await import('/src/dockAppearance.ts');
      const world = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40,520/620,.1,30);
      const local = new OfficeAvatar(world,camera,()=>{},async()=>true);
      await local.load();
      local.sitBlend = local.sitTarget = 1;
      local.seatHeight = .58;
      local.root.position.set(0,0,0);
      const remote = new RemoteAvatars(world);
      remote.sync(new Map([['other',{x:0,z:0,rot:0,sitting:true,moving:false,appearance:DEFAULT_APPEARANCE}]]));
      while (!remote.counts.loaded) await new Promise(r=>setTimeout(r,20));
      const character = remote.entries.get('other').character;
      const times = [];
      for (let i=0;i<12;i++) {
        local.update(.1); remote.update(.1);
        times.push([local.seatedClip.time,character.action('坐姿打字_Type').time]);
      }
      const bone = local.character.bones.get('mixamorigLeftHand');
      const first = bone.getWorldPosition(new THREE.Vector3()).toArray();
      for (let i=0;i<5;i++) local.update(.1);
      const second = bone.getWorldPosition(new THREE.Vector3()).toArray();
      world.add(new THREE.HemisphereLight(0xffffff,0x9aa396,2));
      remote.objectOf('other').visible = false;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(.65,.08,.65),new THREE.MeshStandardMaterial({color:0x60735b}));
      seat.position.y=.54; world.add(seat);
      const renderer = new THREE.WebGLRenderer({antialias:true,alpha:true});
      renderer.setSize(520,620);
      camera.position.set(2,1.6,3); camera.lookAt(0,.9,0);
      renderer.render(world,camera);
      const seatedImage = renderer.domElement.toDataURL();
      local.standUp(); local.update(.1);
      const stopped = !local.character.action('坐姿打字_Type').isRunning();
      const look = {...DEFAULT_APPEARANCE,color:'navy',accessories:{...DEFAULT_APPEARANCE.accessories,hat:'tophat'}};
      const decoded = decodeDockAppearance('look:'+JSON.stringify(look));
      const face = await renderPortrait(decoded);
      const bare = await renderPortrait({...look,accessories:{...look.accessories,hat:'none'}});
      local.dispose(); remote.dispose(); renderer.dispose();
      return {times,first,second,stopped,decoded,face,bare,seatedImage};
    });
    assert.ok(result.times[11][0]>1,'local clip advances');
    assert.ok(result.times.every(([a,b])=>Math.abs(a-b)<.001),'remote action matches local');
    assert.ok(Math.hypot(...result.first.map((v,i)=>v-result.second[i]))>.0001,'hands move');
    assert.equal(result.stopped,true);
    assert.equal(result.decoded.accessories.hat,'tophat');
    assert.notEqual(result.face,result.bare);
    for (const key of ['face','bare','seatedImage']) fs.writeFileSync(resolve(`../Build/portrait-sit-${key}.png`),Buffer.from(result[key].split(',')[1],'base64'));
    console.log('PASS continuous local/remote sitting, hand motion, stand reset, old bridge outfit, portrait pixels',JSON.stringify(result.times));
  } finally { await browser.close(); await vite.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
