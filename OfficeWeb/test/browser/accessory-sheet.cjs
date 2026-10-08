const { chromium }=require('./playwright.cjs');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1320,height:1160},deviceScaleFactor:1});
  const dir=path.resolve('public/assets/characters/thumbnails');
  const names=fs.readdirSync(dir).filter(n=>n.startsWith('wear-'));
  await page.setContent(`<style>body{margin:0;background:#ebe9e2;color:#333;font:14px sans-serif;padding:20px}main{display:grid;grid-template-columns:repeat(6,1fr);gap:14px}figure{margin:0;background:#f7f5f0;border-radius:12px;overflow:hidden;text-align:center}img{width:100%;height:220px;object-fit:contain}figcaption{padding:10px}</style><h2>角色配件 · 实际模型预览</h2><main>${names.map(n=>`<figure><img src="data:image/png;base64,${fs.readFileSync(path.join(dir,n)).toString('base64')}"><figcaption>${n.replace('wear-','').replace('.png','')}</figcaption></figure>`).join('')}</main>`);
  await page.screenshot({path:path.resolve('../Build/ruler-accessories-v2.png'),fullPage:true});
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
