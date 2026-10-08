// 键鼠活跃检测：多久算离桌、什么时候上报、上报时带不带"已经安静了多久"，
// 以及桌面端"在别的软件里干活也算在座"（系统级空闲时间）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/presenceInput.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText;
const { watchInputPresence, deskSensorLabel, AWAY_AFTER_MS, TICK_MS, IDLE_POLL_MS } = await import(
  'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

function harness({ awayAfterMs = 1_000, desktopIdle } = {}) {
  const listeners = new Map();
  const target = {
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type, listener) { if (listeners.get(type) === listener) listeners.delete(type); },
  };
  const sent = [];
  const socketListeners = new Map();
  const socket = {
    connected: true,
    emit: (event, payload) => sent.push([event, payload]),
    on: (event, listener) => { socketListeners.set(event, listener); return socket; },
    off: (event, listener) => { if (socketListeners.get(event) === listener) socketListeners.delete(event); return socket; },
  };
  const state = { now: 0 };
  const intervals = new Map();
  let seq = 0, cleared = 0;
  const presence = watchInputPresence(socket, {
    target, awayAfterMs, now: () => state.now, desktopIdle,
    setInterval: (handler, ms) => { const id = ++seq; intervals.set(id, { handler, ms }); return id; },
    clearInterval: (id) => { cleared += 1; intervals.delete(id); },
  });
  /** Fire every timer with this period — 1s tick or the desktop poll. */
  const fire = ms => { for (const entry of [...intervals.values()]) if (entry.ms === ms) entry.handler(); };
  const last = () => sent.at(-1)?.[1];
  return {
    presence, listeners, sent, socketListeners, socket, last,
    advance(ms) { state.now += ms; },
    fire,
    periods: () => [...intervals.values()].map(entry => entry.ms).sort((a, b) => a - b),
    cleared: () => cleared,
  };
}

/** Let the injected promise callbacks run. */
const settle = () => new Promise(resolve => setTimeout(resolve, 0));

test('忙碌按活跃秒数而非事件数判定，停止频繁输入八秒后恢复', () => {
  const h = harness({ awayAfterMs: 10_000 });
  for (let i = 0; i < 100; i++) h.presence.touch();
  assert.equal(h.sent.length, 0, '一秒内大量鼠标事件不算持续忙碌');
  for (let i = 0; i < 5; i++) { h.advance(1000); h.presence.touch(); }
  assert.equal(h.last().busy, true);
  h.advance(8000); h.presence.tick();
  assert.equal(h.last().busy, false);
  assert.equal(h.last().atDesk, true);
});

test('桌面系统持续活跃可触发忙碌，锁屏清除忙碌', async () => {
  let idle = { seconds: 0, state: 'active' };
  const h = harness({ awayAfterMs: 10000, desktopIdle: async () => idle });
  for (let i = 0; i < 4; i++) { h.advance(2000); h.presence.poll(); await settle(); }
  assert.equal(h.last().busy, true);
  idle = { seconds: 0, state: 'locked' };
  h.presence.poll(); await settle();
  assert.equal(h.last().busy, false);
  assert.equal(h.last().atDesk, false);
});

test('阈值是 10 秒；刚打开页面算在座，也不会上报', () => {
  const h = harness();
  assert.equal(AWAY_AFTER_MS, 10_000);
  assert.equal(TICK_MS, 1_000);
  assert.equal(IDLE_POLL_MS, 2_000, '轮询要比 10 秒阈值密，否则红点会迟到');
  assert.equal(h.presence.isAtDesk(), true);
  assert.deepEqual(h.periods(), [TICK_MS], '浏览器里不该有多余的轮询');
  h.fire(TICK_MS);
  assert.equal(h.sent.length, 0);
});

test('安静超过阈值就报离桌，并带上已经安静了多久；再次输入报在座', () => {
  const h = harness({ awayAfterMs: 10_000 });
  h.advance(13_000);
  h.fire(TICK_MS);
  assert.equal(h.sent.length, 1);
  assert.equal(h.last().atDesk, false);
  assert.ok(h.last().idleMs >= 13_000, '离座时间要从停止操作那一刻算起，实际 ' + h.last().idleMs);
  h.advance(2_000);
  h.fire(TICK_MS);
  assert.equal(h.sent.length, 1, '一直离桌不该反复上报');
  h.listeners.get('pointermove')();
  assert.equal(h.last().atDesk, true);
  assert.equal(h.sent.length, 2);
});

test('鼠标、键盘、滚轮、触摸都能把人叫回来', () => {
  for (const type of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart']) {
    const h = harness({ awayAfterMs: 1_000 });
    h.advance(1_000);
    h.fire(TICK_MS);
    assert.equal(h.last().atDesk, false, `${type} 之前应该已经离桌`);
    h.listeners.get(type)();
    assert.equal(h.last().atDesk, true, `${type} 应该算在座`);
  }
});

