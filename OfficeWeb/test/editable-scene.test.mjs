import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,existsSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createBuildStore} from '../build-store.mjs';
import {createBuildHttp} from '../build-http.mjs';
import {createBuildWorkstations} from '../build-workstations.mjs';
import {initialFixtures} from '../scene-fixtures.mjs';
import {loadTs} from './helpers.mjs';
const user={id:'tester',name:'测试'};
const path=()=>join(mkdtempSync(join(tmpdir(),'editable-scene-')),'world.json');
test('legacy migration backs up exact bytes, preserves user state and runs once',()=>{
 const file=path(),old={revision:41,parts:[{id:'mine',kind:'block',version:7}],chests:{mine:[{value:'keep'}]},chestPeople:{mine:{readers:[]}}};
 const bytes=JSON.stringify(old);writeFileSync(file,bytes);
 const store=createBuildStore(file),snapshot=store.snapshot();
 assert.equal(readFileSync(file+'.before-editable-scene.json','utf8'),bytes);
 assert.deepEqual(snapshot.parts[0],old.parts[0]);
 assert.equal(snapshot.parts.length,1+initialFixtures().length);
 // 两次一次性迁移各推进一次版本：①原场景 67 件迁入（42）②水平两轴回格（43，见 build-grid-invariant 用例）。
 assert.equal(snapshot.revision,43);
 assert.equal(existsSync(file+'.before-grid.json'),true,'回格迁移也要留一份原文件');
 assert.deepEqual(JSON.parse(readFileSync(file)).chests,old.chests);
 const distant=snapshot.parts.find(p=>p.fixture==='distant-0-top');
 store.mutate({action:'remove',id:distant.id,version:1},user);
 assert(!createBuildStore(file).snapshot().parts.some(p=>p.fixture===distant.fixture));
 assert.equal(readFileSync(file+'.before-editable-scene.json','utf8'),bytes);
});
test('all initial objects can move, rotate, recolour, delete and restore without losing template',()=>{
 const file=path(),store=createBuildStore(file);
 for(const part of store.snapshot().parts.filter(p=>p.fixture)){
  const moved=store.mutate({action:'move',id:part.id,version:1,part:{...part,x:part.x+.25,y:part.y+.25,rotation:1,color:'#b9c9df'}},user).changed;
  assert.equal(moved.fixture,part.fixture);
  store.mutate({action:'remove',id:part.id,version:2},user);
  const restored=store.mutate({action:'add',part:moved},user).changed;
  assert.equal(restored.fixture,part.fixture);
  assert.throws(()=>store.mutate({action:'add',part:moved},user),/已经存在/);
 }
 assert.equal(createBuildStore(file).snapshot().parts.filter(p=>p.fixture).length,67);
});
test('original seat numbers survive edits and restoration; removed public seats become invalid',()=>{
 const file=path(),store=createBuildStore(file);
 const registry=createBuildWorkstations(file+'.seats.json',()=>store.snapshot().parts);
 assert.equal(registry.index('scene-desk-0'),0);
 const desk=store.snapshot().parts.find(p=>p.fixture==='desk-0');
 store.mutate({action:'remove',id:desk.id,version:1},user);
 assert(!registry.valid(0));
 const restored=store.mutate({action:'add',part:desk},user).changed;
 assert.equal(registry.index(restored.id),0);
 const chair=store.snapshot().parts.find(p=>p.fixture==='sofa-0');
 store.mutate({action:'remove',id:chair.id,version:1},user);
 const http=createBuildHttp(file);
 assert.equal(http.hasSeat('sofa-0'),false);
 assert.equal(http.hasSeat('sofa-1'),true);
 assert.equal(http.hasSeat('desk-0'),true);
});
test('removing the initial island removes ground support, including at the old position',async()=>{
 const {setBuildSolids,supportHeight}=await import(await loadTs('buildNavigation.ts'));
 setBuildSolids([{min:{x:-15,y:-.6,z:-12},max:{x:15,y:0,z:12}}]);
 assert.equal(supportHeight(0,0,0),0);
 setBuildSolids([]);assert.equal(supportHeight(0,0,0),null);
 setBuildSolids(null);
});
