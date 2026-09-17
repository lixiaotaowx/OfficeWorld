// 版本比较与更新提示文案：网页检测到新版本才弹提示，弹什么、按钮叫什么都在这里定。
// （用户 2026-09-17：「网页检测到新版本就弹出更新软件的提示，然后就是下载进度条，
// 然后安装器打开覆盖安装」。）
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/updateRules.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText;
const { compareVersions, isNewerVersion, formatBytes, progressPercent, describeUpdate } =
  await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));

const manifest = { version: '0.1.14', url: '/download/iruler-dream-Setup-0.1.14-x64.exe',
  size: 101_200_000, sha256: 'a'.repeat(64), notes: '修好了离座检测' };

test('版本比较：按段比数字，缺的段算 0', () => {
  assert.equal(compareVersions('0.1.14', '0.1.13'), 1);
  assert.equal(compareVersions('0.1.13', '0.1.14'), -1);
  assert.equal(compareVersions('0.1.14', '0.1.14'), 0);
  assert.equal(compareVersions('0.1.14', '0.1.9'), 1, '9 < 14，不能按字符串比');
  assert.equal(compareVersions('0.2', '0.1.99'), 1);
  assert.equal(compareVersions('v0.1.15', '0.1.14'), 1, '带 v 也能认');
  assert.equal(compareVersions('0.1.14.0', '0.1.14'), 0, '末尾的 0 不算更新');
  assert.equal(compareVersions('乱七八糟', '0.0.1'), -1, '认不出来就当 0');
  assert.equal(isNewerVersion('0.1.14', '0.1.14'), false);
  assert.equal(isNewerVersion('0.1.15', '0.1.14'), true);
});

test('体积与百分比：给进度条和「96.5 MB」用', () => {
  assert.equal(formatBytes(900), '900 B');
  assert.equal(formatBytes(1024 * 512), '512 KB');
  assert.equal(formatBytes(101_200_000), '96.5 MB');
  assert.equal(formatBytes(0), '');
  assert.equal(progressPercent(50, 100), 50);
  assert.equal(progressPercent(0, 0), null, '不知道总量就不编百分比');
  assert.equal(progressPercent(200, 100), 100, '夹在 0..100');
  assert.equal(progressPercent(undefined, 100), null);
});

test('有新版本才提示：文案、按钮、能不能自动更新', () => {
  const fresh = describeUpdate(manifest, '0.1.13', 'available');
  assert.equal(fresh.title, '发现新版本 0.1.14');
  assert.match(fresh.detail, /当前 0\.1\.13/);
  assert.match(fresh.detail, /96\.5 MB/);
  assert.match(fresh.detail, /修好了离座检测/);
  assert.equal(fresh.action, '下载更新');
  assert.equal(fresh.automatic, true);

  assert.equal(describeUpdate(manifest, '0.1.13', 'current'), null, '已经是最新就不弹');
  assert.equal(describeUpdate(manifest, '0.1.13', 'skipped'), null, '点了稍后就不弹');
  assert.equal(describeUpdate(manifest, '0.1.13', 'unavailable'), null, '拿不到清单就不弹');
  assert.equal(describeUpdate(null, '0.1.13', 'available'), null, '没有清单就不弹');

  const downloading = describeUpdate(manifest, '0.1.13', 'downloading');
  assert.match(downloading.detail, /正在下载/);
  const ready = describeUpdate(manifest, '0.1.13', 'ready');
  assert.equal(ready.action, '立即安装');
  assert.match(ready.detail, /下载完成/);

  // 老客户端（0.1.13 及以前）没有版本桥：提示还在，但只能手动装。
  const old = describeUpdate(manifest, undefined, 'available');
  assert.equal(old.automatic, false);
  assert.match(old.title, /有新版本 0\.1\.14/);
  assert.match(old.detail, /客户端太旧/);
});

test('网页读取的位置、跳过记录、进度通道都与客户端约定一致', () => {
  const hook = readFileSync(new URL('../src/useAppUpdate.ts', import.meta.url), 'utf8');
  assert.match(hook, /MANIFEST_PATH = '\/download\/latest\.json'/, '清单放在 download/latest.json');
  assert.match(hook, /cache: 'no-store'/, '检查更新不能被缓存骗过去');
  assert.match(hook, /bridge\?\.appVersion\?\.\(\)/, '要问客户端自己的版本');
  assert.match(hook, /bridge\.downloadUpdate\(absolute, manifest\.sha256\)/, '下载要带哈希校验');
  assert.match(hook, /bridge\.installUpdate\(file\.current\)/, '下完要能启动安装器');
  assert.match(hook, /onUpdateProgress/, '进度来自主进程推送');
  assert.match(hook, /localStorage\.setItem\(SKIP_KEY, manifest\.version\)/, '「稍后」按版本记');
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.match(app, /客户端 \{update\.currentVersion\}/, '底部栏要显示装的是哪个版本');
  const preload = readFileSync(new URL('../../OfficeDesktop/desktop-preload.cjs', import.meta.url), 'utf8');
  for (const channel of ['office:app-version', 'office:update-download', 'office:update-install']) {
    assert.ok(preload.includes(channel), '预加载要暴露 ' + channel);
  }
  assert.match(preload, /onUpdateProgress\(callback\)/, '预加载要暴露进度订阅');
  const bridge = readFileSync(new URL('../../OfficeDesktop/desktop-bridge.cjs', import.meta.url), 'utf8');
  assert.match(bridge, /office:update-progress/, '主进程把进度发回页面');
  assert.match(bridge, /handle\('office:app-version', \(\) => app\.getVersion\(\)\)/);
});