test('重连后重新声明当前状态，免得上线的人被当成在座', () => {
  const h = harness({ awayAfterMs: 1_000 });
  h.advance(1_000);
  h.fire(TICK_MS);
  const connect = h.socketListeners.get('connect');
  assert.ok(connect, '必须监听 connect');
  connect();
  assert.equal(h.last().atDesk, false);
  assert.deepEqual(h.sent.at(-1)[0], 'input-state');
});

test('还没连上时不上报，卸载后不留监听和定时器', () => {
  const h = harness({ awayAfterMs: 1_000, desktopIdle: async () => ({ seconds: 0, state: 'active' }) });
  assert.deepEqual(h.periods(), [TICK_MS, IDLE_POLL_MS], '桌面端多一个轮询');
  h.socket.connected = false;
  h.advance(1_000);
  h.fire(TICK_MS);
  assert.equal(h.sent.length, 0, '没连上就没必要发');
  h.presence.stop();
  assert.equal(h.periods().length, 0);
  assert.equal(h.cleared(), 2, '两个定时器都要清掉');
  assert.equal(h.listeners.size, 0);
  assert.equal(h.socketListeners.size, 0);
});

test('桌面端：在别的软件里干活（系统输入在动）也算在座', async () => {
  // The user's case: no input reaches this page for three minutes because the
  // person is typing in Word. The OS says the machine is active, so 在座.
  const h = harness({ awayAfterMs: 10_000, desktopIdle: async () => ({ seconds: 0, state: 'active' }) });
  h.advance(180_000);
  h.fire(TICK_MS);
  assert.equal(h.last().atDesk, false, '只看本页输入的话已经误判离桌');
  h.fire(IDLE_POLL_MS);
  await settle();
  assert.equal(h.presence.isAtDesk(), true);
  assert.equal(h.last().atDesk, true, '桌面端必须把人叫回座位');
});

test('底部栏要能看出"谁在判定"：客户端=系统空闲，浏览器=仅本窗口输入', () => {
  // 用户报障「离座检测不管用，鼠标需要去到软件里面才行」——浏览器根本看不到别的
  // 程序，所以先把"现在是哪种判定"显示出来，不用猜（2026-09-15）。
  assert.equal(harness({ desktopIdle: async () => ({ seconds: 0 }) }).presence.usesSystemIdle(), true);
  assert.equal(harness().presence.usesSystemIdle(), false, '浏览器没有 systemIdle，只能看本窗口');
  assert.match(deskSensorLabel(true), /系统空闲/);
  assert.match(deskSensorLabel(false), /本窗口输入/);
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /office\.deskSensorLabel/, '底部栏要渲染这行状态');
  const office = readFileSync(new URL('../src/useOffice.ts', import.meta.url), 'utf8');
  assert.match(office, /setSystemIdleSensor\(presence\.usesSystemIdle\(\)\)/, '要真的问一下桥接有没有');
});

test('桌面端：系统空闲超过阈值算离桌，锁屏也算离桌，回到电脑再变绿', async () => {
  let idle = { seconds: 0, state: 'active' };
  const h = harness({ awayAfterMs: 10_000, desktopIdle: async () => idle });
  h.advance(600_000);
  h.fire(IDLE_POLL_MS);
  await settle();
  assert.equal(h.sent.length, 0, '系统一直在动，不该报离桌');

  idle = { seconds: 40, state: 'idle' };
  h.fire(IDLE_POLL_MS);
  await settle();
  assert.equal(h.last().atDesk, false);
  assert.ok(h.last().idleMs >= 40_000, 'Windows 说的空闲秒数就是离座时长，实际 ' + h.last().idleMs);

  idle = { seconds: 0, state: 'locked' };
  h.fire(IDLE_POLL_MS);
  await settle();
  assert.equal(h.last().atDesk, false, '锁屏要算离桌');
  assert.equal(h.sent.length, 1, '本来就在离桌，不该重复上报');

  idle = { seconds: 0, state: 'active' };
  h.fire(IDLE_POLL_MS);
  await settle();
  assert.equal(h.last().atDesk, true, '解锁回到电脑就回绿');
});

test('桌面端轮询失败时退回本页输入判定，不把人永远留在绿点', async () => {
  const h = harness({ awayAfterMs: 1_000, desktopIdle: async () => { throw new Error('ipc down'); } });
  h.advance(5_000);
  h.fire(IDLE_POLL_MS);
  await settle();
  h.fire(TICK_MS);
  assert.equal(h.last().atDesk, false);
});
