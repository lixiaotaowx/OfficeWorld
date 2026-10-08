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
