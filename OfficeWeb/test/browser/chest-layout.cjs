// 宝箱面板的布局验收：真实数据混合（图片/链接/便签）+ 溢出滚动。
//
//   node test/browser/chest-layout.cjs              # 本地构建
//   BOX_LIVE=1 node test/browser/chest-layout.cjs   # 打正式站
//
// 断言的是"布局合理"这件事实：面板完整落在视口内、只有一个滚动区、
// 没有横向溢出、行不重叠、表单保持可见、缩略图有实际尺寸。
// 截图落在 ../Build/chest-panel-*.png（整屏）与 chest-panel-zoom-*.png（面板特写）。
const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const live=process.env.BOX_LIVE?'live':'local';
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'chest-layout-')),'world.json'));
  const owner={id:'owner',name:'李文杰',appearance:{color:'kraft'}};
  const reader={id:'reader',name:'王小雨',role:'visitor',lookConfirmed:true,appearance:{color:'blue'}};
  const chest=store.mutate({action:'add',part:{kind:'chest',x:20,y:0,z:0,rotation:0,color:'#f3dfc5'}},owner).changed;
  const photo='data:image/png;base64,'+fs.readFileSync(
    path.join('public','assets','characters','thumbnails','body-ink.png')).toString('base64');
  const entries=[
    {type:'image',title:'二层改造前的样子',value:photo},
    {type:'link',title:'这个拱门的做法值得参考',value:'https://www.bilibili.com/video/BV1B7411m7LV/'},
    {type:'note',title:'给夜班同事的提醒',value:'入口那盏地灯别关，晚走的人会摸黑。\n另外二楼平台的护栏还没装，别靠。'},
    {type:'link',title:'参考配色',value:'https://coolors.co/palettes/trending'},
    {type:'image',title:'材料样板',value:photo},
    {type:'note',title:'下周计划',value:'把会议区的隔断补齐，再加两组挂钩。'},
  ];
  for(const entry of entries) store.mutate({action:'put',id:chest.id,entry},owner);
  const vite=live==='local'?await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}}):null;
  if(vite)await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    page.setDefaultTimeout(15000);
    // 面板打开时会自动下滚 90px 再回顶；用页面内探针记录这段过程，截图前等它结束。
    await page.addInitScript(()=>{
      window.__scrollPeak=0;
      const watch=()=>{
        const list=document.querySelector('.build-chest-items');
        if(list) window.__scrollPeak=Math.max(window.__scrollPeak,list.scrollTop);
        requestAnimationFrame(watch);
      };
      requestAnimationFrame(watch);
    });
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.routeWebSocket('**/socket.io/**',s=>s.close());
    await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
    await page.route('**/api/**',r=>{
      const url=new URL(r.request().url());let json={};
      if(url.pathname==='/api/auth/me')json={user:reader};
      if(url.pathname==='/api/build')json=r.request().method()==='POST'?store.mutate(r.request().postDataJSON(),reader)
        :url.searchParams.has('chest')?{entries:store.chest(chest.id),people:store.people(chest.id)}:store.snapshot();
      return r.fulfill({json});
    });
    await page.goto((vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237')+'/?debug=1');
    await page.waitForFunction(id=>window.__officeDebug?.__scene.getObjectByName('chest-people-'+id)?.visible,chest.id);
    const target=await page.evaluate(()=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(20,.5,0);
      c.position.set(20,4,6);c.lookAt(k.target);c.updateMatrixWorld(true);
      const v=c.position.clone().set(20,.5,0).project(c),r=document.querySelector('.scene canvas').getBoundingClientRect();
      return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
    });
    await page.mouse.click(target.x,target.y);
    await page.getByRole('dialog',{name:'共享宝箱',exact:true}).waitFor();
    await page.waitForSelector('.build-chest-items article');
    await page.waitForFunction(()=>window.__scrollPeak>5||performance.now()>4000);
    await page.waitForFunction(()=>document.querySelector('.build-chest-items')?.scrollTop===0);
    await page.waitForTimeout(250);
    const report=await page.evaluate(()=>{
      const rect=el=>{const r=el.getBoundingClientRect();return{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};};
      const style=(el,prop)=>getComputedStyle(el)[prop];
      const panel=document.querySelector('.build-chest');
      const items=document.querySelector('.build-chest-items');
      const form=document.querySelector('.build-chest-form');
      const rows=[...document.querySelectorAll('.build-chest-items article')].map(rect);
      const thumbs=[...document.querySelectorAll('.build-chest-items article img')].map(rect);
      return {viewport:[innerWidth,innerHeight],panel:rect(panel),items:rect(items),form:rect(form),
        rows,thumbs,
        panelOverflowY:style(panel,'overflowY'),itemsOverflowY:style(items,'overflowY'),
        itemsClient:[items.clientWidth,items.clientHeight],itemsScroll:[items.scrollWidth,items.scrollHeight],
        panelClient:[panel.clientWidth,panel.clientHeight],panelScroll:[panel.scrollWidth,panel.scrollHeight],
        watchButtons:[...document.querySelectorAll('.chest-watch')].map(b=>b.textContent.trim()),
        people:[...document.querySelectorAll('.chest-person img')].map(i=>i.alt),
        typeTabs:[...document.querySelectorAll('.build-entry-types button')].map(b=>b.textContent.trim())};
    });
    fs.writeFileSync(path.join('..','Build','chest-layout-'+live+'.json'),JSON.stringify(report,null,1));
    await page.screenshot({path:path.join('..','Build','chest-panel-'+live+'.png')});
    await page.locator('.build-chest').screenshot({path:path.join('..','Build','chest-panel-zoom-'+live+'.png')});
    const [vw,vh]=report.viewport;
    // 面板整体必须落在视口里，不能顶出屏幕。
    assert(report.panel.x>=0&&report.panel.y>=0,'panel inside viewport (top left)');
    assert(report.panel.x+report.panel.w<=vw+1&&report.panel.y+report.panel.h<=vh+1,'panel inside viewport (bottom right)');
    // 只有一个滚动区：外层是固定高度的 flex 容器，滚动发生在内容列表上。
    assert.notEqual(report.panelOverflowY,'auto','panel itself must not scroll');
    assert.equal(report.itemsOverflowY,'auto','content list is the scroller');
    assert(report.itemsScroll[1]>report.itemsClient[1]+2,'content list actually overflows');
    // 不出现横向滚动条（内容都该在容器宽度内换行）。
    assert(report.itemsScroll[0]<=report.itemsClient[0]+2,'no horizontal overflow in the list');
    assert(report.panelScroll[0]<=report.panelClient[0]+2,'no horizontal overflow in the panel');
    // 每一行都排在前一行下面且不重叠，行高一致（网格稳定）。
    const top=report.rows.map(r=>r.y);
    assert.deepEqual(top,[...top].sort((a,b)=>a-b),'rows keep their order');
    for(let i=1;i<report.rows.length;i++) {
      const previous=report.rows[i-1];
      assert(report.rows[i].y>=previous.y+previous.h-1,'row '+i+' starts after row '+(i-1));
    }
    // 缩略图有实际尺寸（不是被压成 0 高）。
    assert(report.thumbs.length>=2,'image entries show a thumbnail');
    for(const thumb of report.thumbs) assert(thumb.h>=56&&thumb.w>=56,'thumbnail has real size '+JSON.stringify(thumb));
    // 表单（右侧栏）始终完整可见。
    assert(report.form.w>=240,'form keeps a usable width');
    assert(report.form.y>=report.panel.y&&report.form.y+report.form.h<=report.panel.y+report.panel.h+1,'form fully inside the panel');
    assert.deepEqual(report.watchButtons,['▶ B站观看'],'video link still offers the player');
    assert(report.people.includes('创建人：李文杰')&&report.people.includes('已读：王小雨'),'creator and reader avatars');
    assert.deepEqual(report.typeTabs,['↗ 链接','▧ 图片','≡ 便签'],'entry type tabs');
    // 窄窗口（客户端常被拉小）：右栏落到列表下面，两边都还在面板里。
    await page.setViewportSize({width:820,height:760});
    await page.waitForTimeout(300);
    const narrow=await page.evaluate(()=>{
      const rect=el=>{const r=el.getBoundingClientRect();return{x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)};};
      const panel=rect(document.querySelector('.build-chest'));
      const items=document.querySelector('.build-chest-items');
      const form=rect(document.querySelector('.build-chest-form'));
      const rail=rect(document.querySelector('.chest-rail'));
      return {panel,items:rect(items),form,rail,scrolling:getComputedStyle(items).overflowY,
        itemsScroll:[items.scrollWidth,items.scrollHeight],itemsClient:[items.clientWidth,items.clientHeight]};
    });
    await page.screenshot({path:path.join('..','Build','chest-panel-narrow-'+live+'.png')});
    assert(narrow.rail.y>=narrow.items.y+narrow.items.h-1,'narrow: rail drops below the list');
    assert(narrow.form.y+narrow.form.h<=narrow.panel.y+narrow.panel.h+1,'narrow: form stays inside the panel');
    assert(narrow.itemsScroll[0]<=narrow.itemsClient[0]+2,'narrow: no horizontal overflow');
    assert(narrow.itemsScroll[1]>narrow.itemsClient[1]+2,'narrow: list still scrolls');
    assert.deepEqual(errors,[]);
    console.log('PASS chest layout',JSON.stringify({panel:report.panel,items:report.items,form:report.form,rows:report.rows.length}));
  } finally {await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
