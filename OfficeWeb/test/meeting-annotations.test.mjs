// 两块画布的接线：私聊那条（别人点「清空」要真的擦掉分享者屏幕上的笔迹）与会议那条
// （会议的屏幕共享要和私聊一样能放大、能标注）。
//
// 用户 2026-09-22 报障：「视频通话的标注清空不管用」「视频会议的屏幕分享和私人要保持
// 一样，可以放大观看可以标记，目前没有」。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadTs } from './helpers.mjs';

const sourceOf = (file) => readFileSync(new URL('../src/' + file, import.meta.url), 'utf8');

/** 假的桌面浮层桥：记录它到底收到了哪一条指令。 */
function fakeLayer() {
  const calls = [];
  return {
    calls,
    attach: async () => ({ ok: true }),
    detach: async () => {},
    clear: async () => { calls.push('clear'); },
    draw: async (message) => { calls.push('draw:' + message.type); },
  };
}

test('中继来的「清空」必须走 clearance 那条桥，打到分享者的浮层上', async () => {
  const layer = fakeLayer();
  globalThis.window = { officeDesktop: { annotations: layer } };
  try {
    const { createAnnotationChannel } = await import(await loadTs('annotationChannel.ts'));
    const channel = createAnnotationChannel({
      socket: { current: { connected: true, emit() {} } },
      notify: () => {},
      sharingScreen: () => true,
    });
    channel.mirror({ type: 'clear' });
    channel.mirror({ type: 'annotate', id: 'a', stroke: 'st1', points: [[0.1, 0.2]] });
    // 客户端的中继通道（office:annotation-push）只放行 annotate/undo，清空必须走
    // office:annotation-clear；否则别人点「清空」永远擦不掉屏幕上的笔迹。
    assert.deepEqual(layer.calls, ['clear', 'draw:annotate'],
      '清空要调 layer().clear()，不能塞进 draw()');
    assert.match(sourceOf('annotationChannel.ts'), /if \(message\.type === 'clear'\) void layer\(\)\?\.clear\(\)/);
  } finally { delete globalThis.window; }
});

test('会议共享画面用和私聊同一个画布（放大 + 标注）', () => {
  const meeting = sourceOf('MeetingCenter.tsx');
  assert.match(meeting, /import ScreenStage from '\.\/ScreenStage'/, '会议要用同一个画布组件');
  assert.match(meeting, /scope=\{active\.room\}/, '标注范围就是会议房间号（服务端按它校验成员）');
  assert.match(meeting, /annotatable=\{canAnnotate\}/, '只有对方的客户端能显示标注时才给工具');
  assert.match(meeting, /onDraw=\{annotation\.draw\} onClear=\{annotation\.clear\} onUndo=\{annotation\.undo\}/,
    '三个画布动作要和私聊一样接上');
  assert.match(meeting, /people\.find\(p => p\.id === key\.slice\(active\.room\.length \+ 1\)\)/,
    '要按共享者身份查到他，才能写名字、判断能不能标注');
  assert.ok(!/function SharedScreen/.test(meeting),
    '那个只能播放、不能放大也不能标注的旧播放器不该再留着');
  assert.match(sourceOf('App.tsx'), /annotation=\{office\.annotation\}/,
    'App 要把画布动作交给会议中心');
  // 会议里视频的尺寸交给画布自己管，别被 .meeting-streams video 抢走。
  assert.match(sourceOf('meetings.css'), /\.meeting-streams \.screen-stage video \{ max-height: 62vh; border-radius: 0; \}/);
});

