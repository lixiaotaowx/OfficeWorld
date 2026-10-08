import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTs } from './helpers.mjs';
const { buildDockState } = await import(await loadTs('dockRules.ts'));
const person = (id, extra) => ({ id, clientId: id, name: id, seat: 1, role: 'employee', ...extra });

test('旧桌面桥保留的 character 字符串携带完整配件', () => {
  const appearance = { color: 'navy', accessories: { glasses: 'black', hair: 'short', beard: 'none', hat: 'tophat' } };
  const state = buildDockState({ people: [person('p', { appearance })], unread: {}, missed: new Set() });
  const carried = String(state.people[0].character);
  assert.ok(carried.startsWith('look:'));
  assert.deepEqual(JSON.parse(carried.slice(5)), appearance);
});
