// Built UI with an offline bridge: never contacts a person or starts real media.
const { launch } = require('./playwright.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await launch();
  try {
    const page = await browser.newPage({ viewport:{width:700,height:650}, ignoreHTTPSErrors:true });
    const errors=[]; page.on('pageerror', error => errors.push(error.message));
    const base=process.env.DOCK_UI_SITE || 'https://offline-dock.test';
    const root=path.resolve('../Build/OfficeWeb');
    const entry=process.env.DOCK_UI_SITE ? await (await page.request.get(base+'/dock.html')).text() :
      fs.readFileSync(path.join(root,'dock.html'),'utf8');
    const script=entry.match(/<script[^>]*src="([^"]+)"/)[1];
    const css=[...entry.matchAll(/<link[^>]*href="([^"]+\.css)"/g)]
      .map(m=>`<link rel="stylesheet" href="${m[1]}">`).join('');
    const html=fs.readFileSync('test/dock-meeting-harness.html','utf8')
      .replace('<script type="module" src="/src/dock.tsx"></script>',`${css}<script type="module" src="${script}"></script>`)
      .replace('state: async () => STATE,', 'state: () => new Promise(resolve => { window.__resolveInitial=()=>resolve(STATE); }),');
    await page.route(base+'/**', route => {
      const url=new URL(route.request().url());
      if(url.pathname==='/private-dock-regression') return route.fulfill({contentType:'text/html',body:html});
      if(process.env.DOCK_UI_SITE) return route.continue();
      const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
      if(!file.startsWith(root+path.sep)||!fs.existsSync(file)) return route.fulfill({status:404});
      const contentType=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':
        file.endsWith('.png')?'image/png':'application/octet-stream';
      return route.fulfill({body:fs.readFileSync(file),contentType});
    });
    await page.goto(base+'/private-dock-regression'); await page.reload();
    await page.waitForFunction(()=>window.__pushState);
    const publish=privateCalls=>page.evaluate(privateCalls=>{
      window.__dockState={...window.__dockState,sharing:true,privateCalls}; window.__pushState(window.__dockState);
    },privateCalls);
    const incoming={id:'r',personId:'p1',name:'同事乙',kind:'voice',offer:false};
    async function hit(button) {
      const box=await button.boundingBox(); assert.ok(box);
      await page.waitForFunction(({x,y})=>window.__layouts.at(-1)?.hitRegions.some(r=>x>=r.x&&x<r.x+r.width&&y>=r.y&&y<r.y+r.height),
        {x:box.x+box.width/2,y:box.y+box.height/2});
    }
    for(const [kind,offer] of [['voice',false],['screen',false],['screen',true]]) {
      incoming.kind=kind; incoming.offer=offer;
      await publish({invitations:[incoming],sessions:[],busy:false,error:''});
      const stage=page.locator('.dock-stage.call[data-greeting="p1"]'); await stage.waitFor();
      await page.evaluate(()=>window.__resolveInitial()); // A late initial snapshot cannot erase newer invitations.
      await page.waitForFunction(()=>{
        const probe=document.querySelector('.dock-stage.call canvas')?.__dockStage;
        return probe?.frames>15 && probe.motion>0 && probe.clip==='招手_Wave';
      });
      await page.evaluate(()=>window.__pushGreet({id:'p2',name:'客户丙',mode:'peek'}));
      await stage.waitFor();
      await page.waitForTimeout(5200); // No ringing event refresh: invitation must persist beyond event TTL.
      assert.equal(await stage.count(),1);
      const answer=page.getByRole('button',{name:'接听',exact:true}); await hit(answer);
      const stageBox=await stage.boundingBox(), answerBox=await answer.boundingBox();
      assert.ok(answerBox.y<stageBox.y,'answer is above caller');
      const action=offer?'拒绝':'接听';
      await page.getByRole('button',{name:action,exact:true}).click();
      assert.deepEqual(await page.evaluate(()=>window.__answers.at(-1)),['r',!offer]);
      await publish({invitations:[],sessions:[],busy:false,error:''});
      await page.getByRole('dialog',{name:'来电',exact:true}).waitFor({state:'detached'});
      await page.evaluate(()=>window.__pushGreet({id:'p1',mode:'call',kind:'voice',requestId:'r'}));
      assert.equal(await page.locator('.dock-call').count(),0,'late call event must not revive expired invitation');
    }
    const session={id:'session-a',name:'同事乙',mic:true,sharing:false,connected:true};
    for(const sharing of [false,true]) {
      session.sharing=sharing; session.mic=!sharing;
      await publish({invitations:[],sessions:[session],busy:false,error:''});
      const group=page.getByRole('group',{name:'与同事乙的私人通话'});
      const share=group.getByRole('button',{name:sharing?'停止共享':'屏幕分享',exact:true});
      await hit(share); await share.click();
      assert.deepEqual((await page.evaluate(()=>window.__actions.at(-1))).slice(0,2),['private-share','session-a']);
      const mic=group.locator('.dock-meeting-mic'); await hit(mic); await mic.click();
      assert.deepEqual((await page.evaluate(()=>window.__actions.at(-1))).slice(0,2),['private-mute','session-a']);
      assert.equal(await mic.textContent(),'');
      assert.equal(await mic.locator('path[stroke="#df4b4b"]').count(),sharing?1:0);
    }
    await page.screenshot({path:path.resolve('../Build/dock-private-controls.png')});
    await publish({invitations:[incoming],sessions:[session],busy:true,error:''});
    assert.equal(await page.getByRole('button',{name:'接听',exact:true}).isDisabled(),true);
    assert.equal(await page.getByRole('button',{name:'停止共享',exact:true}).isDisabled(),true);
    await publish({invitations:[incoming],sessions:[],busy:false,error:''});
    await page.waitForFunction(()=>document.querySelector('.dock-stage.call canvas')?.__dockStage?.frames>20);
    await page.waitForFunction(()=>!document.querySelector('.dock-call-answer')?.disabled);
    await page.screenshot({path:path.resolve('../Build/dock-private-ringing.png')});
    await publish({invitations:[],sessions:[],busy:false,error:''});
    await page.locator('.dock-call').waitFor({state:'detached'});
    assert.equal(await page.locator('.dock-meeting-controls').count(),0);
    assert.deepEqual(errors,[]);
    console.log('PASS: three invitation types, real Wave animation, persistent caller, above-head answer/hit regions, private share/mute, cleanup');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
