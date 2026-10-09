const {launch}=require('./playwright.cjs');
const assert=require('node:assert/strict');
const SITE='https://115.159.43.237';
/**
 * 正式站端到端：玩法两件（直梯 / 传送点）**真的能点击建造**，并且点传送点会瞬移。
 *
 *   node test/browser/build-parts-live.cjs
 *
 * 起因为 2026-10-08 用户报「这俩点不上去啊 无法点击建造」：前端产物发布了，但**后端在启动时
 * 把 build-catalog.json 读进内存**，服务器上还是旧目录 → 每次 add 都回 400「没有这个部件」。
 * 所以这条用例必须**真的用鼠标点场景建造**并断言落进正式存档，只看前端有这两个部件是不够的。
 *
 * 五个坑（都是这次实测踩出来的）：
 *  ① 登录要走页面自己的表单，手工往浏览器塞 HTTP 会话 cookie 会让页面停在身份选择页（画布根本
 *     不存在）；② 每次登录都会吊销该账号的其他会话，所以校验也用**浏览器自己的 request 上下文**
 *     （`context.request`），不要另开一套 Node 会话——否则互相顶掉，页面会被踢回登录页；
 *  ③ 要在页面里点掉"先捏一下你的角色"，否则面板盖住画布，真实鼠标点在 DOM 上就点不到场景
 *     （合成 PointerEvent 能绕过，很容易误判成功）；④ 登录/选身份会冲掉 URL 上的 `?debug=1`，
 *     而探针只在它存在时安装，要重新带上再进一次；⑤ **每件都要先把镜头对准落点再点**，否则目标
 *     偏出画面、射线打到别处，现象是"点了没反应"。
 *
 * 会在正式存档里放三件（直梯 + 两块传送点，第二块由页面自己建，免得受轮询同步时序影响）并在结尾删掉。
 * 写接口 120ms/账号节流，所以删除之间要留间隔；用访客身份，不占工位。
 *
 * **只许动自己那块地**（2026-10-08 的教训，别再犯）：早期版本按"类型"清理——`ladder`/`teleport-pad`
 * 全删，于是把用户自己建的两根直梯和一块传送点一起删了（那几件是他在 x≈-25 和 (3.5,0,-1.5) 搭的，
 * 服务器没有回滚，找不回来）。现在验收件一律摆在 **`PLOT` 这块 25m 内没有别的东西的空地**上，
 * 清理只按"离 PLOT 12m 以内"筛（比落点范围宽一点），并在开头/结尾核对**世界总件数不变**。
 */
const NAME='玩法上线验收', PASSWORD='partslive';
const KIND_LABEL={'ladder':'直梯','teleport-pad':'传送点'};
const partsOf=json=>((json&&json.parts)||[]).filter(p=>KIND_LABEL[p.kind]);
/** 验收件专用的空地：正式世界是 x −42.75~13.5 / z −26~24，这里 25m 内一件都没有。 */
const PLOT={x:40,z:40}, NEAR=12;
const nearSite=part=>Math.hypot(part.x-PLOT.x,part.z-PLOT.z)<NEAR;
const mine=json=>partsOf(json).filter(nearSite);
const sleep=ms=>new Promise(done=>setTimeout(done,ms));

/** 点掉"先捏一下你的角色"（没有它就直接返回）。 */
async function confirmLook(page){
  const dialog=page.getByRole('dialog',{name:'设置我的角色'});
  if(!await dialog.count())return;
  await dialog.getByRole('button',{name:'就这样，进空间'}).click();
  await dialog.waitFor({state:'detached',timeout:15000});
  await sleep(500);
}

