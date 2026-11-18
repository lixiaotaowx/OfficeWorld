class mo extends et.EventEmitter {
    get pc() {
        return this._pc || (this._pc = this.createPC()), this._pc
    }
    constructor(e) {
        let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var n;
        super(), this.log = X, this.ddExtID = 0, this.latestOfferId = 0, this.pendingCandidates = [], this.restartingIce = !1, this.renegotiate = !1, this.trackBitrates = [], this.remoteStereoMids = [], this.remoteNackMids = [], this.negotiate = Gs(s => b(this, void 0, void 0, function*() {
            this.emit(xt.NegotiationStarted);
            try {
                yield this.createAndSendOffer()
            } catch (r) {
                if (s) s(r);
                else throw r
            }
        }), Gm), this.close = () => {
            this._pc && (this._pc.close(), this._pc.onconnectionstatechange = null, this._pc.oniceconnectionstatechange = null, this._pc.onicegatheringstatechange = null, this._pc.ondatachannel = null, this._pc.onnegotiationneeded = null, this._pc.onsignalingstatechange = null, this._pc.onicecandidate = null, this._pc.ondatachannel = null, this._pc.ontrack = null, this._pc.onconnectionstatechange = null, this._pc.oniceconnectionstatechange = null, this._pc = null)
        }, this.log = Ye((n = t.loggerName) !== null && n !== void 0 ? n : Ue.PCTransport), this.loggerOptions = t, this.config = e, this._pc = this.createPC(), this.offerLock = new _e
    }
    createPC() {
        const e = new RTCPeerConnection(this.config);
        return e.onicecandidate = t => {
            var n;
            t.candidate && ((n = this.onIceCandidate) === null || n === void 0 || n.call(this, t.candidate))
        }, e.onicecandidateerror = t => {
            var n;
            (n = this.onIceCandidateError) === null || n === void 0 || n.call(this, t)
        }, e.oniceconnectionstatechange = () => {
            var t;
            (t = this.onIceConnectionStateChange) === null || t === void 0 || t.call(this, e.iceConnectionState)
        }, e.onsignalingstatechange = () => {
            var t;
            (t = this.onSignalingStatechange) === null || t === void 0 || t.call(this, e.signalingState)
        }, e.onconnectionstatechange = () => {
            var t;
            (t = this.onConnectionStateChange) === null || t === void 0 || t.call(this, e.connectionState)
        }, e.ondatachannel = t => {
            var n;
            (n = this.onDataChannel) === null || n === void 0 || n.call(this, t)
        }, e.ontrack = t => {
            var n;
            (n = this.onTrack) === null || n === void 0 || n.call(this, t)
        }, e
    }
    get logContext() {
        var e, t;
        return Object.assign({}, (t = (e = this.loggerOptions).loggerContextCb) === null || t === void 0 ? void 0 : t.call(e))
    }
    get isICEConnected() {
        return this._pc !== null && (this.pc.iceConnectionState === "connected" || this.pc.iceConnectionState === "completed")
    }
    addIceCandidate(e) {
        return b(this, void 0, void 0, function*() {
            if (this.pc.remoteDescription && !this.restartingIce) return this.pc.addIceCandidate(e);
            this.pendingCandidates.push(e)
        })
    }
    setRemoteDescription(e, t) {
        return b(this, void 0, void 0, function*() {
            var n;
            if (e.type === "answer" && this.latestOfferId > 0 && t > 0 && t !== this.latestOfferId) return this.log.warn("ignoring answer for old offer", Object.assign(Object.assign({}, this.logContext), {
                offerId: t,
                latestOfferId: this.latestOfferId
            })), !1;
            let s;
            if (e.type === "offer") {
                let {
                    stereoMids: r,
                    nackMids: a
                } = Jm(e);
                this.remoteStereoMids = r, this.remoteNackMids = a
            } else if (e.type === "answer") {
                const r = ft.parse((n = e.sdp) !== null && n !== void 0 ? n : "");
                r.media.forEach(a => {
                    const o = Js(a.mid);
                    a.type === "audio" && this.trackBitrates.some(c => {
                        if (!c.transceiver || o != c.transceiver.mid) return !1;
                        let d = 0;
                        if (a.rtp.some(u => u.codec.toUpperCase() === c.codec.toUpperCase() ? (d = u.payload, !0) : !1), d === 0) return !0;
                        let l = !1;
                        for (const u of a.fmtp)
                            if (u.payload === d) {
                                u.config = u.config.split(";").filter(h => !h.includes("maxaveragebitrate")).join(";"), c.maxbr > 0 && (u.config += ";maxaveragebitrate=".concat(c.maxbr * 1e3)), l = !0;
                                break
                            } return l || c.maxbr > 0 && a.fmtp.push({
                            payload: d,
                            config: "maxaveragebitrate=".concat(c.maxbr * 1e3)
                        }), !0
                    })
                }), s = ft.write(r)
            }
            return yield this.setMungedSDP(e, s, !0), this.pendingCandidates.forEach(r => {
                this.pc.addIceCandidate(r)
            }), this.pendingCandidates = [], this.restartingIce = !1, this.renegotiate ? (this.renegotiate = !1, yield this.createAndSendOffer()) : e.type === "answer" && (this.emit(xt.NegotiationComplete), e.sdp && ft.parse(e.sdp).media.forEach(a => {
                a.type === "video" && this.emit(xt.RTPVideoPayloadTypes, a.rtp)
            })), !0
        })
    }
    createAndSendOffer(e) {
        return b(this, void 0, void 0, function*() {
            var t;
            const n = yield this.offerLock.lock();
            try {
                if (this.onOffer === void 0) return;
                if (e != null && e.iceRestart && (this.log.debug("restarting ICE", this.logContext), this.restartingIce = !0), this._pc && this._pc.signalingState === "have-local-offer") {
                    const o = this._pc.remoteDescription;
                    if (e != null && e.iceRestart && o) yield this._pc.setRemoteDescription(o);
                    else {
                        this.renegotiate = !0, this.log.debug("requesting renegotiation", Object.assign({}, this.logContext));
                        return
                    }
                } else if (!this._pc || this._pc.signalingState === "closed") {
                    this.log.warn("could not createOffer with closed peer connection", this.logContext);
                    return
                }
                this.log.debug("starting to negotiate", this.logContext);
                const s = this.latestOfferId + 1;
                this.latestOfferId = s;
                const r = yield this.pc.createOffer(e);
                this.log.debug("original offer", Object.assign({
                    sdp: r.sdp
                }, this.logContext));
                const a = ft.parse((t = r.sdp) !== null && t !== void 0 ? t : "");
                if (a.media.forEach(o => {
                        po(o), o.type === "audio" ? fo(o, ["all"], []) : o.type === "video" && this.trackBitrates.some(c => {
                            if (!o.msid || !c.cid || !o.msid.includes(c.cid)) return !1;
                            let d = 0;
                            if (o.rtp.some(u => u.codec.toUpperCase() === c.codec.toUpperCase() ? (d = u.payload, !0) : !1), d === 0 || (We(c.codec) && !Dt() && this.ensureVideoDDExtensionForSVC(o, a), !We(c.codec))) return !0;
                            const l = Math.round(c.maxbr * Km);
                            for (const u of o.fmtp)
                                if (u.payload === d) {
                                    u.config.includes("x-google-start-bitrate") || (u.config += ";x-google-start-bitrate=".concat(l));
                                    break
                                } return !0
                        })
                    }), this.latestOfferId > s) {
                    this.log.warn("latestOfferId mismatch", Object.assign(Object.assign({}, this.logContext), {
                        latestOfferId: this.latestOfferId,
                        offerId: s
                    }));
                    return
                }
                yield this.setMungedSDP(r, ft.write(a)), this.onOffer(r, this.latestOfferId)
            } finally {
                n()
            }
        })
    }
    createAndSetAnswer() {
        return b(this, void 0, void 0, function*() {
            var e;
            const t = yield this.pc.createAnswer(), n = ft.parse((e = t.sdp) !== null && e !== void 0 ? e : "");
            return n.media.forEach(s => {
                po(s), s.type === "audio" && fo(s, this.remoteStereoMids, this.remoteNackMids)
            }), yield this.setMungedSDP(t, ft.write(n)), t
        })
    }
    createDataChannel(e, t) {
        return this.pc.createDataChannel(e, t)
    }
    addTransceiver(e, t) {
        return this.pc.addTransceiver(e, t)
    }
    addTransceiverOfKind(e, t) {
        return this.pc.addTransceiver(e, t)
    }
    addTrack(e) {
        if (!this._pc) throw new fe("PC closed, cannot add track");
        return this._pc.addTrack(e)
    }
    setTrackCodecBitrate(e) {
        this.trackBitrates.push(e)
    }
    setConfiguration(e) {
        var t;
        if (!this._pc) throw new fe("PC closed, cannot configure");
        return (t = this._pc) === null || t === void 0 ? void 0 : t.setConfiguration(e)
    }
    canRemoveTrack() {
        var e;
        return !!(!((e = this._pc) === null || e === void 0) && e.removeTrack)
    }
    removeTrack(e) {
        var t;
        return (t = this._pc) === null || t === void 0 ? void 0 : t.removeTrack(e)
    }
    getConnectionState() {
        var e, t;
        return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.connectionState) !== null && t !== void 0 ? t : "closed"
    }
    getICEConnectionState() {
        var e, t;
        return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.iceConnectionState) !== null && t !== void 0 ? t : "closed"
    }
    getSignallingState() {
        var e, t;
        return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.signalingState) !== null && t !== void 0 ? t : "closed"
    }
    getTransceivers() {
        var e, t;
        return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.getTransceivers()) !== null && t !== void 0 ? t : []
    }
    getSenders() {
        var e, t;
        return (t = (e = this._pc) === null || e === void 0 ? void 0 : e.getSenders()) !== null && t !== void 0 ? t : []
    }
    getLocalDescription() {
        var e;
        return (e = this._pc) === null || e === void 0 ? void 0 : e.localDescription
    }
    getRemoteDescription() {
        var e;
        return (e = this.pc) === null || e === void 0 ? void 0 : e.remoteDescription
    }
    getStats() {
        return this.pc.getStats()
    }
    getConnectedAddress() {
        return b(this, void 0, void 0, function*() {
            var e;
            if (!this._pc) return;
            let t = "";
            const n = new Map,
                s = new Map;
            if ((yield this._pc.getStats()).forEach(o => {
                    switch (o.type) {
                        case "transport":
                            t = o.selectedCandidatePairId;
                            break;
                        case "candidate-pair":
                            t === "" && o.selected && (t = o.id), n.set(o.id, o);
                            break;
                        case "remote-candidate":
                            s.set(o.id, "".concat(o.address, ":").concat(o.port));
                            break
                    }
                }), t === "") return;
            const a = (e = n.get(t)) === null || e === void 0 ? void 0 : e.remoteCandidateId;
            if (a !== void 0) return s.get(a)
        })
    }
    setMungedSDP(e, t, n) {
        return b(this, void 0, void 0, function*() {
            if (t) {
                const s = e.sdp;
                e.sdp = t;
                try {
                    this.log.debug("setting munged ".concat(n ? "remote" : "local", " description"), this.logContext), n ? yield this.pc.setRemoteDescription(e): yield this.pc.setLocalDescription(e);
                    return
                } catch (r) {
                    this.log.warn("not able to set ".concat(e.type, ", falling back to unmodified sdp"), Object.assign(Object.assign({}, this.logContext), {
                        error: r,
                        sdp: t
                    })), e.sdp = s
                }
            }
            try {
                n ? yield this.pc.setRemoteDescription(e): yield this.pc.setLocalDescription(e)
            } catch (s) {
                let r = "unknown error";
                s instanceof Error ? r = s.message : typeof s == "string" && (r = s);
                const a = {
                    error: r,
                    sdp: e.sdp
                };
                throw !n && this.pc.remoteDescription && (a.remoteSdp = this.pc.remoteDescription), this.log.error("unable to set ".concat(e.type), Object.assign(Object.assign({}, this.logContext), {
                    fields: a
                })), new _t(r)
            }
        })
    }
    ensureVideoDDExtensionForSVC(e, t) {
        var n, s;
        if (!((n = e.ext) === null || n === void 0 ? void 0 : n.some(a => a.uri === $r))) {
            if (this.ddExtID === 0) {
                let a = 0;
                t.media.forEach(o => {
                    var c;
                    o.type === "video" && ((c = o.ext) === null || c === void 0 || c.forEach(d => {
                        d.value > a && (a = d.value)
                    }))
                }), this.ddExtID = a + 1
            }(s = e.ext) === null || s === void 0 || s.push({
                value: this.ddExtID,
                uri: $r
            })
        }
    }
}

