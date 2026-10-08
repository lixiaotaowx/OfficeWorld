const { chromium }=require('./playwright.cjs');
const { createServer }=require('vite');
const react=require('@vitejs/plugin-react');
const fs=require('node:fs');
const { resolve }=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const vite=await createServer({configFile:false,root:resolve('.'),plugins:[react()],server:{host:'127.0.0.1',port:0}});
 await vite.listen();const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1260,height:840}});
  await page.goto(`http://127.0.0.1:${vite.httpServer.address().port}/`);
  const available=['happy','busy','sleepy','focused','wave','away'].filter(n=>fs.existsSync(resolve('public/assets/avatars/expressions-v2',n+'.png')));
  const rows=await page.evaluate(async available=>{
   const {renderExpressionPortrait,EXPRESSION_LABELS}=await import('/src/expressionPortrait.ts');
   const {resolveAppearance}=await import('/src/look.ts');
   const rows=[];
   for(const [index,expression] of available.entries()) {
    for(const equipped of [false,true]) {
     const look=resolveAppearance({color:equipped?['navy','sage','rose','snow','mint','lilac'][index]:'kraft',expression,
      accessories:{glasses:equipped?'black':'none',hat:equipped?['beret','cap','beanie','tophat','straw','party'][index]:'none',hair:'none',beard:equipped&&index===3?'mustache':'none'}});
     const url=await renderExpressionPortrait(look, expression);
     const image=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=url});
     const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.drawImage(image,0,0);
     const data=x.getImageData(0,0,512,512).data;
     let transparent=0,partial=0,opaque=0;
     for(let i=3;i<data.length;i+=4){if(data[i]===0)transparent++;else if(data[i]>=250)opaque++;else partial++;}
     rows.push({expression,label:EXPRESSION_LABELS[expression],equipped,url,transparent,partial,opaque});
    }
   }
   return rows;
  },available);
  for(const row of rows){assert.ok(row.transparent>512*512*.25);assert.ok(row.opaque>50000);assert.ok(row.partial>100);}
  await page.setContent(`<style>body{margin:0;padding:24px;background:#e9e6de;font:15px 'Microsoft YaHei';color:#303b31}h1{font-size:24px}main{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.tile{border-radius:18px;text-align:center;background:#f6f3ed;padding:7px}.tile.dark{background:#293644;color:#eee}img{width:100%;display:block}.caption{padding-bottom:8px}</style><h1>薄片尺子 · 透明表情与配饰组装</h1><main>${[false,true].map(e=>rows.filter(r=>r.equipped===e).map(r=>`<div class="tile ${e?'dark':''}"><img src="${r.url}"><div class="caption">${r.label}</div></div>`).join('')).join('')}</main>`);
  await page.screenshot({path:resolve('../Build/expression-assembly.png'),fullPage:true});
  console.log('PASS alpha:',rows.map(({expression,equipped,transparent,partial,opaque})=>({expression,equipped,transparent,partial,opaque})));
 } finally {await browser.close();await vite.close();}
})().catch(e=>{console.error(e);process.exitCode=1});



