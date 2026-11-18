class $i extends Dc {
    get enhancedNoiseCancellation() {
        return this.isKrispNoiseFilterEnabled
    }
    constructor(e, t) {
        let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
            s = arguments.length > 3 ? arguments[3] : void 0,
            r = arguments.length > 4 ? arguments[4] : void 0;
        super(e, O.Kind.Audio, t, n, r), this.stopOnMute = !1, this.isKrispNoiseFilterEnabled = !1, this.monitorSender = () => b(this, void 0, void 0, function*() {
            if (!this.sender) {
                this._currentBitrate = 0;
                return
            }
            let a;
            try {
                a = yield this.getSenderStats()
            } catch (o) {
                this.log.error("could not get audio sender stats", Object.assign(Object.assign({}, this.logContext), {
                    error: o
                }));
                return
            }
            a && this.prevStats && (this._currentBitrate = un(a, this.prevStats)), this.prevStats = a
        }), this.handleKrispNoiseFilterEnable = () => {
            this.isKrispNoiseFilterEnabled = !0, this.log.debug("Krisp noise filter enabled", this.logContext), this.emit(B.AudioTrackFeatureUpdate, this, ke.TF_ENHANCED_NOISE_CANCELLATION, !0)
        }, this.handleKrispNoiseFilterDisable = () => {
            this.isKrispNoiseFilterEnabled = !1, this.log.debug("Krisp noise filter disabled", this.logContext), this.emit(B.AudioTrackFeatureUpdate, this, ke.TF_ENHANCED_NOISE_CANCELLATION, !1)
        }, this.audioContext = s, this.checkForSilence()
    }
    mute() {
        const e = Object.create(null, {
            mute: {
                get: () => super.mute
            }
        });
        return b(this, void 0, void 0, function*() {
            const t = yield this.muteLock.lock();
            try {
                return this.isMuted ? (this.log.debug("Track already muted", this.logContext), this) : (this.source === O.Source.Microphone && this.stopOnMute && !this.isUserProvided && (this.log.debug("stopping mic track", this.logContext), this._mediaStreamTrack.stop()), yield e.mute.call(this), this)
            } finally {
                t()
            }
        })
    }
    unmute() {
        const e = Object.create(null, {
            unmute: {
                get: () => super.unmute
            }
        });
        return b(this, void 0, void 0, function*() {
            const t = yield this.muteLock.lock();
            try {
                return this.isMuted ? (this.source === O.Source.Microphone && (this.stopOnMute || this._mediaStreamTrack.readyState === "ended" || this.pendingDeviceChange) && !this.isUserProvided && (this.log.debug("reacquiring mic track", this.logContext), yield this.restartTrack()), yield e.unmute.call(this), this) : (this.log.debug("Track already unmuted", this.logContext), this)
            } finally {
                t()
            }
        })
    }
    restartTrack(e) {
        return b(this, void 0, void 0, function*() {
            let t;
            if (e) {
                const n = qs({
                    audio: e
                });
                typeof n.audio != "boolean" && (t = n.audio)
            }
            yield this.restart(t)
        })
    }
    restart(e) {
        const t = Object.create(null, {
            restart: {
                get: () => super.restart
            }
        });
        return b(this, void 0, void 0, function*() {
            const n = yield t.restart.call(this, e);
            return this.checkForSilence(), n
        })
    }
    startMonitor() {
        Me() && (this.monitorInterval || (this.monitorInterval = setInterval(() => {
            this.monitorSender()
        }, Qs)))
    }
    setProcessor(e) {
        return b(this, void 0, void 0, function*() {
            var t;
            const n = yield this.trackChangeLock.lock();
            try {
                if (!Xe() && !this.audioContext) throw Error("Audio context needs to be set on LocalAudioTrack in order to enable processors");
                this.processor && (yield this.internalStopProcessor());
                const s = {
                    kind: this.kind,
                    track: this._mediaStreamTrack,
                    audioContext: this.audioContext
                };
                this.log.debug("setting up audio processor ".concat(e.name), this.logContext), yield e.init(s), this.processor = e, this.processor.processedTrack && (yield(t = this.sender) === null || t === void 0 ? void 0 : t.replaceTrack(this.processor.processedTrack), this.processor.processedTrack.addEventListener("enable-lk-krisp-noise-filter", this.handleKrispNoiseFilterEnable), this.processor.processedTrack.addEventListener("disable-lk-krisp-noise-filter", this.handleKrispNoiseFilterDisable)), this.emit(B.TrackProcessorUpdate, this.processor)
            } finally {
                n()
            }
        })
    }
    setAudioContext(e) {
        this.audioContext = e
    }
    getSenderStats() {
        return b(this, void 0, void 0, function*() {
            var e;
            if (!(!((e = this.sender) === null || e === void 0) && e.getStats)) return;
            const t = yield this.sender.getStats();
            let n;
            return t.forEach(s => {
                s.type === "outbound-rtp" && (n = {
                    type: "audio",
                    streamId: s.id,
                    packetsSent: s.packetsSent,
                    packetsLost: s.packetsLost,
                    bytesSent: s.bytesSent,
                    timestamp: s.timestamp,
                    roundTripTime: s.roundTripTime,
                    jitter: s.jitter
                })
            }), n
        })
    }
    checkForSilence() {
        return b(this, void 0, void 0, function*() {
            const e = yield Tc(this);
            return e && (this.isMuted || this.log.debug("silence detected on local audio track", this.logContext), this.emit(B.AudioSilenceDetected)), e
        })
    }
}

