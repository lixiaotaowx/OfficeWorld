class nt extends et.EventEmitter {
    constructor(e, t, n, s) {
        var r;
        super(), this.metadataMuted = !1, this.encryption = ge.NONE, this.log = X, this.handleMuted = () => {
            this.emit(B.Muted)
        }, this.handleUnmuted = () => {
            this.emit(B.Unmuted)
        }, this.log = Ye((r = s == null ? void 0 : s.loggerName) !== null && r !== void 0 ? r : Ue.Publication), this.loggerContextCb = this.loggerContextCb, this.setMaxListeners(100), this.kind = e, this.trackSid = t, this.trackName = n, this.source = O.Source.Unknown
    }
    setTrack(e) {
        this.track && (this.track.off(B.Muted, this.handleMuted), this.track.off(B.Unmuted, this.handleUnmuted)), this.track = e, e && (e.on(B.Muted, this.handleMuted), e.on(B.Unmuted, this.handleUnmuted))
    }
    get logContext() {
        var e;
        return Object.assign(Object.assign({}, (e = this.loggerContextCb) === null || e === void 0 ? void 0 : e.call(this)), te(this))
    }
    get isMuted() {
        return this.metadataMuted
    }
    get isEnabled() {
        return !0
    }
    get isSubscribed() {
        return this.track !== void 0
    }
    get isEncrypted() {
        return this.encryption !== ge.NONE
    }
    get audioTrack() {
        if (Qe(this.track)) return this.track
    }
    get videoTrack() {
        if (Ct(this.track)) return this.track
    }
    updateInfo(e) {
        this.trackSid = e.sid, this.trackName = e.name, this.source = O.sourceFromProto(e.source), this.mimeType = e.mimeType, this.kind === O.Kind.Video && e.width > 0 && (this.dimensions = {
            width: e.width,
            height: e.height
        }, this.simulcasted = e.simulcast), this.encryption = e.encryption, this.trackInfo = e, this.log.debug("update publication info", Object.assign(Object.assign({}, this.logContext), {
            info: e
        }))
    }
}(function(i) {
    (function(e) {
        e.Desired = "desired", e.Subscribed = "subscribed", e.Unsubscribed = "unsubscribed"
    })(i.SubscriptionStatus || (i.SubscriptionStatus = {})),
    function(e) {
        e.Allowed = "allowed", e.NotAllowed = "not_allowed"
    }(i.PermissionStatus || (i.PermissionStatus = {}))
})(nt || (nt = {}));
