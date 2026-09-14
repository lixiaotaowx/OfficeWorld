import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import ts from 'typescript';

test('系统通知仅实时来信/来电/新邀请，去重、静音原生音效、退出清理', async () => {
  const created = [], tones = [];
  class Notification {
    static permission = 'granted';
    constructor(title, options) { this.title = title; this.options = options; created.push(this); }
    close() { this.closed = true; this.onclose?.(); }
  }
  class AudioContext {
    state = 'running'; currentTime = 0;
    resume() { return Promise.resolve(); }
    close() { return Promise.resolve(); }
    createOscillator() { return { frequency: {}, connect() {}, disconnect() {}, start() { tones.push(1); }, stop() {} }; }
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {}, disconnect() {} }; }
  }
  const events = [];
  const window = { Notification, addEventListener() {}, removeEventListener() {}, focus() {}, dispatchEvent(e) { events.push(e.detail); } };
  const exports = {};
  const source = ts.transpileModule(readFileSync(new URL('../src/officeNotifications.ts', import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, window, Notification, AudioContext, CustomEvent: class { constructor(_, p) { this.detail = p.detail; } } });
  const socket = new EventEmitter();
  const dispose = exports.attachOfficeNotifications(socket, 'self');
  socket.emit('chat', { id: 'own', senderId: 'self', text: '自己的消息' });
  socket.emit('chat-history', [{ id: 'old', senderId: 'peer', text: '历史' }]);
  assert.equal(created.length, 0);
  const message = { id: 'new', senderId: 'peer', name: '同事', text: '你好' };
  socket.emit('chat', message); socket.emit('chat', message);
  socket.emit('request', { id: 'call', name: '同事', kind: 'voice' });
  const meeting = { invitations: [{ id: 'meeting', title: '讨论', members: [{ id: 'self', status: 'invited' }] }] };
  socket.emit('meeting-state', meeting); socket.emit('meeting-state', meeting);
  await Promise.resolve();
  assert.equal(created.length, 3); assert.equal(tones.length, 1);
  assert.ok(created.every(n => n.options.silent));
  created[0].onclick(); assert.deepEqual(events, ['chat']);
  socket.emit('request-expired', 'call'); assert.ok(created[1].closed);
  dispose(); assert.ok(created.every(n => n.closed));
  socket.emit('chat', { ...message, id: 'after' }); assert.equal(created.length, 3);
});
