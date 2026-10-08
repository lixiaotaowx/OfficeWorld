// 「有人打电话过来 → 头顶气泡 → 点接听」这条链在**真 Electron** 上走一遍。
//
//   & '.\node_modules\electron\dist\electron.exe' test/dock-call-chain.cjs     （在 OfficeDesktop/ 下跑）
//
// 为什么要有它：这条链上有两处**静默丢字段**的地方，两处都真出过故障——
//   1. `desktop-preload.cjs` 的 `dockGreet` 白名单（漏 `requestId` → 名字有了、头顶没有
//      「接听 / 拒绝」两个按钮；漏 `mode` → 打电话过来也只放个不招手的小人儿）；
//   2. 反方向少一条 `onDockAnswer` 桥（按钮点下去没反应）。
// 单元测试只能盯源码字符串，这个脚本用**真的 preload + 真的 dock-bridge + 两个窗口**把
// 两个方向都跑一遍：主窗口调 `dockGreet` → 小窗必须收到带 `requestId/kind/offer` 的邀请；
// 小窗调 `answer` → 主窗口必须收到 `onDockAnswer`。
//
// 两个窗口都加载同一个可信 origin（用协议桩喂夹具页面，不碰网络、不碰真站点）。
const { app, BrowserWindow, session } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const report = { checks: [], errors: [] };
const write = () => fs.writeFileSync(path.resolve(__dirname, '../../Build/dock-call-chain.json'),
  JSON.stringify(report, null, 2));

