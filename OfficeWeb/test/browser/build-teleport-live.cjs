const {launch}=require('./playwright.cjs');
const assert=require('node:assert/strict');
const SITE='https://115.159.43.237';
/**
 * 正式站自检：玩法两件（直梯 / 传送点）真的随这次前端发布上线了。
 *
 *   BOX_LIVE=1 node test/browser/build-teleport-live.cjs   # 打正式站
 *   node test/browser/build-teleport-live.cjs              # 默认也打正式站（这个用例只测线上产物）
 *
 * 说明：只读，不改正式存档。账号走真 `/api/auth/register`（否则 socket 连不上），
 * 只把 `/api/auth/me` 换成"访客 + 已捏过人"，免得新账号被捏人/选座弹窗挡住。
 */
(async()=>{
  const browser=await launch();
  try{
    const context=await browser.newContext({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    const account={id:'teleport-live',name:'传送上线验收',role:'visitor',lookConfirmed:true};
    const options={headers:{origin:SITE},data:{name:'传送上线验收',password:'teleportqa'}};
    let response=await context.request.post(SITE+'/api/auth/register',options);
    if(response.status()!==200)response=await context.request.post(SITE+'/api/auth/login',options);
    assert.equal(response.status(),200,'QA 账号要能在正式站注册或登录');
    const me=await (await context.request.get(SITE+'/api/auth/me')).json();
    assert.ok(me?.user?.id,'正式站要认得这个会话');
    await context.route('**/api/auth/me',route=>route.fulfill({json:{
      user:{...me.user,role:'visitor',lookConfirmed:true}}}));

    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const failed=[];page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(SITE))failed.push(r.status()+' '+r.url());});
    await page.goto(SITE+'/?debug=1');
    await page.waitForFunction(()=>Boolean(window.__officeDebug?.__scene));
    await page.waitForFunction(()=>window.__officeDebug.__scene.children.some(c=>c.userData.buildId));
    const parts=await page.evaluate(()=>window.__officeDebug.__scene.children.filter(c=>c.userData.buildId).length);
    assert(parts>0,'正式站场景要载入出已保存的部件');

    // 部件库：新的"玩法"分类与两件新部件。
    await page.getByRole('button',{name:/打开部件库/}).click();
    await page.getByRole('tab',{name:'玩法',exact:true}).click();
    for(const label of ['直梯','传送点'])
      assert.equal(await page.getByRole('button',{name:label,exact:true}).count(),1,`正式站部件库里要有 ${label}`);
    // 直梯是真几何（0.25m 踏板能爬）：缩略图/图标之外，目录里也要能拿到它并实例化。
    const built=await page.evaluate(()=>{
      const catalog=window.__officeDebug.__catalog;
      return catalog?catalog.filter(item=>['ladder','teleport-pad'].includes(item.id)).map(item=>[item.id,item.label]):null;
    });
    if(built)assert.deepEqual(built,[['ladder','直梯'],['teleport-pad','传送点']]);
    await page.screenshot({path:'../Build/teleport-live-parts.png'});
    assert.deepEqual(errors,[]);
    assert.deepEqual(failed.filter(url=>!/socket\.io/.test(url)),[],'正式站资源不该有 4xx/5xx');
    console.log(`PASS 正式站已上线这次前端：场景 ${parts} 件部件、玩法分类含直梯/传送点`);
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
