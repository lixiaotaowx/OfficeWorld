import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import ts from 'typescript';

const source = ts.transpileModule(readFileSync(new URL('../src/officeNotifications.ts', import.meta.url), 'utf8'), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;

/** One browser-shaped sandbox; `desktop` adds the Electron preload bridge. */
function load({ desktop = 'none' } = {}) {
  const created = [], tones = [], events = [], alerts = [], alertOpen = [], cleared = [];
  const intervals = new Map();
  let intervalSeq = 0;
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
  const window = {
    Notification, addEventListener() {}, removeEventListener() {}, focus() {},
    dispatchEvent(event) { events.push(event.detail); },
    setInterval: (fn, ms) => { const id = ++intervalSeq; intervals.set(id, { fn, ms }); return id; },
    clearInterval: id => { cleared.push(id); intervals.delete(id); },
    officeDesktop: desktop === 'none' ? undefined : {
      // 'unhandled' models a build whose preload exposes `alert` while its main
      // process registers no such channel: the invoke rejects.
      alert: payload => {
        alerts.push(payload);
        return desktop === 'unhandled' ? Promise.reject(Error('No handler registered')) : Promise.resolve(true);
      },
      onAlertOpen: callback => { alertOpen.push(callback); return () => { alertOpen.length = 0; }; },
    },
  };
  const exports = {};
  vm.runInNewContext(source, { exports, window, Notification, AudioContext,
    CustomEvent: class { constructor(_, params) { this.detail = params.detail; } } });
  return { exports, window, created, tones, events, alerts, alertOpen, intervals, cleared,
    socket: new EventEmitter() };
}

test('系统通知仅实时来信/来电/新邀请，去重、静音原生音效、退出清理', async () => {
  const f = load();
  const dispose = f.exports.attachOfficeNotifications(f.socket, 'self');
  f.socket.emit('chat', { id: 'own', senderId: 'self', text: '自己的消息' });
  f.socket.emit('chat-history', [{ id: 'old', senderId: 'peer', text: '历史' }]);
  assert.equal(f.created.length, 0);
  const message = { id: 'new', senderId: 'peer', name: '同事', text: '你好' };
  f.socket.emit('chat', message); f.socket.emit('chat', message);
  f.socket.emit('request', { id: 'call', name: '同事', kind: 'voice' });
  const meeting = { invitations: [{ id: 'meeting', title: '讨论', members: [{ id: 'self', status: 'invited' }] }] };
  f.socket.emit('meeting-state', meeting); f.socket.emit('meeting-state', meeting);
  await Promise.resolve();
  assert.equal(f.created.length, 3); assert.ok(f.created.every(n => n.options.silent));
  // 普通消息只响一声；来电与会议各起一次铃声，后者顶掉前者的重复音。
  assert.equal(f.tones.length, 3);
  assert.equal(f.intervals.size, 1);
  assert.ok(f.cleared.length >= 1, '会议邀请必须停掉来电仍在重复的铃声');
  f.created[0].onclick(); assert.deepEqual(f.events, ['chat']);
  f.socket.emit('request-expired', 'call'); assert.ok(f.created[1].closed);
  dispose(); assert.ok(f.created.every(n => n.closed));
  assert.equal(f.intervals.size, 0, '退出必须停掉仍在重复的铃声');
  f.socket.emit('chat', { ...message, id: 'after' }); assert.equal(f.created.length, 3);
});

test('桌面端把来电与会议交给主进程原生弹窗并抢前台，普通消息不抢窗口', () => {
  const f = load({ desktop: 'ok' });
  const dispose = f.exports.attachOfficeNotifications(f.socket, 'self');
  f.socket.emit('chat', { id: 'm1', senderId: 'peer', name: '同事', text: '你好' });
  f.socket.emit('request', { id: 'c1', name: '同事', kind: 'voice' });
  f.socket.emit('meeting-state', { invitations: [{ id: 'g1', title: '讨论', members: [{ id: 'self', status: 'invited' }] }] });
  assert.deepEqual(f.alerts.map(a => [a.section, a.urgent]),
    [['chat', false], ['call', true], ['meeting', true]], '只有来电与会议是抢屏的紧急事件');
  assert.equal(f.created.length, 0, '桌面端不得再弹一条重复的 HTML5 通知');
  assert.equal(f.intervals.size, 1, '同一时刻只有一次铃声在响');
  // 原生弹窗的点击走 IPC 回到渲染进程，再转成同一条打开事件。
  f.alertOpen[0]('meeting');
  assert.deepEqual(f.events, ['meeting']);
  assert.equal(f.intervals.size, 0, '点击原生弹窗必须停止铃声');
  dispose();
  assert.equal(f.alertOpen.length, 0, '退出必须退订原生弹窗回调');
});

test('桌面端没有注册处理器时回退到网页通知，而不是静默丢弃', async () => {
  const f = load({ desktop: 'unhandled' });
  f.exports.attachOfficeNotifications(f.socket, 'self');
  f.socket.emit('chat', { id: 'm1', senderId: 'peer', name: '同事', text: '你好' });
  await Promise.resolve(); await Promise.resolve();
  assert.equal(f.alerts.length, 1, '仍然优先尝试桌面通道');
  assert.equal(f.created.length, 1, '桥接拒绝后必须回退到 HTML5 通知，不能没有提示');
});
