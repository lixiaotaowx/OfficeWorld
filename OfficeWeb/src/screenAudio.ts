import { Track, type Room } from 'livekit-client';
import { waitForScreenPermission } from './screenPermission';
import { cloneScreenTrack, showSharedScreen, hideSharedScreen } from './screenShareIndicator';

// Exclude this app's received calls from system loopback where Chromium supports it.
export const screenAudioConstraints: MediaTrackConstraints & { restrictOwnAudio: boolean } = {
  restrictOwnAudio: true, echoCancellation: false, noiseSuppression: false, autoGainControl: false,
};

/** Each room owns a clone; microphone publication is deliberately independent. */
export async function syncScreenAudio(room: Room, source?: MediaStreamTrack) {
  const participant = room.localParticipant;
  const existing = participant.getTrackPublication(Track.Source.ScreenShareAudio)?.track;
  if (!source || source.readyState === 'ended') {
    if (existing) await participant.unpublishTrack(existing, true);
    return;
  }
  const next = source.clone();
  try {
    if (existing) {
      const previous = existing.mediaStreamTrack;
      await existing.replaceTrack(next);
      previous.stop();
    } else {
      await participant.publishTrack(next, {
        source: Track.Source.ScreenShareAudio, name: 'screen-audio',
        dtx: false, red: true, forceStereo: true,
      });
    }
  } catch (error) { next.stop(); throw error; }
}

export async function unpublishScreen(room: Room) {
  await Promise.all([Track.Source.ScreenShare, Track.Source.ScreenShareAudio].map(async source => {
    const track = room.localParticipant.getTrackPublication(source)?.track;
    if (track) {
      await room.localParticipant.unpublishTrack(track, true);
      hideSharedScreen(track.mediaStreamTrack);
    }
  }));
}

export async function publishPrivateScreen(room: Room, stream: MediaStream,
  valid: () => boolean, notice: (message: string) => void) {
  const track = stream.getVideoTracks()[0];
  if (!track || track.readyState !== 'live') throw Error('屏幕共享已停止');
  if (room.localParticipant.getTrackPublication(Track.Source.ScreenShare)) return;
  await waitForScreenPermission(room, () => valid() && track.readyState === 'live',
    stream.getAudioTracks().length > 0);
  const clone = cloneScreenTrack(track);
  try { await room.localParticipant.publishTrack(clone, { name: 'screen', source: Track.Source.ScreenShare }); }
  catch (error) { clone.stop(); throw error; }
  showSharedScreen(clone);
  if (valid() && track.readyState === 'live') {
    await syncScreenAudio(room, stream.getAudioTracks()[0])
      .catch(() => notice('画面已共享，但共享声音发布失败，请停止后重新共享'));
  }
  if (!valid() || track.readyState !== 'live') await unpublishScreen(room);
}

export const noScreenAudio = '当前共享没有声音轨道；浏览器请选择支持音频的来源并勾选“共享音频”，桌面端请更新客户端。';
