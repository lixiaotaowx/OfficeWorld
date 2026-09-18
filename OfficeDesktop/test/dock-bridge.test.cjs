// 头像条与主窗口之间的中转：状态转发、预览按需、点击回传、以及"只有这两个窗口能说话"。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { installDockBridge } = require('../dock-bridge.cjs');
const { OFFICE_URL } = require('../policy.cjs');

function harness() {
  const handlers = {};
  const ipcMain = { handle: (name, fn) => { handlers[name] = fn; } };
  const dockSent = [], dockVisible = [];
  const dock = {
    window: () => dockWindow,
    send: (channel, payload) => { dockSent.push({ channel, payload }); return true; },
    setVisible: (visible, reason) => { dockVisible.push({ visible, reason }); return visible; },
    moveBy: () => { dockVisible.push({ remembered: true }); return true; },
  };
  const appSent = [];
  const appWindow = { destroyed: false, minimized: false, shown: 0,
    isDestroyed: () => false, isMinimized() { return this.minimized; },
    restore() { this.minimized = false; }, show() { this.shown++; },
    moveTop() { this.shown++; }, focus() { this.shown++; },
    webContents: { send: (channel, payload) => appSent.push({ channel, payload }) } };
  const dockWindow = { destroyed: false, isDestroyed: () => false,
    webContents: { send: () => true } };
  const frame = { url: OFFICE_URL + 'dock.html' };
  const appFrame = { url: OFFICE_URL };
  const event = { sender: dockWindow.webContents, senderFrame: frame };
  const appEvent = { sender: appWindow.webContents, senderFrame: appFrame };
  const intruder = { sender: { send: () => true }, senderFrame: { url: OFFICE_URL } };
  const bridge = installDockBridge({ dock, getWindow: () => appWindow, ipcMain });
  return { bridge, handlers, dockSent, dockVisible, appSent, event, appEvent, intruder,
    call: (name, ...args) => handlers[name](event, ...args),
    fromApp: (name, ...args) => handlers[name](appEvent, ...args) };
}

test('主窗口推状态：缓存一份、转发给小窗，共享屏幕时把自己藏起来', () => {
  const h = harness();
  const ok = h.fromApp('office:dock-publish', {
    people: [{ id: 'p1', name: '同事乙', character: 'man_suit', atDesk: false, sharing: true, unread: 3 },
      { id: 'p2', name: '客户丙', role: 'visitor' }],
    sharing: false, missed: 0,
  });
  assert.equal(ok, true);
  assert.deepEqual(h.dockSent.at(-1).payload.people, [
    { id: 'p1', name: '同事乙', character: 'man_suit', atDesk: false, sharing: true, hasPreview: false, unread: 3 },
    { id: 'p2', name: '客户丙', character: '', atDesk: true, sharing: false, hasPreview: false, unread: 0 },
  ]);
  assert.deepEqual(h.dockVisible.at(-1), { visible: true, reason: '' });

  // 自己正在共享屏幕：连小窗一起藏，免得被共享出去。
  h.fromApp('office:dock-publish', { people: [], sharing: true });
  assert.deepEqual(h.dockVisible.at(-1), { visible: false, reason: 'sharing' });
});

test('小窗能拿到最近一次状态（刚打开时先画出来）', () => {
  const h = harness();
  h.fromApp('office:dock-publish', { people: [{ id: 'p1', name: '甲' }], sharing: false });
  const state = h.call('office:dock-state');
  assert.equal(state.people.length, 1);
  assert.equal(state.people[0].name, '甲');
});

test('悬停要一帧：小窗 → 主窗口；主窗口给帧 → 小窗', () => {
  const h = harness();
  assert.equal(h.call('office:dock-preview-want', 'p1'), true);
  assert.deepEqual(h.appSent.at(-1), { channel: 'office:dock-preview-want', payload: 'p1' });
  assert.equal(h.fromApp('office:dock-preview', { id: 'p1', image: 'data:image/jpeg;base64,AAA' }), true);
  assert.deepEqual(h.dockSent.at(-1), { channel: 'office:dock-preview', payload: { id: 'p1', image: 'data:image/jpeg;base64,AAA' } });
});

test('点按钮：把小窗的意图转给主窗口，并把办公室窗口抬到前面', () => {
  const h = harness();
  for (const kind of ['watch', 'share', 'call']) {
    assert.equal(h.call('office:dock-action', { kind, personId: 'p1' }), true);
    assert.deepEqual(h.appSent.at(-1), { channel: 'office:dock-command', payload: { kind, personId: 'p1' } });
  }
  assert.equal(h.appEvent.sender === h.intruder.sender, false);
});

test('未知动作直接拒绝', () => {
  const h = harness();
  assert.throws(() => h.call('office:dock-action', { kind: 'launch-missiles', personId: 'p1' }), /Unknown dock action/);
});

test('只有主窗口与小窗能调这些通道，别的页面一律拒绝', () => {
  const h = harness();
  // 陌生人调小窗那侧的能力
  assert.throws(() => h.handlers['office:dock-state'](h.intruder), /Untrusted/);
  assert.throws(() => h.handlers['office:dock-preview-want'](h.intruder, 'p1'), /Untrusted/);
  assert.throws(() => h.handlers['office:dock-action'](h.intruder, { kind: 'call', personId: 'p1' }), /Untrusted/);
  // 陌生人冒充主窗口推状态
  assert.throws(() => h.handlers['office:dock-publish'](h.intruder, { people: [] }), /Untrusted/);
  assert.throws(() => h.handlers['office:dock-preview'](h.intruder, { id: 'p1' }), /Untrusted/);
  // 小窗也不能推状态（它只该读）
  assert.throws(() => h.call('office:dock-publish', { people: [] }), /Untrusted/);
});

test('拖动：小窗说自己被拖了，主进程去记位置', () => {
  const h = harness();
  h.call('office:dock-drag', { dx: -10, dy: 0 });
  assert.deepEqual(h.dockVisible.at(-1), { remembered: true });
});

test('状态清洗：人数上限、未读数取整、空 id 丢掉', () => {
  const h = harness();
  const people = Array.from({ length: 70 }, (_, index) => ({ id: 'p' + index, name: 'N' + index }));
  people.push({ id: '', name: '无名' });
  h.fromApp('office:dock-publish', { people, sharing: false });
  assert.equal(h.bridge.state().people.length, 64, '最多 64 个，避免小窗被塞爆');
  assert.equal(h.bridge.state().people[0].id, 'p0');

  h.fromApp('office:dock-publish', { people: [{ id: '', name: '无名' }, { id: 'bad', name: '坏', unread: -5 }], sharing: false });
  const state = h.bridge.state();
  assert.equal(state.people.length, 1, '空 id 丢掉');
  assert.equal(state.people[0].id, 'bad');
  assert.equal(state.people[0].unread, 0, '负数抹平');
});
