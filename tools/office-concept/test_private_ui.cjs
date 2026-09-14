const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const BASE = 'http://127.0.0.1:3200';
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
   const { io } = require('socket.io-client');
   const cookies=await ctx.cookies(BASE);
   await new Promise((resolve,reject)=>{
    const s=io(BASE,{transports:['websocket'],extraHeaders:{origin:BASE,cookie:cookies.map(c=>c.name+'='+c.value).join('; ')}});
    const timer=setTimeout(()=>{s.disconnect();reject(Error('seat setup timeout'));},10000);
    s.on('connect',()=>s.emit('join',{}));
    s.once('seats',seats=>s.emit('seat',seats.findIndex(seat=>!seat),answer=>{clearTimeout(timer);s.disconnect();answer.ok?resolve():reject(Error(answer.error));}));
    s.on('connect_error',reject);
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
   await p.route('**/qa-socket.js',r=>r.fulfill({path:'tools/WebRuntime/node_modules/socket.io-client/dist/socket.io.esm.min.js',contentType:'text/javascript'}));
   await p.goto(BASE);pages.push(p);
  }
  const [a,b]=pages;
  await a.getByRole('button',{name:new RegExp(names[1])}).click();
  await b.getByRole('button',{name:new RegExp(names[0])}).click();
  await a.getByRole('button',{name:'请求观看对方屏幕',exact:true}).click();
  await b.getByRole('button',{name:'同意',exact:true}).click();
  await a.waitForFunction(()=>[...document.querySelectorAll('.session-panel video')].some(v=>v.videoWidth>0),null,{timeout:30000});
  check('request unshared screen -> accept -> capture -> remote video');
  await a.locator('.session-panel').getByRole('button',{name:'结束',exact:true}).click();
  await a.getByRole('button',{name:'分享我的屏幕给对方',exact:true}).click();
  await b.getByRole('button',{name:'同意',exact:true}).click();
  await b.waitForFunction(()=>[...document.querySelectorAll('.session-panel video')].some(v=>v.videoWidth>0),null,{timeout:30000});
  check('offer own screen -> accepted -> opposite receiver video');
  await a.locator('.session-panel').getByRole('button',{name:'结束',exact:true}).click();
  await a.getByLabel('我的共享预览').getByRole('button',{name:'停止共享',exact:true}).click();
  await a.getByRole('button',{name:'邀请语音',exact:true}).click();
  await b.getByRole('button',{name:'同意',exact:true}).click();
  for(const p of pages) await p.getByRole('button',{name:'通话麦克风：已开启',exact:true}).waitFor({timeout:30000});
  for(let i=0;i<3;i++) {await a.getByRole('button',{name:'通话麦克风：已开启',exact:true}).click();await a.getByRole('button',{name:'通话麦克风：已静音',exact:true}).click();}
  await a.getByRole('button',{name:'通话麦克风：已开启',exact:true}).waitFor();
  check('private call default enabled and three mute/unmute cycles');
  await a.locator('.session-panel').getByRole('button',{name:'结束',exact:true}).click();
  assert.deepEqual(evidence.errors,[]);
 }finally{fs.writeFileSync('Build/private-ui-evidence.json',JSON.stringify(evidence,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});


