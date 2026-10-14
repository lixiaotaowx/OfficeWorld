import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import {createBuildStore} from '../build-store.mjs';
import {createBuildHttp} from '../build-http.mjs';
import {cleanCinemaContent} from '../cinema-content.mjs';
import {createCinemaMedia} from '../cinema-media.mjs';
import {loadTs} from './helpers.mjs';
const user={id:'cinema-test',name:'测试成员'};
const part={kind:'cinema-screen',color:'#f3dfc5',x:50,y:0,z:50,rotation:0};
const content={type:'video',src:'https://www.bilibili.com/video/BV1xx411c7mD',fit:'contain'};
const pause=()=>new Promise(resolve=>setTimeout(resolve,135));

test('cinema content is durable, version checked, lightweight in snapshots and survives movement',()=>{
  const dir=mkdtempSync(join(tmpdir(),'cinema-store-')),path=join(dir,'world.json');
  try{
    const store=createBuildStore(path),screen=store.mutate({action:'add',part},user).changed;
    store.mutate({action:'cinema',id:screen.id,version:1,content},user);
    assert.deepEqual(createBuildStore(path).screen(screen.id),{content,version:2});
    assert.equal(store.snapshot().parts.find(p=>p.id===screen.id).cinemaVersion,1);
    assert.ok(!JSON.stringify(store.snapshot()).includes(content.src));
    assert.throws(()=>store.mutate({action:'cinema',id:screen.id,version:1,content:null},user),/同事/);
    store.mutate({action:'move',id:screen.id,version:2,part:{...part,x:51}},user);
    assert.deepEqual(store.screen(screen.id).content,content);
    const copy=store.mutate({action:'duplicate',id:screen.id,version:3},user).changed;
    assert.deepEqual(store.screen(copy.id).content,content,'copy preserves the configured screen');
    const removed=store.mutate({action:'remove',id:copy.id,version:1},user);
    const restored=store.mutate({action:'add',part:removed.previous,cinemaContent:removed.previousCinema},user).changed;
    assert.deepEqual(store.screen(restored.id).content,content,'removal undo restores screen content');
    store.mutate({action:'cinema',id:screen.id,version:3,content:null},user);
    assert.equal(store.screen(screen.id).content,null);
    store.mutate({action:'remove',id:screen.id,version:4},user);
    assert.throws(()=>store.screen(screen.id),/拆除/);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('cinema rejects unsafe URLs, image spoofing, invalid fit, wrong part and excessive upload',()=>{
  for(const src of ['javascript:alert(1)','http://example.org/a.mp4','https://user:pass@example.org/a',
    'data:image/webp;base64,YWJj','/api/build?cinemaFile=../secret.mp4'])assert.throws(()=>cleanCinemaContent({...content,src}));
  assert.throws(()=>cleanCinemaContent({...content,fit:'other'}));
  const dir=mkdtempSync(join(tmpdir(),'cinema-upload-'));
  try{
    const media=createCinemaMedia(dir),data={type:'video/mp4',total:16,offset:0,bytes:Buffer.from('0000ftyp00000000').toString('base64')};
    assert.throws(()=>media.upload('a',user,{...data,total:101*1024*1024}),/100 MB/);
    const first=media.upload('a',user,{...data,total:32});
    assert.throws(()=>media.upload('a',{id:'intruder'},{...data,uploadId:first.uploadId,offset:16,total:32}),/进度/);
    const done=media.upload('a',user,{...data,uploadId:first.uploadId,offset:16,total:32});
    assert.ok(media.exists(done.src));assert.equal(done.offset,32);
    assert.equal(existsSync(join(dir,first.uploadId+'.part')),false);
  }finally{rmSync(dir,{recursive:true,force:true});}
});
test('proportional adaptive, crop fill and stretch source rectangles',async()=>{
  const {cinemaRect}=await import(await loadTs('cinemaTypes.ts'));
  assert.deepEqual(cinemaRect(100,200,400,200,'contain'),[0,0,100,200,150,0,100,200]);
  assert.deepEqual(cinemaRect(100,200,400,200,'cover'),[0,75,100,50,0,0,400,200]);
  assert.deepEqual(cinemaRect(100,200,400,200,'stretch'),[0,0,100,200,0,0,400,200]);
});
test('automatic source recognition includes platform sharing text and retained local media',async()=>{
  const {knownCinemaSource,cinemaInput,cinemaSourceName}=await import(await loadTs('cinemaSource.ts'));
  assert.equal(knownCinemaSource('data:image/webp;base64,AAAA'),'image');
  assert.equal(knownCinemaSource('/api/build?cinemaFile=anything.mp4'),'video');
  assert.equal(knownCinemaSource('https://b23.tv/abc'),'video');
  assert.equal(cinemaSourceName('https://www.douyin.com/video/7123456789012345678','video'),'抖音视频');
  assert.equal(cinemaInput('复制打开抖音，看看这个视频 https://v.douyin.com/ABC/ '),'https://v.douyin.com/ABC/');
  assert.equal(knownCinemaSource('https://example.test/resource'),null);
  assert.equal(knownCinemaSource('http://www.bilibili.com/video/BV1xx411c7mD'),null);
});
test('authenticated cinema HTTP persistence and ranged local video; anonymous access denied',async()=>{
  const dir=mkdtempSync(join(tmpdir(),'cinema-http-')),path=join(dir,'world.json');
  const handle=createBuildHttp(path),accounts={authenticate:req=>req.headers.authorization==='test'?user:null,originAllowed:()=>true};
  const server=createServer((req,res)=>void handle(req,res,accounts));
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base=`http://127.0.0.1:${server.address().port}/api/build`;
  const post=async(query,data)=>{await pause();return fetch(base+query,{method:'POST',headers:{authorization:'test','content-type':'application/json'},body:JSON.stringify(data)});};
  try{
    assert.equal((await fetch(base+'?cinema=x')).status,401);
    const added=await (await post('',{action:'add',part})).json();const id=added.changed.id;
    const bytes=Buffer.from('0000ftyp00000000');
    const uploaded=await (await post('?cinemaUpload='+id,{type:'video/mp4',total:bytes.length,offset:0,bytes:bytes.toString('base64')})).json();
    assert.ok(uploaded.src);
    const saved=await post('',{action:'cinema',id,version:1,content:{...content,src:uploaded.src}});assert.equal(saved.status,200);
    const media=await fetch(base+'?cinemaFile='+uploaded.src.split('=')[1],{headers:{authorization:'test',range:'bytes=4-7'}});
    assert.equal(media.status,206);assert.equal(await media.text(),'ftyp');
    assert.equal((await fetch(base+'?cinema='+id,{headers:{authorization:'test'}})).status,200);
    assert.equal((await fetch(base+'?cinemaFile=..%2Fsecret',{headers:{authorization:'test'}})).status,404);
  }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});}
});
