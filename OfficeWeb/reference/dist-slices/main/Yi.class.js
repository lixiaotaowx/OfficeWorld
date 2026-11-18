class Yi extends Fc {
    static fromParticipantInfo(e, t, n) {
        return new Yi(e, t.sid, t.identity, t.name, t.metadata, t.attributes, n, t.kind)
    }
    get logContext() {
        return Object.assign(Object.assign({}, super.logContext), {
            rpID: this.sid,
            remoteParticipant: this.identity
        })
    }
    constructor(e, t, n, s, r, a, o) {
        let c = arguments.length > 7 && arguments[7] !== void 0 ? arguments[7] : fi.STANDARD;
        super(t, n || "", s, r, a, o, c), this.signalClient = e, this.trackPublications = new Map, this.audioTrackPublications = new Map, this.videoTrackPublications = new Map, this.volumeMap = new Map
    }
    addTrackPublication(e) {
        super.addTrackPublication(e), e.on(B.UpdateSettings, t => {
            this.log.debug("send update settings", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
                settings: t
            })), this.signalClient.sendUpdateTrackSettings(t)
        }), e.on(B.UpdateSubscription, t => {
            t.participantTracks.forEach(n => {
                n.participantSid = this.sid
            }), this.signalClient.sendUpdateSubscription(t)
        }), e.on(B.SubscriptionPermissionChanged, t => {
            this.emit(W.TrackSubscriptionPermissionChanged, e, t)
        }), e.on(B.SubscriptionStatusChanged, t => {
            this.emit(W.TrackSubscriptionStatusChanged, e, t)
        }), e.on(B.Subscribed, t => {
            this.emit(W.TrackSubscribed, t, e)
        }), e.on(B.Unsubscribed, t => {
            this.emit(W.TrackUnsubscribed, t, e)
        }), e.on(B.SubscriptionFailed, t => {
            this.emit(W.TrackSubscriptionFailed, e.trackSid, t)
        })
    }
    getTrackPublication(e) {
        const t = super.getTrackPublication(e);
        if (t) return t
    }
    getTrackPublicationByName(e) {
        const t = super.getTrackPublicationByName(e);
        if (t) return t
    }
    setVolume(e) {
        let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : O.Source.Microphone;
        this.volumeMap.set(t, e);
        const n = this.getTrackPublication(t);
        n && n.track && n.track.setVolume(e)
    }
    getVolume() {
        let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : O.Source.Microphone;
        const t = this.getTrackPublication(e);
        return t && t.track ? t.track.getVolume() : this.volumeMap.get(e)
    }
    addSubscribedMediaTrack(e, t, n, s, r, a) {
        let o = this.getTrackPublicationBySid(t);
        if (o || t.startsWith("TR") || this.trackPublications.forEach(l => {
                !o && e.kind === l.kind.toString() && (o = l)
            }), !o) {
            if (a === 0) {
                this.log.error("could not find published track", Object.assign(Object.assign({}, this.logContext), {
                    trackSid: t
                })), this.emit(W.TrackSubscriptionFailed, t);
                return
            }
            a === void 0 && (a = 20), setTimeout(() => {
                this.addSubscribedMediaTrack(e, t, n, s, r, a - 1)
            }, 150);
            return
        }
        if (e.readyState === "ended") {
            this.log.error("unable to subscribe because MediaStreamTrack is ended. Do not call MediaStreamTrack.stop()", Object.assign(Object.assign({}, this.logContext), te(o))), this.emit(W.TrackSubscriptionFailed, t);
            return
        }
        const c = e.kind === "video";
        let d;
        return c ? d = new Mf(e, t, s, r) : d = new xf(e, t, s, this.audioContext, this.audioOutput), d.source = o.source, d.isMuted = o.isMuted, d.setMediaStream(n), d.start(), o.setTrack(d), this.volumeMap.has(o.source) && ds(d) && Qe(d) && d.setVolume(this.volumeMap.get(o.source)), o
    }
    get hasMetadata() {
        return !!this.participantInfo
    }
    getTrackPublicationBySid(e) {
        return this.trackPublications.get(e)
    }
    updateInfo(e) {
        if (!super.updateInfo(e)) return !1;
        const t = new Map,
            n = new Map;
        return e.tracks.forEach(s => {
            var r, a;
            let o = this.getTrackPublicationBySid(s.sid);
            if (o) o.updateInfo(s);
            else {
                const c = O.kindFromProto(s.type);
                if (!c) return;
                o = new jf(c, s, (r = this.signalClient.connectOptions) === null || r === void 0 ? void 0 : r.autoSubscribe, {
                    loggerContextCb: () => this.logContext,
                    loggerName: (a = this.loggerOptions) === null || a === void 0 ? void 0 : a.loggerName
                }), o.updateInfo(s), n.set(s.sid, o);
                const d = Array.from(this.trackPublications.values()).find(l => l.source === (o == null ? void 0 : o.source));
                d && o.source !== O.Source.Unknown && this.log.debug("received a second track publication for ".concat(this.identity, " with the same source: ").concat(o.source), Object.assign(Object.assign({}, this.logContext), {
                    oldTrack: te(d),
                    newTrack: te(o)
                })), this.addTrackPublication(o)
            }
            t.set(s.sid, o)
        }), this.trackPublications.forEach(s => {
            t.has(s.trackSid) || (this.log.trace("detected removed track on remote participant, unpublishing", Object.assign(Object.assign({}, this.logContext), te(s))), this.unpublishTrack(s.trackSid, !0))
        }), n.forEach(s => {
            this.emit(W.TrackPublished, s)
        }), !0
    }
    unpublishTrack(e, t) {
        const n = this.trackPublications.get(e);
        if (!n) return;
        const {
            track: s
        } = n;
        switch (s && (s.stop(), n.setTrack(void 0)), this.trackPublications.delete(e), n.kind) {
            case O.Kind.Audio:
                this.audioTrackPublications.delete(e);
                break;
            case O.Kind.Video:
                this.videoTrackPublications.delete(e);
                break
        }
        t && this.emit(W.TrackUnpublished, n)
    }
    setAudioOutput(e) {
        return b(this, void 0, void 0, function*() {
            this.audioOutput = e;
            const t = [];
            this.audioTrackPublications.forEach(n => {
                var s;
                Qe(n.track) && ds(n.track) && t.push(n.track.setSinkId((s = e.deviceId) !== null && s !== void 0 ? s : "default"))
            }), yield Promise.all(t)
        })
    }
    emit(e) {
        for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) n[s - 1] = arguments[s];
        return this.log.trace("participant event", Object.assign(Object.assign({}, this.logContext), {
            event: e,
            args: n
        })), super.emit(e, ...n)
    }
}
var re;
(function(i) {
    i.Disconnected = "disconnected", i.Connecting = "connecting", i.Connected = "connected", i.Reconnecting = "reconnecting", i.SignalReconnecting = "signalReconnecting"
})(re || (re = {}));
