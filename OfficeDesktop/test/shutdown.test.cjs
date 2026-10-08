// 关机/注销不要被我们拖住（用户 2026-09-20：「问题二不要阻止关机如果可以的话」）。
//
// 这台机器上软件是**开机自启常驻托盘**的，所以关机时它一定在跑：只要退出流程里有一处
// 拦着不放（托盘那条"关窗口 = 收进托盘"的 preventDefault、常驻采集流、光晕窗口），
// Windows 就会等我们，注销/关机就慢，甚至弹"这个应用阻止关机"。
//
// 这几件事都在别的模块/主进程里，没法用单测跑真关机，所以这里做**源码级断言**：谁改掉了
// 这几个必须存在的处理，测试立刻红。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const main = readFileSync(path.join(__dirname, '..', 'main.cjs'), 'utf8');
const tray = readFileSync(path.join(__dirname, '..', 'tray.cjs'), 'utf8');

test('会话结束时立刻退出，不留隐藏窗口拖着系统', () => {
  assert.match(main, /app\.on\('session-end', endSession\)/, '要处理 Windows 的 session-end');
  assert.match(main, /mainWindow\.on\('session-end', endSession\)/);
  assert.match(main, /app\.exit\(0\)/, '处理里要真的退出（不是只清窗口）');
  assert.match(main, /quitOnSessionEnd/, '只处理一次，别重复');
  // 退出前把常驻采集停掉：它会替我们向 Windows 申请"屏幕常亮"，也会让退出多花时间。
  assert.match(main, /previewCapture\.stop\?\.\(\)/, '退出时停掉常驻采集流');
  assert.match(main, /previewGlow\.destroy\(\)/, '光晕窗口也要收掉');
  assert.match(main, /dockWindow\?\.destroy\(\)/);
});

test('托盘那条"关窗口收进托盘"只在用户自己关窗口时拦，关机/注销不拦', () => {
  assert.match(tray, /let quitting = false/);
  assert.match(tray, /window\.on\('close', event => \{\s*\n\s*if \(quitting \|\| tray\.isDestroyed\(\)\) return;/,
    'quitting 时不许 preventDefault');
  assert.match(tray, /window\.on\('query-session-end', allowQuit\)/, 'Windows 问"能不能结束会话"时先放行');
  assert.match(tray, /window\.on\('session-end', allowQuit\)/);
  assert.match(tray, /app\.on\('before-quit', allowQuit\)/);
});