(async()=>{
  const browser=await launch();
  try{
    const context=await browser.newContext({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const build={get:async()=>await (await context.request.get(SITE+'/api/build')).json(),
      post:async data=>await (await context.request.post(SITE+'/api/build',{headers:{origin:SITE},data})).json()};

    await page.goto(SITE+'/?debug=1');
    await page.waitForSelector('.account-card, .scene-shell',{timeout:30000});
    if(await page.locator('.account-card').count()){
      // 注册/登录都用浏览器自己的 request 上下文：会话留在同一个 jar 里，页面不会被踢。
      const res=await context.request.post(SITE+'/api/auth/register',{headers:{origin:SITE},data:{name:NAME,password:PASSWORD}});
      if(res.status()!==200){
        const login=await context.request.post(SITE+'/api/auth/login',{headers:{origin:SITE},data:{name:NAME,password:PASSWORD}});
        assert.equal(login.status(),200,'验收账号要能登录');
      }
      await page.goto(SITE+'/?debug=1');
      await page.waitForTimeout(1500);
    }
    const visitor=page.locator('.role-option').filter({hasText:'访问人'});
    await page.waitForSelector('.role-option, .scene-shell',{timeout:60000});
    if(await visitor.count())await visitor.click();
    // 登录/选身份会把 ?debug=1 冲掉：重新带上再进一次，探针才会装上。
    if(!await page.evaluate(()=>Boolean(window.__officeDebug))){
      await page.goto(SITE+'/?debug=1');
      await page.waitForTimeout(1500);
    }
    await page.waitForFunction(()=>window.__officeDebug?.__scene,{timeout:60000});
    await page.waitForFunction(()=>window.__officeDebug.__scene.children.some(c=>c.userData.buildId),{timeout:60000});
    await page.waitForTimeout(1500);
    await confirmLook(page);
    // 画布中央不能有面板挡着——"点不上去"最常见的原因就是被 DOM 面板吃掉点击。
    assert.equal(await page.evaluate(()=>Boolean(document.elementFromPoint(760,480)?.closest('.scene'))),true,
      '画面中央不能有面板挡着');

    // 开跑前只清掉**自己那块地**上的残留（用例自己收尾，失败时会留），并记下世界总件数：
    // 结尾要核对"正式世界和开跑前一样多"，防止再出现"顺手删了用户的件"。
    const before=(await build.get()).parts.length;
    const strays=mine(await build.get());
    for(const part of strays){await build.post({action:'remove',id:part.id,version:part.version});await sleep(400);}
    assert.equal(mine(await build.get()).length,0,'开跑前自己那块地上不该有残留');
    assert.equal((await build.get()).parts.length,before-strays.length,'清理只许动自己那块地上的件');
    // 基线＝清掉自己的残留之后"自己那块地之外"的件数；结尾必须回到这个数（一件别人的都没动）。
    const baseline=((await build.get()).parts||[]).filter(p=>!nearSite(p)).length;
    const seen=new Set(await page.evaluate(()=>window.__officeDebug.__scene.children
      .filter(c=>c.userData.buildId).map(c=>c.userData.buildId)));

    const anchor=[PLOT.x,PLOT.z];
    const aim=async(x,z)=>{await page.evaluate(([x,z])=>{const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,1,z);c.position.set(x,7,z+9);c.lookAt(k.target);c.updateMatrixWorld(true);},[x,z]);
      await sleep(300);};
    const point=async(x,y,z)=>{const p=await page.evaluate(([x,y,z])=>{
      const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
      const r=document.querySelector('.scene canvas').getBoundingClientRect();
      return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},[x,y,z]);
      await page.mouse.move(p.x,p.y);await sleep(250);return p;};

    // ① 走 UI 把两件都建出来（分开放：直梯个子高，摆一起会挡住传送点的射线）。
    await page.getByRole('button',{name:/打开部件库/}).click();
    await page.getByRole('tab',{name:'玩法',exact:true}).click();
    const spots={'直梯':[anchor[0]+6,anchor[1]+3],'传送点':[anchor[0],anchor[1]+3]};
    for(const label of ['直梯','传送点']){
      await page.getByRole('button',{name:label,exact:true}).click();
      const [sx,sz]=spots[label];
      await aim(sx,sz);
      const at=await point(sx,0,sz);
      await page.mouse.down();await page.mouse.up();
      await page.getByText('已保存 · 所有人可见',{exact:true}).waitFor({timeout:15000});
      const fresh=await page.evaluate(known=>{
        const now=window.__officeDebug.__scene.children.filter(c=>c.userData.buildId&&!known.includes(c.userData.buildId));
        const last=now[now.length-1];
        return last?[last.userData.buildId,+last.position.x.toFixed(2),+last.position.z.toFixed(2)]:null;
      },[...seen]);
      assert.ok(fresh,`${label} 点下去要真的出现在场景里`);
      seen.add(fresh[0]);
      console.log(`已建造 ${label} @ 屏幕 ${JSON.stringify(at)} → 世界 (${fresh[1]}, ${fresh[2]})`);
      await sleep(250);
    }
    const listed=mine(await build.get());
    console.log('正式存档里的新部件 '+JSON.stringify(listed.map(p=>[p.kind,p.x,p.y,p.z])));
    assert(listed.some(p=>p.kind==='ladder')&&listed.some(p=>p.kind==='teleport-pad'),
      '两件都要真的落进正式存档（后端目录如果是旧的，add 会回 400「没有这个部件」）');
    // 粒子条要真的上线了：传送点柱子上应该有 18 个点（一块就能用，所以一直是亮的）。
    const firstPad=listed.find(p=>p.kind==='teleport-pad');
    const firstBeam=await page.evaluate(id=>{
      const root=window.__officeDebug.__scene.getObjectByName('build-'+id);
      const points=root?.userData.teleportBeam;
      return points?{count:points.geometry.getAttribute('position').count,opacity:points.material.opacity}:null;
    },firstPad.id);
    assert(firstBeam,`正式站的传送点要有粒子条（${JSON.stringify(firstBeam)}）`);
    assert.equal(firstBeam.count,18,'粒子条 18 个点');
    assert.equal(firstBeam.opacity>0.9,true,'粒子条是亮的（一块就够用）');

    // ② 第二块传送点：**由页面自己建**（同一会话，不受轮询同步时序影响），然后点第一块。
    await page.getByRole('button',{name:'传送点',exact:true}).click();
    const [px2,pz2]=[anchor[0]-6,anchor[1]+3];
    await aim(px2,pz2);
    await point(px2,0,pz2);
    await page.mouse.down();await page.mouse.up();
    await page.getByText('已保存 · 所有人可见',{exact:true}).waitFor({timeout:15000});
    await sleep(500);
    const pads=mine(await build.get()).filter(p=>p.kind==='teleport-pad');
    assert(pads.length>=2,'两块传送点都要在存档里，实际 '+pads.length);
    // 顺手在正式站验一次"移动模式 Delete 删除选中"：拿**直梯**试（两块传送点摆好后，
    // 移动模式点传送点是"传过去"，不会选中它），删掉再 Ctrl+Z 恢复。
    await page.getByRole('button',{name:/移动/}).click();
    const ladder=mine(await build.get()).find(p=>p.kind==='ladder');
    const solidsBefore=await page.evaluate(()=>window.__officeDebug.__scene.children.filter(c=>c.userData.buildId).length);
    // 直梯现在很薄（0.6×3.78×**0.08**）：原来那套"斜着看、瞄准腰高"的射线会先打到梯子前面的地板。
    // 改成**正上方俯视**，再按"手柄里选中的到底是不是这根梯子"逐个候选点确认。
    await page.evaluate(([x,z])=>{const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,0,z);c.position.set(x,14,z+.001);c.lookAt(k.target);c.updateMatrixWorld(true);},[ladder.x,ladder.z]);
    await sleep(400);
    let selected=false;
    for(const [dx,y,dz] of [[0,3.7,0],[0,2.2,0],[0,1.2,0],[.26,1.6,0],[-.26,1.6,0],[0,3.7,.02],[0,3.7,-.02]]){
      const at=await point(ladder.x+dx,ladder.y+y,ladder.z+dz);
      await page.mouse.down();await page.mouse.up();
      await page.waitForTimeout(400);
      const ids=await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds);
      console.log('瞄准直梯 '+JSON.stringify([dx,y,dz])+' @屏幕 '+JSON.stringify([Math.round(at.x),Math.round(at.y)])+' → 选中 '+JSON.stringify(ids));
      if(ids.length===1&&ids[0]===ladder.id){selected=true;break;}
    }
    assert.ok(selected,'移动模式下点直梯本体要能选中它（薄梯子很容易被前面的地板抢走射线）');
    await page.waitForTimeout(600);
    const selectedBefore=await page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length);
    assert.equal(selectedBefore,1,'移动模式点直梯要选中它（实际选中 '+selectedBefore+' 件）');
    await page.keyboard.press('Delete');
    await page.waitForFunction(n=>window.__officeDebug.__scene.children.filter(c=>c.userData.buildId).length<=n,solidsBefore-1);
    await sleep(800);
    assert.equal(mine(await build.get()).filter(p=>p.kind==='ladder').length,0,
      'Delete 要真的把这件从正式存档里删掉');
    await page.keyboard.press('Control+z');
    await sleep(1200);
    assert.equal(mine(await build.get()).filter(p=>p.kind==='teleport-pad').length,pads.length,
      'Ctrl+Z 要把它恢复回来');
    console.log('正式站 Delete 删除 + Ctrl+Z 撤销通过');
    const from=pads[0], to=pads.find(p=>p.id!==from.id);
    console.log('两块传送点 '+JSON.stringify(pads.map(p=>[p.x,p.z]))+'，从 '+from.x+' 点向 '+to.x);

    // ③ 传送点面板自发光，点它会瞬移（不是走过去）。规则：**点哪一块就到哪一块**（一块就够）；
    //    已经站在这一块上再点它，才去最近的那一块。
    assert.equal(await page.evaluate(id=>{
      const root=window.__officeDebug.__scene.getObjectByName('build-'+id);
      return root.children.some(c=>c.material&&c.material.emissive&&c.material.emissive.getHexString()!=='000000');
    },from.id),true,'传送点面板要自发光');
    await page.getByRole('button',{name:/漫游/}).click();
    const startX=await page.evaluate(()=>window.__officeDebug.avatar.root.position.x);
    // 镜头对准这一块再点：投影落在画面中央，射线一定打在传送点本体上。
    await page.evaluate(([x,z])=>{const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,0.5,z);c.position.set(x,6,z+7);c.lookAt(k.target);c.updateMatrixWorld(true);},[from.x,from.z]);
    await sleep(400);
    const at=await point(from.x,from.y+0.3,from.z);
    const hovered=await page.evaluate(([x,y])=>window.__officeDebug.__pick(x,y),[at.x,at.y]);
    console.log('pad 屏幕点 '+JSON.stringify(at)+' 拾取 '+(hovered.parent||hovered.hit));
    await page.mouse.down();await page.mouse.up();
    await sleep(700);
    const after=await page.evaluate(()=>{
      const p=window.__officeDebug.avatar.root.position;return [+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2)];});
    console.log(`传送前 x=${startX.toFixed(2)} → 落点 ${JSON.stringify(after)}（点的就是 ${from.x},${from.z}）`);
    assert.equal(after[0],from.x,'单击传送点要立刻站到**点的那一块**上（一块就够，不需要配对）');
    assert.equal(after[2],from.z);
    // 站在这一块上再点它 → 去最近的那一块（正式站上真验一次"来回跳"）。
    await page.mouse.down();await page.mouse.up();
    await sleep(700);
    const hopped=await page.evaluate(()=>{
      const p=window.__officeDebug.avatar.root.position;return [+p.x.toFixed(2),+p.z.toFixed(2)];});
    console.log(`站在 ${from.x} 上再点它 → ${JSON.stringify(hopped)}（另一块在 ${to.x},${to.z}）`);
    assert.equal(hopped[0],to.x,'站在这一块上再点它 → 去最近的那一块');
    assert.equal(hopped[1],to.z);
    await page.screenshot({path:'../Build/teleport-live-build.png'});

    // ④ 服务端闸门（在正式站真发一次离格坐标）：存下来必须是整格。
    //    「部件永远整格」这条不变量靠 `build-store.mjs` 的 `cleanPart()` 兜底，所以旧版客户端就算照发
    //    毫米值也污染不了世界（用户 2026-10-09：「确保不会有步长不统一的部件 … 根源修复」）。
    const offGrid={action:'add',part:{kind:'block',rotation:0,x:PLOT.x+1.11,y:.105,z:PLOT.z+1.06,color:'#f3dfc5'}};
    const stored=(await build.post(offGrid)).changed;
    const onGrid=v=>Math.abs(v*4-Math.round(v*4))<1e-9;
    console.log('离格写入 '+JSON.stringify([PLOT.x+1.11,PLOT.z+1.06])+' → 正式存档 '+JSON.stringify([stored.x,stored.z]));
    assert.ok(stored&&onGrid(stored.x)&&onGrid(stored.z),'正式后端要把离格的 x/z 落回 0.25 网格');
    assert.equal(stored.y,.105,'y 是接触高度，原样保留');
    await build.post({action:'remove',id:stored.id,version:stored.version});
    await sleep(400);

    // ⑤ 收尾：把自己那块地上的件删干净，别留在正式世界里。
    for(let pass=0;pass<4;pass++){
      const left=mine(await build.get());
      if(!left.length)break;
      for(const part of left){await build.post({action:'remove',id:part.id,version:part.version});await sleep(400);}
    }
    assert.equal(mine(await build.get()).length,0,'验收用的几件要清干净');
    // 世界的其余部分一件都不能动。用"自己那块地之外"的件数比对：用户可能正在旁边施工，
    // 所以只断言"我没碰别人的"，并把两边数字写进失败信息里，便于区分并发编辑与本用例出错。
    const outside=json=>((json&&json.parts)||[]).filter(p=>!nearSite(p)).length;
    const rest=outside(await build.get());
    assert.equal(rest,baseline,`正式世界自己那块地之外的件数必须不变（开跑 ${baseline} → 现在 ${rest}；`
      +'如果这期间用户在别处施工，这个数字会变）');
    assert.deepEqual(errors,[]);
    console.log('PASS 正式站：直梯/传送点可点击建造、传送点可瞬移、离格写入被落格（验收件已删，世界总件数未变）');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
