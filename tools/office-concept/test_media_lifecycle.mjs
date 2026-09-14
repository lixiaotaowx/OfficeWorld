import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { livekit } from '../../OfficeWeb/livekit.mjs';
import { AccessToken } from 'livekit-server-sdk';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
if(!livekit.ready)throw new Error('Local LiveKit configuration is unavailable');
const id=randomUUID();const voice='audit-voice-'+id,screen='screen-audit-'+id;
const browser=await chromium.launch({headless:true,channel:'msedge',args:['--autoplay-policy=no-user-gesture-required','--no-proxy-server']});
const pages=[];const checks=[];
const check=(name,ok)=>{checks.push({name,ok});console.log((ok?'PASS ':'FAIL ')+name);};
try{
 for(const identity of ['audit-a-'+id,'audit-b-'+id]){
  const tokens={};
  for(const room of [voice,screen]){
   const token=new AccessToken(livekit.apiKey,livekit.apiSecret,{identity,ttl:300});
   token.addGrant({room,roomJoin:true,canPublish:true,canSubscribe:true});tokens[room]=await token.toJwt();
  }
  const page=await browser.newPage();pages.push(page);
  await page.goto('http://127.0.0.1:5188/test/media-harness.html');
  await page.evaluate(async({identity,tokens,url})=>{
   const {OfficeMedia}=await import('/src/media.ts');
   const audioContext=new AudioContext();const tone=audioContext.createOscillator();
   const destination=audioContext.createMediaStreamDestination();tone.frequency.value=440;tone.connect(destination);tone.start();await audioContext.resume();
   navigator.mediaDevices.getUserMedia=async()=>destination.stream.clone();
   navigator.mediaDevices.getDisplayMedia=async()=>{
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=180;
    const c=canvas.getContext('2d');setInterval(()=>{c.fillStyle='#368265';c.fillRect(0,0,320,180);c.fillStyle='white';c.fillText(String(Date.now()),20,40);},80);
    return canvas.captureStream(12);
   };
   const notices=[],videos={};
   const socket={id:identity,timeout(){return this;},emit(event,room,reply){if(event==='livekit-token')reply(null,{url,token:tokens[room],room});}};
   window.mediaAudit={media:new OfficeMedia(socket,m=>notices.push(m),(id,stream)=>{videos[id]=stream;},()=>{}),notices,videos,audioContext,tone,destination};
  },{identity,tokens,url:livekit.url});
 }
 const [a,b]=pages;
 const voiceSession={id:'voice-session',room:voice,kind:'voice',owner:'audit-a-'+id,peer:'audit-b-'+id};
 const joined=await Promise.all(pages.map(p=>p.evaluate(s=>window.mediaAudit.media.start(s),voiceSession)));
 check('Two synthetic microphone sessions connect',joined.every(Boolean));
 console.log(JSON.stringify(await a.evaluate(()=>({mic:window.mediaAudit.media.micStream?.getAudioTracks().map(t=>({live:t.readyState,enabled:t.enabled})),voice:[...window.mediaAudit.media.voiceRooms],rooms:[...window.mediaAudit.media.rooms.values()].map(r=>({audio:r.localParticipant.audioTrackPublications.size,all:r.localParticipant.trackPublications.size,listeners:r.listenerCount('trackSubscribed')}))}))));
 await b.waitForFunction(()=>[...window.mediaAudit.media.rooms.values()].some(r=>[...r.remoteParticipants.values()].some(p=>[...p.trackPublications.values()].some(t=>t.kind==='audio'&&t.isSubscribed))),{},{timeout:30000}).catch(async error=>{
  for(const page of pages)console.log(JSON.stringify(await page.evaluate(()=>({
   notices:window.mediaAudit.notices,
   rooms:[...window.mediaAudit.media.rooms.values()].map(r=>({state:r.state,
    local:[...r.localParticipant.trackPublications.values()].map(p=>({kind:p.kind,muted:p.isMuted})),
    peers:[...r.remoteParticipants.values()].map(p=>({tracks:[...p.trackPublications.values()].map(t=>({kind:t.kind,subscribed:t.isSubscribed}))}))
   }))
  }))));throw error;
 });
 const rms=await b.evaluate(async()=>{
  const track=[...window.mediaAudit.media.rooms.values()][0].remoteParticipants.values().next().value.audioTrackPublications.values().next().value.track;
  const ctx=window.mediaAudit.audioContext;const input=ctx.createMediaStreamSource(new MediaStream([track.mediaStreamTrack]));const analyser=ctx.createAnalyser();input.connect(analyser);
  const samples=new Float32Array(analyser.fftSize);let rms=0;
  for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,100));analyser.getFloatTimeDomainData(samples);rms=Math.sqrt(samples.reduce((s,x)=>s+x*x,0)/samples.length);if(rms>.001)break;}
  return rms;
 });
 check('Remote audio carries a non-silent synthetic signal',rms>.001);
 if(rms<=.001)console.log(JSON.stringify(await b.evaluate(async()=>{
  const r=[...window.mediaAudit.media.rooms.values()][0];const p=[...r.remoteParticipants.values()][0];const t=[...p.audioTrackPublications.values()][0].track;
  const stats=await t.getRTCStatsReport();return {context:window.mediaAudit.audioContext.state,track:t.mediaStreamTrack.readyState,muted:t.mediaStreamTrack.muted,stats:[...(stats?.values()||[])].filter(s=>s.type==='inbound-rtp').map(s=>({bytes:s.bytesReceived,packets:s.packetsReceived,energy:s.totalAudioEnergy})),attached:window.mediaAudit.media.audio.size};
 })));
 await a.evaluate(()=>window.mediaAudit.media.toggleMute(true));
 check('Mute disables captured audio',await a.evaluate(()=>!window.mediaAudit.media.micStream.getAudioTracks()[0].enabled));
 await a.evaluate(()=>window.mediaAudit.media.startScreen());
 const screenSession={id:'screen-session',room:screen,kind:'screen',owner:'audit-a-'+id,peer:'audit-b-'+id};
 check('Approved synthetic screen connection opens',(await Promise.all(pages.map(p=>p.evaluate(s=>window.mediaAudit.media.start(s),screenSession)))).every(Boolean));
 await b.waitForFunction(()=>window.mediaAudit.videos['screen-session']?.getVideoTracks()[0]?.readyState==='live',{},{timeout:30000});
 check('Remote screen video track received',true);
 for(const p of pages)await p.evaluate(()=>{window.mediaAudit.media.end('voice-session');window.mediaAudit.media.end('screen-session');window.mediaAudit.media.stopScreen();});
 check('Ending calls releases microphones and owned audio elements',(await Promise.all(pages.map(p=>p.evaluate(()=>window.mediaAudit.media.micStream===null&&window.mediaAudit.media.audio.size===0)))).every(Boolean));
 console.log(JSON.stringify(await a.evaluate(()=>({mic:window.mediaAudit.media.micStream?.getAudioTracks().map(t=>t.readyState),voice:[...window.mediaAudit.media.voiceRooms],wanted:[...window.mediaAudit.media.wanted],audio:window.mediaAudit.media.audio.size}))));
 check('Stopping screen clears capture',await a.evaluate(()=>window.mediaAudit.media.screen===null));
}finally{
 for(const page of pages)await page.evaluate(()=>{window.mediaAudit?.media.dispose();window.mediaAudit?.audioContext.close();}).catch(()=>{});
 await browser.close();
}
if(checks.some(x=>!x.ok))process.exit(1);
