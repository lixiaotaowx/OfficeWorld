import { waitForScreenPermission } from './screenPermission';\
import { screenAudioConstraints, syncScreenAudio, unpublishScreen, noScreenAudio } from './screenAudio';\
      const publication = room.localParticipant.getTrackPublication(Track.Source.ScreenShare);\
      if (publication?.track) await room.localParticipant.unpublishTrack(publication.track, true);\
      await unpublishScreen(room);\
        const tracks = await room.localParticipant.createScreenTracks({ audio: false,\
        const tracks = await room.localParticipant.createScreenTracks({ audio: screenAudioConstraints,\
          resolution: { width: 1920, height: 1080, frameRate: 15 }, contentHint: 'text' });\
        const next = tracks[0]?.mediaStreamTrack;\
        tracks.slice(1).forEach(track => track.stop());\
        if (!next) continue;\
        // 发布轨接管 next；上面那个包装不能再 stop，否则会把刚交出去的轨掐掉。\
        if (await swapScreenTrack(room, next)) switched = true;\
        else next.stop();\
        let adopted = false;\
        try {\
          await this.rooms.run(name, async (current, connected) => {\
            if (capture.cancelled || this.captures.get(name) !== capture || !connected()) return;\
            const next = tracks.find(track => track.mediaStreamTrack.kind === 'video')?.mediaStreamTrack;\
            if (!next) return;\
            const clone = next.clone();\
            try {\
              if (!await swapScreenTrack(current, clone)) { clone.stop(); return; }\
            } catch (error) { clone.stop(); throw error; }\
            capture.tracks.forEach(track => track.stop());\
            capture.tracks = tracks;\
            adopted = true;\
            next.addEventListener('ended', () => {\
              if (this.captures.get(name) === capture && capture.tracks === tracks) this.stop(name);\
            }, { once: true });\
            const audio = tracks.find(track => track.mediaStreamTrack.kind === 'audio')?.mediaStreamTrack;\
            await syncScreenAudio(current, audio).catch(async () => {\
              await syncScreenAudio(current);\
              this.notice('画面已切换，但共享声音失败，请重新共享');\
            });\
            if (!audio) this.notice(noScreenAudio);\
            switched = true;\
          });\
        } finally { if (!adopted) tracks.forEach(track => track.stop()); }\
    const tracks = await room.localParticipant.createScreenTracks({ audio: false,\
    const tracks = await room.localParticipant.createScreenTracks({ audio: screenAudioConstraints,\
      if (!valid()) throw Error('共享已取消');\
      if (!tracks.some(track => track.mediaStreamTrack.kind === 'audio')) this.notice(noScreenAudio);\
          await current.localParticipant.publishTrack(track, { source: Track.Source.ScreenShare });\
          const audio = track.mediaStreamTrack.kind === 'audio';\
          await current.localParticipant.publishTrack(track, {\
            source: audio ? Track.Source.ScreenShareAudio : Track.Source.ScreenShare,\
            ...(audio ? { dtx: false, forceStereo: true } : {}),\
          });\
          if (!audio) {\
          track.mediaStreamTrack.addEventListener('ended', () => {\
            if (this.captures.get(name) === capture) this.stop(name);\
            if (this.captures.get(name) === capture && capture.tracks === tracks) this.stop(name);\
          }, { once: true });\
          }\
