// 「看队友全屏」那块画面上的信号条（用户 2026-10-15 要求）。
//
//   「需要新加一个信号条，在观看队友全屏的时候，在视频播放的"返回头像条"按钮的右侧。
//    另外把最大化去掉，现在只用全屏就可以了」。
//
// 这条钉住接线：信号从 `useMeetingSignal`（主窗口唯一有 MediaRoom 的地方）一路交到
// `MeetingScreenViewer`，并且**真的渲染在「返回头条」右边**；以及"最大化"那一档确实没了。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sourceOf = (file) => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');

test('看队友全屏时有信号条，且在「返回头像条」右侧', () => {
  const viewer = sourceOf('MeetingScreenViewer.tsx');
  // 一进来就全屏（"最大化"那一档已删）
  assert.match(viewer, /initialFullscreen\b/, '一挂载就全屏');
  assert.ok(!/initialMode/.test(viewer), '旧的 initialMode（含最大化）不该再出现');
  // 「返回头像条」在**前**、信号条在**后**：同一个 actions 里的顺序就是从左到右的顺序。
  const actions = /actions=\{<>([\s\S]*?)<\/>\}/.exec(viewer);
  assert.ok(actions, 'actions 要是一个片段（按顺序排按钮和信号条）');
  const back = actions[1].indexOf('返回头像条');
  const signal = actions[1].indexOf('<SignalBars');
  assert.ok(back >= 0, '要有「返回头像条」');
  assert.ok(signal > back, '信号条必须排在「返回头像条」**之后**（也就是它的右边）');
  // 没有信号时说一句"检测中"，不假装有数据
  assert.match(actions[1], /screen-stage-signal-wait">信号检测中/);
  // 信号从 useOffice 交出来，再由 App 传进这块画面
  assert.match(sourceOf('useOffice.ts'), /signal: \{ \.\.\.signal, tick: signalTick \}/,
    'useOffice 要把会议信号交出去');
  assert.match(sourceOf('App.tsx'), /<MeetingScreenViewer[\s\S]{0,200}signal=\{office\.signal\}/,
    'App 要把信号传给这块画面');
});

test('「看屏幕」和「全屏」现在开的是同一个全屏浮层', () => {
  const dock = sourceOf('useDockMeetings.ts');
  assert.match(dock, /if \(value\.kind !== 'meeting' && streams\[value\.personId\]\) onView\(value\.personId\);/,
    '两种命令都走同一个 onView（不再区分 fullscreen）');
  assert.match(dock, /onView: \(id: string\) => void/, 'onView 的签名只有 id');
  assert.match(sourceOf('App.tsx'), /setMeetingView\(\{ id \}\)/, 'App 只记 id');
  // 任务栏小窗里那块共享画面上也不该再有「最大化」
  const screens = sourceOf('DockMeetingScreens.tsx');
  assert.ok(!/onMaximize/.test(screens), '小窗气泡上不该再给「最大化」');
  assert.match(screens, /onFullscreen=\{\(\) => \{ void window\.officeDock\?\.action\?\.\('meeting-fullscreen'/,
    '只发全屏那一条命令');
});

test('ScreenStage 只剩全屏一档：组件、样式、调用方都没有"最大化"了', () => {
  const stage = sourceOf('ScreenStage.tsx');
  // 只看**代码**，不看注释（注释里会提到"以前有 maximized"这段历史）。
  const code = stage.split('\n')
    .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line))
    .join('\n');
  assert.ok(!/maximized/i.test(code), `ScreenStage 代码里不该再有 maximized：${/.*maximized.*/i.exec(code)?.[0]}`);
  assert.ok(!/initialMode/.test(code), '旧的 initialMode prop 也要删干净');
  assert.match(stage, /const enlarged = fullscreen;/, 'enlarged 就是 fullscreen');
  // 从小窗进全屏时，**必须等 portal 把节点挂好再请求**：节点一被挪走，浏览器会把刚进的
  // 全屏立刻撤掉（实测 `fullscreenElement` 先有、随后变 null），表现就是"点了没反应"。
  assert.match(stage, /setFullscreen\(true\);\s*\n\s*const ask = \(left: number\)/, '要先提交状态再请求');
  assert.match(stage, /requestAnimationFrame\(\(\) => ask\(2\)\)/, '等重挂完成后再请求');
  // 紧凑控件只剩全屏（同样只看代码，注释里会写"最大化已删"）
  const controls = sourceOf('ScreenViewControls.tsx').split('\n')
    .filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n');
  assert.ok(!/onMaximize|最大化/.test(controls), `紧凑控件里不该再有最大化：${/.*最大化.*/.exec(controls)?.[0]}`);
  assert.match(controls, /onFullscreen/);
  // 样式：`.screen-stage.maximized` 那几条规则已经删干净。**先整块去掉注释**再查选择器 ——
  // 注释里就是写着"这条规则已经删除"（按行过滤漏得掉跨行注释，这条踩过一次）。
  const css = sourceOf('screen-stage.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/\.screen-stage\.maximized/.test(css),
    `样式里不该再留 .screen-stage.maximized 的选择器：${/.*\.screen-stage\.maximized.*/.exec(css)?.[0]}`);
  assert.match(css, /\.screen-stage-bar \.signal-bars-panel \{[\s\S]{0,200}background: none/,
    '信号条挂在深色控制条里要透明底，不能是浅底卡片');
});
