class Fc extends et.EventEmitter {
    get logContext() {
        var e, t;
        return Object.assign({}, (t = (e = this.loggerOptions) === null || e === void 0 ? void 0 : e.loggerContextCb) === null || t === void 0 ? void 0 : t.call(e))
    }
    get isEncrypted() {
        return this.trackPublications.size > 0 && Array.from(this.trackPublications.values()).every(e => e.isEncrypted)
    }
    get isAgent() {
        var e;
        return ((e = this.permissions) === null || e === void 0 ? void 0 : e.agent) || this.kind === fi.AGENT
    }
    get isActive() {
        var e;
        return ((e = this.participantInfo) === null || e === void 0 ? void 0 : e.state) === Vt.ACTIVE
    }
    get kind() {
        return this._kind
    }
    get attributes() {
        return Object.freeze(Object.assign({}, this._attributes))
    }
    constructor(e, t, n, s, r, a) {
        let o = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : fi.STANDARD;
        var c;
        super(), this.audioLevel = 0, this.isSpeaking = !1, this._connectionQuality = gt.Unknown, this.log = X, this.log = Ye((c = a == null ? void 0 : a.loggerName) !== null && c !== void 0 ? c : Ue.Participant), this.loggerOptions = a, this.setMaxListeners(100), this.sid = e, this.identity = t, this.name = n, this.metadata = s, this.audioTrackPublications = new Map, this.videoTrackPublications = new Map, this.trackPublications = new Map, this._kind = o, this._attributes = r ?? {}
    }
    getTrackPublications() {
        return Array.from(this.trackPublications.values())
    }
    getTrackPublication(e) {
        for (const [, t] of this.trackPublications)
            if (t.source === e) return t
    }
    getTrackPublicationByName(e) {
        for (const [, t] of this.trackPublications)
            if (t.trackName === e) return t
    }
    waitUntilActive() {
        return this.isActive ? Promise.resolve() : this.activeFuture ? this.activeFuture.promise : (this.activeFuture = new Le, this.once(W.Active, () => {
            var e, t;
            (t = (e = this.activeFuture) === null || e === void 0 ? void 0 : e.resolve) === null || t === void 0 || t.call(e), this.activeFuture = void 0
        }), this.activeFuture.promise)
    }
    get connectionQuality() {
        return this._connectionQuality
    }
    get isCameraEnabled() {
        var e;
        const t = this.getTrackPublication(O.Source.Camera);
        return !(!((e = t == null ? void 0 : t.isMuted) !== null && e !== void 0) || e)
    }
    get isMicrophoneEnabled() {
        var e;
        const t = this.getTrackPublication(O.Source.Microphone);
        return !(!((e = t == null ? void 0 : t.isMuted) !== null && e !== void 0) || e)
    }
    get isScreenShareEnabled() {
        return !!this.getTrackPublication(O.Source.ScreenShare)
    }
    get isLocal() {
        return !1
    }
    get joinedAt() {
        return this.participantInfo ? new Date(Number.parseInt(this.participantInfo.joinedAt.toString()) * 1e3) : new Date
    }
    updateInfo(e) {
        var t;
        return this.participantInfo && this.participantInfo.sid === e.sid && this.participantInfo.version > e.version ? !1 : (this.identity = e.identity, this.sid = e.sid, this._setName(e.name), this._setMetadata(e.metadata), this._setAttributes(e.attributes), e.state === Vt.ACTIVE && ((t = this.participantInfo) === null || t === void 0 ? void 0 : t.state) !== Vt.ACTIVE && this.emit(W.Active), e.permission && this.setPermissions(e.permission), this.participantInfo = e, !0)
    }
    _setMetadata(e) {
        const t = this.metadata !== e,
            n = this.metadata;
        this.metadata = e, t && this.emit(W.ParticipantMetadataChanged, n)
    }
    _setName(e) {
        const t = this.name !== e;
        this.name = e, t && this.emit(W.ParticipantNameChanged, e)
    }
    _setAttributes(e) {
        const t = Xh(this.attributes, e);
        this._attributes = e, Object.keys(t).length > 0 && this.emit(W.AttributesChanged, t)
    }
    setPermissions(e) {
        var t, n, s, r, a, o;
        const c = this.permissions,
            d = e.canPublish !== ((t = this.permissions) === null || t === void 0 ? void 0 : t.canPublish) || e.canSubscribe !== ((n = this.permissions) === null || n === void 0 ? void 0 : n.canSubscribe) || e.canPublishData !== ((s = this.permissions) === null || s === void 0 ? void 0 : s.canPublishData) || e.hidden !== ((r = this.permissions) === null || r === void 0 ? void 0 : r.hidden) || e.recorder !== ((a = this.permissions) === null || a === void 0 ? void 0 : a.recorder) || e.canPublishSources.length !== this.permissions.canPublishSources.length || e.canPublishSources.some((l, u) => {
                var h;
                return l !== ((h = this.permissions) === null || h === void 0 ? void 0 : h.canPublishSources[u])
            }) || e.canSubscribeMetrics !== ((o = this.permissions) === null || o === void 0 ? void 0 : o.canSubscribeMetrics);
        return this.permissions = e, d && this.emit(W.ParticipantPermissionsChanged, c), d
    }
    setIsSpeaking(e) {
        e !== this.isSpeaking && (this.isSpeaking = e, e && (this.lastSpokeAt = new Date), this.emit(W.IsSpeakingChanged, e))
    }
    setConnectionQuality(e) {
        const t = this._connectionQuality;
        this._connectionQuality = Nf(e), t !== this._connectionQuality && this.emit(W.ConnectionQualityChanged, this._connectionQuality)
    }
    setDisconnected() {
        var e, t;
        this.activeFuture && ((t = (e = this.activeFuture).reject) === null || t === void 0 || t.call(e, new Error("Participant disconnected")), this.activeFuture = void 0)
    }
    setAudioContext(e) {
        this.audioContext = e, this.audioTrackPublications.forEach(t => Qe(t.track) && t.track.setAudioContext(e))
    }
    addTrackPublication(e) {
        e.on(B.Muted, () => {
            this.emit(W.TrackMuted, e)
        }), e.on(B.Unmuted, () => {
            this.emit(W.TrackUnmuted, e)
        });
        const t = e;
        switch (t.track && (t.track.sid = e.trackSid), this.trackPublications.set(e.trackSid, e), e.kind) {
            case O.Kind.Audio:
                this.audioTrackPublications.set(e.trackSid, e);
                break;
            case O.Kind.Video:
                this.videoTrackPublications.set(e.trackSid, e);
                break
        }
    }
}

