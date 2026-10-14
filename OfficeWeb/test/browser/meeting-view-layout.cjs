const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const assert=require('node:assert/strict');
(async()=>{
  const vite=await createServer({configFile:false,root:process.cwd(),plugins:[react()],
    server:{host:'127.0.0.1',port:0,strictPort:true}});
  await vite.listen(); const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1280,height:720}});
    page.on('pageerror',e=>console.error(e));
    await page.goto('http://127.0.0.1:'+vite.httpServer.address().port+'/test/meeting-view-layout-harness.html');
    await page.getByRole('button',{name:'最大化',exact:true}).click();
    await page.waitForFunction(()=>window.__focus===1 && document.querySelector('.screen-stage video').videoWidth>0);
    assert.equal(await page.locator('.screen-stage').evaluate(e=>e.parentElement===document.body),true);
    await page.getByRole('button',{name:'全屏',exact:true}).click();
    await page.locator('.screen-stage.fullscreen').waitFor();
    const box=await page.locator('.screen-stage video').boundingBox();
    assert.ok(box.width>=1270 && box.height>=710,'picture fills viewport with only a small margin');
    await page.mouse.move(640,250); await page.mouse.wheel(0,-600);
    await page.waitForFunction(()=>Number(document.querySelector('.screen-stage-zoom')?.textContent.replace('%',''))>100);
    const toolbar=await page.locator('.screen-stage-bar').boundingBox();
    await page.mouse.wheel(0,2400);
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('.screen-stage video')).transform==='matrix(1, 0, 0, 1, 0, 0)');
    assert.deepEqual(await page.locator('.screen-stage-bar').boundingBox(),toolbar,'zoom leaves controls stable');
    await page.screenshot({path:'../Build/meeting-view-fullscreen.png'});
    await page.getByRole('button',{name:'退出全屏',exact:true}).click();
    await page.getByRole('button',{name:'关闭放大视图'}).click();
    await page.waitForFunction(()=>document.querySelector('.screen-stage video').videoWidth>0);
    assert.equal(await page.locator('#root .screen-stage').count(),1,'inline video resumes after portal return');
    await page.evaluate(()=>{ delete window.officeDesktop; });
    await page.getByRole('button',{name:'全屏',exact:true}).click();
    await page.waitForFunction(()=>document.fullscreenElement===document.querySelector('.screen-stage'));
    await page.getByRole('button',{name:'退出全屏',exact:true}).click();
    console.log('PASS meeting viewer: window focus, unclipped fullscreen, wheel zoom, fixed controls, stream restored');
  } finally {await browser.close();await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
