import { Room, Track } from 'livekit-client';
import { captureScreen, showSharedScreen, hideSharedScreen } from './screenShareIndicator';

/** Check the generation again after browser permission UI has resolved. */
export async function setPublication(room: Room, source: Track.Source.Microphone | Track.Source.ScreenShare,
  enabled: boolean, valid: () => boolean) {
  const participant = room.localParticipant;
  const existing = participant.getTrackPublication(source);
  if (!enabled) {
    if (source === Track.Source.ScreenShare) {
      if (existing?.track) {
        await participant.unpublishTrack(existing.track, true);
        hideSharedScreen(existing.track.mediaStreamTrack);
      }
    } else await existing?.mute();
    return;
  }
  if (!valid()) throw Error('媒体操作已取消');
  if (existing?.track?.mediaStreamTrack.readyState === 'live') {
    await existing.unmute();
    if (!valid()) { await existing.mute(); throw Error('媒体操作已取消'); }
    return;
  }
  if (existing?.track) await participant.unpublishTrack(existing.track, true);
  const tracks = source === Track.Source.ScreenShare
    ? await captureScreen(() => participant.createScreenTracks({ audio: false,
      resolution: { width: 1920, height: 1080, frameRate: 15 } }), tracks => tracks.map(track => track.mediaStreamTrack))
    : await participant.createTracks({ audio: { echoCancellation: true, noiseSuppression: true } });
  const published = [];
  try {
    if (!valid()) throw Error('媒体操作已取消，请在连接恢复后重试');
    for (const track of tracks) {
      await participant.publishTrack(track, { source });
      published.push(track);
      if (source === Track.Source.ScreenShare) showSharedScreen(track.mediaStreamTrack);
      if (!valid()) throw Error('媒体操作已取消，请在连接恢复后重试');
    }
  } catch (error) {
    tracks.forEach(track => track.stop());
    await Promise.allSettled(published.map(track => participant.unpublishTrack(track, true)));
    throw error;
  }
}
