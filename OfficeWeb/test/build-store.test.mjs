import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createBuildStore, catalog, seedParts } from '../build-store.mjs';

const user = { id: 'alice', name: 'Alice' };
const part = { kind:'block', color:'#f3dfc5', x:5, y:0, z:0, rotation:0 };
const store = () => createBuildStore(join(mkdtempSync(join(tmpdir(),'box-store-')),'world.json'));
test('all box parts have unique kinds, bounded dimensions and starter chest exists', () => {
  assert(catalog.length>=62);
  assert.equal(new Set(catalog.map(p=>p.id)).size,catalog.length);
  assert(seedParts().some(p=>p.kind==='chest'));
  for (const item of catalog) assert(item.size.every(n=>n>0 && n<=4));
});
test('add/move/remove persist and stale collaborative edits do not overwrite', () => {
  const path = join(mkdtempSync(join(tmpdir(),'box-restart-')),'world.json');
  const a = createBuildStore(path);
  const added = a.mutate({ action:'add', part },user).changed;
  assert.equal(createBuildStore(path).snapshot().parts.at(-1).id,added.id);
  a.mutate({ action:'move', id:added.id, version:1, part:{...part,x:6,rotation:1} },user);
  assert.throws(()=>a.mutate({ action:'remove', id:added.id, version:1 },user),/同事/);
  a.mutate({ action:'remove', id:added.id, version:2 },user);
  assert(!createBuildStore(path).snapshot().parts.some(p=>p.id===added.id));
});
test('bounds, finite coordinates, grid, palette validated on server', () => {
  const s=store();
  // y 仍按毫米校验（接触高度是毫米级但不许比毫米更细）；x/z 不再拒收，而是**落格**——见下一条断言。
  for (const override of [{x:Number.MAX_VALUE},{y:Infinity},{x:NaN},{y:0.0003},{kind:'bad'},{rotation:0.2},{color:'red'}])
    assert.throws(()=>s.mutate({action:'add',part:{...part,...override}},user));
  assert.equal(s.snapshot().revision,2,'新世界两次一次性迁移：原场景迁入 + 水平回格');
});
test('off-grid x/z are snapped, never rejected', () => {
  const s=store();
  const added=s.mutate({action:'add',part:{...part,x:5.11,z:-2.19,y:.105}},user).changed;
  assert.deepEqual([added.x,added.z],[5,-2.25]);
  assert.equal(added.y,.105,'y 原样保留（接触高度）');
});
test('floors extend beyond the old island and are not subject to the 600 prop cap', () => {
  const path=join(mkdtempSync(join(tmpdir(),'box-floor-')),'world.json');
  const parts=Array.from({length:600},(_,i)=>({...part,id:`p${i}`,version:1}));
  writeFileSync(path,JSON.stringify({revision:0,parts,chests:{}}));
  const s=createBuildStore(path);
  for (const x of [20,1000,-10000]) {
    const added=s.mutate({action:'add',part:{...part,kind:'floor',x}},user).changed;
    assert.equal(added.x,x);
  }
  assert.equal(s.mutate({action:'add',part},user).changed.kind,'block');
  assert.equal(createBuildStore(path).snapshot().parts.filter(p=>!p.fixture).length,604);
});

test('flush wall offsets and real tabletop heights persist across reload', () => {
  const path=join(mkdtempSync(join(tmpdir(),'box-contact-')),'world.json');
  const s=createBuildStore(path);
  const mounted={...part,kind:'photo-frame',x:10,y:1.25,z:.173};
  const a=s.mutate({action:'add',part:mounted},user).changed;
  const b=s.mutate({action:'add',part:{...part,kind:'mug',x:11,y:.495}},user).changed;
  const restored=createBuildStore(path).snapshot().parts;
  assert.deepEqual(restored.find(p=>p.id===a.id),a);
  assert.deepEqual(restored.find(p=>p.id===b.id),b);
});
test('treasure survives restart; unsafe links rejected; only owner removes; nonempty chest protected', () => {
  const path=join(mkdtempSync(join(tmpdir(),'box-chest-')),'world.json');
  const s=createBuildStore(path);
  const chest=s.mutate({action:'add',part:{...part,kind:'chest'}},user).changed;
  const put=entry=>s.mutate({action:'put',id:chest.id,entry},user);
  assert.throws(()=>put({type:'link',title:'bad',value:'javascript:alert(1)'}));
  assert.throws(()=>put({type:'image',title:'bad',value:'data:image/svg+xml;base64,PHN2Zz4='}));
  assert.throws(()=>put({type:'image',title:'bad',value:'data:image/png;base64,PHN2Zz4='}));
  put({type:'link',title:'文档',value:'https://example.com/'});
  put({type:'note',title:'便签',value:'明天一起搭房子'});
  assert.equal(createBuildStore(path).chest(chest.id).length,2);
  assert.throws(()=>s.mutate({action:'remove',id:chest.id,version:1},user),/还有内容/);
  const entry=s.chest(chest.id)[0];
  assert.throws(()=>s.mutate({action:'take',id:chest.id,entryId:entry.id},{id:'bob'}));
  s.mutate({action:'take',id:chest.id,entryId:entry.id},user);
  assert.equal(s.chest(chest.id).length,1);
});
test('corrupt save is not silently overwritten', () => {
  const path=join(mkdtempSync(join(tmpdir(),'box-corrupt-')),'world.json');
  writeFileSync(path,'broken');
  assert.throws(()=>createBuildStore(path));
  assert.equal(readFileSync(path,'utf8'),'broken');
});

test('underground has no gameplay depth limit, including below reserved ground workstations', () => {
  const path=join(mkdtempSync(join(tmpdir(),'box-underground-')),'world.json');
  const s=createBuildStore(path);
  for(const y of [-3,-100,-10000]) {
    const added=s.mutate({action:'add',part:{...part,x:0,z:4,y}},user).changed;
    assert.equal(createBuildStore(path).snapshot().parts.find(p=>p.id===added.id).y,y);
  }
  assert.equal(s.mutate({action:'add',part:{...part,x:0,z:4,y:-.25}},user).changed.y,-.25);
});


test('stairs continue above 12 metres and high placements survive reload', () => {
  const path=join(mkdtempSync(join(tmpdir(),'box-high-')),'world.json');
  const s=createBuildStore(path);
  for(const y of [11.5,12.25,13,30,1000]) {
    const added=s.mutate({action:'add',part:{...part,kind:'stairs',y}},user).changed;
    assert.equal(added.y,y);
    assert.equal(createBuildStore(path).snapshot().parts.at(-1).y,y);
  }
});
