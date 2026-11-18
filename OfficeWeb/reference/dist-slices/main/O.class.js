class O extends et.EventEmitter {
    get streamState() {
        return this._streamState
    }
    setStreamState(e) {
        this._streamState = e
    }
    constructor(e, t) {
        let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        var s;
        super(), this.attachedElements = [], this.isMuted = !1, this._streamState = O.StreamState.Active, this.isInBackground = !1, this._currentBitrate = 0, this.log = X, this.appVisibilityChangedListener = () => {
            this.backgroundTimeout && clearTimeout(this.backgroundTimeout), document.visibilityState === "hidden" ? this.backgroundTimeout = setTimeout(() => this.handleAppVisibilityChanged(), tm) : this.handleAppVisibilityChanged()
        }, this.log = Ye((s = n.loggerName) !== null && s !== void 0 ? s : Ue.Track), this.loggerContextCb = n.loggerContextCb, this.setMaxListeners(100), this.kind = t, this._mediaStreamTrack = e, this._mediaStreamID = e.id, this.source = O.Source.Unknown
    }
    get logContext() {
        var e;
        return Object.assign(Object.assign({}, (e = this.loggerContextCb) === null || e === void 0 ? void 0 : e.call(this)), te(this))
    }
    get currentBitrate() {
        return this._currentBitrate
    }
    get mediaStreamTrack() {
        return this._mediaStreamTrack
    }
    get mediaStreamID() {
        return this._mediaStreamID
    }
    attach(e) {
        let t = "audio";
        this.kind === O.Kind.Video && (t = "video"), this.attachedElements.length === 0 && this.kind === O.Kind.Video && this.addAppVisibilityListener(), e || (t === "audio" && (ei.forEach(r => {
            r.parentElement === null && !e && (e = r)
        }), e && ei.splice(ei.indexOf(e), 1)), e || (e = document.createElement(t))), this.attachedElements.includes(e) || this.attachedElements.push(e), Ft(this.mediaStreamTrack, e);
        const n = e.srcObject.getTracks(),
            s = n.some(r => r.kind === "audio");
        return e.play().then(() => {
            this.emit(s ? B.AudioPlaybackStarted : B.VideoPlaybackStarted)
        }).catch(r => {
            r.name === "NotAllowedError" ? this.emit(s ? B.AudioPlaybackFailed : B.VideoPlaybackFailed, r) : r.name === "AbortError" ? X.debug("".concat(s ? "audio" : "video", " playback aborted, likely due to new play request")) : X.warn("could not playback ".concat(s ? "audio" : "video"), r), s && e && n.some(a => a.kind === "video") && r.name === "NotAllowedError" && (e.muted = !0, e.play().catch(() => {}))
        }), this.emit(B.ElementAttached, e), e
    }
    detach(e) {
        try {
            if (e) {
                Ht(this.mediaStreamTrack, e);
                const n = this.attachedElements.indexOf(e);
                return n >= 0 && (this.attachedElements.splice(n, 1), this.recycleElement(e), this.emit(B.ElementDetached, e)), e
            }
            const t = [];
            return this.attachedElements.forEach(n => {
                Ht(this.mediaStreamTrack, n), t.push(n), this.recycleElement(n), this.emit(B.ElementDetached, n)
            }), this.attachedElements = [], t
        } finally {
            this.attachedElements.length === 0 && this.removeAppVisibilityListener()
        }
    }
    stop() {
        this.stopMonitor(), this._mediaStreamTrack.stop()
    }
    enable() {
        this._mediaStreamTrack.enabled = !0
    }
    disable() {
        this._mediaStreamTrack.enabled = !1
    }
    stopMonitor() {
        this.monitorInterval && clearInterval(this.monitorInterval), this.timeSyncHandle && cancelAnimationFrame(this.timeSyncHandle)
    }
    updateLoggerOptions(e) {
        e.loggerName && (this.log = Ye(e.loggerName)), e.loggerContextCb && (this.loggerContextCb = e.loggerContextCb)
    }
    recycleElement(e) {
        if (e instanceof HTMLAudioElement) {
            let t = !0;
            e.pause(), ei.forEach(n => {
                n.parentElement || (t = !1)
            }), t && ei.push(e)
        }
    }
    handleAppVisibilityChanged() {
        return b(this, void 0, void 0, function*() {
            this.isInBackground = document.visibilityState === "hidden", !this.isInBackground && this.kind === O.Kind.Video && setTimeout(() => this.attachedElements.forEach(e => e.play().catch(() => {})), 0)
        })
    }
    addAppVisibilityListener() {
        Me() ? (this.isInBackground = document.visibilityState === "hidden", document.addEventListener("visibilitychange", this.appVisibilityChangedListener)) : this.isInBackground = !1
    }
    removeAppVisibilityListener() {
        Me() && document.removeEventListener("visibilitychange", this.appVisibilityChangedListener)
    }
}

