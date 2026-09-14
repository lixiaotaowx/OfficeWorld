import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, rmSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createServer as createVite } from "vite";
import react from "@vitejs/plugin-react";
import { createOfficeServer } from "../../server.mjs";
import { RETENTION } from "../../chat-store.mjs";
const require = createRequire(import.meta.url);
const { chromium } = require("./playwright.cjs");
const dir = mkdtempSync(join(tmpdir(), "navigation-browser-"));
const options = { statePath: join(dir, "state.json"), accountsPath: join(dir, "accounts.json"), secureCookies: false };
let server = createOfficeServer(options);
await new Promise(r => server.http.listen(0, "127.0.0.1", r));
const port = server.http.address().port;
const target = `http://127.0.0.1:${port}`;
const vite = await createVite({ configFile: false, root: resolve("."), plugins: [react()],
  server: { host: "127.0.0.1", port: 0, proxy: { "/socket.io": { target, ws: true }, "/api": { target } } } });
await vite.listen();
const origin = `http://127.0.0.1:${vite.httpServer.address().port}`;
const url = origin + "/test/chat-files-harness.html";
const browser = await chromium.launch({ channel: "msedge", headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const pages=[],errors=[];
async function stats(page){return page.evaluate(async()=>{let video=0,audio=0;for(const pc of window.__pcs){if(pc.connectionState==='closed')continue;for(const row of (await pc.getStats()).values()){if(row.type==='inbound-rtp'&&row.kind==='video')video+=row.framesDecoded||0;if(row.type==='inbound-rtp'&&row.kind==='audio')audio+=row.totalAudioEnergy||0;}}return{video,audio};});}
try {
 for(let i=0;i<2;i++){
  const context=await browser.newContext();
  const response=await context.request.post(origin+'/api/auth/register',{headers:{origin},data:{name:'接替验证'+i,password:'qa'}});assert.equal(response.status(),200);
  await context.addInitScript(()=>{
   window.__pcs=[];window.__captures=[];window.__denyScreen=false;
   const PC=RTCPeerConnection;window.RTCPeerConnection=class extends PC{constructor(...args){super(...args);window.__pcs.push(this);}};
   navigator.mediaDevices.getUserMedia=async()=>{const ac=new AudioContext();await ac.resume();const o=ac.createOscillator(),gain=ac.createGain(),dest=ac.createMediaStreamDestination();gain.gain.value=.1;o.connect(gain).connect(dest);o.start();return dest.stream;};
   navigator.mediaDevices.getDisplayMedia=async()=>{if(window.__denyScreen)throw new DOMException('cancel','NotAllowedError');const c=document.createElement('canvas');c.width=640;c.height=360;const ctx=c.getContext('2d');setInterval(()=>{ctx.fillStyle='#628c51';ctx.fillRect(0,0,640,360);ctx.fillStyle='white';ctx.font='30px sans-serif';ctx.fillText(String(Date.now()),10,100);},100);const stream=c.captureStream(12);window.__captures.push(stream);return stream;};
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/test/takeover-harness.html');pages.push(page);
 }
 const [a,b]=pages;for(const p of pages)await p.waitForFunction(()=>window.office?.people.length===2);
 await a.evaluate(()=>window.office.request(window.office.people.find(p=>p.id!==window.office.myId).id,'voice'));
 await b.getByRole('button',{name:'同意并接通',exact:true}).click();
 for(const p of pages)await p.getByRole('button',{name:'分享屏幕',exact:true}).waitFor();
 await a.waitForFunction(()=>Object.values(window.office.callStates).some(s=>s.connected&&s.voice==='已开启'),null,{timeout:40000});
 await b.waitForFunction(()=>Object.values(window.office.callStates).some(s=>s.connected&&s.voice==='已开启'),null,{timeout:40000});
 await a.getByRole('button',{name:'分享屏幕',exact:true}).click();
 await b.waitForFunction(()=>[...document.querySelectorAll('video')].some(v=>v.videoWidth>0),null,{timeout:30000});
 await a.waitForFunction(()=>Object.values(window.office.callStates).some(s=>s.sharing));
 await b.evaluate(()=>window.__denyScreen=true);await b.getByRole('button',{name:'分享屏幕',exact:true}).click();
 await b.waitForFunction(()=>document.querySelector('.private-calls button:last-child')?.textContent==='分享屏幕');
 assert.equal(await a.evaluate(()=>Object.values(window.office.callStates).some(s=>s.sharing)),true);
 await b.evaluate(()=>window.__denyScreen=false);await b.getByRole('button',{name:'分享屏幕',exact:true}).click();
 await a.waitForFunction(()=>Object.values(window.office.callStates).some(s=>s.connected&&!s.sharing)&&[...document.querySelectorAll('video')].some(v=>v.videoWidth>0),null,{timeout:30000});
 await a.waitForFunction(()=>window.__captures.every(s=>!s.active));
 await b.waitForFunction(()=>Object.values(window.office.callStates).some(s=>s.sharing));
 const before=await Promise.all(pages.map(stats));await a.waitForTimeout(1500);const after=await Promise.all(pages.map(stats));
 for(let i=0;i<2;i++)assert.ok(after[i].audio>before[i].audio,'voice survives private takeover');
 await a.screenshot({path:'../Build/private-screen-takeover.png'});
 console.log('PASS private voice -> A screen -> cancelled B picker keeps A -> B takes over, A capture stops, audio continues');
 await a.getByRole('button',{name:'挂断通话',exact:true}).click();for(const p of pages)await p.locator('.private-calls').waitFor({state:'hidden'});
 await a.evaluate(()=>window.office.meetings.act({action:'create',title:'独占屏幕测试',invitees:[window.office.people.find(p=>p.id!==window.office.myId).clientId],microphone:true}));
 await b.waitForFunction(()=>window.office.meetings.invitations.length>0);
 await b.evaluate(()=>window.office.meetings.act({action:'accept',id:window.office.meetings.invitations[0].id,microphone:true}));
 for(const p of pages)await p.waitForFunction(()=>window.office.meetings.status==='已连接会议',null,{timeout:30000});
 await a.evaluate(()=>window.office.meetings.toggleShare());await a.waitForFunction(()=>window.office.meetings.sharing);
 await b.evaluate(()=>window.__denyScreen=true);
 await assert.rejects(b.evaluate(()=>window.office.meetings.toggleShare()));
 assert.equal(await a.evaluate(()=>window.office.meetings.sharing),true);
 await b.evaluate(()=>window.__denyScreen=false);
 await b.evaluate(()=>window.office.meetings.toggleShare());
 await a.waitForFunction(()=>!window.office.meetings.sharing&&window.__captures.every(s=>!s.active),null,{timeout:30000});
 await b.waitForFunction(()=>window.office.meetings.sharing);
 const mBefore=await Promise.all(pages.map(stats));await a.waitForTimeout(1500);const mAfter=await Promise.all(pages.map(stats));
 assert.ok(mAfter[0].video>mBefore[0].video,'A decodes B meeting screen');for(let i=0;i<2;i++)assert.ok(mAfter[i].audio>mBefore[i].audio,'meeting audio survives');
 await b.evaluate(()=>window.office.meetings.stopShare());await b.waitForFunction(()=>!window.office.meetings.sharing);
 await a.evaluate(()=>window.office.meetings.act({action:'end',id:window.office.meetings.active.id}));
 assert.deepEqual(errors,[]);console.log('PASS meeting takeover stops A capture, B video decodes, audio continues; zero page errors');
} catch(error) {for(const p of pages)console.log(await p.evaluate(()=>({notice:window.office?.notice,sessions:window.office?.sessions,states:window.office?.callStates,captures:window.__captures?.map(s=>s.active),videos:[...document.querySelectorAll('video')].map(v=>[v.videoWidth,v.videoHeight])})));throw error;} finally {await browser.close();await vite.close();await new Promise(r=>server.io.close(r));rmSync(dir,{recursive:true,force:true});}
