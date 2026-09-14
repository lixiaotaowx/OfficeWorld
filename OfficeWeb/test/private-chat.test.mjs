import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { io } from 'socket.io-client';
import { createOfficeServer } from '../server.mjs';

test('私聊文字/文件实时与历史隔离，离线与重启补收、公共兼容、跨会话防重放', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'private-chat-'));
  const sockets = [];
  let server, base;
  async function start() {
    server = createOfficeServer({ statePath: join(dir, 'state.json'), accountsPath: join(dir, 'accounts.json'), secureCookies: false });
    await new Promise(resolve => server.http.listen(0, '127.0.0.1', resolve));
    base = `http://127.0.0.1:${server.http.address().port}`;
  }
  async function register(name) {
    const res = await fetch(base + '/api/auth/register', { method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify({ name, password: '1' }) });
    assert.equal(res.status, 200);
    return { ...(await res.json()).user, cookie: res.headers.get('set-cookie').split(';')[0] };
  }
  async function connect(user) {
    const socket = io(base, { transports: ['websocket'], reconnection: false,
      extraHeaders: { Cookie: user.cookie, Origin: base } });
    sockets.push(socket);
    await new Promise((resolve, reject) => {
      socket.on('connect_error', reject);
      socket.on('connect', () => socket.emit('join', {}));
      socket.on('people', rows => { if (rows.some(p => p.id === socket.id)) resolve(); });
    });
    return socket;
  }
  try {
    await start();
    const a = await register('同事甲'), b = await register('同事乙'), c = await register('同事丙');
    const sa = await connect(a), sb = await connect(b), sc = await connect(c);
    const seenA = [], seenB = [], seenC = [];
    sa.on('chat', m => seenA.push(m)); sb.on('chat', m => seenB.push(m)); sc.on('chat', m => seenC.push(m));
    const payload = { text: '仅甲乙可见', recipientId: b.id, requestId: 'private-1', senderId: c.id };
    const sent = await sa.emitWithAck('chat', payload);
    assert.equal(sent.ok, true); assert.equal(sent.message.senderId, a.id);
    assert.equal(sent.message.recipientId, b.id);
    assert.equal((await sa.emitWithAck('chat', payload)).message.id, sent.message.id);
    assert.equal((await sa.emitWithAck('chat', { ...payload, recipientId: c.id })).ok, false);
    assert.equal((await sa.emitWithAck('chat', { ...payload, requestId: 'self', recipientId: a.id })).ok, false);
    assert.equal((await sa.emitWithAck('chat', { ...payload, requestId: 'missing', recipientId: 'missing' })).ok, false);
    const data = { requestId: 'private-file', recipientId: b.id, name: '私密.txt', size: 6, offset: 0, bytes: Buffer.from('abc') };
    assert.equal((await sa.emitWithAck('chat-file', data)).offset, 3);
    assert.equal((await sa.emitWithAck('chat-file', { ...data, offset: 3, recipientId: c.id })).ok, false);
    const uploaded = await sa.emitWithAck('chat-file', { ...data, offset: 3, bytes: Buffer.from('def') });
    assert.equal(uploaded.ok, true);
    const route = '/api/chat/files/' + uploaded.message.attachment.id;
    for (const user of [a, b]) {
      const res = await fetch(base + route, { headers: { Cookie: user.cookie } });
      assert.equal(res.status, 200); assert.equal(await res.text(), 'abcdef');
    }
    assert.equal((await fetch(base + route, { headers: { Cookie: c.cookie } })).status, 403);
    assert.equal((await fetch(base + route)).status, 401);
    assert.equal((await sc.emitWithAck('chat-history', '')).messages.length, 0);
    assert.ok(seenA.some(m => m.id === sent.message.id)); assert.ok(seenB.some(m => m.id === sent.message.id));
    assert.equal(seenC.length, 0);
    sb.disconnect();
    const contacts = await sa.emitWithAck('chat-contacts');
    assert.ok(contacts.contacts.some(contact => contact.id === b.id));
    const offline = await sa.emitWithAck('chat', { ...payload, requestId: 'offline', text: '离线留言' });
    assert.equal(offline.ok, true);
    const pub = await sc.emitWithAck('chat', { text: '公共消息', requestId: 'public' });
    assert.equal(pub.ok, true); assert.equal(pub.message.recipientId, undefined);
    assert.deepEqual((await sc.emitWithAck('chat-history', '')).messages.map(m => m.text), ['公共消息']);
    sockets.forEach(socket => socket.disconnect());
    await new Promise(resolve => server.io.close(resolve));
    await start();
    const restored = await connect(b);
    const history = await restored.emitWithAck('chat-history', '');
    assert.equal(history.messages.length, 4);
    assert.ok(history.messages.some(m => m.text === '离线留言'));
    assert.equal((await restored.emitWithAck('chat-history', history.cursor)).messages.length, 0);
  } finally {
    sockets.forEach(socket => socket.disconnect());
    if (server) await new Promise(resolve => server.io.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
});

