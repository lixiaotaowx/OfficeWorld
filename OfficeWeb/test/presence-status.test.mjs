import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { createPresenceStatus } from '../presence-status.mjs';

test('status authentication, own identity, persistence, validation and clearing', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'presence-'));
  const path = join(dir, 'status.json');
  let handle = createPresenceStatus(path);
  const accounts = { authenticate: req => req.headers.user ? { id: req.headers.user } : null,
    originAllowed: req => req.headers.origin === 'http://trusted' };
  const server = createServer(async (req, res) => { await handle(req, res, accounts); });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/presence-status`;
  const get = user => fetch(url, { headers: user ? { user } : {} });
  const post = (user, data, origin = 'http://trusted') => fetch(url, {
    method: 'POST', headers: { user, origin }, body: JSON.stringify(data),
  });
  try {
    assert.equal((await get()).status, 401);
    assert.equal((await post('alice', { text: '外出' }, 'http://other')).status, 403);
    assert.equal((await post('alice', { id: 'bob', text: '吃饭去了' })).status, 200);
    assert.deepEqual((await (await get('bob')).json()).statuses, { alice: '吃饭去了' });
    assert.equal((await post('bob', { text: '周五准备文件' })).status, 200);
    handle = createPresenceStatus(path);
    assert.deepEqual((await (await get('alice')).json()).statuses, { alice: '吃饭去了', bob: '周五准备文件' });
    assert.equal((await post('alice', { text: '长'.repeat(41) })).status, 400);
    assert.equal((await post('alice', { text: '长'.repeat(1000) })).status, 413);
    assert.equal((await post('alice', { text: null })).status, 400);
    assert.equal((await post('alice', { id: 'bob', text: '' })).status, 200);
    assert.deepEqual((await (await get('alice')).json()).statuses, { bob: '周五准备文件' });
  } finally {
    await new Promise(resolve => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
});
