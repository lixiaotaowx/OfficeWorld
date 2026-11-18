class Qm {
    get needsPublisher() {
        return this.isPublisherConnectionRequired
    }
    get needsSubscriber() {
        return this.isSubscriberConnectionRequired
    }
    get currentState() {
        return this.state
    }
    get mode() {
        return this._mode
    }
    constructor(e, t, n) {
        var s;
        this.peerConnectionTimeout = zs.peerConnectionTimeout, this.log = X, this.updateState = () => {
            var r, a;
            const o = this.state,
                c = this.requiredTransports.map(d => d.getConnectionState());
            c.every(d => d === "connected") ? this.state = le.CONNECTED : c.some(d => d === "failed") ? this.state = le.FAILED : c.some(d => d === "connecting") ? this.state = le.CONNECTING : c.every(d => d === "closed") ? this.state = le.CLOSED : c.some(d => d === "closed") ? this.state = le.CLOSING : c.every(d => d === "new") && (this.state = le.NEW), o !== this.state && (this.log.debug("pc state change: from ".concat(le[o], " to ").concat(le[this.state]), this.logContext), (r = this.onStateChange) === null || r === void 0 || r.call(this, this.state, this.publisher.getConnectionState(), (a = this.subscriber) === null || a === void 0 ? void 0 : a.getConnectionState()))
        }, this.log = Ye((s = n.loggerName) !== null && s !== void 0 ? s : Ue.PCManager), this.loggerOptions = n, this.isPublisherConnectionRequired = t !== "subscriber-primary", this.isSubscriberConnectionRequired = t === "subscriber-primary", this.publisher = new mo(e, n), this._mode = t, t !== "publisher-only" && (this.subscriber = new mo(e, n), this.subscriber.onConnectionStateChange = this.updateState, this.subscriber.onIceConnectionStateChange = this.updateState, this.subscriber.onSignalingStatechange = this.updateState, this.subscriber.onIceCandidate = r => {
            var a;
            (a = this.onIceCandidate) === null || a === void 0 || a.call(this, r, qe.SUBSCRIBER)
        }, this.subscriber.onDataChannel = r => {
            var a;
            (a = this.onDataChannel) === null || a === void 0 || a.call(this, r)
        }, this.subscriber.onTrack = r => {
            var a;
            (a = this.onTrack) === null || a === void 0 || a.call(this, r)
        }), this.publisher.onConnectionStateChange = this.updateState, this.publisher.onIceConnectionStateChange = this.updateState, this.publisher.onSignalingStatechange = this.updateState, this.publisher.onIceCandidate = r => {
            var a;
            (a = this.onIceCandidate) === null || a === void 0 || a.call(this, r, qe.PUBLISHER)
        }, this.publisher.onTrack = r => {
            var a;
            (a = this.onTrack) === null || a === void 0 || a.call(this, r)
        }, this.publisher.onOffer = (r, a) => {
            var o;
            (o = this.onPublisherOffer) === null || o === void 0 || o.call(this, r, a)
        }, this.state = le.NEW, this.connectionLock = new _e, this.remoteOfferLock = new _e
    }
    get logContext() {
        var e, t;
        return Object.assign({}, (t = (e = this.loggerOptions).loggerContextCb) === null || t === void 0 ? void 0 : t.call(e))
    }
    requirePublisher() {
        let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
        this.isPublisherConnectionRequired = e, this.updateState()
    }
    createAndSendPublisherOffer(e) {
        return this.publisher.createAndSendOffer(e)
    }
    setPublisherAnswer(e, t) {
        return this.publisher.setRemoteDescription(e, t)
    }
    removeTrack(e) {
        return this.publisher.removeTrack(e)
    }
    close() {
        return b(this, void 0, void 0, function*() {
            var e;
            if (this.publisher && this.publisher.getSignallingState() !== "closed") {
                const t = this.publisher;
                for (const n of t.getSenders()) try {
                    t.canRemoveTrack() && t.removeTrack(n)
                } catch (s) {
                    this.log.warn("could not removeTrack", Object.assign(Object.assign({}, this.logContext), {
                        error: s
                    }))
                }
            }
            yield Promise.all([this.publisher.close(), (e = this.subscriber) === null || e === void 0 ? void 0 : e.close()]), this.updateState()
        })
    }
    triggerIceRestart() {
        return b(this, void 0, void 0, function*() {
            this.subscriber && (this.subscriber.restartingIce = !0), this.needsPublisher && (yield this.createAndSendPublisherOffer({
                iceRestart: !0
            }))
        })
    }
    addIceCandidate(e, t) {
        return b(this, void 0, void 0, function*() {
            var n;
            t === qe.PUBLISHER ? yield this.publisher.addIceCandidate(e): yield(n = this.subscriber) === null || n === void 0 ? void 0 : n.addIceCandidate(e)
        })
    }
    createSubscriberAnswerFromOffer(e, t) {
        return b(this, void 0, void 0, function*() {
            var n, s, r;
            this.log.debug("received server offer", Object.assign(Object.assign({}, this.logContext), {
                RTCSdpType: e.type,
                sdp: e.sdp,
                signalingState: (n = this.subscriber) === null || n === void 0 ? void 0 : n.getSignallingState().toString()
            }));
            const a = yield this.remoteOfferLock.lock();
            try {
                return (yield(s = this.subscriber) === null || s === void 0 ? void 0 : s.setRemoteDescription(e, t)) ? yield(r = this.subscriber) === null || r === void 0 ? void 0 : r.createAndSetAnswer(): void 0
            } finally {
                a()
            }
        })
    }
    updateConfiguration(e, t) {
        var n;
        this.publisher.setConfiguration(e), (n = this.subscriber) === null || n === void 0 || n.setConfiguration(e), t && this.triggerIceRestart()
    }
    ensurePCTransportConnection(e, t) {
        return b(this, void 0, void 0, function*() {
            var n;
            const s = yield this.connectionLock.lock();
            try {
                this.isPublisherConnectionRequired && this.publisher.getConnectionState() !== "connected" && this.publisher.getConnectionState() !== "connecting" && (this.log.debug("negotiation required, start negotiating", this.logContext), this.publisher.negotiate()), yield Promise.all((n = this.requiredTransports) === null || n === void 0 ? void 0 : n.map(r => this.ensureTransportConnected(r, e, t)))
            } finally {
                s()
            }
        })
    }
    negotiate(e) {
        return b(this, void 0, void 0, function*() {
            return new Ee((t, n) => b(this, void 0, void 0, function*() {
                let s = setTimeout(() => {
                    n(new _t("negotiation timed out"))
                }, this.peerConnectionTimeout);
                const r = () => {
                        clearTimeout(s), this.publisher.off(xt.NegotiationStarted, o), e.signal.removeEventListener("abort", a)
                    },
                    a = () => {
                        r(), n(new _t("negotiation aborted"))
                    },
                    o = () => {
                        e.signal.aborted || (clearTimeout(s), s = setTimeout(() => {
                            r(), n(new _t("negotiation timed out"))
                        }, this.peerConnectionTimeout))
                    };
                e.signal.addEventListener("abort", a), this.publisher.on(xt.NegotiationStarted, o), this.publisher.once(xt.NegotiationComplete, () => {
                    r(), t()
                }), yield this.publisher.negotiate(c => {
                    r(), c instanceof Error ? n(c) : n(new Error(String(c)))
                })
            }))
        })
    }
    addPublisherTransceiver(e, t) {
        return this.publisher.addTransceiver(e, t)
    }
    addPublisherTransceiverOfKind(e, t) {
        return this.publisher.addTransceiverOfKind(e, t)
    }
    getMidForReceiver(e) {
        const n = (this.subscriber ? this.subscriber.getTransceivers() : this.publisher.getTransceivers()).find(s => s.receiver === e);
        return n == null ? void 0 : n.mid
    }
    addPublisherTrack(e) {
        return this.publisher.addTrack(e)
    }
    createPublisherDataChannel(e, t) {
        return this.publisher.createDataChannel(e, t)
    }
    getConnectedAddress(e) {
        return e === qe.PUBLISHER ? this.publisher.getConnectedAddress() : e === qe.SUBSCRIBER ? this.publisher.getConnectedAddress() : this.requiredTransports[0].getConnectedAddress()
    }
    get requiredTransports() {
        const e = [];
        return this.isPublisherConnectionRequired && e.push(this.publisher), this.isSubscriberConnectionRequired && this.subscriber && e.push(this.subscriber), e
    }
    ensureTransportConnected(e, t) {
        return b(this, arguments, void 0, function(n, s) {
            var r = this;
            let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : this.peerConnectionTimeout;
            return function*() {
                if (n.getConnectionState() !== "connected") return new Promise((c, d) => b(r, void 0, void 0, function*() {
                    const l = () => {
                        this.log.warn("abort transport connection", this.logContext), Te.clearTimeout(u), d($.cancelled("room connection has been cancelled"))
                    };
                    s != null && s.signal.aborted && l(), s == null || s.signal.addEventListener("abort", l);
                    const u = Te.setTimeout(() => {
                        s == null || s.signal.removeEventListener("abort", l), d($.internal("could not establish pc connection"))
                    }, a);
                    for (; this.state !== le.CONNECTED;)
                        if (yield Ce(50), s != null && s.signal.aborted) {
                            d($.cancelled("room connection has been cancelled"));
                            return
                        } Te.clearTimeout(u), s == null || s.signal.removeEventListener("abort", l), c()
                }))
            }()
        })
    }
}
