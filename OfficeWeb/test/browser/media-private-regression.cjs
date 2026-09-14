const { chromium } = require("./playwright.cjs");
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
   await ctx.route(BASE+'/qa-harness',route=>route.fulfill({contentType:'text/html',body:'<html><body><script src="/qa-harness.js"></script></body></html>'}));
   await ctx.route(BASE+'/qa-harness.js',route=>route.fulfill({path:'Build/media-harness.js',contentType:'text/javascript'}));
   await p.goto(BASE+'/qa-harness');pages.push(p);
  }

  const [a,b]=pages;
  async function until(p,predicate){const end=Date.now()+30000;while(Date.now()<end){const data=await p.evaluate(()=>window.__stats());if(predicate(data))return data;await p.waitForTimeout(300);}throw Error('No received media');}
  for(const p of pages) await p.waitForFunction(()=>window.qa?.s.connected);
  const aid=await a.evaluate(()=>window.qa.s.id);
  for(let i=0;i<3;i++){
    await a.evaluate(()=>window.qa.media.startScreen());
    await b.evaluate(target=>window.qa.s.emit('request',{target,kind:'screen'}),aid);
    const video=await until(b,data=>data.some(x=>x.kind==='video'&&x.frames>3));
    evidence.samples.push(video);
    await b.waitForFunction(()=>[...window.qa.videos.keys()].some(k=>k!=='local-screen'));
    await a.evaluate(()=>window.qa.media.stopScreen());
    await b.waitForFunction(()=>window.qa.videos.size===0);
  }
  check('workstation consent, remote video and stop/restart three cycles');
  await b.evaluate(target=>window.qa.s.emit('request',{target,kind:'voice'}),aid);
  for(const p of pages) evidence.samples.push(await until(p,data=>data.some(x=>x.kind==='audio'&&x.energy>0)));
  for(let i=0;i<3;i++){
    await a.evaluate(()=>window.qa.media.toggleMute(true));await a.waitForTimeout(350);
    await a.evaluate(()=>window.qa.media.toggleMute(false));
    const before=await b.evaluate(()=>window.__stats());
    await until(b,data=>data.some(x=>x.kind==='audio'&&x.energy>(before.find(y=>y.kind==='audio')?.energy??0)));
  }
  check('private voice both directions and mute/unmute three cycles');
  await a.evaluate(()=>{for(const id of window.qa.sessions.keys())window.qa.s.emit('end',id);});
  for(const p of pages)await p.waitForFunction(()=>window.qa.sessions.size===0);
  assert.deepEqual(evidence.errors,[]);check('private session cleanup without page errors');
 }finally{fs.writeFileSync('Build/media-private-evidence.json',JSON.stringify(evidence,null,2));await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
