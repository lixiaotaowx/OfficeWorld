const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('fs'),ts=require('typescript');
const moduleOutput={exports:{}};
new Function('exports',ts.transpileModule(fs.readFileSync('src/chestVideo.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(moduleOutput.exports);
const {chestVideo}=moduleOutput.exports;
test('platform allowlist and player parameters',()=>{
 assert.match(chestVideo('https://www.bilibili.com/video/BV1B7411m7LV/?p=2&t=30').embed,/bvid=BV1B7411m7LV&p=2&t=30&autoplay=0/);
 assert.match(chestVideo('https://www.bilibili.com/video/av1234').embed,/aid=1234/);
 assert.match(chestVideo('https://www.douyin.com/video/7146408143612345678').embed,/vid=7146408143612345678/);
 assert.equal(chestVideo('https://www.xiaohongshu.com/explore/test').embed,undefined);
 for(const url of ['javascript:alert(1)','https://bilibili.com.evil.test/video/BV1B7411m7LV/','https://evil.test/?bvid=BV1B7411m7LV'])assert.equal(chestVideo(url),null);
});
test('short link resolver checks every redirect',async()=>{
 const {resolveBuildLink}=await import('../build-link.mjs');
 const mock=async url=>String(url).includes('b23.tv')?new Response(null,{status:302,headers:{location:'https://www.bilibili.com/video/BV1B7411m7LV/'}}):new Response('ok');
 assert.match(await resolveBuildLink('https://b23.tv/example',mock),/bilibili.com/);
 let calls=0;
 await assert.rejects(resolveBuildLink('https://b23.tv/example',async()=>{calls++;return new Response(null,{status:302,headers:{location:'http://127.0.0.1/private'}});}));
 assert.equal(calls,1);
 await assert.rejects(resolveBuildLink('https://evil.test/',mock));
});
