import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

// Exercise the adapter's real command dispatch without mounting media or a socket.
const source = readFileSync(new URL('../src/useDockMeetings.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext } }).outputText
  .replace(/import \{ useRef, useState \} from 'react';/, 'const useRef = current => ({current}); const useState = value => [value, () => {}];')
  .replace(/import \{ useDockMeetingVideo \} from '.\/useDockMeetingVideo';/, 'const useDockMeetingVideo = () => {};');
const { useDockMeetings } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const settle = () => new Promise(resolve => setImmediate(resolve));
function fixture(host = 'me', active = true) {
  const actions = [];
  const info = { id: 'a', host, room: 'meeting-a', title: '讨论',
    members: [{ id:'me', name:'我', status:'joined' }, { id:'other', name:'CCC', status:'invited' }] };
  const pending = { id: 'b', host: 'other', members: [{id:'me',status:'invited'}, {id:'other',name:'CCC',status:'joined'}] };
  const client = { active: active ? info : null, invitations: [pending, { ...pending, id:'old', members:[{id:'me',status:'left'}] }],
    mic:false, sharing:false, act:async action => { actions.push(action); } };
  const adapter = useDockMeetings(client, {}, [{id:'socket-c',clientId:'other',name:'CCC'}], 'socket-me', 'me', () => {}, () => {});
  return { adapter, actions };
}
test('dock meeting commands use meeting IDs and preserve host authority', async () => {
  const { adapter, actions } = fixture();
  assert.deepEqual(adapter.state.members, [{id:'me',name:'我',status:'joined'}, {id:'other',name:'CCC',status:'invited'}]);
  adapter.command({kind:'meeting-leave',personId:'stale'}); await settle();
  assert.deepEqual(actions, []);
  adapter.command({kind:'meeting-leave',personId:'a'}); await settle();
  adapter.command({kind:'meeting-end',personId:'a'}); await settle();
  assert.deepEqual(actions, [{action:'leave',id:'a'}, {action:'end',id:'a'}]);
  const guest = fixture('other'); guest.adapter.command({kind:'meeting-end',personId:'a'}); await settle();
  assert.deepEqual(guest.actions, []);
});
test('only pending invitations greet; accepting is muted and cannot replace an active meeting', async () => {
  const { adapter, actions } = fixture('other', false);
  assert.deepEqual(adapter.state.invitations, [{id:'b',personId:'socket-c',name:'CCC'}]);
  adapter.command({kind:'meeting-accept',personId:'b'}); await settle();
  adapter.command({kind:'meeting-decline',personId:'b'}); await settle();
  assert.deepEqual(actions, [{action:'accept',id:'b',microphone:false}, {action:'decline',id:'b'}]);
  const busy = fixture(); busy.adapter.command({kind:'meeting-accept',personId:'b'}); await settle();
  assert.deepEqual(busy.actions, []);
});
