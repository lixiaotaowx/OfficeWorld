import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const js = ts.transpileModule(readFileSync(new URL('../src/restoreLogin.ts', import.meta.url), 'utf8'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { restoreLogin } = await import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
const flush = () => new Promise(resolve => setImmediate(resolve));
const response = (status, data) => ({ status, ok: status === 200, json: async () => data });

test('自动登录网络重试、在线立即恢复、清除失效登录、取消旧请求', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.window = new EventTarget();
  const calls = [], users = [], errors = [];
  let clear = 0, offline = true;
  window.officeDesktop = { readLogin: async () => ({ name: '测试', password: '1' }),
    clearLogin: async () => { clear++; } };
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (offline) throw Error('Offline');
    return url.endsWith('/me') ? response(401, {}) : response(200, { user: { name: '测试' } });
  };
  const callbacks = { user: user => users.push(user), loading: () => {}, error: error => errors.push(error) };
  let stop;
  try {
    stop = restoreLogin(callbacks);
    await flush();
    assert.match(errors[0], /5 秒后自动重试/);
    offline = false; window.dispatchEvent(new Event('online')); await flush();
    assert.equal(users.length, 1);
    assert.ok(calls.every(call => call.url === '/api/auth/login'), 'launch must log in even with an old cookie');
    assert.equal(JSON.parse(calls.at(-1).options.body).password, '1');
    const count = calls.length;
    window.dispatchEvent(new Event('online')); await flush();
    assert.equal(calls.length, count);

    globalThis.fetch = async () => response(401, { invalidSession: true });
    stop = restoreLogin(callbacks); await flush();
    assert.equal(clear, 0);
    assert.equal(users.length, 1);
    assert.match(errors.at(-1), /姓名或密码不正确/);

    let finish;
    globalThis.fetch = () => new Promise(resolve => { finish = resolve; });
    stop = restoreLogin(callbacks); await flush(); stop();
    finish(response(200, { user: { name: '过期请求' } })); await flush();
    assert.equal(users.length, 1);
  } finally { stop?.(); globalThis.fetch = originalFetch; delete globalThis.window; }
});