app.whenReady().then(async () => {
  const ses = session.fromPartition('dock-call-chain');
  // 只喂一个空白夹具页：`policy.trusted()` 只看 origin，所以两个窗口都算"可信来源"。
  await ses.protocol.handle('https', () => new Response(
    '<!doctype html><meta charset="utf-8"><title>chain fixture</title><body>fixture</body>',
    { headers: { 'Content-Type': 'text/html' } }));

  const appWin = new BrowserWindow({ show: false, webPreferences: { session: ses, sandbox: true,
    contextIsolation: true, nodeIntegration: false,
    preload: path.resolve(__dirname, '../desktop-preload.cjs') } });
  const dockWin = new BrowserWindow({ show: false, webPreferences: { session: ses, sandbox: true,
    contextIsolation: true, nodeIntegration: false,
    preload: path.resolve(__dirname, '../desktop-dock-preload.cjs') } });
  for (const win of [appWin, dockWin]) {
    win.webContents.on('preload-error', (_e, file, error) =>
      report.errors.push(`${path.basename(file)}: ${error.message}`));
  }

  const sentToDock = [];
  const visible = [];
  // 夹具里没有真正的主进程：preload 会问一次 `dream:resources`，给它一个空答案，
  // 免得 stderr 里刷一堆 "No handler registered"（和这条链无关）。
  require('electron').ipcMain.handle('dream:resources', () => ({}));
  require('../dock-bridge.cjs').installDockBridge({
    ipcMain: require('electron').ipcMain,
    getWindow: () => appWin,
    dock: {
      window: () => dockWin,
      send: (channel, payload) => { sentToDock.push({ channel, payload }); dockWin.webContents.send(channel, payload); return true; },
      setVisible: (on, reason) => { visible.push([on === true, String(reason || '')]); return true; },
      resize: () => true,
      theme: async () => null,
      edge: () => 'bottom', popup: () => 'left', stripHeight: () => 40,
    },
  });

  await appWin.loadURL('https://115.159.43.237/');
  await dockWin.loadURL('https://115.159.43.237/dock.html');

  // 小窗那一侧：把收到的 greet 记下来（真页面就是用这条回调把角色拉出来的）。
  await dockWin.webContents.executeJavaScript(`(() => {
    window.__greets = [];
    window.officeDock.onGreet(payload => window.__greets.push(payload));
    return typeof window.officeDock.answer === 'function';
  })()`).then(hasAnswer => {
    assert.equal(hasAnswer, true, '小窗必须能按接听（answer 桥在）');
    report.checks.push({ name: '小窗暴露 answer', ok: true });
  });

  // 方向一：主窗口说"有人打电话过来"。
  const greet = await appWin.webContents.executeJavaScript(`window.officeDesktop.dockGreet({
    id: 'p1', name: '同事乙', character: 'man_suit', mode: 'call',
    requestId: 'inv-chain-1', kind: 'screen', offer: true })`);
  assert.equal(greet, true);
  await new Promise(done => setTimeout(done, 120));
  const got = await dockWin.webContents.executeJavaScript('window.__greets.at(-1)');
  console.log('小窗收到：', JSON.stringify(got));
  assert.equal(got?.id, 'p1');
  assert.equal(got?.mode, 'call', '场合要带下去（不然只有小人儿、不招手、也没有气泡）');
  assert.equal(got?.requestId, 'inv-chain-1', '邀请 id 要带下去（不然头顶没有接听/拒绝按钮）');
  assert.equal(got?.kind, 'screen');
  assert.equal(got?.offer, true);
  report.checks.push({ name: '主窗口 → 小窗：邀请完整（mode/requestId/kind/offer）', ok: true, got });

  // 脏数据不许穿透（既有的清洗仍然生效）。
  await appWin.webContents.executeJavaScript(`window.officeDesktop.dockGreet({
    id: 'p1', mode: 'nonsense', kind: 'evil', requestId: 'x'.repeat(200) })`);
  await new Promise(done => setTimeout(done, 120));
  const dirty = await dockWin.webContents.executeJavaScript('window.__greets.at(-1)');
  assert.equal(dirty?.mode, 'peek', '脏场合按"只是看一眼"处理');
  assert.equal(dirty?.kind, '', '脏种类丢掉');
  assert.equal(dirty?.requestId.length, 64, '邀请 id 截断到 64');
  report.checks.push({ name: '主窗口 → 小窗：脏数据被清洗', ok: true, got: dirty });

  // 方向二：小窗点了「接听」→ 主窗口要收到（少这条桥就是"点了没反应"）。
  // 先挂上监听（不等它 resolve），再让小窗去点，最后收结果。
  const pending = appWin.webContents.executeJavaScript(`new Promise(resolve => {
    window.officeDesktop.onDockAnswer(payload => resolve(payload));
    setTimeout(() => resolve({ timeout: true }), 3000);
  })`);
  await new Promise(done => setTimeout(done, 200));
  const accepted = await dockWin.webContents.executeJavaScript(`window.officeDock.answer('inv-chain-1', true)`);
  assert.equal(accepted, true);
  const gotAnswer = await pending;
  console.log('主窗口收到：', JSON.stringify(gotAnswer));
  assert.deepEqual(gotAnswer, { requestId: 'inv-chain-1', accept: true },
    '点接听要真的传回主窗口（这条就是"按钮点了没反应"的守门员）');
  report.checks.push({ name: '小窗 → 主窗口：接听/拒绝传得回去', ok: true, got: gotAnswer });

  // 状态那条路照旧：主窗口推一份名单，小窗拿得到。
  await appWin.webContents.executeJavaScript(`window.officeDesktop.dockState({
    people: [{ id: 'p1', name: '同事乙', character: 'man_suit' }], connected: true })`);
  await new Promise(done => setTimeout(done, 120));
  const state = await dockWin.webContents.executeJavaScript('window.officeDock.state()');
  assert.equal(state?.people?.[0]?.id, 'p1');
  report.checks.push({ name: '状态仍然推得到小窗', ok: true, people: state?.people?.length });

  assert.deepEqual(report.errors, []);
  assert.ok(visible.some(row => row[0] === false && row[1] === 'starting'),
    '装桥时先藏起来（启动不闪空条子）');
  write();
  console.log('PASS 来电气泡那条链（真 preload + 真 dock-bridge）');
  app.exit(0);
}).catch(error => {
  report.errors.push(error.stack || String(error));
  write();
  console.error(error);
  app.exit(1);
});
setTimeout(() => { report.errors.push('timeout'); write(); app.exit(1); }, 60000).unref();
