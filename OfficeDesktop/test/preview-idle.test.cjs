// 离开电脑就停采集，别挡息屏（用户 2026-09-17：「离开就暂停采集 不要耽误息屏」）。
//
// Windows 上"正在采集桌面"会让 Chromium 申请 DISPLAY 常亮，实测 powercfg /requests
// 显示 `Native desktop capture`——所以只要系统空闲超过阈值，就必须把采集流停掉。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createPreviewIdleGate, AWAY_PAUSE_SECONDS } = require('../preview-idle.cjs');

function harness({ idle = 0, awaySeconds } = {}) {
  const stopped = [];
  const state = { idle };
  const gate = createPreviewIdleGate({
    powerMonitor: { getSystemIdleTime: () => state.idle },
    awaySeconds,
    onChange: paused => stopped.push(paused),
  });
  return { gate, state, stopped };
}

test('阈值默认 60 秒，必须不大于系统的关屏超时', () => {
  assert.equal(AWAY_PAUSE_SECONDS, 60);
});

test('人在电脑前：一直不暂停，也不会去停流', () => {
  const h = harness();
  assert.equal(h.gate.check(), false);
  h.state.idle = 59;
  assert.equal(h.gate.check(), false);
  assert.deepEqual(h.stopped, [], '没到阈值不该停采集');
});

test('空闲到阈值：判定暂停并通知一次停流（不重复通知）', () => {
  const h = harness();
  h.state.idle = 60;
  assert.equal(h.gate.check(), true);
  assert.equal(h.gate.paused(), true);
  assert.deepEqual(h.stopped, [true]);
  h.state.idle = 600;
  assert.equal(h.gate.check(), true);
  assert.deepEqual(h.stopped, [true], '已经在暂停状态，不再重复通知');
});

test('人一回来：立刻恢复采集', () => {
  const h = harness();
  h.state.idle = 120;
  h.gate.check();
  h.state.idle = 0;
  assert.equal(h.gate.check(), false);
  assert.equal(h.gate.paused(), false);
  assert.deepEqual(h.stopped, [true, false]);
});

test('读不到空闲时间时当 0：宁可继续采集，也不莫名停掉预览', () => {
  const gate = createPreviewIdleGate({ powerMonitor: { getSystemIdleTime: () => { throw Error('no'); } } });
  assert.equal(gate.idleSeconds(), 0);
  assert.equal(gate.check(), false);
  const broken = createPreviewIdleGate({ powerMonitor: { getSystemIdleTime: () => undefined } });
  assert.equal(broken.check(), false);
});

test('阈值可调，便于按别人的关屏设置改', () => {
  const h = harness({ awaySeconds: 30 });
  h.state.idle = 30;
  assert.equal(h.gate.check(), true);
  assert.equal(h.gate.awaySeconds, 30);
});
