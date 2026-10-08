// Uses the documented 3200 tunnel to the VPS isolated QA instance, never production accounts.
const { chromium } = require('./playwright.cjs');
const { io } = require('socket.io-client');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = 'http://127.0.0.1:3200';
const suffix = 'BoxWorldQA';

(async () => {
  const browser = await chromium.launch({ channel:'msedge', args:['--no-proxy-server','--autoplay-policy=no-user-gesture-required'] });
  const errors = [];
  let activePage;
  try {
    async function signIn(name,seat) {
      const context = await browser.newContext({viewport:{width:1600,height:1080},ignoreHTTPSErrors:true});
      let response = await context.request.post(base+'/api/auth/register',{
        headers:{origin:base},data:{name:name+suffix,password:'boxqa'},
      });
      if (response.status() !== 200) response = await context.request.post(base+'/api/auth/login',{
        headers:{origin:base},data:{name:name+suffix,password:'boxqa'},
      });
      assert.equal(response.status(),200);
      const account=(await response.json()).user;
      await context.request.post(base+'/api/auth/role',{headers:{origin:base},data:{role:'employee'}});
      const cookies=await context.cookies(base);
      const socket=io(base,{transports:['websocket'],extraHeaders:{origin:base,cookie:cookies.map(c=>c.name+'='+c.value).join('; ')}});
      console.log('signing in',name);
      await new Promise((resolve,reject)=>{
        const timeout=setTimeout(()=>reject(Error('QA socket join timed out')),15000);
        socket.on('connect_error',reject);
        socket.on('connect',()=>socket.emit('join',{}));
        socket.once('seats',()=>socket.emit('seat',seat,answer=>{clearTimeout(timeout);answer.ok?resolve():reject(Error(answer.error));}));
      });
      socket.emit('appearance',{color:'sage',hair:'none',hat:'none',beard:'none',glasses:'none'});
      await new Promise(resolve=>setTimeout(resolve,200));
      socket.disconnect();
      const page=await context.newPage();
      activePage=page;
      page.on('pageerror',error=>errors.push(error.message));
      const requests=[];
      page.on('request',request=>requests.push(request.url()));
      if (process.env.BOX_LIVE === '1') {
        // Open the real published URL/assets; route only business traffic to isolated QA.
        // Engine.IO retains HTTP polling when the optional WebSocket upgrade is declined.
        await page.routeWebSocket('**/socket.io/**',socket=>socket.close());
        await page.route('https://115.159.43.237/**',async route=>{
          const url=new URL(route.request().url());
          if(!url.pathname.startsWith('/api/')&&!url.pathname.startsWith('/socket.io/')) return route.continue();
          const request=route.request();
          try {
            const result=await context.request.fetch(base+url.pathname+url.search,{
              maxRetries: 3,
              method:request.method(),headers:{origin:base,'content-type':request.headers()['content-type']||'application/json'},
              ...(request.postDataBuffer() ? {data:request.postDataBuffer()} : {}),
            });
            return route.fulfill({response:result});
          } catch { return route.abort(); }
        });
      }
      await page.goto((process.env.BOX_LIVE==='1' ? 'https://115.159.43.237' : base)+'/?debug=1',{waitUntil:'domcontentloaded'});
      console.log('page loaded',name);
      await page.waitForFunction(()=>Boolean(window.__officeDebug?.__scene),null,{timeout:60000});
      await page.waitForFunction(()=>document.querySelector('.build-live')?.textContent.includes('已连接'),null,{timeout:30000});
      return {context,page,account,requests};
    }
    const a=await signIn('搭建甲',0);
    const b=await signIn('搭建乙',1);
    activePage=a.page;
    const snapshot=async()=> (await a.context.request.get(base+'/api/build',{maxRetries:3})).json();
    const command=async(context,data)=>{
      await new Promise(resolve=>setTimeout(resolve,160));
      return context.request.post(base+'/api/build',{headers:{origin:base},data});
    };
    for(const part of (await snapshot()).parts) {
      if(part.kind==='chest') {
        const items=(await (await a.context.request.get(base+`/api/build?chest=${part.id}`,{maxRetries:3})).json()).entries;
        for(const item of items.filter(e=>e.owner===a.account.id))
          await command(a.context,{action:'take',id:part.id,entryId:item.id});
      }
      if(!part.id.startsWith('starter-')) await command(a.context,{action:'remove',id:part.id,version:part.version});
    }
    await new Promise(resolve=>setTimeout(resolve,2500));
    const project=async(page,x,y,z)=>page.evaluate(([x,y,z])=>{
      const camera=window.__officeDebug.__camera;
      const point=camera.position.clone().set(x,y,z).project(camera);
      const rect=document.querySelector('.scene canvas').getBoundingClientRect();
      return {x:rect.left+(point.x+1)/2*rect.width,y:rect.top+(1-point.y)/2*rect.height};
    },[x,y,z]);
    const clickPoint=async(page,x,y,z)=>{
      const point=await project(page,x,y,z);
      await page.mouse.move(point.x,point.y);
      await page.mouse.click(point.x,point.y);
    };
    const waitCount=async(count)=>{
      await a.page.waitForFunction(count=>window.__officeDebug.__scene.children.filter(n=>n.userData.buildId).length===count,count,{timeout:15000});
      await b.page.waitForFunction(count=>window.__officeDebug.__scene.children.filter(n=>n.userData.buildId).length===count,count,{timeout:15000});
    };
    const initial=(await snapshot()).parts.length;
    await a.page.getByRole('button',{name:'打开部件库'}).click();
    await a.page.getByRole('button',{name:/小方块/}).click();
    await a.page.keyboard.press('r');
    await a.page.getByRole('button',{name:/收起部件/}).click();
    await clickPoint(a.page,5,0,-1);
    await waitCount(initial+1);
    let built=(await snapshot()).parts.at(-1);
    assert.equal(built.kind,'small');
    assert.equal(built.rotation,1);
    await a.page.getByRole('button',{name:/移动/,exact:false}).click();
    await clickPoint(a.page,built.x,built.y+0.25,built.z);
    await clickPoint(a.page,6,0,-1);
    await a.page.waitForFunction(()=>document.querySelector('.build-live')?.textContent.includes('已保存'));
    await new Promise(resolve=>setTimeout(resolve,400));
    built=(await snapshot()).parts.find(p=>p.id===built.id);
    assert.equal(built.version,2);
    await a.page.getByRole('button',{name:/拆除/,exact:false}).click();
    await clickPoint(a.page,built.x,built.y+0.25,built.z);
    await waitCount(initial);
    await a.page.getByRole('button',{name:'↶ 撤销'}).click();
    await waitCount(initial+1);
    await a.page.getByRole('button',{name:/漫游/,exact:false}).click();
    const chest=(await snapshot()).parts.find(p=>p.kind==='chest' && p.x<0);
    await clickPoint(a.page,chest.x,0.65,chest.z);
    await a.page.getByRole('dialog',{name:'共享宝箱'}).waitFor();
    await a.page.getByRole('textbox',{name:'宝物标题'}).fill('共同的参考链接');
    await a.page.getByRole('textbox',{name:'宝物内容'}).fill('https://example.com/box-world');
    await a.page.getByRole('button',{name:'＋ 放进宝箱'}).click();
    await a.page.getByRole('link',{name:'↗ 共同的参考链接'}).waitFor();
    await a.page.getByRole('button',{name:'≡ 便签'}).click();
    await a.page.getByRole('textbox',{name:'宝物标题'}).fill('一起搭建');
    await a.page.getByRole('textbox',{name:'宝物内容'}).fill('左边建房子，右边放工位。');
    await a.page.getByRole('button',{name:'＋ 放进宝箱'}).click();
    await a.page.getByText('左边建房子，右边放工位。').waitFor();
    await a.page.getByRole('button',{name:'▧ 图片'}).click();
    await a.page.locator('input[type=file]').setInputFiles('C:/Users/Administrator/AppData/Local/Temp/codex-clipboard-04a50796-b93c-42ec-b800-d2d6f543c6b6.png');
    await a.page.getByText('✓ 图片已准备好 · 点击重选').waitFor();
    await a.page.getByRole('textbox',{name:'宝物标题'}).fill('方块参考');
    await a.page.getByRole('button',{name:'＋ 放进宝箱'}).click();
    await a.page.getByRole('img',{name:'方块参考'}).waitFor();
    await a.page.screenshot({path:'Build/box-world-chest.png'});
    const entries=(await (await b.context.request.get(base+`/api/build?chest=${chest.id}`,{maxRetries:3})).json()).entries;
    assert(entries.some(e=>e.type==='image'));
    assert(entries.some(e=>e.type==='note'));
    await a.page.getByRole('button',{name:'关闭宝箱'}).click();
    const addedChair=await (await command(a.context,{action:'add',part:{kind:'chair',color:'#e9b8b5',x:6,y:0,z:-4,rotation:2}})).json();
    const chair=addedChair.changed;
    assert(chair,JSON.stringify(addedChair));
    await new Promise(resolve=>setTimeout(resolve,2500));
    await a.page.bringToFront();
    console.log('chair hit',await a.page.evaluate(id=>{
      const debug=window.__officeDebug;
      const object=debug.__scene.getObjectByName('build-'+id);
      const p=object.position.clone(); p.y=0.5; p.project(debug.__camera);
      const rect=document.querySelector('.scene canvas').getBoundingClientRect();
      return { data:object.userData,hit:debug.__pick((p.x+1)/2*rect.width,(1-p.y)/2*rect.height) };
    },chair.id));
    await clickPoint(a.page,chair.x,0.5,chair.z);
    await a.page.waitForFunction(id=>window.__officeDebug.local().sittingSpot===`build-seat-${id}` && window.__officeDebug.local().sitting,chair.id,{timeout:45000});
    const occupied=await command(b.context,{action:'remove',id:chair.id,version:1});
    assert.equal(occupied.status(),409);
    await a.page.evaluate(()=>window.__officeDebug.avatar.standUp());
    await new Promise(resolve=>setTimeout(resolve,300));
    assert.equal((await command(a.context,{action:'remove',id:chair.id,version:1})).status(),200);
    await a.page.getByRole('button',{name:'打开部件库'}).click();
    await a.page.screenshot({path:'Build/box-world-overview.png'});
    await b.page.reload();
    await b.page.waitForFunction(()=>Boolean(window.__officeDebug?.__scene));
    await waitCount(initial+1);
    assert(!a.requests.some(url=>/office.*\.glb|natural.*\.glb/.test(url)));
    assert(await a.page.locator('#office-side-panel').isVisible());
    assert.deepEqual(errors,[]);
    await a.page.setViewportSize({width:1000,height:800});
    await a.page.screenshot({path:'Build/box-world-compact.png'});
    await require('./box-expansion-check.cjs')({a,b,command,snapshot,clickPoint});
    fs.writeFileSync('Build/box-world-evidence.json',JSON.stringify({initial,parts:(await snapshot()).parts.length,entries:entries.map(e=>e.type),errors,oldOfficeModelRequested:false,mode:process.env.BOX_LIVE?'live-assets':'qa'},null,2));
    console.log('PASS: UI placement/rotation/move/removal/undo, two clients sync, chest link/image/note, reload persistence, list preserved; no old scene GLB.');
  } catch(error) {
    if(activePage) {
      await activePage.screenshot({path:'Build/box-world-failure.png'});
      console.error('page status',await activePage.locator('.build-live').textContent());
      console.error('avatar',await activePage.evaluate(()=>window.__officeDebug?.local()));
    }
    throw error;
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

