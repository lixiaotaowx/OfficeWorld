class Qi extends Dc {
    get sender() {
        return this._sender
    }
    set sender(e) {
        this._sender = e, this.degradationPreference && this.setDegradationPreference(this.degradationPreference)
    }
    constructor(e, t) {
        let n = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0,
            s = arguments.length > 3 ? arguments[3] : void 0;
        super(e, O.Kind.Video, t, n, s), this.simulcastCodecs = new Map, this.degradationPreference = "balanced", this.isCpuConstrained = !1, this.optimizeForPerformance = !1, this.monitorSender = () => b(this, void 0, void 0, function*() {
            if (!this.sender) {
                this._currentBitrate = 0;
                return
            }
            let r;
            try {
                r = yield this.getSenderStats()
            } catch (c) {
                this.log.error("could not get video sender stats", Object.assign(Object.assign({}, this.logContext), {
                    error: c
                }));
                return
            }
            const a = new Map(r.map(c => [c.rid, c])),
                o = r.some(c => c.qualityLimitationReason === "cpu");
            if (o !== this.isCpuConstrained && (this.isCpuConstrained = o, this.isCpuConstrained && this.emit(B.CpuConstrained)), this.prevStats) {
                let c = 0;
                a.forEach((d, l) => {
                    var u;
                    const h = (u = this.prevStats) === null || u === void 0 ? void 0 : u.get(l);
                    c += un(d, h)
                }), this._currentBitrate = c
            }
            this.prevStats = a
        }), this.senderLock = new _e
    }
    get isSimulcast() {
        return !!(this.sender && this.sender.getParameters().encodings.length > 1)
    }
    startMonitor(e) {
        var t;
        if (this.signalClient = e, !Me()) return;
        const n = (t = this.sender) === null || t === void 0 ? void 0 : t.getParameters();
        n && (this.encodings = n.encodings), !this.monitorInterval && (this.monitorInterval = setInterval(() => {
            this.monitorSender()
        }, Qs))
    }
    stop() {
        this._mediaStreamTrack.getConstraints(), this.simulcastCodecs.forEach(e => {
            e.mediaStreamTrack.stop()
        }), super.stop()
    }
    pauseUpstream() {
        const e = Object.create(null, {
            pauseUpstream: {
                get: () => super.pauseUpstream
            }
        });
        return b(this, void 0, void 0, function*() {
            var t, n, s, r, a;
            yield e.pauseUpstream.call(this);
            try {
                for (var o = !0, c = at(this.simulcastCodecs.values()), d; d = yield c.next(), t = d.done, !t; o = !0) r = d.value, o = !1, yield(a = r.sender) === null || a === void 0 ? void 0 : a.replaceTrack(null)
            } catch (l) {
                n = {
                    error: l
                }
            } finally {
                try {
                    !o && !t && (s = c.return) && (yield s.call(c))
                } finally {
                    if (n) throw n.error
                }
            }
        })
    }
    resumeUpstream() {
        const e = Object.create(null, {
            resumeUpstream: {
                get: () => super.resumeUpstream
            }
        });
        return b(this, void 0, void 0, function*() {
            var t, n, s, r, a;
            yield e.resumeUpstream.call(this);
            try {
                for (var o = !0, c = at(this.simulcastCodecs.values()), d; d = yield c.next(), t = d.done, !t; o = !0) {
                    r = d.value, o = !1;
                    const l = r;
                    yield(a = l.sender) === null || a === void 0 ? void 0 : a.replaceTrack(l.mediaStreamTrack)
                }
            } catch (l) {
                n = {
                    error: l
                }
            } finally {
                try {
                    !o && !t && (s = c.return) && (yield s.call(c))
                } finally {
                    if (n) throw n.error
                }
            }
        })
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
                return this.isMuted ? (this.log.debug("Track already muted", this.logContext), this) : (this.source === O.Source.Camera && !this.isUserProvided && (this.log.debug("stopping camera track", this.logContext), this._mediaStreamTrack.stop()), yield e.mute.call(this), this)
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
                return this.isMuted ? (this.source === O.Source.Camera && !this.isUserProvided && (this.log.debug("reacquiring camera track", this.logContext), yield this.restartTrack()), yield e.unmute.call(this), this) : (this.log.debug("Track already unmuted", this.logContext), this)
            } finally {
                t()
            }
        })
    }
    setTrackMuted(e) {
        super.setTrackMuted(e);
        for (const t of this.simulcastCodecs.values()) t.mediaStreamTrack.enabled = !e
    }
    getSenderStats() {
        return b(this, void 0, void 0, function*() {
            var e;
            if (!(!((e = this.sender) === null || e === void 0) && e.getStats)) return [];
            const t = [],
                n = yield this.sender.getStats();
            return n.forEach(s => {
                var r;
                if (s.type === "outbound-rtp") {
                    const a = {
                            type: "video",
                            streamId: s.id,
                            frameHeight: s.frameHeight,
                            frameWidth: s.frameWidth,
                            framesPerSecond: s.framesPerSecond,
                            framesSent: s.framesSent,
                            firCount: s.firCount,
                            pliCount: s.pliCount,
                            nackCount: s.nackCount,
                            packetsSent: s.packetsSent,
                            bytesSent: s.bytesSent,
                            qualityLimitationReason: s.qualityLimitationReason,
                            qualityLimitationDurations: s.qualityLimitationDurations,
                            qualityLimitationResolutionChanges: s.qualityLimitationResolutionChanges,
                            rid: (r = s.rid) !== null && r !== void 0 ? r : s.id,
                            retransmittedPacketsSent: s.retransmittedPacketsSent,
                            targetBitrate: s.targetBitrate,
                            timestamp: s.timestamp
                        },
                        o = n.get(s.remoteId);
                    o && (a.jitter = o.jitter, a.packetsLost = o.packetsLost, a.roundTripTime = o.roundTripTime), t.push(a)
                }
            }), t.sort((s, r) => {
                var a, o;
                return ((a = r.frameWidth) !== null && a !== void 0 ? a : 0) - ((o = s.frameWidth) !== null && o !== void 0 ? o : 0)
            }), t
        })
    }
    setPublishingQuality(e) {
        const t = [];
        for (let n = De.LOW; n <= De.HIGH; n += 1) t.push(new Ls({
            quality: n,
            enabled: n <= e
        }));
        this.log.debug("setting publishing quality. max quality ".concat(e), this.logContext), this.setPublishingLayers(We(this.codec), t)
    }
    restartTrack(e) {
        return b(this, void 0, void 0, function*() {
            var t, n, s, r, a;
            let o;
            if (e) {
                const u = qs({
                    video: e
                });
                typeof u.video != "boolean" && (o = u.video)
            }
            yield this.restart(o), this.isCpuConstrained = !1;
            try {
                for (var c = !0, d = at(this.simulcastCodecs.values()), l; l = yield d.next(), t = l.done, !t; c = !0) {
                    r = l.value, c = !1;
                    const u = r;
                    u.sender && ((a = u.sender.transport) === null || a === void 0 ? void 0 : a.state) !== "closed" && (u.mediaStreamTrack = this.mediaStreamTrack.clone(), yield u.sender.replaceTrack(u.mediaStreamTrack))
                }
            } catch (u) {
                n = {
                    error: u
                }
            } finally {
                try {
                    !c && !t && (s = d.return) && (yield s.call(d))
                } finally {
                    if (n) throw n.error
                }
            }
        })
    }
    setProcessor(e) {
        const t = Object.create(null, {
            setProcessor: {
                get: () => super.setProcessor
            }
        });
        return b(this, arguments, void 0, function(n) {
            var s = this;
            let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
            return function*() {
                var a, o, c, d, l, u;
                if (yield t.setProcessor.call(s, n, r), !((l = s.processor) === null || l === void 0) && l.processedTrack) try {
                    for (var h = !0, m = at(s.simulcastCodecs.values()), f; f = yield m.next(), a = f.done, !a; h = !0) d = f.value, h = !1, yield(u = d.sender) === null || u === void 0 ? void 0 : u.replaceTrack(s.processor.processedTrack)
                } catch (p) {
                    o = {
                        error: p
                    }
                } finally {
                    try {
                        !h && !a && (c = m.return) && (yield c.call(m))
                    } finally {
                        if (o) throw o.error
                    }
                }
            }()
        })
    }
    setDegradationPreference(e) {
        return b(this, void 0, void 0, function*() {
            if (this.degradationPreference = e, this.sender) try {
                this.log.debug("setting degradationPreference to ".concat(e), this.logContext);
                const t = this.sender.getParameters();
                t.degradationPreference = e, this.sender.setParameters(t)
            } catch (t) {
                this.log.warn("failed to set degradationPreference", Object.assign({
                    error: t
                }, this.logContext))
            }
        })
    }
    addSimulcastTrack(e, t) {
        if (this.simulcastCodecs.has(e)) {
            this.log.error("".concat(e, " already added, skipping adding simulcast codec"), this.logContext);
            return
        }
        const n = {
            codec: e,
            mediaStreamTrack: this.mediaStreamTrack.clone(),
            sender: void 0,
            encodings: t
        };
        return this.simulcastCodecs.set(e, n), n
    }
    setSimulcastTrackSender(e, t) {
        const n = this.simulcastCodecs.get(e);
        n && (n.sender = t, setTimeout(() => {
            this.subscribedCodecs && this.setPublishingCodecs(this.subscribedCodecs)
        }, vf))
    }
    setPublishingCodecs(e) {
        return b(this, void 0, void 0, function*() {
            var t, n, s, r, a, o, c;
            if (this.log.debug("setting publishing codecs", Object.assign(Object.assign({}, this.logContext), {
                    codecs: e,
                    currentCodec: this.codec
                })), !this.codec && e.length > 0) return yield this.setPublishingLayers(We(e[0].codec), e[0].qualities), [];
            this.subscribedCodecs = e;
            const d = [];
            try {
                for (t = !0, n = at(e); s = yield n.next(), r = s.done, !r; t = !0) {
                    c = s.value, t = !1;
                    const l = c;
                    if (!this.codec || this.codec === l.codec) yield this.setPublishingLayers(We(l.codec), l.qualities);
                    else {
                        const u = this.simulcastCodecs.get(l.codec);
                        if (this.log.debug("try setPublishingCodec for ".concat(l.codec), Object.assign(Object.assign({}, this.logContext), {
                                simulcastCodecInfo: u
                            })), !u || !u.sender) {
                            for (const h of l.qualities)
                                if (h.enabled) {
                                    d.push(l.codec);
                                    break
                                }
                        } else u.encodings && (this.log.debug("try setPublishingLayersForSender ".concat(l.codec), this.logContext), yield yo(u.sender, u.encodings, l.qualities, this.senderLock, We(l.codec), this.log, this.logContext))
                    }
                }
            } catch (l) {
                a = {
                    error: l
                }
            } finally {
                try {
                    !t && !r && (o = n.return) && (yield o.call(n))
                } finally {
                    if (a) throw a.error
                }
            }
            return d
        })
    }
    setPublishingLayers(e, t) {
        return b(this, void 0, void 0, function*() {
            if (this.optimizeForPerformance) {
                this.log.info("skipping setPublishingLayers due to optimized publishing performance", Object.assign(Object.assign({}, this.logContext), {
                    qualities: t
                }));
                return
            }
            this.log.debug("setting publishing layers", Object.assign(Object.assign({}, this.logContext), {
                qualities: t
            })), !(!this.sender || !this.encodings) && (yield yo(this.sender, this.encodings, t, this.senderLock, e, this.log, this.logContext))
        })
    }
    prioritizePerformance() {
        return b(this, void 0, void 0, function*() {
            if (!this.sender) throw new Error("sender not found");
            const e = yield this.senderLock.lock();
            try {
                this.optimizeForPerformance = !0;
                const t = this.sender.getParameters();
                t.encodings = t.encodings.map((n, s) => {
                    var r;
                    return Object.assign(Object.assign({}, n), {
                        active: s === 0,
                        scaleResolutionDownBy: Math.max(1, Math.ceil(((r = this.mediaStreamTrack.getSettings().height) !== null && r !== void 0 ? r : 360) / 360)),
                        scalabilityMode: s === 0 && We(this.codec) ? "L1T3" : void 0,
                        maxFramerate: s === 0 ? 15 : 0,
                        maxBitrate: s === 0 ? n.maxBitrate : 0
                    })
                }), this.log.debug("setting performance optimised encodings", Object.assign(Object.assign({}, this.logContext), {
                    encodings: t.encodings
                })), this.encodings = t.encodings, yield this.sender.setParameters(t)
            } catch (t) {
                this.log.error("failed to set performance optimised encodings", Object.assign(Object.assign({}, this.logContext), {
                    error: t
                })), this.optimizeForPerformance = !1
            } finally {
                e()
            }
        })
    }
    handleAppVisibilityChanged() {
        const e = Object.create(null, {
            handleAppVisibilityChanged: {
                get: () => super.handleAppVisibilityChanged
            }
        });
        return b(this, void 0, void 0, function*() {
            yield e.handleAppVisibilityChanged.call(this), Ec() && this.isInBackground && this.source === O.Source.Camera && (this._mediaStreamTrack.enabled = !1)
        })
    }
}

