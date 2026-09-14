const { chromium } = require('C:/Users/Administrator/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({channel:'msedge', headless:true});
 try {
  const pages = [];
  const names = ['主持QA','接收QA'].map(n => n + Date.now());
  for (const name of names) {
   const context = await browser.newContext({viewport:{width:1440,height:1000}});
   const reply = await context.request.post('http://127.0.0.1:3198/api/auth/register', {
    headers:{origin:'http://127.0.0.1:3198'}, data:{name,password:'qa'}});
   assert.equal(reply.status(),200);
   await context.addInitScript(() => {
    navigator.mediaDevices.getDisplayMedia = async () => {
     const canvas = document.createElement('canvas'); canvas.width=960; canvas.height=540;
     const ctx=canvas.getContext('2d');
     setInterval(() => {ctx.fillStyle='#315e3e';ctx.fillRect(0,0,960,540);
      ctx.fillStyle='white';ctx.font='35px sans-serif';ctx.fillText('REMOTE SCREEN '+Date.now(),30,200);},100);
     return canvas.captureStream(10);
    };
   });
   const page = await context.newPage(); await page.goto('http://127.0.0.1:5198'); pages.push(page);
  }
  const [host, viewer] = pages;
  await host.getByRole('button',{name:'会议',exact:true}).click();
  await host.getByLabel(names[1],{exact:true}).check();
  await host.getByRole('button',{name:'创建会议并发送邀请'}).click();
  await viewer.getByRole('button',{name:'收到会议邀请 · 查看'}).click();
  assert.equal(await viewer.getByRole('button',{name:'创建会议并发送邀请'}).count(),0);
  await viewer.getByRole('button',{name:'接受并加入'}).click();
  for (const page of pages) await page.getByText(/已连接会议/).waitFor({timeout:25000});
  await host.getByLabel('收起会议面板').click();
  await host.getByRole('button',{name:'共享到会议',exact:true}).click();
  await viewer.waitForFunction(() => document.querySelector('video[aria-label="会议共享画面"]')?.videoWidth > 0,null,{timeout:30000});
  const first=await viewer.getByLabel('会议共享画面').evaluate(v=>v.currentTime);
  await viewer.waitForTimeout(1200);
  assert.ok(await viewer.getByLabel('会议共享画面').evaluate(v=>v.currentTime)>first);
  await viewer.screenshot({path:'Build/Audit/meeting-receiver.png'});
  await host.getByRole('button',{name:'停止会议共享',exact:true}).click();
  await viewer.getByLabel('会议共享画面').waitFor({state:'detached'});
  await host.getByRole('button',{name:'会议进行中',exact:true}).click();
  await host.getByRole('button',{name:'结束会议',exact:true}).click();
  await host.getByRole('button',{name:'确认结束'}).click();
  console.log('PASS two accounts: invitation-first, main share routes to meeting, remote video frames advance, stop removes remote video');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
