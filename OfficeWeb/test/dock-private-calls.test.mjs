import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { loadTs } from './helpers.mjs';

const { dockGreeting } = await import(await loadTs('dock-private-contract.ts'));
const source = readFileSync(new URL('../src/useDockPrivateCalls.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext } }).outputText.replace(/import \{ useRef, useState \} from 'react';/,
  'const useRef = current => ({current}); const useState = value => [value, () => {}];');
const { useDockPrivateCalls } = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const settle = () => new Promise(resolve => setImmediate(resolve));
function fixture(overrides = {}) {
  const actions = [];
  const client = { connected: true, meetings: { active: null }, people: [{ id: 'peer', name: '访客' }],
    requests: [{ id: 'r', from: 'peer', name: '访客', kind: 'voice' }],
    sessions: [{ id: 's', peer: 'peer', kind: 'voice' }],
    callStates: { s: { voice: '已静音', connected: true, sharing: false } },
    respond: async (...args) => actions.push(['answer', ...args]),
    mute: async id => actions.push(['mute', id]), shareInCall: async id => actions.push(['share', id]),
    stopShare: () => actions.push(['stop']), ...overrides };
  return { actions, adapter: useDockPrivateCalls(client) };
}

test('three invitation types own greeting until resolved, even with preview or late call events', () => {
  for (const [kind, offer] of [['voice', false], ['screen', false], ['screen', true]]) {
    const state = { privateCalls: { invitations: [{ id: 'r', personId: 'peer', name: '访客', kind, offer }] } };
    for (const event of [null, { id: 'someone-else', mode: 'peek' }, { id: 'old', mode: 'call' }]) {
      assert.deepEqual(dockGreeting(state, event), { id: 'peer', name: '访客', requestId: 'r', kind, offer, mode: 'call', at: 0 });
    }
    state.privateCalls.invitations = [];
    assert.equal(dockGreeting(state, { id: 'peer', mode: 'call', requestId: 'r' }), null);
  }
  assert.equal(dockGreeting({ meeting: { invitations: [{ id:'m',personId:'host' }] } }, null).kind, 'meeting');
});

test('private controls bind session IDs and serialize repeated clicks, including answer', async () => {
  const { adapter, actions } = fixture();
  assert.equal(adapter.state.sessions[0].name, '访客');
  assert.equal(adapter.state.sessions[0].mic, false);
  adapter.command({kind:'private-share',personId:'s'});
  adapter.command({kind:'private-mute',personId:'s'});
  await settle();
  adapter.command({kind:'private-mute',personId:'s'}); await settle();
  adapter.answer('r', true); adapter.answer('r', true); await settle();
  adapter.answer('expired', true); adapter.command({kind:'private-share',personId:'peer'});
  assert.deepEqual(actions, [['share','s'],['mute','s'],['answer','r',true]]);
});

test('sharing stops without restarting media; offline and active meeting never dispatch private media', async () => {
  const h = fixture({ callStates: { s: { sharing:true,connected:true,voice:'已开启' } } });
  h.adapter.command({kind:'private-share',personId:'s'}); await settle();
  assert.deepEqual(h.actions, [['stop']]);
  for (const props of [{ connected:false }, { meetings:{active:{id:'m'}} }, {callStates:{}}]) {
    const row = fixture(props);
    row.adapter.command({kind:'private-share',personId:'s'});
    row.adapter.command({kind:'private-mute',personId:'s'}); await settle();
    assert.deepEqual(row.actions, []);
  }
});
