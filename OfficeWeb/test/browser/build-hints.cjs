// 三维提示胶囊的验收（安装模式的旋转快捷键 + 接点，饼菜单式排布）。
//
//   node test/browser/build-hints.cjs              # 本地
//   BOX_LIVE=1 node test/browser/build-hints.cjs   # 正式站
//
// 断言的是这件事：胶囊小（屏幕 22~32px）、有不透明深底与浅色文字、四个方位槽
// （左/上/右/下）**彼此不重叠**，而且移动模式已经没有任何提示贴片。
// 截图：../Build/hint-*.png
const {launch}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const assert=require('node:assert/strict');
const live=process.env.BOX_LIVE?'live':'local';
(async()=>{
  const {createBuildStore}=await import('../../build-store.mjs');
  const store=createBuildStore(path.join(fs.mkdtempSync(path.join(os.tmpdir(),'hints-')),'world.json'));
  const user={id:'hints',name:'提示验收',role:'visitor',lookConfirmed:true};
  const pillar=store.mutate({action:'add',part:{kind:'pillar',x:20,y:0,z:0,rotation:0,color:'#e9b8b5'}},user).changed;
  const vite=live==='local'?await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}}):null;
  if(vite)await vite.listen();
  const browser=await launch();
  try {
    const page=await browser.newPage({viewport:{width:1500,height:950},ignoreHTTPSErrors:true});
    page.setDefaultTimeout(15000);
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
    await page.goto((vite?'http://127.0.0.1:'+vite.httpServer.address().port:'https://115.159.43.237')+'/?debug=1');
    await page.waitForFunction(id=>Boolean(window.__officeDebug?.__scene.getObjectByName('build-'+id)),pillar.id);
    const point=async(x,y,z)=>{
      const p=await page.evaluate(([x,y,z])=>{
        const d=window.__officeDebug,v=d.__camera.position.clone().set(x,y,z).project(d.__camera);
        const r=document.querySelector('.scene canvas').getBoundingClientRect();
        return{x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2};
      },[x,y,z]);
      await page.mouse.move(p.x,p.y);return p;
    };
    const aim=async(target,camera)=>page.evaluate(([t,c])=>{
      const d=window.__officeDebug,k=d.controls();
      k.dispatchEvent({type:'start'});k.target.set(...t);
      d.__camera.position.set(...c);d.__camera.lookAt(k.target);d.__camera.updateMatrixWorld(true);
    },[target,camera]);
    // 读一张提示贴片：画布是药丸吗？屏幕高度多少？屏幕上占多大矩形（用来查重叠）？
    const measure=(group)=>page.evaluate(group=>{
      const canvas=document.querySelector('.scene canvas').getBoundingClientRect();
      const camera=window.__officeDebug.__camera;
      const panel=window.__officeDebug.__scene.getObjectByName(group);
      const sprites=[];
      panel.traverse(node=>{
        if(!node.isSprite) return;
        const image=node.material.map?.image;
        const ctx=image?.getContext?.('2d');
        let opaque=0,light=0,dark=0,total=0;
        if(ctx){
          const data=ctx.getImageData(0,0,image.width,image.height).data;
          for(let y=2;y<image.height-2;y+=3)for(let x=2;x<image.width-2;x+=3){
            const i=(y*image.width+x)*4;total++;
            if(data[i+3]>120){opaque++;
              const lum=(data[i]+data[i+1]+data[i+2])/3;
              if(lum>190)light++;else if(lum<70)dark++;}
          }
        }
        const world=node.getWorldPosition(node.position.clone());
        const distance=camera.position.distanceTo(world);
        const height=node.scale.y/(2*distance*Math.tan(camera.fov*Math.PI/360))*canvas.height;
        const width=height*(Number(node.userData.aspect)||4);
        const screen=world.clone().project(camera);
        sprites.push({shortcut:node.userData.shortcut,aspect:Number(node.userData.aspect)||0,
          pixels:image?[image.width,image.height]:null,height:Math.round(height),
          depthTest:node.material.depthTest,order:node.renderOrder,
          center:[Math.round(canvas.left+(screen.x+1)*canvas.width/2),Math.round(canvas.top+(1-screen.y)*canvas.height/2)],
          rect:[width,height],
          opaque:total?Math.round(opaque/total*100):0,light:total?Math.round(light/total*100):0,dark:total?Math.round(dark/total*100):0});
      });
      return sprites;
    },group);
    const checkChips=(sprites,label)=>{
      assert(sprites.length,label+': 找到提示贴片');
      for(const chip of sprites){
        assert(chip.aspect>2.2,label+' 「'+chip.shortcut+'」是细长胶囊（比例 '+chip.aspect.toFixed(1)+'）');
        assert(chip.opaque>60,label+' 「'+chip.shortcut+'」有不透明底（'+chip.opaque+'%）');
        assert(chip.dark>10,label+' 「'+chip.shortcut+'」底色是深色（'+chip.dark+'%）');
        assert(chip.light>=1,label+' 「'+chip.shortcut+'」画出了浅色文字（'+chip.light+'%）');
        // 用户要求「不要遮住」：贴片必须浮在部件与环线之上，不能被预部件切掉一半。
        assert.equal(chip.depthTest,false,label+' 「'+chip.shortcut+'」不吃深度（不被部件遮住）');
        assert(chip.order>=900,label+' 「'+chip.shortcut+'」renderOrder ≥ 900（'+chip.order+'）');
        // 用户要求「不要太大 太抢戏」：屏幕上 22~32px 高。
        assert(chip.height>=22&&chip.height<=32,label+' 「'+chip.shortcut+'」足够小（'+chip.height+'px）');
      }
    };
    // ① 移动模式：用户要求去掉那句提示，手柄上不该有任何贴片
    await aim([20,2.2,0],[22.2,4.4,4.6]);
    await page.getByRole('button',{name:/移动/}).click();
    const hand=await point(20,1.5,.25);
    await page.mouse.click(hand.x,hand.y);
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-move-handle').userData.selectedIds?.length===1);
    await page.waitForTimeout(300);
    assert.deepEqual(await measure('build-move-handle'),[],'移动模式不再有提示贴片');
    // ② 安装模式：饼菜单式排布的旋转快捷键与接点
    await page.getByRole('button',{name:/安装/}).click();
    await aim([20,.6,0],[21,5.5,7]);
    await point(20.2,0,.4);
    await page.waitForFunction(()=>window.__officeDebug.__scene.getObjectByName('build-rotation-guide').visible);
    await page.waitForTimeout(300);
    const chips=await measure('build-rotation-guide');
    await page.locator('.scene canvas').screenshot({path:path.join('..','Build','hint-install-'+live+'.png'),
      clip:await page.evaluate(()=>{
        const d=window.__officeDebug,r=document.querySelector('.scene canvas').getBoundingClientRect();
        const p=d.__scene.getObjectByName('build-rotation-guide').position.clone().project(d.__camera);
        const width=Math.min(900,r.width),height=Math.min(620,r.height);
        const cx=r.left+(p.x+1)*r.width/2,cy=r.top+(1-p.y)*r.height/2;
        return {x:Math.min(Math.max(cx-width/2,r.left),r.left+r.width-width),
          y:Math.min(Math.max(cy-height/2,r.top),r.top+r.height-height),width,height};
      })});
    checkChips(chips,'安装模式');
    for(const [shortcut] of [['Q / R · 左右转'],['X · 前后翻'],['Z · 侧翻']])
      assert(chips.some(c=>c.shortcut===shortcut),'旋转快捷键：'+shortcut);
    assert(chips.some(c=>c.shortcut?.startsWith('C · ')),'接点胶囊');
    // 四个方位槽（左/上/右/下）互不重叠：相邻两张贴片的屏幕矩形不许相交。
    for(let i=0;i<chips.length;i++)for(let j=i+1;j<chips.length;j++){
      const [ax,ay]=chips[i].center,[bx,by]=chips[j].center;
      const [aw,ah]=chips[i].rect,[bw,bh]=chips[j].rect;
      const overlap=Math.abs(ax-bx)<(aw+bw)/2&&Math.abs(ay-by)<(ah+bh)/2;
      assert(!overlap,'「'+chips[i].shortcut+'」与「'+chips[j].shortcut+'」不重叠');
    }
    // 方位分布：三条环提示按住主导轴归类，必须分别落在左/上/右三个槽上（饼状排布，
    // 而不是像旧版那样全堆在环的上方互相压）；接点贴片另有位置（贴着高亮边）。
    const guideCenter=await page.evaluate(()=>{
      const d=window.__officeDebug,r=document.querySelector('.scene canvas').getBoundingClientRect();
      const p=d.__scene.getObjectByName('build-rotation-guide').position.clone().project(d.__camera);
      return [r.left+(p.x+1)*r.width/2,r.top+(1-p.y)*r.height/2];
    });
    const slotOf=chip=>{
      const dx=chip.center[0]-guideCenter[0],dy=chip.center[1]-guideCenter[1];
      if(Math.abs(dx)>Math.abs(dy)*1.5)return dx<0?'left':'right';
      if(Math.abs(dy)>Math.abs(dx)*1.5)return dy<0?'up':'down';
      return 'neither';
    };
    const ringChips=chips.filter(c=>c.shortcut!=='C · 自动');
    const slots=ringChips.map(slotOf);
    assert.deepEqual([...slots].sort(),['left','right','up'],'三条旋转提示各占一个方位');
    // 接点贴片占右上斜槽：与"上""右"各 45°，不会挤在一起。
    const anchor=chips.find(c=>c.shortcut==='C · 自动');
    const ax=anchor.center[0]-guideCenter[0],ay=anchor.center[1]-guideCenter[1];
    assert(ax>0&&ay<0,'接点贴片在右上斜槽');
    assert(Math.abs(Math.abs(ax/ay)-1)<.35,'接点贴片与"上/右"各差约 45°（比值 '+(ax/ay).toFixed(2)+'）');
    // 贴片不许压到底部工具栏那条带上（画布 72% 高度以下都会和工具栏打架）。
    const canvasBox=await page.evaluate(()=>{
      const r=document.querySelector('.scene canvas').getBoundingClientRect();
      return [r.left,r.top,r.width,r.height];
    });
    const toolbarTop=canvasBox[1]+canvasBox[3]*.72;
    for(const chip of chips)
      assert(chip.center[1]+chip.rect[1]/2<toolbarTop,
        '「'+chip.shortcut+'」不落在底部工具栏带里（y '+Math.round(chip.center[1])+' < '+Math.round(toolbarTop)+'）');
    assert.deepEqual(errors,[]);
    console.log('PASS hint chips',JSON.stringify({chips:chips.map((c,i)=>c.shortcut+' '+c.height+'px')}));
  } finally {await browser.close();if(vite)await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

