class Dc extends O {
    get sender() {
        return this._sender
    }
    set sender(e) {
        this._sender = e
    }
    get constraints() {
        return this._constraints
    }
    get hasPreConnectBuffer() {
        return !!this.localTrackRecorder
    }
    constructor(e, t, n) {
        let s = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : !1,
            r = arguments.length > 4 ? arguments[4] : void 0;
        super(e, t, r), this.manuallyStopped = !1, this.pendingDeviceChange = !1, this._isUpstreamPaused = !1, this.handleTrackMuteEvent = () => this.debouncedTrackMuteHandler().catch(() => this.log.debug("track mute bounce got cancelled by an unmute event", this.logContext)), this.debouncedTrackMuteHandler = Gs(() => b(this, void 0, void 0, function*() {
            yield this.pauseUpstream()
        }), 5e3), this.handleTrackUnmuteEvent = () => b(this, void 0, void 0, function*() {
            this.debouncedTrackMuteHandler.cancel("unmute"), yield this.resumeUpstream()
        }), this.handleEnded = () => {
            this.isInBackground && (this.reacquireTrack = !0), this._mediaStreamTrack.removeEventListener("mute", this.handleTrackMuteEvent), this._mediaStreamTrack.removeEventListener("unmute", this.handleTrackUnmuteEvent), this.emit(B.Ended, this)
        }, this.reacquireTrack = !1, this.providedByUser = s, this.muteLock = new _e, this.pauseUpstreamLock = new _e, this.trackChangeLock = new _e, this.trackChangeLock.lock().then(a => b(this, void 0, void 0, function*() {
            try {
                yield this.setMediaStreamTrack(e, !0)
            } finally {
                a()
            }
        })), this._constraints = e.getConstraints(), n && (this._constraints = n)
    }
    get id() {
        return this._mediaStreamTrack.id
    }
    get dimensions() {
        if (this.kind !== O.Kind.Video) return;
        const {
            width: e,
            height: t
        } = this._mediaStreamTrack.getSettings();
        if (e && t) return {
            width: e,
            height: t
        }
    }
    get isUpstreamPaused() {
        return this._isUpstreamPaused
    }
    get isUserProvided() {
        return this.providedByUser
    }
    get mediaStreamTrack() {
        var e, t;
        return (t = (e = this.processor) === null || e === void 0 ? void 0 : e.processedTrack) !== null && t !== void 0 ? t : this._mediaStreamTrack
    }
    get isLocal() {
        return !0
    }
    getSourceTrackSettings() {
        return this._mediaStreamTrack.getSettings()
    }
    setMediaStreamTrack(e, t) {
        return b(this, void 0, void 0, function*() {
            var n;
            if (e === this._mediaStreamTrack && !t) return;
            this._mediaStreamTrack && (this.attachedElements.forEach(r => {
                Ht(this._mediaStreamTrack, r)
            }), this.debouncedTrackMuteHandler.cancel("new-track"), this._mediaStreamTrack.removeEventListener("ended", this.handleEnded), this._mediaStreamTrack.removeEventListener("mute", this.handleTrackMuteEvent), this._mediaStreamTrack.removeEventListener("unmute", this.handleTrackUnmuteEvent)), this.mediaStream = new MediaStream([e]), e && (e.addEventListener("ended", this.handleEnded), e.addEventListener("mute", this.handleTrackMuteEvent), e.addEventListener("unmute", this.handleTrackUnmuteEvent), this._constraints = e.getConstraints());
            let s;
            if (this.processor && e) {
                if (this.log.debug("restarting processor", this.logContext), this.kind === "unknown") throw TypeError("cannot set processor on track of unknown kind");
                this.processorElement && (Ft(e, this.processorElement), this.processorElement.muted = !0), yield this.processor.restart({
                    track: e,
                    kind: this.kind,
                    element: this.processorElement
                }), s = this.processor.processedTrack
            }
            this.sender && ((n = this.sender.transport) === null || n === void 0 ? void 0 : n.state) !== "closed" && (yield this.sender.replaceTrack(s ?? e)), !this.providedByUser && this._mediaStreamTrack !== e && this._mediaStreamTrack.stop(), this._mediaStreamTrack = e, e && (this._mediaStreamTrack.enabled = !this.isMuted, yield this.resumeUpstream(), this.attachedElements.forEach(r => {
                Ft(s ?? e, r)
            }))
        })
    }
    waitForDimensions() {
        return b(this, arguments, void 0, function() {
            var e = this;
            let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : sf;
            return function*() {
                var n;
                if (e.kind === O.Kind.Audio) throw new Error("cannot get dimensions for audio tracks");
                ((n = Oe()) === null || n === void 0 ? void 0 : n.os) === "iOS" && (yield Ce(10));
                const s = Date.now();
                for (; Date.now() - s < t;) {
                    const r = e.dimensions;
                    if (r) return r;
                    yield Ce(50)
                }
                throw new ct("unable to get track dimensions after timeout")
            }()
        })
    }
    setDeviceId(e) {
        return b(this, void 0, void 0, function*() {
            return this._constraints.deviceId === e && this._mediaStreamTrack.getSettings().deviceId === It(e) ? !0 : (this._constraints.deviceId = e, this.isMuted ? (this.pendingDeviceChange = !0, !0) : (yield this.restartTrack(), It(e) === this._mediaStreamTrack.getSettings().deviceId))
        })
    }
    getDeviceId() {
        return b(this, arguments, void 0, function() {
            var e = this;
            let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
            return function*() {
                if (e.source === O.Source.ScreenShare) return;
                const {
                    deviceId: n,
                    groupId: s
                } = e._mediaStreamTrack.getSettings(), r = e.kind === O.Kind.Audio ? "audioinput" : "videoinput";
                return t ? Se.getInstance().normalizeDeviceId(r, n, s) : n
            }()
        })
    }
    mute() {
        return b(this, void 0, void 0, function*() {
            return this.setTrackMuted(!0), this
        })
    }
    unmute() {
        return b(this, void 0, void 0, function*() {
            return this.setTrackMuted(!1), this
        })
    }
    replaceTrack(e, t) {
        return b(this, void 0, void 0, function*() {
            const n = yield this.trackChangeLock.lock();
            try {
                if (!this.sender) throw new ct("unable to replace an unpublished track");
                let s, r;
                return typeof t == "boolean" ? s = t : t !== void 0 && (s = t.userProvidedTrack, r = t.stopProcessor), this.providedByUser = s ?? !0, this.log.debug("replace MediaStreamTrack", this.logContext), yield this.setMediaStreamTrack(e), r && this.processor && (yield this.internalStopProcessor()), this
            } finally {
                n()
            }
        })
    }
    restart(e) {
        return b(this, void 0, void 0, function*() {
            this.manuallyStopped = !1;
            const t = yield this.trackChangeLock.lock();
            try {
                e || (e = this._constraints);
                const {
                    deviceId: n,
                    facingMode: s
                } = e, r = Rh(e, ["deviceId", "facingMode"]);
                this.log.debug("restarting track with constraints", Object.assign(Object.assign({}, this.logContext), {
                    constraints: e
                }));
                const a = {
                    audio: !1,
                    video: !1
                };
                this.kind === O.Kind.Video ? a.video = n || s ? {
                    deviceId: n,
                    facingMode: s
                } : !0 : a.audio = n ? Object.assign({
                    deviceId: n
                }, r) : !0, this.attachedElements.forEach(d => {
                    Ht(this.mediaStreamTrack, d)
                }), this._mediaStreamTrack.removeEventListener("ended", this.handleEnded), this._mediaStreamTrack.stop();
                const c = (yield navigator.mediaDevices.getUserMedia(a)).getTracks()[0];
                return this.kind === O.Kind.Video && (yield c.applyConstraints(r)), c.addEventListener("ended", this.handleEnded), this.log.debug("re-acquired MediaStreamTrack", this.logContext), yield this.setMediaStreamTrack(c), this._constraints = e, this.pendingDeviceChange = !1, this.emit(B.Restarted, this), this.manuallyStopped && (this.log.warn("track was stopped during a restart, stopping restarted track", this.logContext), this.stop()), this
            } finally {
                t()
            }
        })
    }
    setTrackMuted(e) {
        this.log.debug("setting ".concat(this.kind, " track ").concat(e ? "muted" : "unmuted"), this.logContext), !(this.isMuted === e && this._mediaStreamTrack.enabled !== e) && (this.isMuted = e, this._mediaStreamTrack.enabled = !e, this.emit(e ? B.Muted : B.Unmuted, this))
    }
    get needsReAcquisition() {
        return this._mediaStreamTrack.readyState !== "live" || this._mediaStreamTrack.muted || !this._mediaStreamTrack.enabled || this.reacquireTrack
    }
    handleAppVisibilityChanged() {
        const e = Object.create(null, {
            handleAppVisibilityChanged: {
                get: () => super.handleAppVisibilityChanged
            }
        });
        return b(this, void 0, void 0, function*() {
            yield e.handleAppVisibilityChanged.call(this), Ec() && (this.log.debug("visibility changed, is in Background: ".concat(this.isInBackground), this.logContext), !this.isInBackground && this.needsReAcquisition && !this.isUserProvided && !this.isMuted && (this.log.debug("track needs to be reacquired, restarting ".concat(this.source), this.logContext), yield this.restart(), this.reacquireTrack = !1))
        })
    }
    stop() {
        var e;
        this.manuallyStopped = !0, super.stop(), this._mediaStreamTrack.removeEventListener("ended", this.handleEnded), this._mediaStreamTrack.removeEventListener("mute", this.handleTrackMuteEvent), this._mediaStreamTrack.removeEventListener("unmute", this.handleTrackUnmuteEvent), (e = this.processor) === null || e === void 0 || e.destroy(), this.processor = void 0
    }
    pauseUpstream() {
        return b(this, void 0, void 0, function*() {
            var e;
            const t = yield this.pauseUpstreamLock.lock();
            try {
                if (this._isUpstreamPaused === !0) return;
                if (!this.sender) {
                    this.log.warn("unable to pause upstream for an unpublished track", this.logContext);
                    return
                }
                this._isUpstreamPaused = !0, this.emit(B.UpstreamPaused, this);
                const n = Oe();
                if ((n == null ? void 0 : n.name) === "Safari" && Ze(n.version, "12.0") < 0) throw new Vs("pauseUpstream is not supported on Safari < 12.");
                ((e = this.sender.transport) === null || e === void 0 ? void 0 : e.state) !== "closed" && (yield this.sender.replaceTrack(null))
            } finally {
                t()
            }
        })
    }
    resumeUpstream() {
        return b(this, void 0, void 0, function*() {
            var e;
            const t = yield this.pauseUpstreamLock.lock();
            try {
                if (this._isUpstreamPaused === !1) return;
                if (!this.sender) {
                    this.log.warn("unable to resume upstream for an unpublished track", this.logContext);
                    return
                }
                this._isUpstreamPaused = !1, this.emit(B.UpstreamResumed, this), ((e = this.sender.transport) === null || e === void 0 ? void 0 : e.state) !== "closed" && (yield this.sender.replaceTrack(this.mediaStreamTrack))
            } finally {
                t()
            }
        })
    }
    getRTCStatsReport() {
        return b(this, void 0, void 0, function*() {
            var e;
            return !((e = this.sender) === null || e === void 0) && e.getStats ? yield this.sender.getStats(): void 0
        })
    }
    setProcessor(e) {
        return b(this, arguments, void 0, function(t) {
            var n = this;
            let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
            return function*() {
                var r;
                const a = yield n.trackChangeLock.lock();
                try {
                    n.log.debug("setting up processor", n.logContext);
                    const o = document.createElement(n.kind),
                        c = {
                            kind: n.kind,
                            track: n._mediaStreamTrack,
                            element: o,
                            audioContext: n.audioContext
                        };
                    if (yield t.init(c), n.log.debug("processor initialized", n.logContext), n.processor && (yield n.internalStopProcessor()), n.kind === "unknown") throw TypeError("cannot set processor on track of unknown kind");
                    if (Ft(n._mediaStreamTrack, o), o.muted = !0, o.play().catch(d => {
                            d instanceof DOMException && d.name === "AbortError" ? (n.log.warn("failed to play processor element, retrying", Object.assign(Object.assign({}, n.logContext), {
                                error: d
                            })), setTimeout(() => {
                                o.play().catch(l => {
                                    n.log.error("failed to play processor element", Object.assign(Object.assign({}, n.logContext), {
                                        err: l
                                    }))
                                })
                            }, 100)) : n.log.error("failed to play processor element", Object.assign(Object.assign({}, n.logContext), {
                                error: d
                            }))
                        }), n.processor = t, n.processorElement = o, n.processor.processedTrack) {
                        for (const d of n.attachedElements) d !== n.processorElement && s && (Ht(n._mediaStreamTrack, d), Ft(n.processor.processedTrack, d));
                        yield(r = n.sender) === null || r === void 0 ? void 0 : r.replaceTrack(n.processor.processedTrack)
                    }
                    n.emit(B.TrackProcessorUpdate, n.processor)
                } finally {
                    a()
                }
            }()
        })
    }
    getProcessor() {
        return this.processor
    }
    stopProcessor() {
        return b(this, arguments, void 0, function() {
            var e = this;
            let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
            return function*() {
                const n = yield e.trackChangeLock.lock();
                try {
                    yield e.internalStopProcessor(t)
                } finally {
                    n()
                }
            }()
        })
    }
    internalStopProcessor() {
        return b(this, arguments, void 0, function() {
            var e = this;
            let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
            return function*() {
                var n, s;
                e.processor && (e.log.debug("stopping processor", e.logContext), (n = e.processor.processedTrack) === null || n === void 0 || n.stop(), yield e.processor.destroy(), e.processor = void 0, t || ((s = e.processorElement) === null || s === void 0 || s.remove(), e.processorElement = void 0), yield e._mediaStreamTrack.applyConstraints(e._constraints), yield e.setMediaStreamTrack(e._mediaStreamTrack, !0), e.emit(B.TrackProcessorUpdate))
            }()
        })
    }
    startPreConnectBuffer() {
        let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 100;
        if (!nf()) {
            this.log.warn("MediaRecorder is not available, cannot start preconnect buffer", this.logContext);
            return
        }
        if (this.localTrackRecorder) {
            this.log.warn("preconnect buffer already started");
            return
        } else {
            let t = "audio/webm;codecs=opus";
            MediaRecorder.isTypeSupported(t) || (t = "video/mp4"), this.localTrackRecorder = new tf(this, {
                mimeType: t
            })
        }
        this.localTrackRecorder.start(e), this.autoStopPreConnectBuffer = setTimeout(() => {
            this.log.warn("preconnect buffer timed out, stopping recording automatically", this.logContext), this.stopPreConnectBuffer()
        }, rf)
    }
    stopPreConnectBuffer() {
        clearTimeout(this.autoStopPreConnectBuffer), this.localTrackRecorder && (this.localTrackRecorder.stop(), this.localTrackRecorder = void 0)
    }
    getPreConnectBuffer() {
        var e;
        return (e = this.localTrackRecorder) === null || e === void 0 ? void 0 : e.byteStream
    }
    getPreConnectBufferMimeType() {
        var e;
        return (e = this.localTrackRecorder) === null || e === void 0 ? void 0 : e.mimeType
    }
}
