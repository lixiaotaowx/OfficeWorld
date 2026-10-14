import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../src/dockRules.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
} }).outputText;

test('来电气泡写什么：谁 + 怎么打过来的（用户 2026-09-21）', async () => {
  const { callLabel, CALL_BAR_HEIGHT } = await import(
    'data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
  assert.equal(callLabel({ name: '同事乙', kind: 'voice' }), '同事乙 来电 · 语音通话');
  assert.equal(callLabel({ name: '同事乙', kind: 'screen', offer: false }), '同事乙 来电 · 想看你的屏幕');
  assert.equal(callLabel({ name: '同事乙', kind: 'screen', offer: true }), '同事乙 来电 · 要给你看屏幕');
  assert.equal(callLabel({}), '同事 来电', '不知道是谁/种类也得有句话');
  // 老客户端（<0.1.28）不转发邀请的种类：那会儿别瞎猜是语音还是屏幕（用户 2026-09-21 之后）。
  assert.equal(callLabel({ name: '同事乙' }), '同事乙 来电');
  assert.equal(callLabel({ name: '同事乙', kind: '乱七八糟' }), '同事乙 来电', '脏种类不许瞎猜');
  assert.ok(CALL_BAR_HEIGHT >= 52 && CALL_BAR_HEIGHT <= 80, '气泡高度要留够：' + CALL_BAR_HEIGHT);
  // 头像条那页：气泡带两个按钮、接听走 answer 桥；舞台给它让出高度。
  const dock = readFileSync(new URL('../src/dock.tsx', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/DockGreetingStage.tsx', import.meta.url), 'utf8');
  assert.match(dock, /className="dock-call"/, '要有那条来电气泡');
  assert.match(dock, /callLabel\(greet\)/);
  assert.match(dock, /window\.officeDock\?\.answer\?\.\(requestId, accept\)/);
  assert.match(dock, /GREET_CANVAS\[greetMode\(greet\.mode\)\]\.height \+/, '舞台高度要把气泡算进去');
  assert.match(dock, /stagePx, width,/, '高度要报给主进程，不然气泡会被窗口裁掉');
  const css = readFileSync(new URL('../src/dock.css', import.meta.url), 'utf8') +
    readFileSync(new URL('../src/dock-card.css', import.meta.url), 'utf8');
  assert.match(css, /\.dock-call \{[\s\S]*border-radius: 999px/, '气泡也是灵动岛那种圆角');
  // 位置：**挂在角色头顶**（用户 2026-09-21 纠正：「我是说打招呼的人站在状态栏上的人物
  // 头顶」）。外层和角色画布同一格（同宽、贴在画布上边缘之上），气泡在里面居中。
  assert.match(css, /\.dock-call-wrap \{[\s\S]*bottom: calc\(var\(--dock-h\) \+ var\(--dock-stage-h, 380px\)\)/,
    '气泡要挂在画布上边缘之上（= 角色头顶）');
  assert.match(css, /\.dock-call-wrap \{[\s\S]*width: var\(--dock-stage-w, 320px\)/,
    '外层和角色画布一样宽，居中的气泡才对得上头');
  assert.match(css, /\.dock-call-wrap \{[\s\S]*justify-content: center/, '气泡对准人物头顶，不偏在一边');
  assert.match(css, /\.dock-call-wrap \{[\s\S]*pointer-events: none/, '外层的透明区不许吃鼠标');
  assert.match(css, /\.dock-call \{[\s\S]*pointer-events: auto/, '气泡本身要能点');
  assert.ok(!/over-call/.test(css), '「角色站在气泡上面」那一版已经删掉，别留下旧规则');
  assert.ok(!/over-call/.test(dock), 'dock.tsx 里也不该再有 over-call');
});
