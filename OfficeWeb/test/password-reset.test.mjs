import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createAccounts } from '../accounts.mjs';

test('simple reset preserves account, revokes old sessions and persists only a salted hash', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'office-reset-'));
  const file = join(dir, 'accounts.json');
  const notified = [];
  let accounts = createAccounts(file, { secure: false, onLogin: id => notified.push(id) });
  const server = createServer((req, res) => void accounts.handle(req, res));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = async (route, body, origin = base) => {
    const response = await fetch(base + '/api/auth/' + route, { method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json(), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  };
  try {
    const first = await post('register', { name: '找回测试', password: 'old-secret' });
    const id = first.body.user.id;
    accounts.setRole(id, 'employee');
    accounts.setAppearance(id, { color: 'navy', accessories: { hat: 'tophat' } });
    const disk = () => readFileSync(join(file + '.d', id + '.json'), 'utf8');
    const before = JSON.parse(disk()).user;
    assert.equal((await post('reset-password', { name: '找回测试', password: '' })).status, 400);
    assert.equal((await post('reset-password', { name: '找回测试', password: 'a'.repeat(17) })).status, 400);
    assert.equal((await post('reset-password', { name: '未注册的人', password: 'new-secret' })).status, 404);
    assert.equal((await post('reset-password', { name: '找回测试', password: 'new-secret' }, 'https://elsewhere.invalid')).status, 403);
    const blockedWrite = join(file + '.d', id + '.json.next');
    mkdirSync(blockedWrite);
    assert.equal((await post('reset-password', { name: '找回测试', password: 'not-saved' })).status, 400);
    assert.equal(accounts.authenticate({ headers: { cookie: first.cookie } }).hash, before.hash,
      'failed disk write restores original password and sessions');
    rmSync(blockedWrite, { recursive: true });
    const reset = await post('reset-password', { name: '找回测试', password: 'new-secret' });
    assert.equal(reset.status, 200);
    assert.equal(reset.body.user.id, id);
    assert.equal(reset.body.user.role, 'employee');
    assert.equal(reset.body.user.lookConfirmed, true);
    assert.equal(reset.body.user.appearance.accessories.hat, 'tophat');
    assert.equal(accounts.authenticate({ headers: { cookie: first.cookie } }), undefined);
    assert.equal(accounts.authenticate({ headers: { cookie: reset.cookie } }).id, id);
    assert.equal(notified.at(-1), id, 'normal session replacement callback runs');
    assert.ok(!disk().includes('new-secret') && !disk().includes('old-secret'));
    assert.notEqual(JSON.parse(disk()).user.salt, before.salt);
    accounts = createAccounts(file, { secure: false });
    assert.equal((await post('login', { name: '找回测试', password: 'old-secret' })).status, 401);
    assert.equal((await post('login', { name: '找回测试', password: 'new-secret' })).status, 200);
    for (let i = 0; i < 30; i++) await post('reset-password', { name: '不存在的姓名', password: '1' });
    assert.equal((await post('reset-password', { name: '找回测试', password: '1' })).status, 429);
  } finally {
    await new Promise(r => server.close(r));
    rmSync(dir, { recursive: true, force: true });
  }
});
