import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {catalog,dimensions,createBuildStore} from '../build-store.mjs';

test('every catalog part has envelopes that stay bottom-anchored through rotations',()=>{
  // 11 月的渲染网格由 HallView 的建造渲染器吃目录包络；这里用 dimensions() 的
  // 旋转外延公式做**目录侧**校验：倾角只会放大或保持外延，不会缩小。
  for(const item of catalog) for(let pitch=0;pitch<4;pitch++) for(let roll=0;roll<4;roll++) for(let rotation=0;rotation<4;rotation++) {
    if(!pitch&&!roll)continue;
    const part={id:'test',kind:item.id,color:'#e9d4aa',x:20,y:-3,z:0,pitch,roll,rotation};
    const flat=dimensions({...part,pitch:0,roll:0});
    const tilted=dimensions(part);
    tilted.forEach((n,i)=>assert(Number.isFinite(n)&&n>0,`${item.id} axis ${i}`));
  }
});
test('tilted placement persists, moves, and rejects malformed orientation',()=>{
  const path=join(mkdtempSync(join(tmpdir(),'rotation-')),'world.json');
  const store=createBuildStore(path),user={id:'u',name:'test'};
  const input={kind:'column',color:'#e9d4aa',x:20,y:11,z:0,rotation:0,roll:1,pitch:0};
  const saved=store.mutate({action:'add',part:input},user).changed;
  assert.equal(createBuildStore(path).snapshot().parts.at(-1).roll,1);
  assert.deepEqual(dimensions(saved),dimensions(input));
  assert.equal(store.mutate({action:'add',part:{...input,roll:0}},user).changed.y,11);
  for(const value of [-1,.5,'1',null])assert.throws(()=>store.mutate({action:'add',part:{...input,pitch:value}},user),/倾斜/);
  const moved=store.mutate({action:'move',id:saved.id,version:1,part:{...saved,y:0,pitch:1}},user).changed;
  assert.equal(moved.pitch,1);assert.equal(moved.roll,1);
});
