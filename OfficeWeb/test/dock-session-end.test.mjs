// 离开办公室时头像条必须被交还（清空 + 藏起来）。
//
// 用户 2026-10 报障：「被挤掉线之后为啥头像都还在 所有人的都在 这不合理吧」。
// 机制：被顶下线/退出/会话失效走的都是 App 卸载回登录页，而 `useDockBridge` 的
// `enabled` 入参只表示"这台机器有没有 dockState 这道桥"，根本不会跟着变 false，
// 所以收尾若只 `clearInterval`，小窗就永远停在最后那一份名单上。
//
// 真页面的回归在 `test/browser/dock-session-end.mjs`（真服务器 + 真账号互顶）；
// 这里只钉住源码不会被改回"只清定时器"。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const hook = () => readFileSync(new URL('../src/useDockBridge.ts', import.meta.url), 'utf8');

test('卸载收尾要推一份"清空名单 + 藏起来"，而不是只清定时器', () => {
  const source = hook();
  assert.match(source, /people: \[\], sharing: false, missed: 0, hidden: true/,
    '交还条子的状态就是空名单 + hidden');
  assert.match(source, /return \(\) => \{ pushNow\.current = undefined; clearInterval\(timer\); release\(\); \};/,
    '卸载时必须 release()（顺手摘掉 pushNow，别再让它指向已经卸载的组件）');
  assert.match(source, /if \(!input\.enabled\) \{ release\(\); return; \}/,
    '"不可用"那条路和卸载走同一份逻辑，别写成两套');
});

test('交还要把 lastSent 清掉，否则再登进来小窗回不来', () => {
  const source = hook();
  const release = source.slice(source.indexOf('const release'), source.indexOf('if (!input.enabled)'));
  assert.match(release, /lastSent\.current = ''/, '推完那份"藏起来"的状态要允许重新推');
  assert.match(release, /dockState\?\.\(\{/, '同一份逻辑里只推这一份状态');
});
