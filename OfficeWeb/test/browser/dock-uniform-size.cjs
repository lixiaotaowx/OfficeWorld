const { chromium } = require('./playwright.cjs');
const { createServer } = require('vite');
const react = require('@vitejs/plugin-react');
const { resolve } = require('node:path');
const assert = require('node:assert/strict');
(async () => {
  const vite = await createServer({configFile:false,root:resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
  await vite.listen();
  const browser = await chromium.launch({channel:'msedge',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1000,height:240}});
    if (process.env.LIVE_DOCK) {
      const live = await fetch('https://115.159.43.237/dock.html').then(r=>r.text());
      const moduleTag = live.match(/<script type="module"[^>]*><\/script>/)[0];
      const styles = live.match(/<link rel="stylesheet"[^>]*>/g).join('\n');
      await page.route('**/test/dock-harness.html', async route => {
        const html = require('node:fs').readFileSync(resolve('test/dock-harness.html'),'utf8');
        await route.fulfill({contentType:'text/html',body:html.replace(
          '<script type="module" src="/src/dock.tsx"></script>',styles+moduleTag)});
      });
      await page.route('**/assets/**', async route => {
        const url = new URL(route.request().url());
        const response = await fetch('https://115.159.43.237'+url.pathname+url.search);
        assert.ok(response.ok, url.pathname);
        await route.fulfill({status:response.status,
          contentType:response.headers.get('content-type'),body:Buffer.from(await response.arrayBuffer())});
      });
    }
    await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/test/dock-harness.html`);
    await page.waitForFunction(() => typeof window.__pushState === 'function');
    await page.evaluate(() => window.__pushState({people:Array.from({length:10},(_,i)=>({
      id:String(i),name:'头像'+i,character:'look:'+JSON.stringify({color:['kraft','navy','snow','sage','rose'][i%5],
        accessories:{glasses:i%2?'black':'none',hair:'none',hat:i%3?'tophat':'none',beard:'none'}}),
      atDesk:true,unread:i===1?2:0,missed:false})),sharing:false,missed:0,hidden:false}));
    await page.waitForFunction(() => [...document.querySelectorAll('.dock-avatar')].length===10 &&
      [...document.querySelectorAll('.dock-avatar')].every(n=>n.style.backgroundImage.includes('data:image')));
    assert.equal(await page.locator('.dock-frame').evaluate(n => n.getBoundingClientRect().height), 32, 'island uses 80% of 40px taskbar');
    await page.locator('.dock-avatar').evaluateAll(nodes => nodes.forEach(n => n.getAnimations().forEach(a => { if (a.effect.getTiming().iterations !== Infinity) a.finish(); })));
    const geometry = await page.locator('.dock-avatar').evaluateAll(nodes => nodes.map(n => {
      const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
    }));
    for (let i = 1; i < geometry.length; i++) {
      assert.equal(geometry[i].x - geometry[i - 1].right, 8, '8px between avatars');
    }
    assert.ok(geometry.every(r => r.x >= 0 && r.y >= 0 && r.bottom <= 240), JSON.stringify(geometry));
    assert.ok(await page.evaluate(() => window.__layouts.at(-1).width >=
      document.querySelector('.dock').getBoundingClientRect().width), 'desktop receives enlarged strip width');
    const rows = [];
    for (const state of ['normal','open','greeting','dropping','alert']) {
      await page.evaluate(state => {
        const nodes = [...document.querySelectorAll('.dock-avatar')];
        nodes.forEach((node,index) => {
          node.classList.remove('open','greeting','dropping','alert');
          if (index===0 && state!=='normal') node.classList.add(state);
          for (const animation of node.getAnimations()) animation.pause();
        });
      },state);
      for (const time of [0,100,350,800]) {
        const sizes = await page.evaluate(time => [...document.querySelectorAll('.dock-avatar')].map(node=>{
          for(const animation of node.getAnimations()) animation.currentTime=time;
          const box=node.getBoundingClientRect(); return [box.width,box.height];
        }),time);
        assert.ok(sizes.every(([w,h])=>Math.abs(w-40)<.01 && Math.abs(h-40)<.01),`${state} ${time}: ${JSON.stringify(sizes)}`);
      }
      rows.push(state);
    }
    await page.locator('.dock-avatar').nth(3).hover();
    const hovered = await page.locator('.dock-avatar').nth(3).boundingBox();
    assert.equal(hovered.width,40); assert.equal(hovered.height,40);
    await page.screenshot({path:resolve('../Build/dock-uniform-size.png')});
    const push = async (inCall, expression, beard = 'none') => {
      await page.evaluate(({ inCall, expression, beard }) => window.__pushState({
        people: ['a', 'b'].map(id => ({ id, name: id, atDesk: true, inCall,
          character: 'look:' + JSON.stringify({ color: 'rose', expression,
            accessories: { glasses: 'black', hair: 'none', hat: 'beret', beard } }),
          unread: 0, missed: false })), sharing: false, missed: 0, hidden: false,
      }), { inCall, expression, beard });
    };
    const images = () => page.locator('.dock-avatar').evaluateAll(nodes => nodes.map(n => n.style.backgroundImage));
    await push(false);
    await page.waitForFunction(() => document.querySelectorAll('.dock-avatar').length === 2 &&
      [...document.querySelectorAll('.dock-avatar')].every(n => n.style.backgroundImage.includes('data:image')));
    const happy = (await images())[0];
    assert.equal((await images())[1], happy, 'same outfit and shared pose for both people');
    await push(true);
    await page.waitForFunction(happy => [...document.querySelectorAll('.dock-avatar')].every(n => n.style.backgroundImage.includes('data:image') && n.style.backgroundImage !== happy), happy);
    const busy = (await images())[0];
    await push(false, 'sleepy');
    await page.waitForFunction(happy => document.querySelector('.dock-avatar').style.backgroundImage === happy, happy);
    assert.notEqual(busy, happy);
    await push(false, 'sleepy', 'full');
    await page.waitForFunction(happy => [...document.querySelectorAll('.dock-avatar')].every(n => n.style.backgroundImage.includes('data:image') && n.style.backgroundImage !== happy), happy);
    assert.equal((await images())[0], (await images())[1], 'beard composes identically for all people');
    console.log('PASS shared state poses, legacy override ignored, beard assembly and identical outfits');
    console.log('PASS ten outfits, fixed 40×40 in all animation frames and hover:',rows.join(', '));
  } finally { await browser.close(); await vite.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});


