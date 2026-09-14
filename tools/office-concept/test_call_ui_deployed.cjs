const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const WebSocket = require('ws');
const BASE = 'http://127.0.0.1:3200';
const APP = 'https://115.159.43.237';
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
 const evidence={checks:[],errors:[],samples:[]};
 const check=(name,detail)=>{evidence.checks.push({name,detail});console.log('PASS',name,JSON.stringify(detail??''));};
 try {
  const pages=[]; const names=['MediaQA-A-','MediaQA-B-'].map(n=>n+Date.now());
  for(const name of names){
   const ctx=await browser.newContext({viewport:{width:1440,height:1000}});
   const reply=await ctx.request.post(BASE+'/api/auth/register',{headers:{origin:BASE},data:{name,password:'qa'}});
   assert.equal(reply.status(),200);
   const cookies = await ctx.cookies(BASE);
   const session = cookies.find(c=>c.name==='office_session');
   await ctx.addCookies([{name:session.name,value:session.value,url:APP,secure:true,httpOnly:true,sameSite:'Strict'}]);
   for (const endpoint of ['api/**','socket.io/**']) await ctx.route(APP+'/'+endpoint, async route=>{
    const request=route.request();const url=new URL(request.url());
    const response=await route.fetch({url:BASE+url.pathname+url.search,
     headers:{...request.headers(),origin:BASE,host:'127.0.0.1:3200',cookie:'office_session='+session.value}});
    await route.fulfill({response});
   });
   await ctx.routeWebSocket(APP.replace('https:','wss:')+'/socket.io/**', ws=>{
     const url=new URL(ws.url());
     const upstream=new WebSocket(BASE.replace('http:','ws:')+url.pathname+url.search,
       {headers:{origin:BASE,cookie:'office_session='+session.value}});
     const pending=[];
     ws.onMessage(message=>{if(upstream.readyState===1)upstream.send(message);else pending.push(message);});
     upstream.on('open',()=>pending.splice(0).forEach(message=>upstream.send(message)));
     upstream.on('message',(data,binary)=>ws.send(binary?data:data.toString()));
     upstream.on('error',()=>{});
     ws.onClose(()=>upstream.close());
    });
   await ctx.addInitScript(()=>{
    window.__pcs=[];window.__capture=[];
    const PC=window.RTCPeerConnection;
    window.RTCPeerConnection=class extends PC {constructor(...a){super(...a);window.__pcs.push(this);}};
    navigator.mediaDevices.getUserMedia=async()=>{
     const ac=new AudioContext();await ac.resume();const o=ac.createOscillator();o.frequency.value=440;
     const gain=ac.createGain();gain.gain.value=.15;const dest=ac.createMediaStreamDestination();
     o.connect(gain).connect(dest);o.start();return dest.stream;
    };
    navigator.mediaDevices.getDisplayMedia=async()=>{
     const c=document.createElement('canvas');c.width=960;c.height=540;const x=c.getContext('2d');
     setInterval(()=>{x.fillStyle='#315e3e';x.fillRect(0,0,960,540);x.fillStyle='white';x.font='35px sans-serif';x.fillText('RTC '+Date.now(),30,200);},100);
     const stream=c.captureStream(10);window.__capture.push(stream);return stream;
    };
    window.__stats=async()=>{
     const out=[];for(const pc of window.__pcs){if(pc.connectionState==='closed')continue;
      for(const r of (await pc.getStats()).values())if(r.type==='inbound-rtp')out.push({kind:r.kind,bytes:r.bytesReceived,energy:r.totalAudioEnergy,frames:r.framesDecoded});
     }return out;
    };
   });
   const p=await ctx.newPage();p.on('pageerror',e=>evidence.errors.push(e.message));
   p.on('console',m=>{if(['warning','error'].includes(m.type())&&!m.text().includes('access_token')) console.log('BROWSER',m.text().slice(0,500));if(m.type()==='error'&&/publisher|PC manager/.test(m.text()))evidence.errors.push(m.text());});
   await p.goto(APP);pages.push(p);
  }
  const [a,b]=pages;
  for(const p of pages) assert.ok(await p.locator('script[src]').evaluateAll(nodes=>nodes.some(n=>n.src.includes('index-vh8dYLTa.js'))));
  check('formal HTTPS frontend loaded; test business accounts routed to isolated VPS service');
  await a.getByRole('button',{name:'会议',exact:true}).click();
  await a.getByLabel(names[1],{exact:true}).check();
  await a.getByRole('button',{name:'创建会议并发送邀请'}).click();
  await b.getByRole('button',{name:'收到会议邀请 · 查看'}).click();
  await b.getByRole('button',{name:'接受并加入'}).click();
  for(const p of pages)await p.getByText(/已连接会议/).waitFor({timeout:35000});
  check('two authenticated clients joined VPS LiveKit');
  for(const p of pages)await p.getByRole('button',{name:'开启麦克风',exact:true}).click();
  async function until(p, predicate, label) {
    const end=Date.now()+30000;
    while(Date.now()<end){const value=await p.evaluate(()=>window.__stats());if(predicate(value))return value;await p.waitForTimeout(400);}
    throw Error('Timed out: '+label);
  }
  async function audio(p){
   const before=await p.evaluate(()=>window.__stats());
   return until(p, now=>now.some(n=>n.kind==='audio'&&n.energy>0&&n.bytes>(before.find(r=>r.kind==='audio')?.bytes??0)), 'received audio');
  }
  check('bidirectional received audio energy and increasing bytes',await Promise.all(pages.map(audio)));
  for(let i=0;i<5;i++){
   await a.getByRole('button',{name:'静音',exact:true}).click();
   await a.getByRole('button',{name:'开启麦克风',exact:true}).click();
   await audio(b);
  }
  check('microphone off/on five cycles with receiver audio');
  await a.getByLabel('收起会议面板').click();
  await a.getByRole('button',{name:'会议麦克风：开',exact:true}).click();
  await a.getByRole('button',{name:'会议麦克风：关',exact:true}).click();
  await audio(b);
  await a.getByRole('button',{name:'会议进行中',exact:true}).click();
  check('main toolbar microphone controls current meeting with panel collapsed');
  async function screen(sender,receiver){
   await sender.getByRole('button',{name:'共享屏幕到会议',exact:true}).click();
   await receiver.waitForFunction(()=>document.querySelector('video[aria-label="会议共享画面"]')?.videoWidth>0,null,{timeout:30000});
   const before=await receiver.evaluate(()=>window.__stats());
   await until(receiver, now=>now.some(n=>n.kind==='video'&&n.frames>(before.find(r=>r.kind==='video')?.frames??0)), 'decoded frames');
   evidence.samples.push(await receiver.evaluate(()=>window.__stats()));
  }
  for(let i=0;i<3;i++){
   await screen(a,b);
   await a.getByRole('button',{name:'停止会议共享',exact:true}).last().click();
   await b.getByLabel('会议共享画面').waitFor({state:'detached'});
  }
  check('screen start/stop/restart three cycles, remote decoded frames');
  await screen(b,a);await a.screenshot({path:'Build/media-production-receiver.png'});
  await b.evaluate(()=>{const t=window.__capture.at(-1).getVideoTracks()[0];t.stop();t.dispatchEvent(new Event('ended'));});
  await a.getByLabel('会议共享画面').waitFor({state:'detached'});
  check('reverse sharing and system-ended cleanup');
  await b.getByRole('button',{name:'离开会议',exact:true}).click();
  await b.getByRole('button',{name:'确认离开',exact:true}).click(); await b.waitForTimeout(300);
  await b.getByRole('button',{name:'接受并加入'}).click();
  await b.getByText(/已连接会议/).waitFor({timeout:30000});
  await b.getByRole('button',{name:'开启麦克风',exact:true}).click();await audio(a);
  await screen(b,a);await b.getByRole('button',{name:'停止会议共享',exact:true}).last().click();
  check('leave/rejoin restores audio and screen publication');
  await a.getByRole('button',{name:'结束会议',exact:true}).click();await a.getByRole('button',{name:'确认结束',exact:true}).click();
  assert.deepEqual(evidence.errors,[]);check('no page errors or PC manager/publisher exceptions');
 }finally{fs.writeFileSync('Build/media-production-evidence.json',JSON.stringify(evidence,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});





