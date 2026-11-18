    const ownsScreen = session.screenOwners?.includes(this.socket.id || '') ??\
    // Focus incoming audio immediately; microphone capture must not wait for screen publication.\
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
