// 麦克风音量波纹的数值规则（用户 2026-10-14：「状态栏静音按钮需要一个声音波纹来看麦的
// 音量」）。取样的接线在 `useMicLevel.ts`，这里只钉住"数怎么算"，因为那几个数最容易被
// 顺手改坏：改完波纹要么一直贴着底，要么静音时还在动。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTs } from './helpers.mjs';

const sourceOf = (file) => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');

test('音量换算：安静贴 0，正常说话落到能看出来的中段', async () => {
  const { waveHeight, trackRms, meterLevel, MIC_SILENT, MIC_FLOOR } = await import(await loadTs('micLevel.ts'));
  assert.equal(waveHeight(0), 0);
  assert.equal(waveHeight(undefined), 0);
  assert.equal(waveHeight(-1), 0);
  assert.equal(waveHeight(Number.NaN), 0);
  assert.equal(waveHeight(9), 1, '爆音封顶到 1');
  assert.equal(waveHeight(MIC_FLOOR), 0, '底噪线上一点都不画');
  // 实测量级：安静房间 0.002～0.006、轻声 0.02、正常说话 0.05～0.12。
  assert.equal(waveHeight(0.002), 0, '安静房间的底噪不该画波纹');
  assert.equal(waveHeight(0.006), 0);
  assert.ok(waveHeight(0.02) > 0.2 && waveHeight(0.02) < 0.5, `轻声要有明显高度: ${waveHeight(0.02)}`);
  assert.ok(waveHeight(0.05) > 0.4, `正常说话要过中段: ${waveHeight(0.05)}`);
  assert.ok(waveHeight(0.08) > waveHeight(0.04), '越响越高，别做平了');
  // 时域 RMS：静音基准 128。满幅方波 [128,255,128,0] 的 RMS ≈ 0.704（255 不是精确的 +1.0）。
  assert.equal(trackRms(new Uint8Array([128, 128, 128, 128])), 0);
  assert.ok(Math.abs(trackRms(new Uint8Array([128, 255, 128, 0])) - 0.704) < 0.005);
  assert.ok(trackRms(new Uint8Array([128, 200, 128, 56])) > 0.2);
});

test('静音 / 没在通话时一律 0，取样值按 0.01 收敛（省掉没意义的推送）', async () => {
  const { meterLevel, MIC_SILENT } = await import(await loadTs('micLevel.ts'));
  assert.equal(meterLevel(0.8, false), 0, '麦克风静音时不许画波纹');
  assert.equal(meterLevel(0.01, true), 0, '低于静音线就当没在说话');
  assert.equal(meterLevel(undefined, true), 0);
  assert.equal(meterLevel(Number.NaN, true), 0);
  assert.equal(meterLevel(0.456, true), 0.46, '四舍五入到 0.01：没变的数不用再推一次');
  assert.ok(meterLevel(MIC_SILENT, true) >= MIC_SILENT, '刚好到线就该开始画');
  assert.equal(meterLevel(2, true), 1, '封顶');
});

test('起得快落得慢，但停嘴之后必须真的回到 0', async () => {
  const { smoothLevel } = await import(await loadTs('micLevel.ts'));
  assert.equal(smoothLevel(0, 0.9), 0.9, '音一出口立刻亮');
  assert.ok(smoothLevel(0.9, 0) < 0.9, '停嘴要往下走');
  assert.ok(smoothLevel(0.9, 0) > 0.7, '但不是一帧掉到底（那样像闪一下）');
  let level = 0.9;
  for (let step = 0; step < 60; step += 1) level = smoothLevel(level, 0);
  assert.ok(level < 0.01, `持续安静要落干净: ${level}`);
});

test('音量指示的接线：静音按钮里那层填充，主窗口取样、小窗只画', () => {
  const panel = sourceOf('DockCallControls.tsx');
  assert.match(panel, /className="dock-meeting-mic"/, '填充挂在静音按钮上');
  assert.match(panel, /data-mic-level=\{meterLevel\(row\.level, row\.mic\)\}/,
    '按钮上要留一个可断言/可排查的音量（静音时是 0）');
  assert.match(panel, /<DockMicFill level=\{row\.level\}/, '填充由 DockMicFill 画');
  assert.match(panel, /\{row\.mic && <DockMicFill/, '静音时不渲染那层填充');
  // **填在图标里、从下往上涨**（用户 2026-10-14：「麦克风图标里面会根据音量的大小来填充颜色
  // 的高度，就像腾讯会议那样的功能」）。所以断言的是"里面那层 + scaleY"，不是外圈的圆。
  const fill = sourceOf('DockMicFill.tsx');
  assert.match(fill, /meterLevel\(level, true\)/, '填充高度走那条纯规则');
  assert.match(fill, /transform: `scaleY\(\$\{height\}\)`/, '用 scaleY 涨（不改 height，免得每帧重排）');
  assert.ok(!/circle/.test(fill), '不能再退回图标外面那圈涟漪');
  const css = sourceOf('dock-meeting.css');
  assert.match(css, /\.dock-mic-fill \{[\s\S]{0,220}transform-origin: 50% 100%/,
    '液面要从底部涨起来');
  assert.match(css, /\.dock-meeting-mic svg \{ position: relative; z-index: 1; \}/,
    '图标要压在填充上面，不然话筒形状被糊掉');
  assert.match(css, /\.dock-meeting-controls \.dock-meeting-mic \{ position: relative; overflow: hidden; \}/,
    '填充不能溢出按钮的圆角');
  // 会议和私聊两条状态都要带音量，否则另一种通话里没有音量指示。
  assert.match(sourceOf('dock-meeting-contract.ts'), /micLevel\?: number/);
  assert.match(sourceOf('dock-private-contract.ts'), /micLevel\?: number/);
  assert.match(sourceOf('useDockMeetings.ts'), /micLevel,/);
  assert.match(sourceOf('useDockPrivateCalls.ts'), /micLevel,/);
  // 取样在主窗口（小窗不碰媒体），并且只认"真的在收音"。
  assert.match(sourceOf('App.tsx'), /useMicLevel\(office\.activeMic, office\.micLive, office\.micLive\)/);
  assert.match(sourceOf('media.ts'), /activeMic = \(\): MediaStreamTrack \| null/,
    'activeMic 必须是箭头函数：传出去以后 this 不能丢');
  assert.match(sourceOf('media.ts'), /return room\?\.state === 'connected' \? liveMic\(room\) : null/,
    '只量有声音焦点那间房的麦克风');
  const hook = sourceOf('useMicLevel.ts');
  assert.match(hook, /new AudioContext\(\)/, '用原生 AnalyserNode（手里只有 MediaStreamTrack）');
  assert.match(hook, /void closing\?\.close\(\)\.catch/, 'AudioContext 必须关，否则几通电话后就建不出来');
  assert.match(hook, /readMic\.current\(\) !== track\) attach\(\)/,
    '通话里换了麦克风要重建，否则读数冻在最后一帧');
});