test('会议里的共享视频轨键要带共享者身份，不能只用轨道 sid', () => {
  const media = sourceOf('media.ts');
  const key = sourceOf('meetingVideo.ts');
  assert.match(key, /export function meetingVideoKey\(roomName: string, participant/,
    '键的后缀是共享者（LiveKit identity = socket id），否则界面查不到"谁在共享"');
  assert.match(media, /import \{ meetingVideoKey \} from '\.\/meetingVideo'/,
    '键函数住在 meetingVideo.ts（media.ts 贴着 500 行上限）');
  assert.match(media, /meetingVideoKey\(roomName, participant, track\.sid\)/,
    '订阅与取消订阅必须算出同一个键');
  assert.ok(!/roomName\.startsWith\('meeting-'\) \? `\$\{roomName\}:\$\{track\.sid\}`/.test(media),
    '会议视频键里不该再出现裸的 track.sid（音频轨仍用 sid 做键，与画布无关）');
});

test('会议共享也算「我在共享」，并且要挂上标注浮层', () => {
  const office = sourceOf('useOffice.ts');
  assert.match(office,
    /sharingScreen: \(\) => media\.current\?\.screen\?\.active === true\s*\|\| media\.current\?\.meetingStatus\(\)\.sharing === true/,
    '会议的共享不经过 media.screen，这个判断必须把会议也算上');
  assert.match(office, /if \(meetings\.sharing\) annotations\.attach\(\)/,
    '会议共享开始时要把浮层挂上，否则笔迹没有地方落');
});

// ── 2026-10-14 用户提的四条 ──────────────────────────────────────────────────

test('观众挑的颜色跟着笔画走，撤销点名删哪一条', async () => {
  const sent = [];
  globalThis.window = { officeDesktop: { annotations: fakeLayer() } };
  try {
    const { createAnnotationChannel } = await import(await loadTs('annotationChannel.ts'));
    const channel = createAnnotationChannel({
      socket: { current: { connected: true, emit: (...args) => sent.push(args) } },
      notify: () => {},
      sharingScreen: () => true,
    });
    // 第一笔画浅蓝，中途换成草绿：颜色只在**起笔那一条**消息上定下来。
    channel.draw('call-1', [[0.1, 0.1]], false, '#4a9fd8');
    channel.draw('call-1', [[0.2, 0.2]], false, '#5fb96a');
    channel.draw('call-1', [], true, '#5fb96a');
    const strokes = sent.filter(([name]) => name === 'annotate').map(([, payload]) => payload);
    assert.equal(strokes.length, 3);
    assert.deepEqual(strokes.map(payload => payload.color),
      ['#4a9fd8', '#4a9fd8', '#4a9fd8'], '一整条笔画一个颜色，中途换色只影响下一笔');
    assert.ok(strokes.every(payload => payload.stroke === strokes[0].stroke), '同一条笔画共用一个 id');
    // 第二笔用新颜色，id 也要换。
    channel.draw('call-1', [[0.3, 0.3]], false, '#5fb96a');
    const next = sent.filter(([name]) => name === 'annotate').map(([, payload]) => payload).at(-1);
    assert.equal(next.color, '#5fb96a');
    assert.notEqual(next.stroke, strokes[0].stroke, '换色是新的一笔，不能续在上一笔上');
    // 不带颜色（老页面）时退回默认色，不能把 undefined 发出去。
    channel.draw('call-2', [[0, 0]], false);
    const plain = sent.filter(([name]) => name === 'annotate').map(([, payload]) => payload).at(-1);
    assert.equal(plain.color, '#f0d274');
    // 撤销要带上当前那一笔的 id，浮层才能精确删掉它（观众换了颜色以后尤其重要）。
    channel.undo('call-2');
    assert.deepEqual(sent.at(-1), ['annotate-undo', { scope: 'call-2', stroke: plain.stroke }]);
  } finally { delete globalThis.window; }
});

test('分享者自己能清屏（用户：「分享者清屏按钮需要」）', () => {
  // 浮层是鼠标穿透的（`setIgnoreMouseEvents`），别人画到分享者屏幕上的笔迹他点不到，
  // 所以只能从自己的页面擦：会议和自己的共享预览都要有这个入口。
  const stage = sourceOf('ScreenStage.tsx');
  assert.match(stage, /clearsOwnBoard\?: boolean/, '分享者那块预览用这个开关');
  assert.match(stage, /const clearBoard = \(\) => \{ dropEcho\(\); props\.onClear\(scope\); \}/,
    '清屏要同时清掉本机即时回显，否则留下一条幽灵笔迹');
  assert.match(stage, /props\.clearsOwnBoard && <div className="screen-stage-own-clear">/);
  assert.match(stage, /onClick=\{clearBoard\}>清屏<\/button>/);
  assert.match(sourceOf('screen-stage.css'), /\.screen-stage-own-clear \{ position: absolute/,
    '清屏按钮要贴在画面上，不能挤进底部工具栏');
  // 会议那一路：预览把 scope 和 onClear 都接上。
  assert.match(sourceOf('MeetingCenter.tsx'), /scope=\{active\?\.room\} onClear=\{annotation\.clear\}/);
  // 私聊那一路：正在共享时给自己一块预览。
  const priv = sourceOf('PrivateCallPanel.tsx');
  assert.match(priv, /state\?\.sharing && office\.videos\['local-screen'\] && office\.boardScope/);
  assert.match(priv, /scope=\{office\.boardScope\} onClear=\{office\.annotation\.clear\}/);
  assert.match(sourceOf('useOffice.ts'), /boardScope,/, 'useOffice 要把"我正在共享哪张画布"交出去');
  // 预览组件本身：展开时用画布（带清屏），收起时把清屏挪到标题栏。
  const preview = sourceOf('SharingPreview.tsx');
  assert.match(preview, /clearsOwnBoard onClear=\{onClear\}/);
  assert.match(preview, /collapsed && onClear && scope && <button className="clear-board"/);
});

test('每一笔不再署名（用户：「标记每一笔都会署名，名称去掉」）', () => {
  const overlay = readFileSync(new URL('../../OfficeDesktop/annotation-overlay.js', import.meta.url), 'utf8');
  assert.ok(!/function label\(/.test(overlay), '署名用的那个名牌函数必须删掉');
  assert.ok(!/fillText/.test(overlay), '浮层里不该再画任何文字');
  assert.ok(!/roundRect/.test(overlay), '名牌胶囊的圆角框也要一起删');
  // 姓名仍然在协议里传（服务端与旧页面还在发），只是不画了 —— 别顺手把字段删掉。
  assert.match(sourceOf('annotations.ts'), /name: string;/);
});
