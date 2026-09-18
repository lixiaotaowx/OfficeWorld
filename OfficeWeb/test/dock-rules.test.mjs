// 头像条要显示什么：在线的人、在座/离座、正在共享、未读与未接来电，以及"谁能有预览"。
// 外加一条铁律的守卫：小窗只做显示 + 遥控，不许自己连 socket 或碰媒体。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/dockRules.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText;
const { buildDockState, previewPlaceholder, dockInteractive, DOCK_MAX_PEOPLE } =
  await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

const person = (id, extra = {}) => ({ id, clientId: id, name: id, character: '', seat: 1,
  role: 'employee', atDesk: true, sharing: false, ...extra });

test('只显示在线的人，去掉我自己', () => {
  const state = buildDockState({ people: [person('me'), person('a'), person('b')], myId: 'me', sharing: false });
  assert.deepEqual(state.people.map(row => row.id), ['a', 'b']);
});

test('排序：未接来电 → 未读 → 正在共享 → 在座', () => {
  const state = buildDockState({
    people: [person('calm'), person('away', { atDesk: false }), person('sharing', { sharing: true }),
      person('unread'), person('missed')],
    unread: { unread: 2 }, missed: new Set(['missed']), sharing: false,
  });
  assert.deepEqual(state.people.map(row => row.id), ['missed', 'unread', 'sharing', 'calm', 'away']);
  assert.equal(state.people[0].missed, true);
  assert.equal(state.missed, 1);
});

test('预览只有"成员 + 有工位"才可能有；访客永远没有', () => {
  const state = buildDockState({
    people: [person('member'), person('visitor', { role: 'visitor', seat: null }),
      person('noDesk', { seat: null })],
    sharing: false,
  });
  const flags = Object.fromEntries(state.people.map(row => [row.id, row.hasPreview]));
  assert.equal(flags.member, true);
  assert.equal(flags.visitor, false, '访客不广播预览，这是规则');
  assert.equal(flags.noDesk, false, '没工位就没有工位预览');
});

test('我自己在共享屏幕时标记出来（主进程据此藏起头像条）', () => {
  assert.equal(buildDockState({ people: [], sharing: true }).sharing, true);
  assert.equal(buildDockState({ people: [], sharing: false }).sharing, false);
});

test('人数上限：头像条不会被塞爆', () => {
  const many = Array.from({ length: 40 }, (_, index) => person('p' + index));
  assert.equal(buildDockState({ people: many, sharing: false }).people.length, DOCK_MAX_PEOPLE);
});

test('占位文案说清"是规则没有"而不是坏了', () => {
  assert.match(previewPlaceholder({ hasPreview: false }), /不广播/);
  assert.match(previewPlaceholder({ hasPreview: true, atDesk: false }), /不在电脑前/);
  assert.match(previewPlaceholder({ hasPreview: true, atDesk: true }), /正在获取/);
  assert.match(previewPlaceholder({ hasPreview: true, atDesk: true }, true), /暂时没有画面/,
    '等过了还没来，别再说"正在获取"');
  assert.equal(previewPlaceholder(null), '');
});

test('指针只在头像条/卡片上才接管点击，透明区要透给任务栏', () => {
  const strip = { x: 0, y: 210, width: 148, height: 44 };
  const card = { x: 0, y: 25, width: 308, height: 177 };
  assert.equal(dockInteractive(strip, card, 70, 230), true, '在头像条上');
  assert.equal(dockInteractive(strip, card, 70, 100), true, '在卡片上');
  assert.equal(dockInteractive(strip, card, 200, 230), false, '头像条右边的透明区要穿透');
  assert.equal(dockInteractive(strip, card, 70, 5), false, '卡片上方的透明区要穿透');
  assert.equal(dockInteractive(strip, null, 70, 230), true);
  assert.equal(dockInteractive(null, null, 70, 230), false);
});

test('铁律：小窗只做显示 + 遥控，绝不连 socket、绝不碰媒体', () => {
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8');
  for (const forbidden of ['socket.io-client', 'useOffice', 'OfficeScene', 'getDisplayMedia',
    'RTCPeerConnection', 'fetch(']) {
    assert.equal(dock.includes(forbidden), false, '小窗里不该出现 ' + forbidden);
  }
  const preload = readFileSync(new URL('../../OfficeDesktop/desktop-dock-preload.cjs', import.meta.url), 'utf8');
  assert.equal(preload.includes('exposeInMainWorld(\'officeDock\''), true);
  assert.equal(/ipcRenderer\s*[,}]/.test(preload) && !preload.includes('contextBridge.exposeInMainWorld'),
    false, '只能通过 contextBridge 暴露白名单');
  assert.equal(preload.includes('getDisplayMedia'), false);
  assert.equal(preload.includes('nodeIntegration'), false);
  // 主进程那条通道必须真的把小窗和主窗口分开校验。
  const bridge = readFileSync(new URL('../../OfficeDesktop/dock-bridge.cjs', import.meta.url), 'utf8');
  assert.match(bridge, /allowApp/);
  assert.match(bridge, /allowDock/);
  assert.match(bridge, /trusted\(event\.senderFrame\?\.url\)/);
  // 主窗口那侧只推状态、只发起邀请；它自己才是 socket 的拥有者。
  const hook = readFileSync(new URL('../src/useDockBridge.ts', import.meta.url), 'utf8');
  assert.equal(hook.includes('io('), false, '推状态不该另开连接');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /useDockBridge\(\{/, '主窗口负责喂状态');
  assert.match(app, /office\.request\(personId, 'screen', kind === 'share'\)/, '看屏幕/分享走同一条邀请通道');
});
