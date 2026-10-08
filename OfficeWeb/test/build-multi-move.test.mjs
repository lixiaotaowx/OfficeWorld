import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createBuildStore} from '../build-store.mjs';
import {loadTs} from './helpers.mjs';
const {BuildHistory}=await import(await loadTs('buildHistory.ts'));
test('group moves commit once, preserve offsets and undo/redo with earlier history',()=>{
  const path=join(mkdtempSync(join(tmpdir(),'group-move-')),'world.json');
  const store=createBuildStore(path),history=new BuildHistory(),user={id:'u',name:'u'};
  const send=(command,mode)=>{const result=store.mutate(command,user);history.accept(command,result,mode);return result;};
  const a=send({action:'add',part:{kind:'pillar',x:20,y:0,z:0,rotation:0,color:'#f3dfc5'}}).changed;
  const b=send({action:'add',part:{...a,x:22.5}}).changed;
  const revision=store.snapshot().revision;
  const group={action:'moveMany',items:[a,b].map(p=>({id:p.id,version:p.version,part:{...p,x:p.x+.13,y:-2}}))};
  send(group);assert.equal(store.snapshot().revision,revision+1);
  const positions=()=>store.snapshot().parts.filter(p=>[a.id,b.id].includes(p.id)).map(p=>[p.x,p.y]);
  assert.deepEqual(positions(),[[20.13,-2],[22.63,-2]]);
  send(history.peek('undo'),'undo');assert.deepEqual(positions(),[[20,0],[22.5,0]]);
  send(history.peek('redo'),'redo');assert.deepEqual(positions(),[[20.13,-2],[22.63,-2]]);
  send(history.peek('undo'),'undo');send(history.peek('undo'),'undo');send(history.peek('undo'),'undo');
  assert.deepEqual(positions(),[]);
  assert.deepEqual(createBuildStore(path).snapshot(),store.snapshot());
});
test('one stale or invalid part rejects the whole group without changing disk',()=>{
  const path=join(mkdtempSync(join(tmpdir(),'group-conflict-')),'world.json');
  const store=createBuildStore(path),user={id:'u',name:'u'};
  const [a,b]=store.snapshot().parts;
  const before=structuredClone(store.snapshot());
  for(const second of [{...b,version:999},{...b,y:NaN}]){
    const items=[{id:a.id,version:a.version,part:{...a,x:a.x+1}},
      {id:b.id,version:second.version,part:second}];
    assert.throws(()=>store.mutate({action:'moveMany',items},user));
    assert.deepEqual(store.snapshot(),before);
  }
  assert.throws(()=>store.mutate({action:'moveMany',items:[{id:a.id},{id:a.id}]},user),/重复/);
});
