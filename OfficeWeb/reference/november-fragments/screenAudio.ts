import { Track, type Room } from 'livekit-client';\
import { waitForScreenPermission } from './screenPermission';\
export async function unpublishScreen(room: Room) {\
}\
\
export async function publishPrivateScreen(room: Room, stream: MediaStream,\
  valid: () => boolean, notice: (message: string) => void) {\
  const track = stream.getVideoTracks()[0];\
  if (!track || track.readyState !== 'live') throw Error('屏幕共享已停止');\
  if (room.localParticipant.getTrackPublication(Track.Source.ScreenShare)) return;\
  await waitForScreenPermission(room, () => valid() && track.readyState === 'live');\
  const clone = track.clone();\
  try { await room.localParticipant.publishTrack(clone, { name: 'screen', source: Track.Source.ScreenShare }); }\
  catch (error) { clone.stop(); throw error; }\
  if (valid() && track.readyState === 'live') {\
    await syncScreenAudio(room, stream.getAudioTracks()[0])\
      .catch(() => notice('画面已共享，但共享声音发布失败，请停止后重新共享'));\
  }\
  if (!valid() || track.readyState !== 'live') await unpublishScreen(room);\
}\
