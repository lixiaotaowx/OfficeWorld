import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { automaticExpression, createInputPresence } from '../input-presence.mjs';
import { loadTs } from './helpers.mjs';

const { activityExpression } = await import(await loadTs('expressionPortrait.ts'));
const { decodeDockExpression } = await import(await loadTs('dockAppearance.ts'));
const { buildDockState } = await import(await loadTs('dockRules.ts'));

test('时间边界、忙碌覆盖开心、长离座覆盖忙碌', () => {
  const p = { atDesk: true, onlineSince: 0 };
  assert.equal(automaticExpression(p, 600000), 'focused');
  assert.equal(automaticExpression(p, 600001), 'happy');
  assert.equal(automaticExpression({ ...p, busy: true }, 700000), 'busy');
  const away = { ...p, atDesk: false, awaySince: 0, busy: true };
  assert.equal(automaticExpression(away, 299999), 'away');
  assert.equal(automaticExpression(away, 300000), 'sleepy');
  assert.equal(activityExpression({ autoExpression: 'busy', inCall: true }), 'focused');
  assert.equal(activityExpression({ autoExpression: 'sleepy', greeting: true }), 'wave');
});

test('服务端发布状态翻转与到时切换，新观察者收到同一状态', () => {
  const io = new EventEmitter(), socket = new EventEmitter();
  socket.id = 'a';
  const people = new Map([['a', { id: 'a', atDesk: true }]]);
  const snapshots = [];
  const presence = createInputPresence({ io, people, publish: () => snapshots.push(presence.view()) });
  io.emit('connection', socket);
  presence.view();
  socket.emit('input-state', { atDesk: true, busy: true });
  assert.equal(snapshots.at(-1)[0].autoExpression, 'busy');
  socket.emit('input-state', { atDesk: true, busy: true });
  assert.equal(snapshots.length, 1);
  socket.emit('input-state', { atDesk: false, idleMs: 299000 });
  people.get('a').awaySince = Date.now() - 300000;
  presence.refresh();
  assert.equal(snapshots.at(-1)[0].autoExpression, 'sleepy');
  assert.equal(presence.view()[0].autoExpression, 'sleepy');
  const count = snapshots.length;
  presence.refresh();
  assert.equal(snapshots.length, count);
});

test('所有表情穿过旧桌面桥保留的 character 字符串，不改变装扮', () => {
  for (const pose of ['busy', 'focused', 'sleepy', 'away', 'happy']) {
    const state = buildDockState({ people: [{ id: 'a', name: 'A', autoExpression: pose,
      appearance: { color: 'sage', accessories: {} } }], previews: {}, unread: {}, missed: new Set() });
    assert.equal(decodeDockExpression(state.people[0].character), pose);
  }
  assert.equal(decodeDockExpression('look:invalid'), undefined);
  assert.equal(decodeDockExpression('look:{"autoExpression":"invalid"}'), undefined);
});
