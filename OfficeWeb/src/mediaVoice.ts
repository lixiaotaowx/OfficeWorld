// 私聊语音那几句状态与"该操作哪间房"的判定。
//
// 从 `media.ts` 搬出来的（那个文件贴着 500 行上限）：全是纯函数，只认"哪间房、哪条轨"，
// 不碰 `OfficeMedia` 的内部状态，所以搬出来既能让 `media.ts` 掉头，也能直接单测。
import { Track, type Room } from 'livekit-client';

/**
 * 该操作哪间语音房：指定会话优先，否则是正在收发声音的那间（`audioFocus`），再否则第一间
 * —— 一条语音都没有时返回 undefined。
 */
export function voiceRoom(voiceRooms: Set<string>, focus: string | null,
  sessionRoom: Map<string, string>, sessionId?: string): string | undefined {
  if (sessionId) return sessionRoom.get(sessionId);
  if (focus && voiceRooms.has(focus)) return focus;
  return [...voiceRooms][0];
}

/** 那间房里活着的麦克风轨（没有发布 / 已经结束都是 null）。 */
export function liveMic(room: Room): MediaStreamTrack | null {
  const track = room.localParticipant.getTrackPublication(Track.Source.Microphone)
    ?.track?.mediaStreamTrack;
  return track && track.readyState === 'live' ? track : null;
}

/**
 * 私聊那一行语音状态文案。返回的是**给人看的中文**，界面直接显示这几句，换文案时三处
 * （`useOffice` 的麦克风判断、头像条的通话按钮、私聊面板）要一起看。
 * `room` 已经没有 / 没连上时由调用方直接给'连接中'，这里只管连着的那几种情况。
 */
export function voiceLabel(room: Room, focused: boolean, micLive: MediaStreamTrack | null,
  intended: boolean): string {
  if (!focused) return '声音已暂停';
  if (room.localParticipant.isMicrophoneEnabled && micLive) return '已开启';
  return intended ? '等待授权或开启失败' : '已静音';
}
