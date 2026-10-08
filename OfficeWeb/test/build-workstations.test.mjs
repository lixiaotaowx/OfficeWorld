import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createBuildWorkstations} from '../build-workstations.mjs';
import {withServer} from './helpers.mjs';
const call=(socket,event,value)=>new Promise(resolve=>socket.emit(event,value,resolve));
const desk=(id,y=0)=>({id,kind:'desk',color:'#f3dfc5',x:20,y,z:0,rotation:0,version:1});
test('built desk numbers survive reorder, deletion and restart; tilted desks excluded',()=>{
 const path=join(mkdtempSync(join(tmpdir(),'built-seats-')),'seats.json');
 let parts=[desk('a',30),desk('b',-4)];
 const a=createBuildWorkstations(path,()=>parts);
 assert.deepEqual(a.list().map(p=>p.seatIndex),[9,10]);
 parts=[desk('b',-4),desk('c'),{...desk('tilted'),pitch:1}];
 assert.deepEqual(a.list().map(p=>p.seatIndex),[10,11]);
 const b=createBuildWorkstations(path,()=>parts);
 assert.equal(b.valid(9),false);assert.equal(b.valid(10),true);
 assert.deepEqual(b.list().map(p=>p.seatIndex),[10,11]);
});
test('built workstations can be claimed, cannot be stolen or bypassed, and survive reconnect',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'built-claim-')),statePath=join(dir,'state.json');
 writeFileSync(join(dir,'build-world.json'),JSON.stringify({revision:0,parts:[desk('high',30),desk('low',-4)],chests:{}}));
 let clientId;
 await withServer(async({connect})=>{
  const a=await connect('甲',{clientId:'built-owner'}),b=await connect('乙');clientId='built-owner';
  assert.equal((await call(a,'seat',9)).ok,true);
  assert.equal((await call(b,'seat',9)).ok,false);
  assert.equal((await call(b,'sit','desk-9')).ok,false);
  assert.equal((await call(b,'sit','build-seat-high')).ok,false);
  assert.equal((await call(a,'sit','desk-9')).ok,true);
  assert.equal((await call(a,'sit',null)).ok,true);
  assert.equal((await call(b,'sit','desk-9')).ok,false);
  assert.equal((await call(b,'seat',10)).ok,true);
  assert.equal((await call(b,'seat',11)).ok,false);
 },{statePath});
 await withServer(async({connect})=>{
  const b=await connect('丙');assert.equal((await call(b,'seat',9)).ok,false);
 },{statePath});
});
