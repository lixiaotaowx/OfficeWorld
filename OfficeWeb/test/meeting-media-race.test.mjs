import test from 'node:test';
import assert from 'node:assert/strict';
import { createMeetings } from '../meetings.mjs';

test('rejoin waits for previous server media removal before allowing new publication', async () => {
  let finishRemoval;
  const removal = new Promise(r => { finishRemoval = r; });
  const people = new Map([['a', { id: 'a', clientId: 'account-a', name: 'a' }],
    ['b', { id: 'b', clientId: 'account-b', name: 'b' }]]);
  const api = createMeetings({ to: () => ({ emit() {} }) }, people, () => {}, () => removal);
  const client = id => {
    const handlers = new Map(); api.attach({ id, data: {}, on: (event, action) => handlers.set(event, action) });
    return async data => { await new Promise(r => setTimeout(r, 160));
      return new Promise(r => handlers.get('meeting-action')(data, r)); };
  };
  const a = client('a'), b = client('b');
  const created = await a({ action: 'create', title: 'race', invitees: ['account-b'] });
  assert.equal((await b({ action: 'accept', id: created.id })).ok, true);
  assert.equal((await b({ action: 'leave', id: created.id })).ok, true);
  let accepted = false;
  const next = b({ action: 'accept', id: created.id }).then(result => { accepted = true; return result; });
  await new Promise(r => setTimeout(r, 220)); assert.equal(accepted, false);
  finishRemoval(); assert.equal((await next).ok, true);
});
