// 头像条与主窗口之间的中转：状态转发、预览按需、点击回传、以及"只有这两个窗口能说话"。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { installDockBridge } = require('../dock-bridge.cjs');
const { OFFICE_URL } = require('../policy.cjs');

function harness(options = {}) {
  const handlers = {};
  const ipcMain = { handle: (name, fn) => { handlers[name] = fn; } };
  const dockSent = [], dockVisible = [], layouts = [];
  // 任务栏颜色（主进程读注册表）：测试里可以随时换，看小窗会不会跟着换色。
  let themeValue = options.theme === undefined ? null : options.theme;
  const dock = {
    window: () => dockWindow,
    send: (channel, payload) => { dockSent.push({ channel, payload }); return true; },
    setVisible: (visible, reason) => { dockVisible.push({ visible, reason }); return visible; },
    moveBy: () => { dockVisible.push({ remembered: true }); return true; },
    theme: async () => themeValue,
    applyLayout: input => { layouts.push(input);
      return { expanded: input.expanded, stage: input.stage === true,
        peek: input.stageMode === 'peek', width: input.width }; },
    // 卡片画在哪一侧（Win11 条子在屏幕最左端，只能往右画）。
    popup: () => 'right',
    edge: () => 'bottom',
    stripHeight: () => 40,
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
  return { bridge, handlers, dockSent, dockVisible, appSent, event, appEvent, intruder, layouts,
    setTheme: next => { themeValue = next; },
    settle: () => new Promise(resolve => setTimeout(resolve, 0)),
    call: (name, ...args) => handlers[name](event, ...args),
    fromApp: (name, ...args) => handlers[name](appEvent, ...args) };
}

test('主窗口推状态：缓存一份、转发给小窗，共享屏幕时把自己藏起来', () => {
  const h = harness();
  // 还没收到第一份状态之前小窗就该是藏着的：不然启动/刚登录那会儿先闪一条空条子，
  // 用户看到的就是"没有头像"（用户 2026-09-20）。
  assert.equal(h.bridge.state().hidden, true);
  assert.deepEqual(h.dockVisible.at(-1), { visible: false, reason: 'starting' },
    '装桥的时候先把它藏起来');
  const ok = h.fromApp('office:dock-publish', {
    people: [{ id: 'p1', name: '同事乙', character: 'man_suit', atDesk: false, sharing: true, unread: 3,
      inCall: true },
      { id: 'p2', name: '客户丙', role: 'visitor', inCall: 'yes' },
      { id: 'p3', name: '我自己', self: true, missed: true, away: '离座 6 分钟' }],
    sharing: false, missed: 1,
  });
  assert.equal(ok, true);
  assert.deepEqual(h.dockSent.at(-1).payload.people, [
    { id: 'p1', name: '同事乙', character: 'man_suit', atDesk: false, sharing: true, inCall: true,
      hasPreview: false, unread: 3, self: false, missed: false, away: '' },
    { id: 'p2', name: '客户丙', character: '', atDesk: true, sharing: false, inCall: false,
      hasPreview: false, unread: 0, self: false, missed: false, away: '' },
    { id: 'p3', name: '我自己', character: '', atDesk: true, sharing: false, inCall: false,
      hasPreview: false, unread: 0, self: true, missed: true, away: '离座 6 分钟' },
  ], '"我"的标记、未接来电、离座时长、通话中都要原样转给小窗（漏过就会没圈、没"!"、卡片里没有时长、头像上没有话筒）');
  assert.deepEqual(h.dockVisible.at(-1), { visible: true, reason: '' });
  // 卡片往哪边画要传给小窗：挑错边的话窗口长出来时头像条会被顶走（用户 2026-09-20）。
  assert.equal(h.dockSent.at(-1).payload.popup, 'right');
  assert.equal(h.dockSent.at(-1).payload.edge, 'bottom');
  assert.equal(h.dockSent.at(-1).payload.stripHeight, 40);
  // 连着（connected）要如实转给小窗：短暂掉线时它据此保留上一次的名单，
  // 不然头像会整排消失再冒出来（用户 2026-09-20：「有时候头像会消失闪烁」）。
  assert.equal(h.dockSent.at(-1).payload.connected, true, '缺省算连着');
  h.fromApp('office:dock-publish', { people: [], sharing: false, connected: false });
  assert.equal(h.dockSent.at(-1).payload.connected, false);

  // 自己正在共享屏幕：连小窗一起藏，免得被共享出去。
  h.fromApp('office:dock-publish', { people: [], sharing: false, transfers: [
    { id: 't1', name: '方案.pdf', percent: 0.4, direction: 'send', done: false },
    { id: 't2', name: '照片', percent: 1, direction: 'receive', done: true },
  ] });
  assert.deepEqual(h.dockSent.at(-1).payload.transfers, [
    { id: 't1', name: '方案.pdf', percent: 0.4, direction: 'send', done: false, failed: false },
    { id: 't2', name: '照片', percent: 1, direction: 'receive', done: true, failed: false },
  ], '传文件的进度要原样转给小窗（白名单漏掉就是"头像条上永远看不到进度"）');
  h.fromApp('office:dock-publish', { people: [], sharing: false,
    transfers: [{ id: '', name: 'x' }, { id: 't3', percent: 'x', direction: 'wat' }] });
  assert.deepEqual(h.dockSent.at(-1).payload.transfers,
    [{ id: 't3', name: '', percent: 0, direction: 'send', done: false, failed: false }],
    '脏数据要挡掉');

  // 自己正在共享屏幕：连小窗一起藏，免得被共享出去。
  h.fromApp('office:dock-publish', { people: [], sharing: true });
  assert.deepEqual(h.dockVisible.at(-1), { visible: false, reason: 'sharing' });
});

test('文件拖到某个头像上：小窗 → 主窗口，只认非空路径', () => {
  const h = harness();
  assert.equal(h.call('office:dock-files', { personId: 'p1', paths: ['C:\\a\\b.pdf'] }), true);
  assert.deepEqual(h.appSent.at(-1), { channel: 'office:dock-files',
    payload: { personId: 'p1', paths: ['C:\\a\\b.pdf'] } });
  // 脏数据：没人、没路径、超长、非字符串全都挡掉（小窗里能拿到什么不由页面说了算）。
  assert.equal(h.call('office:dock-files', { personId: '', paths: ['C:\\a'] }), false);
  assert.equal(h.call('office:dock-files', { personId: 'p1', paths: [] }), false);
  assert.equal(h.call('office:dock-files', { personId: 'p1', paths: ['x'.repeat(2000)] }), false);
  assert.equal(h.call('office:dock-files', { personId: 'p1', paths: [42, null] }), false);
  assert.equal(h.call('office:dock-files', { personId: 'p1',
    paths: ['C:\\ok', 7, '', 'D:\\ok2'] }), true);
  assert.deepEqual(h.appSent.at(-1).payload.paths, ['C:\\ok', 'D:\\ok2']);
  // 别人的窗口调不动它（和别的 dock 通道一个门）。
  assert.throws(() => h.handlers['office:dock-files'](h.intruder, { personId: 'p1', paths: ['C:\\a'] }),
    /Untrusted/);
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

test('有人来看我了：主窗口让它转给头像条，把那个人的角色拉出来演动作', () => {
  const h = harness();
  const appearance = { color: 'navy', accessories: {
    glasses: 'black', hair: 'short', beard: 'none', hat: 'tophat' } };
  assert.equal(h.call.greet === undefined, true);
  // 只是鼠标停在头像上：`mode: peek` 小一倍、不演动作（用户 2026-09-20）。
  assert.equal(h.fromApp('office:dock-greet', { id: 'p1', name: '同事乙', appearance }), true);
  assert.deepEqual(h.dockSent.at(-1), { channel: 'office:dock-greet',
    payload: { id: 'p1', name: '同事乙', appearance, mode: 'peek',
      requestId: '', kind: '', offer: false } });
  // 有人打电话过来：`call` 用当前大小打招呼（用户 2026-09-20：
  // 「当用三个方式打电话过来需要屏幕里面绿起来，且用当前角色大小打招呼」），
  // 还要带上那一通邀请（用户 2026-09-21：头像条上写清是谁来电、并能直接接听）。
  h.fromApp('office:dock-greet', { id: 'p1', name: '同事乙', appearance, mode: 'call',
    requestId: 'inv-1', kind: 'screen', offer: true });
  assert.equal(h.dockSent.at(-1).payload.mode, 'call');
  assert.deepEqual(h.dockSent.at(-1).payload,
    { id: 'p1', name: '同事乙', appearance, mode: 'call',
      requestId: 'inv-1', kind: 'screen', offer: true });
  // 脏种类：只认 screen / voice，其余当没写。
  h.fromApp('office:dock-greet', { id: 'p1', mode: 'call', kind: 'nonsense', requestId: 'x' });
  assert.equal(h.dockSent.at(-1).payload.kind, '');
  assert.equal(h.dockSent.at(-1).payload.offer, false);
  // 没有 id 的一律丢掉；小窗自己不能伪造（那是主窗口才有的能力）。
  assert.equal(h.fromApp('office:dock-greet', { name: '无名' }), false);
  assert.throws(() => h.call('office:dock-greet', { id: 'p1' }), /Untrusted/);
});

test('头像条上按「接听 / 拒绝」：转给主窗口去应答那一通（用户 2026-09-21）', () => {
  const h = harness();
  assert.equal(h.call('office:dock-answer', { requestId: 'inv-7', accept: true }), true);
  assert.deepEqual(h.appSent.at(-1), { channel: 'office:dock-answer',
    payload: { requestId: 'inv-7', accept: true } });
  h.call('office:dock-answer', { requestId: 'inv-7', accept: false });
  assert.deepEqual(h.appSent.at(-1).payload, { requestId: 'inv-7', accept: false }, '拒绝也是同一路');
  // 没有 id 的一律丢掉；主窗口不能伪造（那是小窗才有的能力）。
  assert.equal(h.call('office:dock-answer', { accept: true }), false);
  assert.throws(() => h.fromApp('office:dock-answer', { requestId: 'x', accept: true }), /Untrusted/);
});

test('小窗报版面：卡片开合、舞台、条子真实宽度都转给窗口', () => {
  const h = harness();
  assert.deepEqual(h.call('office:dock-layout', { expanded: true, stage: true, width: 156 }),
    { expanded: true, stage: true, peek: false, width: 156 });
  assert.deepEqual(h.layouts.at(-1),
    { expanded: true, stage: true, stageMode: '', stagePx: 0, width: 156 });
  // 来电气泡让舞台更高：页面报的 stagePx 要带下去（脏数据夹在 0..900）。
  h.call('office:dock-layout', { expanded: true, stage: true, stageMode: 'call', stagePx: 452, width: 156 });
  assert.equal(h.layouts.at(-1).stagePx, 452);
  h.call('office:dock-layout', { expanded: true, stage: true, stageMode: 'call', stagePx: 99999, width: 156 });
  assert.equal(h.layouts.at(-1).stagePx, 900, '太大的封顶');
  h.call('office:dock-layout', { expanded: true, stage: true, stageMode: 'call', stagePx: -5, width: 156 });
  assert.equal(h.layouts.at(-1).stagePx, 0, '负数当没报');
  // peek 舞台（鼠标只是停了一下）：窗口据此只留一半地方。
  h.call('office:dock-layout', { expanded: true, stage: true, stageMode: 'peek', width: 156 });
  assert.equal(h.layouts.at(-1).stageMode, 'peek');
  assert.equal(h.call('office:dock-layout', { expanded: true, stage: true, stageMode: 'peek', width: 156 }).peek, true);
  // 脏数据：宽度不是数字就让窗口按估算值来（传 0 而不是 NaN）；stageMode 不认得就当空。
  h.call('office:dock-layout', { expanded: false, stage: false, stageMode: 'nonsense', width: 'x' });
  assert.deepEqual(h.layouts.at(-1),
    { expanded: false, stage: false, stageMode: '', stagePx: 0, width: 0 });
});

test('任务栏的颜色要转给小窗（外面那圈框跟着它适配，用户 2026-09-20）', async () => {
  const h = harness({ theme: { light: true, tinted: true, accent: '#F0A0C8', transparent: false,
    source: 'registry' } });
  await h.settle();
  h.fromApp('office:dock-publish', { people: [{ id: 'p1', name: '甲' }], sharing: false });
  assert.deepEqual(h.dockSent.at(-1).payload.theme,
    { light: true, tinted: true, accent: '#f0a0c8', transparent: false },
    '只把画框要的四个字段交出去，强调色统一小写');
  // 用户换了主题：重读之后要**立刻重发一次状态**，小窗的框马上跟着换色。
  h.setTheme({ light: false, tinted: false, accent: '', transparent: true });
  await h.bridge.refreshTheme();
  assert.equal(h.dockSent.at(-1).payload.theme.light, false);
  assert.equal(h.dockSent.at(-1).payload.people.length, 1, '重发的是完整状态，不是只有主题');
  // 脏数据：强调色不是 #rrggbb 就当没有（页面那边会退回中性边框）。
  h.setTheme({ light: false, tinted: true, accent: 'javascript:alert(1)' });
  await h.bridge.refreshTheme();
  assert.equal(h.dockSent.at(-1).payload.theme.accent, '');
  assert.equal(h.dockSent.at(-1).payload.theme.tinted, true);
  // 读不到就是 null：页面自己有兜底（按深色任务栏画），绝不能因此报错。
  h.setTheme(null);
  await h.bridge.refreshTheme();
  assert.equal(h.dockSent.at(-1).payload.theme, null);
});

test('只有主窗口与小窗能调这些通道，别的页面一律拒绝', () => {
  const h = harness();
  // 陌生人调小窗那侧的能力
  assert.throws(() => h.handlers['office:dock-state'](h.intruder), /Untrusted/);
  assert.throws(() => h.handlers['office:dock-preview-want'](h.intruder, 'p1'), /Untrusted/);
  assert.throws(() => h.handlers['office:dock-action'](h.intruder, { kind: 'call', personId: 'p1' }), /Untrusted/);
  assert.throws(() => h.handlers['office:dock-layout'](h.intruder, { expanded: true, width: 100 }), /Untrusted/);
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
