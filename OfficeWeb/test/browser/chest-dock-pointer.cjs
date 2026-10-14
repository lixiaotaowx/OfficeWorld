const assert = require('node:assert/strict');
const path = require('node:path');
const { createServer } = require('vite');
const { launch } = require('./playwright.cjs');
(async () => {
  const vite = await createServer({ configFile:false, root:path.resolve('.'),
    server:{ host:'127.0.0.1', port:0, strictPort:true } });
  let browser;
  try {
    await vite.listen(); browser = await launch();
    const base = `http://127.0.0.1:${vite.httpServer.address().port}`;
    const page = await browser.newPage({ viewport:{width:560,height:520} });
    await page.goto(base + '/test/dock-harness.html');
    await page.waitForFunction(() => window.__pushGreet && window.__layouts.at(-1)?.hitRegions?.length);
    await page.evaluate(() => window.__pushGreet({id:'p1',name:'同事乙',mode:'call',requestId:'req',kind:'voice'}));
    await page.locator('.dock-call-answer').waitFor();
    await page.waitForFunction(() => [...document.querySelectorAll('.dock-call-actions button')].every(button => {
      const p=button.getBoundingClientRect();
      return window.__layouts.at(-1)?.hitRegions?.some(r => p.x+p.width/2>=r.x &&
        p.x+p.width/2<r.x+r.width && p.y+p.height/2>=r.y && p.y+p.height/2<r.y+r.height);
    }));
    const regions = await page.evaluate(() => {
      const rect = document.querySelector('.dock-call-text').getBoundingClientRect();
      const point={x:rect.x+rect.width/2,y:rect.y+rect.height/2};
      const hit=window.__layouts.at(-1).hitRegions.some(r => point.x>=r.x && point.x<r.x+r.width && point.y>=r.y && point.y<r.y+r.height);
      return {hit,css:getComputedStyle(document.querySelector('.dock-call')).pointerEvents};
    });
    assert.equal(regions.hit,false); assert.equal(regions.css,'none');
    await page.locator('.dock-call-answer').click();
    assert.deepEqual(await page.evaluate(()=>window.__answers),[['req',true]]);
    await page.evaluate(() => window.__pushGreet({id:'p2',mode:'peek'}));
    await page.waitForFunction(() => window.__layouts.at(-1)?.stageMode === 'peek');
    assert.equal(await page.evaluate(()=>{
      const p=document.querySelector('.dock-stage').getBoundingClientRect();
      return window.__layouts.at(-1).hitRegions.some(r => p.x+p.width/2>=r.x &&
        p.x+p.width/2<r.x+r.width && p.y+p.height/2>=r.y && p.y+p.height/2<r.y+r.height);
    }),false);
    await page.goto(base + '/test/arrow-glow-harness.html');
    await page.waitForFunction(()=>window.qa);
    const result=await page.evaluate(async () => {
      const {BuildChestUnread}=await import('/src/buildChestUnread.ts');
      const {world,THREE,render}=window.qa;
      const chest={id:'broadcast',kind:'chest',color:'#b4c5a0',x:0,y:0,z:0,
        chestPeople:{creator:{id:'author'},readers:[]}};
      const object=new THREE.Group(); object.add(new THREE.Mesh(new THREE.BoxGeometry(1,1,1)));
      world.add(object);
      const alice=new BuildChestUnread(world,'alice'),bob=new BuildChestUnread(world,'bob');
      const objects=new Map([['broadcast',object]]);
      alice.sync([chest],objects); bob.sync([chest],objects); render(0);
      const arrows=()=>world.children.filter(o=>o.userData.chestUnread);
      const first=arrows()[0];
      const a=first.userData.arrowPanels[0].getWorldPosition(new THREE.Vector3()).y;
      render(.65);
      const b=first.userData.arrowPanels[0].getWorldPosition(new THREE.Vector3()).y;
      const before=arrows().length;
      const read={...chest,chestPeople:{...chest.chestPeople,readers:[{id:'alice'}]}};
      alice.sync([read],objects); bob.sync([read],objects); const after=arrows().length;
      alice.dispose(); bob.dispose();
      return {before,after,down:b<a,disposed:arrows().length};
    });
    assert.deepEqual(result,{before:2,after:1,down:true,disposed:0});
    console.log('浏览器通过：来电文字/人物不进入点击区、接听可用、peek仅头像条接收输入；宝箱自动箭头及独立已读。');
  } finally { await browser?.close(); await vite.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
