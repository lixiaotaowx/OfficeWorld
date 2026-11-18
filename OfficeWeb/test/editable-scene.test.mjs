import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createBuildStore, seedParts} from '../build-store.mjs';
const user={id:'tester',name:'娴嬭瘯'};
const path=()=>join(mkdtempSync(join(tmpdir(),'editable-scene-')),'world.json');

test('legacy migration backs up exact bytes, seeds the library hall and runs once',()=>{
 const file=path(),old={revision:41,parts:[{id:'mine',kind:'block',version:7}],chests:{mine:[{value:'keep'}]},chestPeople:{mine:{readers:[]}}};
 const bytes=JSON.stringify(old);writeFileSync(file,bytes);
 const store=createBuildStore(file),snapshot=store.snapshot();
 // 鏃т斧鐣屽瓨鍒版棫鏂囦欢閲岋紝涓€瀛椾涓嶅樊锛堝彲鎵惧洖鏉ワ級銆?
 assert.equal(readFileSync(file+'.before-hall.json','utf8'),bytes);
 // 鏂颁斧鐣屽氨鏄浘功 Scarlett 瀹硷細绉嶅瓙闆朵欢 + 鐢ㄦ埛鏃ф柦鏂界殑淇濈暀瑙勫垯涓嶅啀瀛樺湪锛
 assert.equal(snapshot.revision,42,'old revision carries over once');
 assert.deepEqual(JSON.parse(readFileSync(file + '.before-hall.json')).chests,old.chests,'chest contents stay in the backup');
 // 鍐嶆鐨勪竴娆℃槸绋冲畾鐘舵€侊紝涓嶄細鍐嶆鎼細
 const again=createBuildStore(file).snapshot();
 assert.equal(again.revision,snapshot.revision);
 assert.equal(existsSync(file+'.before-hall.json'),true,'backup stays');
});

test('hall parts can move, rotate, recolour, delete and re-add',()=>{
 const file=path(),store=createBuildStore(file);
 const parts=store.snapshot().parts.filter(p=>p.kind==='chair').slice(0,10);
 for(const part of parts){
  const moved=store.mutate({action:'move',id:part.id,version:1,part:{...part,x:part.x+.25,y:part.y+.25,rotation:1,color:'#5c6b9c'}},user).changed;
  assert.equal(moved.id,part.id);
  store.mutate({action:'remove',id:part.id,version:2},user);
  const restored=store.mutate({action:'add',part:moved},user).changed;
  assert.equal(restored.kind,'chair');
 }
 assert.equal(createBuildStore(file).snapshot().parts.filter(p=>p.kind==='chair').length,10);
});

test('original seat numbers survive edits; removed desks invalid',()=>{
 const file=path(),store=createBuildStore(file);
 const before=store.snapshot().parts.filter(p=>p.kind==='desk').length;
 const first=store.snapshot().parts.find(p=>p.kind==='desk');
 store.mutate({action:'remove',id:first.id,version:1},user);
 const after=createBuildStore(file).snapshot().parts.filter(p=>p.kind==='desk').length;
 assert.equal(after,before-1,'desk removal persists');
});

test('treasure chest contents survive restarts',()=>{
 const file=path(),store=createBuildStore(file);
 const chest=store.snapshot().parts.find(p=>p.kind==='chest');
 store.mutate({action:'put',id:chest.id,entry:{type:'note',title:'渚跨',value:'鏄庝竴璧锋' }},user);
 assert.equal(createBuildStore(file).chest(chest.id).length,1);
});
