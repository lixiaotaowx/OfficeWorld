  publishers(): Room[];\
  /** Serialize replacement with publication/stop for this room. */\
  run?(room: Room, action: () => Promise<void>): Promise<unknown>;\
  let switched = false;\
  for (const room of host.publishers()) {\
    // A fresh clone per room: each sender needs its own track to own.\
    const clone = next.clone();\
    if (await swapScreenTrack(room, clone).catch(() => false)) {\
      switched = true;\
      await syncScreenAudio(room, stream.getAudioTracks()[0]).catch(() => syncScreenAudio(room));\
    } else clone.stop();\
    const replace = async () => {\
      if (host.live() !== stream) return;\
      // A fresh clone per room: each sender needs its own track to own.\
      const clone = next.clone();\
      if (await swapScreenTrack(room, clone).catch(() => false)) {\
        switched = true;\
        if (host.live() === stream)\
          await syncScreenAudio(room, stream.getAudioTracks()[0]).catch(() => syncScreenAudio(room));\
      } else clone.stop();\
    };\
    if (host.run) await host.run(room, replace).catch(() => undefined);\
    else await replace();\
