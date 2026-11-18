        await this.rooms.run(other, (active, valid) => setPublication(active, Track.Source.Microphone, false, valid));\
        await this.rooms.run(other, (active, valid) => setPublication(active, Track.Source.Microphone, false, valid), 'audio');\
        enabled, () => valid() && this.current === name && this.intended(name) === enabled));\
        enabled, () => valid() && this.curr<truncated omitted_approx_tokens="129" />lication.\
    let audioReady: Promise<unknown> = Promise.resolve();\
    if (!this.audioInitialized.has(session.room) || reconnecting && (!previous || this.audioFocus.current === session.room) &&\
        !room.localParticipant.isMicrophoneEnabled && this.audioFocus.intended(session.room)) {\
      this.audioInitialized.add(session.room);\
      audioReady = this.audioFocus.activate(session.room)\
        .catch(() => this.onNotice("麦克风没打开，画面可以用。检查一下设备权限再打开试试"));\
    }\
    const ownsScreen = session.screenOwners?.includes(this.socket.id || '') ??\
    // Screen permission failures must not discard the other working medium.\
    if (!this.audioInitialized.has(session.room) || reconnecting && (!previous || this.audioFocus.current === session.room) &&\
        !room.localParticipant.isMicrophoneEnabled && this.audioFocus.intended(session.room)) {\
      this.audioInitialized.add(session.room);\
      try { await this.audioFocus.activate(session.room); }\
      catch { this.onNotice("麦克风没打开，画面可以用。检查一下设备权限再打开试试"); }\
    }\
    await audioReady;\
