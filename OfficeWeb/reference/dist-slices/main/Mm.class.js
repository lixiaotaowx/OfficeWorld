class Mm extends et.EventEmitter {
    constructor(e, t) {
        super(), this.decryptDataRequests = new Map, this.encryptDataRequests = new Map, this.onWorkerMessage = n => {
            var s, r;
            const {
                kind: a,
                data: o
            } = n.data;
            switch (a) {
                case "error":
                    if (X.error(o.error.message), o.uuid) {
                        const l = this.decryptDataRequests.get(o.uuid);
                        if (l != null && l.reject) {
                            l.reject(o.error);
                            break
                        }
                        const u = this.encryptDataRequests.get(o.uuid);
                        if (u != null && u.reject) {
                            u.reject(o.error);
                            break
                        }
                    }
                    this.emit(vt.EncryptionError, o.error, o.participantIdentity);
                    break;
                case "initAck":
                    o.enabled && this.keyProvider.getKeys().forEach(l => {
                        this.postKey(l)
                    });
                    break;
                case "enable":
                    if (o.enabled && this.keyProvider.getKeys().forEach(l => {
                            this.postKey(l)
                        }), this.encryptionEnabled !== o.enabled && o.participantIdentity === ((s = this.room) === null || s === void 0 ? void 0 : s.localParticipant.identity)) this.emit(vt.ParticipantEncryptionStatusChanged, o.enabled, this.room.localParticipant), this.encryptionEnabled = o.enabled;
                    else if (o.participantIdentity) {
                        const l = (r = this.room) === null || r === void 0 ? void 0 : r.getParticipantByIdentity(o.participantIdentity);
                        if (!l) throw TypeError("couldn't set encryption status, participant not found".concat(o.participantIdentity));
                        this.emit(vt.ParticipantEncryptionStatusChanged, o.enabled, l)
                    }
                    break;
                case "ratchetKey":
                    this.keyProvider.emit(yt.KeyRatcheted, o.ratchetResult, o.participantIdentity, o.keyIndex);
                    break;
                case "decryptDataResponse":
                    const c = this.decryptDataRequests.get(o.uuid);
                    c != null && c.resolve && c.resolve(o);
                    break;
                case "encryptDataResponse":
                    const d = this.encryptDataRequests.get(o.uuid);
                    d != null && d.resolve && d.resolve(o);
                    break
            }
        }, this.onWorkerError = n => {
            X.error("e2ee worker encountered an error:", {
                error: n.error
            }), this.emit(vt.EncryptionError, n.error, void 0)
        }, this.keyProvider = e.keyProvider, this.worker = e.worker, this.encryptionEnabled = !1, this.dataChannelEncryptionEnabled = t
    }
    get isEnabled() {
        return this.encryptionEnabled
    }
    get isDataChannelEncryptionEnabled() {
        return this.isEnabled && this.dataChannelEncryptionEnabled
    }
    setup(e) {
        if (!_m()) throw new Vs("tried to setup end-to-end encryption on an unsupported browser");
        if (X.info("setting up e2ee"), e !== this.room) {
            this.room = e, this.setupEventListeners(e, this.keyProvider);
            const t = {
                kind: "init",
                data: {
                    keyProviderOptions: this.keyProvider.getOptions(),
                    loglevel: wh.getLevel()
                }
            };
            this.worker && (X.info("initializing worker", {
                worker: this.worker
            }), this.worker.onmessage = this.onWorkerMessage, this.worker.onerror = this.onWorkerError, this.worker.postMessage(t))
        }
    }
    setParticipantCryptorEnabled(e, t) {
        X.debug("set e2ee to ".concat(e, " for participant ").concat(t)), this.postEnable(e, t)
    }
    setSifTrailer(e) {
        !e || e.length === 0 ? X.warn("ignoring server sent trailer as it's empty") : this.postSifTrailer(e)
    }
    setupEngine(e) {
        e.on(V.RTPVideoMapUpdate, t => {
            this.postRTPMap(t)
        })
    }
    setupEventListeners(e, t) {
        e.on(U.TrackPublished, (n, s) => this.setParticipantCryptorEnabled(n.trackInfo.encryption !== ge.NONE, s.identity)), e.on(U.ConnectionStateChanged, n => {
            n === re.Connected && e.remoteParticipants.forEach(s => {
                s.trackPublications.forEach(r => {
                    this.setParticipantCryptorEnabled(r.trackInfo.encryption !== ge.NONE, s.identity)
                })
            })
        }).on(U.TrackUnsubscribed, (n, s, r) => {
            var a;
            const o = {
                kind: "removeTransform",
                data: {
                    participantIdentity: r.identity,
                    trackId: n.mediaStreamID
                }
            };
            (a = this.worker) === null || a === void 0 || a.postMessage(o)
        }).on(U.TrackSubscribed, (n, s, r) => {
            this.setupE2EEReceiver(n, r.identity, s.trackInfo)
        }).on(U.SignalConnected, () => {
            if (!this.room) throw new TypeError("expected room to be present on signal connect");
            t.getKeys().forEach(n => {
                this.postKey(n)
            }), this.setParticipantCryptorEnabled(this.room.localParticipant.isE2EEEnabled, this.room.localParticipant.identity)
        }), e.localParticipant.on(W.LocalSenderCreated, (n, s) => b(this, void 0, void 0, function*() {
            this.setupE2EESender(s, n)
        })), e.localParticipant.on(W.LocalTrackPublished, n => {
            if (!Ct(n.track) || !vi()) return;
            const s = {
                kind: "updateCodec",
                data: {
                    trackId: n.track.mediaStreamID,
                    codec: li(n.trackInfo.codecs[0].mimeType),
                    participantIdentity: this.room.localParticipant.identity
                }
            };
            this.worker.postMessage(s)
        }), t.on(yt.SetKey, n => this.postKey(n)).on(yt.RatchetRequest, (n, s) => this.postRatchetRequest(n, s))
    }
    encryptData(e) {
        return b(this, void 0, void 0, function*() {
            if (!this.worker) throw Error("could not encrypt data, worker is missing");
            const t = crypto.randomUUID(),
                n = {
                    kind: "encryptDataRequest",
                    data: {
                        uuid: t,
                        payload: e,
                        participantIdentity: this.room.localParticipant.identity
                    }
                },
                s = new Le;
            return s.onFinally = () => {
                this.encryptDataRequests.delete(t)
            }, this.encryptDataRequests.set(t, s), this.worker.postMessage(n), s.promise
        })
    }
    handleEncryptedData(e, t, n, s) {
        if (!this.worker) throw Error("could not handle encrypted data, worker is missing");
        const r = crypto.randomUUID(),
            a = {
                kind: "decryptDataRequest",
                data: {
                    uuid: r,
                    payload: e,
                    iv: t,
                    participantIdentity: n,
                    keyIndex: s
                }
            },
            o = new Le;
        return o.onFinally = () => {
            this.decryptDataRequests.delete(r)
        }, this.decryptDataRequests.set(r, o), this.worker.postMessage(a), o.promise
    }
    postRatchetRequest(e, t) {
        if (!this.worker) throw Error("could not ratchet key, worker is missing");
        const n = {
            kind: "ratchetRequest",
            data: {
                participantIdentity: e,
                keyIndex: t
            }
        };
        this.worker.postMessage(n)
    }
    postKey(e) {
        let {
            key: t,
            participantIdentity: n,
            keyIndex: s
        } = e;
        var r;
        if (!this.worker) throw Error("could not set key, worker is missing");
        const a = {
            kind: "setKey",
            data: {
                participantIdentity: n,
                isPublisher: n === ((r = this.room) === null || r === void 0 ? void 0 : r.localParticipant.identity),
                key: t,
                keyIndex: s
            }
        };
        this.worker.postMessage(a)
    }
    postEnable(e, t) {
        if (this.worker) {
            const n = {
                kind: "enable",
                data: {
                    enabled: e,
                    participantIdentity: t
                }
            };
            this.worker.postMessage(n)
        } else throw new ReferenceError("failed to enable e2ee, worker is not ready")
    }
    postRTPMap(e) {
        var t;
        if (!this.worker) throw TypeError("could not post rtp map, worker is missing");
        if (!(!((t = this.room) === null || t === void 0) && t.localParticipant.identity)) throw TypeError("could not post rtp map, local participant identity is missing");
        const n = {
            kind: "setRTPMap",
            data: {
                map: e,
                participantIdentity: this.room.localParticipant.identity
            }
        };
        this.worker.postMessage(n)
    }
    postSifTrailer(e) {
        if (!this.worker) throw Error("could not post SIF trailer, worker is missing");
        const t = {
            kind: "setSifTrailer",
            data: {
                trailer: e
            }
        };
        this.worker.postMessage(t)
    }
    setupE2EEReceiver(e, t, n) {
        if (e.receiver) {
            if (!(n != null && n.mimeType) || n.mimeType === "") throw new TypeError("MimeType missing from trackInfo, cannot set up E2EE cryptor");
            this.handleReceiver(e.receiver, e.mediaStreamID, t, e.kind === "video" ? li(n.mimeType) : void 0)
        }
    }
    setupE2EESender(e, t) {
        if (!Kt(e) || !t) {
            t || X.warn("early return because sender is not ready");
            return
        }
        this.handleSender(t, e.mediaStreamID, void 0)
    }
    handleReceiver(e, t, n, s) {
        return b(this, void 0, void 0, function*() {
            if (this.worker) {
                if (ls() && !Qr()) {
                    const r = {
                        kind: "decode",
                        participantIdentity: n,
                        trackId: t,
                        codec: s
                    };
                    e.transform = new RTCRtpScriptTransform(this.worker, r)
                } else {
                    if (ii in e && s) {
                        const c = {
                            kind: "updateCodec",
                            data: {
                                trackId: t,
                                codec: s,
                                participantIdentity: n
                            }
                        };
                        this.worker.postMessage(c);
                        return
                    }
                    let r = e.writableStream,
                        a = e.readableStream;
                    if (!r || !a) {
                        const c = e.createEncodedStreams();
                        e.writableStream = c.writable, r = c.writable, e.readableStream = c.readable, a = c.readable
                    }
                    const o = {
                        kind: "decode",
                        data: {
                            readableStream: a,
                            writableStream: r,
                            trackId: t,
                            codec: s,
                            participantIdentity: n,
                            isReuse: ii in e
                        }
                    };
                    this.worker.postMessage(o, [a, r])
                }
                e[ii] = !0
            }
        })
    }
    handleSender(e, t, n) {
        var s;
        if (!(ii in e || !this.worker)) {
            if (!(!((s = this.room) === null || s === void 0) && s.localParticipant.identity) || this.room.localParticipant.identity === "") throw TypeError("local identity needs to be known in order to set up encrypted sender");
            if (ls() && !Qr()) {
                X.info("initialize script transform");
                const r = {
                    kind: "encode",
                    participantIdentity: this.room.localParticipant.identity,
                    trackId: t,
                    codec: n
                };
                e.transform = new RTCRtpScriptTransform(this.worker, r)
            } else {
                X.info("initialize encoded streams");
                const r = e.createEncodedStreams(),
                    a = {
                        kind: "encode",
                        data: {
                            readableStream: r.readable,
                            writableStream: r.writable,
                            codec: n,
                            trackId: t,
                            participantIdentity: this.room.localParticipant.identity,
                            isReuse: !1
                        }
                    };
                this.worker.postMessage(a, [r.readable, r.writable])
            }
            e[ii] = !0
        }
    }
}
