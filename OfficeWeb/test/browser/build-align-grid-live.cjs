const {launch}=require('./playwright.cjs');
const assert=require('node:assert/strict');
const SITE='https://115.159.43.237';
/**
 * 正式站验收：「对齐网格」按钮真的能收拾**已经建好的**离格部件。
 *
 *   node test/browser/build-align-grid-live.cjs
 *
 * 起因为用户 2026-10-09 的追问「上线了吗 还是不行啊 是不是因为我已经创建的就不行？」——
 * 拖动步长的修复只管"以后怎么落点"，**老存档里那 63 件离格部件不会自己动**。本地用例
 * （`build-align-grid.cjs`）跑的是假存档，这条打**正式站**：登录 → 用正式接口在远处空地放两块
 * 离格方块（x/z 带毫米偏置）→ 刷新页面让它们进场景 → 移动模式 Shift 多选 → 点「对齐网格」→
 * 断言正式存档里 x/z 都回到 0.25 网格、y 一点没动 → 两次 Ctrl+Z 各自回原位 → 删掉验收件。
 *
 * 坑（和 `build-parts-live.cjs` 同源，别重踩）：①登录走页面自己的表单；②登录/选身份会冲掉
 * `?debug=1`，探针要重进一次才装得上；③"先捏一下你的角色"面板会盖住画布，要点掉；④两块
 * 1×1×1 方块**不能贴着放**（会互相重叠，Shift 点已选中的部件是"取消选择"）；⑤镜头要正上方俯视。
 * 这条用例还额外踩了正式站独有的三个坑（本地假存档都碰不到，全写进注释了）：**⑥"先捏一下你的
 * 角色"在页面稍后才挂上来**，早一步 `count()` 是 0，于是它带着 `role="dialog"` 留在页面上，
 * 而 `useBuildEditor` 一看到对话框就跳过整段键盘处理 —— **Ctrl+Z 静默失效**；⑦它那块
 * `LiveLookPreview` 画布压在场景画布正中（实测 368~598 × 315~602 被盖住），`__pick` 照样
 * 打得中部件、真实鼠标却点在预览画布上，所以落点要用 `elementFromPoint` 确认；⑧**Esc 在编辑态
 * 是"取消并回到漫游"**，想关面板必须**先按 Esc 再进移动模式**，反过来就一直在漫游里点。
 */
const NAME='对齐柜验收', PASSWORD='alignlive', OFF=120;
const sleep=ms=>new Promise(done=>setTimeout(done,ms));

/**
 * 点掉"先捏一下你的角色"。
 *
 * 它**可能在页面稍后才出现**（实测：刚进空间时还没有，等部件加载完才挂上来），所以这里先小等
 * 一会儿。这块面板一定要关掉：它正中间的 `LiveLookPreview` 画布压在场景画布上，而且它带
 * `role="dialog"` —— `useBuildEditor` 的键盘处理器看到页面上有对话框就**整段跳过**，
 * Ctrl+Z 会静默失效（本地假存档没有这块面板，只有正式站会踩到）。
 */
async function confirmLook(page){
  const dialog=page.getByRole('dialog',{name:'设置我的角色'});
  await dialog.waitFor({state:'visible',timeout:12000}).catch(()=>{});
  if(!await dialog.count())return false;
  await dialog.getByRole('button',{name:'就这样，进空间'}).click();
  await dialog.waitFor({state:'detached',timeout:15000});
  await sleep(500);
  return true;
}

