const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const {launch}=require('./playwright.cjs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const vite=await createServer({configFile:false,root:path.resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
 await vite.listen();
 const base='http://127.0.0.1:'+vite.httpServer.address().port;
 const browser=await launch();
 try{
   const page=await browser.newPage({viewport:{width:1680,height:1200}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/test/prop-gallery.html');
   await page.waitForFunction(()=>window.__ready===true);
   // 画廊渲染的是 catalog.slice(20)：数量跟着目录长，不能再写死（加过楼梯/屋顶/流动箭头）。
   const rendered=await page.evaluate(()=>window.__models.length);
   assert(rendered>20);
   assert.equal(await page.locator('article img').count(),rendered);
   await page.screenshot({path:'../Build/lounge-props-gallery.png',fullPage:true});
   await page.goto(base+'/test/build-props-harness.html');
   await page.getByRole('button',{name:/打开部件库/}).click();
   const {catalog}=await import('../../build-store.mjs');
   const categories=[...new Set(catalog.map(item=>item.category))];
   const tabs=await page.getByRole('tab').allTextContents();
   assert.deepEqual(tabs,categories,'分类页签跟着目录走（加过楼梯/屋顶/玩法等）');
   for(const category of tabs){
     await page.getByRole('tab',{name:category,exact:true}).click();
     await page.waitForFunction(()=>[...document.querySelectorAll('.build-part')].every(e=>e.querySelector('img')?.complete));
     assert(await page.locator('.build-part').count()>0);
   }
   await page.getByRole('tab',{name:'桌面',exact:true}).click();
   await page.getByRole('button',{name:'爆米花桶',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.__settings.kind),'popcorn');
   await page.getByLabel('搜索部件').fill('灯');
   assert.equal(await page.locator('.build-part').count(),5);
   await page.getByRole('button',{name:'暖光桌灯',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.__settings.kind),'table-light');
   await page.getByRole('button',{name:'颜色 雾蓝',exact:true}).click();
   assert.equal(await page.evaluate(()=>window.__settings.color),'#b9c9df');
   await page.getByRole('tab',{name:'桌面',exact:true}).click();
   for(const width of [1600,1000,520]){
     await page.setViewportSize({width,height:850});
     const rect=await page.locator('.build-ui').boundingBox();
     assert(rect.height<180,`toolbar grew to ${rect.height}`);
     assert(rect.x>=0 && rect.x+rect.width<=width);
     await page.screenshot({path:`../Build/lounge-props-toolbar-${width}.png`});
   }
   assert.deepEqual(errors,[]);
   console.log('PASS rendered models ('+rendered+'); '+tabs.length+' categories; search, selection, recolor; compact toolbar at 1600/1000/520');
 }finally{await browser.close();await vite.close();}
})();
