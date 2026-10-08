const {chromium}=require('./playwright.cjs');
const {createServer}=require('vite');
const react=require('@vitejs/plugin-react');
const {resolve}=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const vite=await createServer({configFile:false,root:resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
 await vite.listen();const browser=await chromium.launch({channel:'msedge',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:1000}});
  await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/`);
  const rows=await page.evaluate(async()=>{
   const {renderExpressionPortrait}=await import('/src/expressionPortrait.ts');
   const {ACCESSORIES,SLOT_ORDER,DEFAULT_APPEARANCE}=await import('/src/look.ts');
   const rows=[];
   for(const slot of SLOT_ORDER) for(const item of ACCESSORIES[slot]){
    if(!item.mesh)continue;
    const image=await renderExpressionPortrait({...DEFAULT_APPEARANCE,accessories:{...DEFAULT_APPEARANCE.accessories,[slot]:item.id}});
    rows.push({label:item.label,image});
   }
   return rows;
  });
  assert.equal(rows.length,19);
  assert.equal(new Set(rows.map(r=>r.image)).size,19);
  await page.setContent(`<style>body{background:#edf0e9;font:14px 'Microsoft YaHei';margin:18px}main{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}figure{margin:0;background:#fff;border-radius:14px;text-align:center;padding:8px}img{width:180px;height:180px;object-fit:contain}figcaption{padding:6px}</style><h2>19 件透明配饰 · 独立组装</h2><main>${rows.map(r=>`<figure><img src="${r.image}"><figcaption>${r.label}</figcaption></figure>`).join('')}</main>`);
  await page.screenshot({path:resolve('../Build/expression-all-accessories.png'),fullPage:true});
  console.log('PASS all 19 independently selectable accessory layers produce distinct portraits');
 }finally{await browser.close();await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
