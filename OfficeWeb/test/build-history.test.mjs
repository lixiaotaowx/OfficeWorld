import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createBuildStore} from '../build-store.mjs';
import {loadTs} from './helpers.mjs';
const {BuildHistory}=await import(await loadTs('buildHistory.ts'));
const part={kind:'pillar',color:'#f3dfc5',x:10,y:0,z:0,rotation:0};
const user={id:'history',name:'History'};
function harness() {
  const store=createBuildStore(join(mkdtempSync(join(tmpdir(),'build-history-')),'world.json'));
  const history=new BuildHistory();
  const run=(command,mode='normal')=>{
    const next=store.mutate(command,user);history.accept(command,next,mode);return next;
  };
  const travel=mode=>run(history.peek(mode),mode);
  return{store,history,run,travel};
}
test('add, two moves, remove, all undo then all redo preserve positions and new IDs',()=>{
  const h=harness();
  let p=h.run({action:'add',part}).changed;
  p=h.run({action:'move',id:p.id,version:p.version,part:{...p,x:11}}).changed;
  p=h.run({action:'move',id:p.id,version:p.version,part:{...p,x:12}}).changed;
  h.run({action:'remove',id:p.id,version:p.version});
  assert.equal(h.travel('undo').changed.x,12);
  assert.equal(h.travel('undo').changed.x,11);
  assert.equal(h.travel('undo').changed.x,10);
  h.travel('undo');
  assert.deepEqual(h.history.counts,{undoCount:0,redoCount:4});
  assert.equal(h.travel('redo').changed.x,10);
  assert.equal(h.travel('redo').changed.x,11);
  assert.equal(h.travel('redo').changed.x,12);
  h.travel('redo');
  assert.deepEqual(h.history.counts,{undoCount:4,redoCount:0});
});
test('new edit clears redo; failed collaborative undo leaves history and colleague unchanged',()=>{
  const h=harness();
  const p=h.run({action:'add',part}).changed;
  h.run({action:'move',id:p.id,version:1,part:{...p,x:11}});
  h.travel('undo');
  h.run({action:'add',part:{...part,x:15}});
  assert.equal(h.history.counts.redoCount,0);
  h.travel('undo');
  const current=h.store.snapshot().parts.find(x=>x.id===p.id);
  h.store.mutate({action:'move',id:p.id,version:current.version,part:{...current,x:13}},user);
  const before={...h.history.counts};
  assert.throws(()=>h.travel('undo'),/同事/);
  assert.deepEqual(h.history.counts,before);
  assert.equal(h.store.snapshot().parts.find(x=>x.id===p.id).x,13);
});
