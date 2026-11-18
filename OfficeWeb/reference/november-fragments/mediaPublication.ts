import { Room, Track } from 'livekit-client';\
import { captureScreen, showSharedScreen, hideSharedScreen } from './screenShareIndicator';\
      if (existing?.track) await participant.unpublishTrack(existing.track, true);\
      if (existing?.track) {\
        await participant.unpublishTrack(existing.track, true);\
        hideSharedScreen(existing.track.mediaStreamTrack);\
      }\
    ? await participant.createScreenTracks({ audio: false, resolution: { width: 1920, height: 1080, frameRate: 15 } })\
    ? await captureScreen(() => participant.createScreenTracks({ audio: false,\
      resolution: { width: 1920, height: 1080, frameRate: 15 } }), tracks => tracks.map(track => track.mediaStreamTrack))\
      published.push(track);\
      if (source === Track.Source.ScreenShare) showSharedScreen(track.mediaStreamTrack);\
