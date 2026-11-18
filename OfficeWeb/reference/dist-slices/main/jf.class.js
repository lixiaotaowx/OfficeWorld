class jf extends nt {
    constructor(e, t, n, s) {
        super(e, t.sid, t.name, s), this.track = void 0, this.allowed = !0, this.requestedDisabled = void 0, this.visible = !0, this.handleEnded = r => {
            this.setTrack(void 0), this.emit(B.Ended, r)
        }, this.handleVisibilityChange = r => {
            this.log.debug("adaptivestream video visibility ".concat(this.trackSid, ", visible=").concat(r), this.logContext), this.visible = r, this.emitTrackUpdate()
        }, this.handleVideoDimensionsChange = r => {
            this.log.debug("adaptivestream video dimensions ".concat(r.width, "x").concat(r.height), this.logContext), this.videoDimensionsAdaptiveStream = r, this.emitTrackUpdate()
        }, this.subscribed = n, this.updateInfo(t)
    }
    setSubscribed(e) {
        const t = this.subscriptionStatus,
            n = this.permissionStatus;
        this.subscribed = e, e && (this.allowed = !0);
        const s = new an({
            trackSids: [this.trackSid],
            subscribe: this.subscribed,
            participantTracks: [new ka({
                participantSid: "",
                trackSids: [this.trackSid]
            })]
        });
        this.emit(B.UpdateSubscription, s), this.emitSubscriptionUpdateIfChanged(t), this.emitPermissionUpdateIfChanged(n)
    }
    get subscriptionStatus() {
        return this.subscribed === !1 ? nt.SubscriptionStatus.Unsubscribed : super.isSubscribed ? nt.SubscriptionStatus.Subscribed : nt.SubscriptionStatus.Desired
    }
    get permissionStatus() {
        return this.allowed ? nt.PermissionStatus.Allowed : nt.PermissionStatus.NotAllowed
    }
    get isSubscribed() {
        return this.subscribed === !1 ? !1 : super.isSubscribed
    }
    get isDesired() {
        return this.subscribed !== !1
    }
    get isEnabled() {
        return this.requestedDisabled !== void 0 ? !this.requestedDisabled : this.isAdaptiveStream ? this.visible : !0
    }
    get isLocal() {
        return !1
    }
    setEnabled(e) {
        !this.isManualOperationAllowed() || this.requestedDisabled === !e || (this.requestedDisabled = !e, this.emitTrackUpdate())
    }
    setVideoQuality(e) {
        !this.isManualOperationAllowed() || this.requestedMaxQuality === e || (this.requestedMaxQuality = e, this.requestedVideoDimensions = void 0, this.emitTrackUpdate())
    }
    setVideoDimensions(e) {
        var t, n;
        this.isManualOperationAllowed() && (((t = this.requestedVideoDimensions) === null || t === void 0 ? void 0 : t.width) === e.width && ((n = this.requestedVideoDimensions) === null || n === void 0 ? void 0 : n.height) === e.height || (En(this.track) && (this.requestedVideoDimensions = e), this.requestedMaxQuality = void 0, this.emitTrackUpdate()))
    }
    setVideoFPS(e) {
        this.isManualOperationAllowed() && En(this.track) && this.fps !== e && (this.fps = e, this.emitTrackUpdate())
    }
    get videoQuality() {
        var e;
        return (e = this.requestedMaxQuality) !== null && e !== void 0 ? e : De.HIGH
    }
    setTrack(e) {
        const t = this.subscriptionStatus,
            n = this.permissionStatus,
            s = this.track;
        s !== e && (s && (s.off(B.VideoDimensionsChanged, this.handleVideoDimensionsChange), s.off(B.VisibilityChanged, this.handleVisibilityChange), s.off(B.Ended, this.handleEnded), s.detach(), s.stopMonitor(), this.emit(B.Unsubscribed, s)), super.setTrack(e), e && (e.sid = this.trackSid, e.on(B.VideoDimensionsChanged, this.handleVideoDimensionsChange), e.on(B.VisibilityChanged, this.handleVisibilityChange), e.on(B.Ended, this.handleEnded), this.emit(B.Subscribed, e)), this.emitPermissionUpdateIfChanged(n), this.emitSubscriptionUpdateIfChanged(t))
    }
    setAllowed(e) {
        const t = this.subscriptionStatus,
            n = this.permissionStatus;
        this.allowed = e, this.emitPermissionUpdateIfChanged(n), this.emitSubscriptionUpdateIfChanged(t)
    }
    setSubscriptionError(e) {
        this.emit(B.SubscriptionFailed, e)
    }
    updateInfo(e) {
        super.updateInfo(e);
        const t = this.metadataMuted;
        this.metadataMuted = e.muted, this.track ? this.track.setMuted(e.muted) : t !== e.muted && this.emit(e.muted ? B.Muted : B.Unmuted)
    }
    emitSubscriptionUpdateIfChanged(e) {
        const t = this.subscriptionStatus;
        e !== t && this.emit(B.SubscriptionStatusChanged, t, e)
    }
    emitPermissionUpdateIfChanged(e) {
        this.permissionStatus !== e && this.emit(B.SubscriptionPermissionChanged, this.permissionStatus, e)
    }
    isManualOperationAllowed() {
        return this.isDesired ? !0 : (this.log.warn("cannot update track settings when not subscribed", this.logContext), !1)
    }
    get isAdaptiveStream() {
        return En(this.track) && this.track.isAdaptiveStream
    }
    emitTrackUpdate() {
        const e = new Oa({
            trackSids: [this.trackSid],
            disabled: !this.isEnabled,
            fps: this.fps
        });
        if (this.kind === O.Kind.Video) {
            let t = this.requestedVideoDimensions;
            if (this.videoDimensionsAdaptiveStream !== void 0)
                if (t) zr(this.videoDimensionsAdaptiveStream, t) && (this.log.debug("using adaptive stream dimensions instead of requested", Object.assign(Object.assign({}, this.logContext), this.videoDimensionsAdaptiveStream)), t = this.videoDimensionsAdaptiveStream);
                else if (this.requestedMaxQuality !== void 0 && this.trackInfo) {
                const n = em(this.trackInfo, this.requestedMaxQuality);
                n && zr(this.videoDimensionsAdaptiveStream, n) && (this.log.debug("using adaptive stream dimensions instead of max quality layer", Object.assign(Object.assign({}, this.logContext), this.videoDimensionsAdaptiveStream)), t = this.videoDimensionsAdaptiveStream)
            } else this.log.debug("using adaptive stream dimensions", Object.assign(Object.assign({}, this.logContext), this.videoDimensionsAdaptiveStream)), t = this.videoDimensionsAdaptiveStream;
            t ? (e.width = Math.ceil(t.width), e.height = Math.ceil(t.height)) : this.requestedMaxQuality !== void 0 ? (this.log.debug("using requested max quality", Object.assign(Object.assign({}, this.logContext), {
                quality: this.requestedMaxQuality
            })), e.quality = this.requestedMaxQuality) : (this.log.debug("using default quality", Object.assign(Object.assign({}, this.logContext), {
                quality: De.HIGH
            })), e.quality = De.HIGH)
        }
        this.emit(B.UpdateSettings, e)
    }
}