(async()=>{
  const browser=await launch();
  try{
    const context=await browser.newContext({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    const page=await context.newPage();
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const build={get:async()=>await (await context.request.get(SITE+'/api/build')).json(),
      post:async data=>await (await context.request.post(SITE+'/api/build',{headers:{origin:SITE},data})).json()};
    const mine=json=>((json&&json.parts)||[]).filter(p=>p.kind==='block'&&p.x>=OFF-1);
    const onGrid=p=>Math.abs(p.x*4-Math.round(p.x*4))<1e-9&&Math.abs(p.z*4-Math.round(p.z*4))<1e-9;

    await page.goto(SITE+'/?debug=1');
    await page.waitForSelector('.account-card, .scene-shell',{timeout:30000});
    if(await page.locator('.account-card').count()){
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
    if(!await page.evaluate(()=>Boolean(window.__officeDebug))){
      await page.goto(SITE+'/?debug=1');
      await page.waitForTimeout(1500);
    }
    await confirmLook(page);

    // ① 用正式接口在远处空地放两块离格方块（x/z 带毫米偏置，y 也刻意离格）。
    for(const part of mine(await build.get())){await build.post({action:'remove',id:part.id,version:part.version});await sleep(400);}
    // POST 回的是「整份快照 + changed」，不是 `{part}`（踩过一次）。
    const off1=(await build.post({action:'add',part:{kind:'block',rotation:0,x:OFF+0.11,y:0.105,z:OFF+0.06,color:'#e9b8b5'}})).changed;
    await sleep(400);
    const off2=(await build.post({action:'add',part:{kind:'block',rotation:0,x:OFF+2.37,y:0.105,z:OFF+0.19,color:'#b4c5a0'}})).changed;
    await sleep(400);
    assert.equal(onGrid(off1),false,'验收件本身要是离格的（正式后端按毫米存，不做网格取整）');
    console.log('放好两块离格方块 '+JSON.stringify([off1.x,off2.x]));

    // ② 重新进页面让这两件进场景，然后移动模式 Shift 多选。
    await page.goto(SITE+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),off1.id,{timeout:60000});
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),off2.id,{timeout:60000});
    await page.waitForTimeout(1200);
    await confirmLook(page);
    assert.equal(await page.evaluate(()=>document.querySelectorAll('[role="dialog"]').length),0,
      '进编辑前页面上不能还留着对话框（它会挡住画布，还会让 Ctrl+Z 整段失效）');
    const point=async(x,y,z)=>{const p=await page.evaluate(([x,y,z])=>{
      const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
      const r=document.querySelector('.scene canvas').getBoundingClientRect();
      return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};},[x,y,z]);
      await page.mouse.move(p.x,p.y);await sleep(200);return p;};
    const sel=()=>page.evaluate(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds);

    // 先按 Esc 把可能开着的面板收掉，**然后再进移动模式**——Esc 在编辑态里是"取消并回到漫游"
    // （`useBuildEditor` 的 Escape 分支），顺序反了就会发现自己其实在漫游里点，怎么都选不中。
    await page.keyboard.press('Escape');
    await sleep(300);
    await page.getByRole('button',{name:/移动/}).click();
    const button=page.getByRole('button',{name:/对齐网格/});
    assert.equal(await button.count(),1,'正式站工具栏要有「对齐网格」按钮（没有就是产物没发上去）');
    assert.equal(await page.evaluate(()=>
      document.querySelector('.build-modes button[aria-pressed="true"]')?.textContent),'↔移动','真的在移动模式里');
    const aimAt=async(cx,cz)=>{
      await page.evaluate(([cx,cz])=>{const d=window.__officeDebug,c=d.__camera,k=d.controls();
        k.dispatchEvent({type:'start'});k.target.set(cx,0,cz);c.position.set(cx,16,cz+.001);c.lookAt(k.target);c.updateMatrixWorld(true);},[cx,cz]);
      await sleep(450);};
    /**
     * 点一件：**把它摆到画面上没有东西压着的地方再点**。
     *
     * 正式站和本地假存档最大的差别是**页面上真有一堆面板**：刚注册的账号进来会带着
     * 「选择角色」的捏人面板，它正中间那块 `LiveLookPreview` 画布就压在场景画布上
     * （实测 1078×852 的画布里，368~598 × 315~602 被它盖住）。这时 `__pick`（直接射线）照样
     * 打得中部件，真实鼠标却点在预览画布上——现象是"拾取命中了却选不中、连提示都没有"。
     * 所以这里把镜头横移一点，让目标投到面板右边，并用 `elementFromPoint` 确认落点真的在
     * `.scene` 画布上（`.scene` 是场景画布的祖先，那块预览画布不在里面，正好能区分）。
     */
    const clickPart=async(part,shift)=>{
      let hit=null;
      for(const dx of [0,-2,-4,4,-6,6,-8]){
        await aimAt(part.x+dx,part.z);
        const p=await point(part.x,0.6,part.z);
        const where=await page.evaluate(([x,y])=>{
          const el=document.elementFromPoint(x,y);
          return {tag:el?.tagName||null,scene:Boolean(el?.closest('.scene'))};},[p.x,p.y]);
        if(where.tag==='CANVAS'&&where.scene){hit={p,dx};break;}
      }
      assert.ok(hit,'点不到部件：落点被面板/预览画布压住了');
      console.log(`点 (${part.x},${part.z}) → 屏幕 ${JSON.stringify([Math.round(hit.p.x),Math.round(hit.p.y)])}`+
        `（镜头横移 ${hit.dx}m 避开面板）`);
      if(shift)await page.keyboard.down('Shift');
      await page.mouse.down();await page.mouse.up();
      if(shift)await page.keyboard.up('Shift');
      await sleep(400);
      console.log('  点击后 选中='+JSON.stringify(await sel())+' 提示='+
        await page.evaluate(()=>document.querySelector('.build-hint')?.textContent||'(无)'));
    };
    await clickPart(off1,false);
    await page.waitForFunction(id=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.includes(id),off1.id,{timeout:15000});
    await clickPart(off2,true);
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length===2,{timeout:15000});
    console.log('已选中 '+JSON.stringify(await sel()));

    // ③ 点「对齐网格」，等正式存档真的改完。
    await button.click();
    const waitOnGrid=async()=>{
      for(let i=0;i<40;i++){
        const now=mine(await build.get());
        if(now.length===2&&now.every(onGrid))return now;
        await sleep(400);
      }
      return mine(await build.get());
    };
    const aligned=await waitOnGrid();
    const a1=aligned.find(p=>p.id===off1.id), b1=aligned.find(p=>p.id===off2.id);
    assert(onGrid(a1),`第一件要回到网格（现在 ${a1&&a1.x},${a1&&a1.z}）`);
    assert(onGrid(b1),`第二件要回到网格（现在 ${b1&&b1.x},${b1&&b1.z}）`);
    assert.equal(a1.y,0.105,'高度不动（y 是接触高度，强行取整会让叠着的东西浮起/陷进去）');
    assert.equal(b1.y,0.105);
    console.log('对齐后 '+JSON.stringify([a1.x,a1.z,b1.x,b1.z])+'（原 '+JSON.stringify([off1.x,off1.z,off2.x,off2.z])+'）');

    // ④ Ctrl+Z 逐件回退到原来的毫米偏置。
    await page.keyboard.press('Control+z');await sleep(900);
    await page.keyboard.press('Control+z');await sleep(1200);
    const undone=mine(await build.get());
    assert.equal(undone.find(p=>p.id===off1.id).x,off1.x,'撤销要把第一件放回原位');
    assert.equal(undone.find(p=>p.id===off2.id).x,off2.x,'撤销要把第二件放回原位');
    await page.screenshot({path:'../Build/align-grid-live.png'});
    assert.deepEqual(errors,[],'页面不该有报错：'+errors.join(' | '));

    // ⑤ 收尾：验收件删干净。
    for(let pass=0;pass<4;pass++){
      const left=mine(await build.get());
      if(!left.length)break;
      for(const part of left){await build.post({action:'remove',id:part.id,version:part.version});await sleep(400);}
    }
    assert.equal(mine(await build.get()).length,0,'验收件要清干净');
    console.log('PASS 正式站对齐网格：选中的离格部件一键回到 0.25 网格、高度不动、Ctrl+Z 还原');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
