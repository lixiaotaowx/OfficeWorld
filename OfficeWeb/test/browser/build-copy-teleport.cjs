const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'copy-drag-')),'world.json'));
  const user={id:'copy-teleport',name:'复制传送验收',role:'visitor',lookConfirmed:true};
  const add=part=>store.mutate({action:'add',part:{rotation:0,...part}},user).changed;
  // 全部摆在初始岛屿之外的空地上：原场景的 67 件固定几何会挡住射线。
  const source=add({kind:'pillar',x:80,y:0,z:0,color:'#e9b8b5'});
  const padA=add({kind:'teleport-pad',x:88,y:0,z:0,color:'#b4c5a0'});
  const padB=add({kind:'teleport-pad',x:94,y:0,z:0,color:'#b9c9df'});
  const vite=await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
  await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.routeWebSocket('**/socket.io/**',s=>s.close());
    await page.route('**/socket.io/**',r=>r.fulfill({status:503,body:'isolated'}));
    await page.route('**/api/**',async r=>{
      const url=new URL(r.request().url());let json={};
      if(url.pathname==='/api/auth/me')json={user};
      if(url.pathname==='/api/build') {
        const cmd=r.request().method()==='POST'?r.request().postDataJSON():null;
        try{json=cmd?store.mutate(cmd,user):store.snapshot();}
        catch(e){return r.fulfill({status:400,json:{error:e.message}});}
      }
      await r.fulfill({json});
    });
    const base='http://127.0.0.1:'+vite.httpServer.address().port;
    await page.goto(base+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),source.id);
    // 正上方俯视：射线垂直落下，绝不会被原场景的横梁/立柱挡在中间。
    const aim=async(x,z)=>page.evaluate(([x,z])=>{
      const d=window.__officeDebug,c=d.__camera,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(x,0,z);c.position.set(x,14,z+.001);c.lookAt(k.target);c.updateMatrixWorld(true);
    },[x,z]);
    const point=async(x,y,z)=>{
      const p=await page.evaluate(([x,y,z])=>{
        const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();
        return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
      },[x,y,z]);
      await page.mouse.move(p.x,p.y);return p;
    };
    const click=async(x,y,z)=>{
      await point(x,y,z);
      // 组件自己的 pointerdown 处理要先记下指针位置；`mouse.click` 的两个事件挨太近会漏掉。
      await page.mouse.down();await page.mouse.up();
    };
    const handle=()=>page.evaluate(()=>{
      const g=window.__officeDebug.__scene.getObjectByName('build-move-handle');
      return {following:Boolean(g.userData.copyFollowing),drop:Boolean(g.userData.copyDrop),
        ids:[...g.userData.selectedIds],draft:g.userData.draft?[g.userData.draft.x,g.userData.draft.z]:null};
    });
    // 只数自己摆的那几件立柱：默认模板里本来就有别的立柱。
    const pillars=()=>store.snapshot().parts.filter(p=>p.kind==='pillar'&&p.x>=60).map(p=>p.x).sort((a,b)=>a-b);
    const waitSelected=n=>page.waitForFunction(
      n=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds.length===n,n);
    const settle=async()=>{
      await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.copyFollowing===false);
      await page.getByText('已保存 · 所有人可见',{exact:true}).waitFor();
    };

    await page.getByRole('button',{name:/移动/}).click();
    await aim(80,0);

    // ① Shift+D：副本立刻出现在原地，然后跟着鼠标走，单击放下。
    await click(80,1.5,.25);
    await waitSelected(1);
    await page.keyboard.press('Shift+d');
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.copyFollowing===true);
    // Shift+D 是背着服务端逐件复制的，等这一组的每一件都复制完再看存档。
    await page.waitForTimeout(1500);
    assert.deepEqual(pillars(),[80,80],'Shift+D 立刻在原地多一件副本');
    // 鼠标往 +x 挪一段：副本必须跟过去（落点按 25 厘米吸附，所以只断言方向与吸附）。
    await point(86,0,0);
    await page.waitForFunction(()=>{const d=window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.draft;return Boolean(d)&&d.x!==80;});
    const aimed=await handle();
    assert(aimed.draft[0]>80,'副本跟着鼠标往 +x 走');
    assert.equal(Math.round(aimed.draft[0]/.25*4)%4,0,'落点按 25 厘米吸附');
    assert.equal(aimed.drop,true,'鼠标挪出半格后副本算"已挪走"');
    await click(aimed.draft[0],0,aimed.draft[1]);
    await settle();
    assert.deepEqual(pillars(),[80,aimed.draft[0]],'原件留在 80，副本落到新位置');
    assert.equal((await handle()).ids.length,1,'放下后手柄还在，选中的是副本');
    await page.screenshot({path:'../Build/copy-drag-'+(process.env.BOX_LIVE?'live':'local')+'.png'});
    const movedCopy=aimed.draft[0];

    // ② 多选复制：Shift 加选原件，Shift+D 一次复制两件并整组跟着鼠标走。
    await page.keyboard.down('Shift');await click(80,1.5,.25);await page.keyboard.up('Shift');
    await waitSelected(2);
    await page.keyboard.press('Shift+d');
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.copyFollowing===true);
    await page.waitForTimeout(1500);
    assert.deepEqual(pillars(),[80,80,movedCopy,movedCopy],'整组复制：两件都在原位多了一份');
    await point(92,0,0);
    await page.waitForFunction(()=>{const d=window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.draft;return Boolean(d)&&d.x!==80;});
    const group=await handle();
    await click(group.draft[0],0,group.draft[1]);
    await settle();
    // 整组副本都在原地各多一份；接下来用手柄整组拖走，验证位移一致（保持相对位置）。
    assert.deepEqual(pillars(),[80,80,movedCopy,movedCopy],'整组复制：两件都在原位多了一份');
    await waitSelected(2);
    const before=store.snapshot().parts.filter(p=>p.kind==='pillar'&&p.x>=60).map(p=>p.x).sort((a,b)=>a-b);
    const grip=async()=>page.evaluate(()=>{
      const d=window.__officeDebug,g=d.__scene.getObjectByName('build-move-handle');
      g.updateMatrixWorld(true);
      const t=g.children[0].controls,r=g.children[1].controls,s=g.children[2].controls;
      const rect=document.querySelector('.scene canvas').getBoundingClientRect();
      const center=d.__scene.getObjectByName('build-move-pivot').position.clone().project(d.__camera);
      const cx=rect.left+(center.x+1)*rect.width/2,cy=rect.top+(1-center.y)*rect.height/2;
      for(let dy=-140;dy<=140;dy+=6)for(let dx=-140;dx<=140;dx+=6){
        if(Math.hypot(dx,dy)<40)continue;
        const x=cx+dx,y=cy+dy,p={x:(x-rect.left)/rect.width*2-1,y:-(y-rect.top)/rect.height*2+1,button:0};
        t.pointerHover(p);r.pointerHover(p);s.pointerHover(p);
        if(t.axis==='X')return{x,y};
      }
      throw Error('找不到手柄的 X 轴');
    });
    const spot=await grip();
    await page.mouse.move(spot.x,spot.y);
    await page.mouse.down();
    await page.mouse.move(spot.x+90,spot.y,{steps:10});
    await page.mouse.up();
    await page.getByText('已保存 · 所有人可见',{exact:true}).waitFor();
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.working===false);
    const after=store.snapshot().parts.filter(p=>p.kind==='pillar'&&p.x>=60).map(p=>p.x).sort((a,b)=>a-b);
    const moves=after.map((x,i)=>x-before[i]).filter(n=>Math.abs(n)>.001);
    assert.equal(moves.length,2,'整组两件都动了');
    assert(Math.abs(moves[0]-moves[1])<.001,'整组位移一致，相对位置不变');
    await page.screenshot({path:'../Build/copy-drag-multi-'+(process.env.BOX_LIVE?'live':'local')+'.png'});

    // ③ 移动模式下 Delete 删除选中：整组一起删（服务端逐件删），Ctrl+Z 能整组恢复。
    const pillarsAt=()=>store.snapshot().parts.filter(p=>p.kind==='pillar'&&p.x>=60).length;
    const kept=pillarsAt();
    await waitSelected(2);
    await page.keyboard.press('Delete');
    // 底部那句"已删除 N 件"会被"正在保存…/已保存 · 所有人可见"这条状态覆盖掉，
    // **不能等它出现**（踩过：等它必超时）；等真实结果就行。
    await page.waitForTimeout(1500);
    const beforeUndo=pillarsAt();
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(900);
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(900);
    assert.equal(beforeUndo,kept-2,'Delete 要把整组两件都删掉');
    assert.equal(pillarsAt(),kept,'Ctrl+Z 要把整组恢复回来');
    // 单件删除 + Backspace 也要能用。
    await page.getByRole('button',{name:/移动/}).click();
    await click(80,1.5,.25);
    await waitSelected(1);
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(1500);
    assert.equal(pillarsAt(),kept-1,'Backspace 也要能删单件');
    console.log('已删除单件/整组并撤销恢复通过');

    // ④ 传送点：**在任何地方点它 → 直接站到点的那一块上**（一块就够用），并面向来路。
    await page.getByRole('button',{name:/漫游/}).click();
    assert.equal(await page.evaluate(id=>{
      const root=window.__officeDebug.__scene.getObjectByName('build-'+id);
      return root.children.some(c=>c.material&&c.material.emissive&&c.material.emissive.getHexString()!=='000000');
    },padB.id),true,'传送点的面板是自发光材质');
    // 放一个确定的出发点（-x 一侧），落点朝向才可断言。
    await page.evaluate(()=>window.__officeDebug.avatar.teleportTo({x:80,y:0,z:0},0));
    await aim(91,0);
    await click(88,.3,0);
    await page.waitForFunction(()=>Math.abs(window.__officeDebug.avatar.root.position.x-88)<.01);
    const landed=await page.evaluate(()=>{
      const p=window.__officeDebug.avatar.root.position,r=window.__officeDebug.avatar.root.rotation;
      return {x:+p.x.toFixed(3),y:+p.y.toFixed(3),z:+p.z.toFixed(3),yaw:+r.y.toFixed(3)};
    });
    assert.equal(landed.x,88,'点的就是 88 那一块，落点就是它（不是"最近的另一块"）');
    assert.equal(landed.z,0);
    // 从 -x 过来的，落地要面向来路 = 朝 -x（atan2(80-88,0) = -π/2）。
    assert(Math.abs(landed.yaw+Math.PI/2)<.001,'面向来路：从 -x 过来的朝 -x 回头看');
    await page.screenshot({path:'../Build/teleport-'+(process.env.BOX_LIVE?'live':'local')+'.png'});

    // ④ 已经站在 88 上再点它 → 去最近的那一块 94（人多时来回跳）；站在 94 上点它再跳回来。
    await click(88,.3,0);
    await page.waitForFunction(()=>Math.abs(window.__officeDebug.avatar.root.position.x-94)<.01);
    const hopped=await page.evaluate(()=>({x:+window.__officeDebug.avatar.root.position.x.toFixed(3),
      yaw:+window.__officeDebug.avatar.root.rotation.y.toFixed(3)}));
    assert.equal(hopped.x,94,'站在这一块上再点它 → 去最近的那一块');
    assert(Math.abs(hopped.yaw+Math.PI/2)<.001,'跳过去的朝向是来路（-x）');
    await click(94,.3,0);
    await page.waitForFunction(()=>Math.abs(window.__officeDebug.avatar.root.position.x-88)<.01);
    const back=await page.evaluate(()=>{
      const p=window.__officeDebug.avatar.root.position,r=window.__officeDebug.avatar.root.rotation;
      return {x:+p.x.toFixed(3),z:+p.z.toFixed(3),yaw:+r.y.toFixed(3)};
    });
    assert.equal(back.x,88);assert.equal(back.z,0);
    assert(Math.abs(back.yaw-Math.PI/2)<.001,'回程朝向来路（+x）');

    // ⑤ 传送点的增删：漫游/安装模式点它是"传过去"（上面刚验过），要删/挪就切**拆除**模式点它
    //    （那里传送点是普通部件；移动模式点它是"选中来挪动"，也不再传送）。
    const padsNow=()=>store.snapshot().parts.filter(p=>p.kind==='teleport-pad'&&p.x>=80).length;
    const padsBefore=padsNow();
    await page.getByRole('button',{name:/拆除/}).click();
    await aim(91,0);
    await click(88,.3,0);
    await page.waitForFunction(n=>window.__officeDebug.__scene.children.filter(c=>c.userData.buildId).length<=n,
      await page.evaluate(()=>window.__officeDebug.__scene.children.filter(c=>c.userData.buildId).length));
    await page.waitForTimeout(600);
    assert.equal(padsNow(),padsBefore-1,'拆除模式点传送点要能把它删掉');
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(900);
    assert.equal(padsNow(),padsBefore,'Ctrl+Z 要把传送点恢复回来');
    console.log('传送点拆除 + 撤销通过');

    assert.deepEqual(errors,[]);
    console.log('PASS Shift+D 拖拽复制（单件/多选）、单击放下、移动模式 Delete 删除、传送点传送与拆除');
  }finally{await browser.close();await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
