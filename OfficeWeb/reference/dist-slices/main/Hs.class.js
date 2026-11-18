class Hs {
    get currentState() {
        return this.state
    }
    get isDisconnected() {
        return this.state === ae.DISCONNECTING || this.state === ae.DISCONNECTED
    }
    get isEstablishingConnection() {
        return this.state === ae.CONNECTING || this.state === ae.RECONNECTING
    }
    getNextRequestId() {
        return this._requestId += 1, this._requestId
    }
    constructor() {
        let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !1,
            t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var n;
        this.rtt = 0, this.state = ae.DISCONNECTED, this.log = X, this._requestId = 0, this.useV0SignalPath = !1, this.resetCallbacks = () => {
            this.onAnswer = void 0, this.onLeave = void 0, this.onLocalTrackPublished = void 0, this.onLocalTrackUnpublished = void 0, this.onNegotiateRequested = void 0, this.onOffer = void 0, this.onRemoteMuteChanged = void 0, this.onSubscribedQualityUpdate = void 0, this.onTokenRefresh = void 0, this.onTrickle = void 0, this.onClose = void 0, this.onMediaSectionsRequirement = void 0
        }, this.log = Ye((n = t.loggerName) !== null && n !== void 0 ? n : Ue.Signal), this.loggerContextCb = t.loggerContextCb, this.useJSON = e, this.requestQueue = new Am, this.queuedRequests = [], this.closingLock = new _e, this.connectionLock = new _e, this.state = ae.DISCONNECTED
    }
    get logContext() {
        var e, t;
        return (t = (e = this.loggerContextCb) === null || e === void 0 ? void 0 : e.call(this)) !== null && t !== void 0 ? t : {}
    }
    join(e, t, n, s) {
        return b(this, arguments, void 0, function(r, a, o, c) {
            var d = this;
            let l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1;
            return function*() {
                return d.state = ae.CONNECTING, d.options = o, yield d.connect(r, a, o, c, l)
            }()
        })
    }
    reconnect(e, t, n, s) {
        return b(this, void 0, void 0, function*() {
            if (!this.options) {
                this.log.warn("attempted to reconnect without signal options being set, ignoring", this.logContext);
                return
            }
            return this.state = ae.RECONNECTING, this.clearPingInterval(), yield this.connect(e, t, Object.assign(Object.assign({}, this.options), {
                reconnect: !0,
                sid: n,
                reconnectReason: s
            }), void 0, this.useV0SignalPath)
        })
    }
    connect(e, t, n, s) {
        return b(this, arguments, void 0, function(r, a, o, c) {
            var d = this;
            let l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1;
            return function*() {
                const u = yield d.connectionLock.lock();
                d.connectOptions = o, d.useV0SignalPath = l;
                const h = hm(),
                    m = l ? Fm(a, h, o) : Bm(a, h, o),
                    f = Sm(r, m, l).toString(),
                    p = Cm(f).toString();
                return new Promise((_, w) => b(d, void 0, void 0, function*() {
                    var k, P;
                    try {
                        let y = !1;
                        const S = M => b(this, void 0, void 0, function*() {
                            if (y) return;
                            y = !0;
                            const g = M instanceof Event ? M.currentTarget : M,
                                T = wm(g, "Abort handler called");
                            this.streamWriter && !this.isDisconnected ? this.sendLeave().then(() => this.close(T)).catch(A => {
                                this.log.error(A), this.close()
                            }) : this.close(), E(), w($.cancelled(T))
                        });
                        c == null || c.addEventListener("abort", S);
                        const E = () => {
                                clearTimeout(x), c == null || c.removeEventListener("abort", S)
                            },
                            x = setTimeout(() => {
                                S($.timeout("room connection has timed out (signal)"))
                            }, o.websocketTimeout),
                            D = (M, g) => {
                                this.handleSignalConnected(M, x, g)
                            },
                            C = new URL(f);
                        C.searchParams.has("access_token") && C.searchParams.set("access_token", "<redacted>"), this.log.debug("connecting to ".concat(C), Object.assign({
                            reconnect: o.reconnect,
                            reconnectReason: o.reconnectReason
                        }, this.logContext)), this.ws && (yield this.close(!1)), this.ws = new Nm(f);
                        try {
                            this.ws.closed.then(N => {
                                var Q;
                                this.isEstablishingConnection && w($.internal("Websocket got closed during a (re)connection attempt: ".concat(N.reason))), N.closeCode !== 1e3 && (this.log.warn("websocket closed", Object.assign(Object.assign({}, this.logContext), {
                                    reason: N.reason,
                                    code: N.closeCode,
                                    wasClean: N.closeCode === 1e3,
                                    state: this.state
                                })), this.state === ae.CONNECTED && this.handleOnClose((Q = N.reason) !== null && Q !== void 0 ? Q : "Unexpected WS error"))
                            }).catch(N => {
                                this.isEstablishingConnection && w($.internal("Websocket error during a (re)connection attempt: ".concat(N)))
                            });
                            const M = yield this.ws.opened.catch(N => b(this, void 0, void 0, function*() {
                                if (this.state !== ae.CONNECTED) {
                                    this.state = ae.DISCONNECTED, clearTimeout(x);
                                    const Q = yield this.handleConnectionError(N, p);
                                    w(Q);
                                    return
                                }
                                this.handleWSError(N), w(N)
                            }));
                            if (clearTimeout(x), !M) return;
                            const g = M.readable.getReader();
                            this.streamWriter = M.writable.getWriter();
                            const T = yield g.read();
                            if (g.releaseLock(), !T.value) throw $.internal("no message received as first message");
                            const A = io(T.value),
                                F = this.validateFirstMessage(A, (k = o.reconnect) !== null && k !== void 0 ? k : !1);
                            if (!F.isValid) {
                                w(F.error);
                                return
                            }((P = A.message) === null || P === void 0 ? void 0 : P.case) === "join" && (this.pingTimeoutDuration = A.message.value.pingTimeout, this.pingIntervalDuration = A.message.value.pingInterval, this.pingTimeoutDuration && this.pingTimeoutDuration > 0 && this.log.debug("ping config", Object.assign(Object.assign({}, this.logContext), {
                                timeout: this.pingTimeoutDuration,
                                interval: this.pingIntervalDuration
                            })));
                            const H = F.shouldProcessFirstMessage ? A : void 0;
                            D(M, H), _(F.response)
                        } catch (M) {
                            w(M)
                        } finally {
                            E()
                        }
                    } finally {
                        u()
                    }
                }))
            }()
        })
    }
    startReadingLoop(e, t) {
        return b(this, void 0, void 0, function*() {
            for (t && this.handleSignalResponse(t);;) {
                this.signalLatency && (yield Ce(this.signalLatency));
                const {
                    done: n,
                    value: s
                } = yield e.read();
                if (n) break;
                const r = io(s);
                this.handleSignalResponse(r)
            }
        })
    }
    close() {
        return b(this, arguments, void 0, function() {
            var e = this;
            let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0,
                n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "Close method called on signal client";
            return function*() {
                if ([ae.DISCONNECTING || ae.DISCONNECTED].includes(e.state)) {
                    e.log.debug("ignoring signal close as it's already in disconnecting state");
                    return
                }
                const s = yield e.closingLock.lock();
                try {
                    if (e.clearPingInterval(), t && (e.state = ae.DISCONNECTING), e.ws) {
                        e.ws.close({
                            closeCode: 1e3,
                            reason: n
                        });
                        const r = e.ws.closed;
                        e.ws = void 0, e.streamWriter = void 0, yield Promise.race([r, Ce(jm)])
                    }
                } catch (r) {
                    e.log.debug("websocket error while closing", Object.assign(Object.assign({}, e.logContext), {
                        error: r
                    }))
                } finally {
                    t && (e.state = ae.DISCONNECTED), s()
                }
            }()
        })
    }
    sendOffer(e, t) {
        this.log.debug("sending offer", Object.assign(Object.assign({}, this.logContext), {
            offerSdp: e.sdp
        })), this.sendRequest({
            case: "offer",
            value: Bt(e, t)
        })
    }
    sendAnswer(e, t) {
        return this.log.debug("sending answer", Object.assign(Object.assign({}, this.logContext), {
            answerSdp: e.sdp
        })), this.sendRequest({
            case: "answer",
            value: Bt(e, t)
        })
    }
    sendIceCandidate(e, t) {
        return this.log.debug("sending ice candidate", Object.assign(Object.assign({}, this.logContext), {
            candidate: e
        })), this.sendRequest({
            case: "trickle",
            value: new rn({
                candidateInit: JSON.stringify(e),
                target: t
            })
        })
    }
    sendMuteTrack(e, t) {
        return this.sendRequest({
            case: "mute",
            value: new on({
                sid: e,
                muted: t
            })
        })
    }
    sendAddTrack(e) {
        return this.sendRequest({
            case: "addTrack",
            value: e
        })
    }
    sendUpdateLocalMetadata(e, t) {
        return b(this, arguments, void 0, function(n, s) {
            var r = this;
            let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
            return function*() {
                const o = r.getNextRequestId();
                return yield r.sendRequest({
                    case: "updateMetadata",
                    value: new Ns({
                        requestId: o,
                        metadata: n,
                        name: s,
                        attributes: a
                    })
                }), o
            }()
        })
    }
    sendUpdateTrackSettings(e) {
        this.sendRequest({
            case: "trackSetting",
            value: e
        })
    }
    sendUpdateSubscription(e) {
        return this.sendRequest({
            case: "subscription",
            value: e
        })
    }
    sendSyncState(e) {
        return this.sendRequest({
            case: "syncState",
            value: e
        })
    }
    sendUpdateVideoLayers(e, t) {
        return this.sendRequest({
            case: "updateLayers",
            value: new Aa({
                trackSid: e,
                layers: t
            })
        })
    }
    sendUpdateSubscriptionPermissions(e, t) {
        return this.sendRequest({
            case: "subscriptionPermission",
            value: new Ua({
                allParticipants: e,
                trackPermissions: t
            })
        })
    }
    sendSimulateScenario(e) {
        return this.sendRequest({
            case: "simulate",
            value: e
        })
    }
    sendPing() {
        return Promise.all([this.sendRequest({
            case: "ping",
            value: de.parse(Date.now())
        }), this.sendRequest({
            case: "pingReq",
            value: new Ba({
                timestamp: de.parse(Date.now()),
                rtt: de.parse(this.rtt)
            })
        })])
    }
    sendUpdateLocalAudioTrack(e, t) {
        return this.sendRequest({
            case: "updateAudioTrack",
            value: new As({
                trackSid: e,
                features: t
            })
        })
    }
    sendLeave() {
        return this.sendRequest({
            case: "leave",
            value: new cn({
                reason: He.CLIENT_INITIATED,
                action: qt.DISCONNECT
            })
        })
    }
    sendRequest(e) {
        return b(this, arguments, void 0, function(t) {
            var n = this;
            let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !1;
            return function*() {
                if (!s && !Um(t) && n.state === ae.RECONNECTING) {
                    n.queuedRequests.push(() => b(n, void 0, void 0, function*() {
                        yield this.sendRequest(t, !0)
                    }));
                    return
                }
                if (s || (yield n.requestQueue.flush()), n.signalLatency && (yield Ce(n.signalLatency)), n.isDisconnected) {
                    n.log.debug("skipping signal request (type: ".concat(t.case, ") - SignalClient disconnected"));
                    return
                }
                if (!n.streamWriter) {
                    n.log.error("cannot send signal request before connected, type: ".concat(t == null ? void 0 : t.case), n.logContext);
                    return
                }
                const a = new Hu({
                    message: t
                });
                try {
                    n.useJSON ? yield n.streamWriter.write(a.toJsonString()): yield n.streamWriter.write(a.toBinary())
                } catch (o) {
                    n.log.error("error sending signal message", Object.assign(Object.assign({}, n.logContext), {
                        error: o
                    }))
                }
            }()
        })
    }
    handleSignalResponse(e) {
        var t, n;
        const s = e.message;
        if (s == null) {
            this.log.debug("received unsupported message", this.logContext);
            return
        }
        let r = !1;
        if (s.case === "answer") {
            const a = oo(s.value);
            this.onAnswer && this.onAnswer(a, s.value.id, s.value.midToTrackId)
        } else if (s.case === "offer") {
            const a = oo(s.value);
            this.onOffer && this.onOffer(a, s.value.id, s.value.midToTrackId)
        } else if (s.case === "trickle") {
            const a = JSON.parse(s.value.candidateInit);
            this.onTrickle && this.onTrickle(a, s.value.target)
        } else s.case === "update" ? this.onParticipantUpdate && this.onParticipantUpdate((t = s.value.participants) !== null && t !== void 0 ? t : []) : s.case === "trackPublished" ? this.onLocalTrackPublished && this.onLocalTrackPublished(s.value) : s.case === "speakersChanged" ? this.onSpeakersChanged && this.onSpeakersChanged((n = s.value.speakers) !== null && n !== void 0 ? n : []) : s.case === "leave" ? this.onLeave && this.onLeave(s.value) : s.case === "mute" ? this.onRemoteMuteChanged && this.onRemoteMuteChanged(s.value.sid, s.value.muted) : s.case === "roomUpdate" ? this.onRoomUpdate && s.value.room && this.onRoomUpdate(s.value.room) : s.case === "connectionQuality" ? this.onConnectionQuality && this.onConnectionQuality(s.value) : s.case === "streamStateUpdate" ? this.onStreamStateUpdate && this.onStreamStateUpdate(s.value) : s.case === "subscribedQualityUpdate" ? this.onSubscribedQualityUpdate && this.onSubscribedQualityUpdate(s.value) : s.case === "subscriptionPermissionUpdate" ? this.onSubscriptionPermissionUpdate && this.onSubscriptionPermissionUpdate(s.value) : s.case === "refreshToken" ? this.onTokenRefresh && this.onTokenRefresh(s.value) : s.case === "trackUnpublished" ? this.onLocalTrackUnpublished && this.onLocalTrackUnpublished(s.value) : s.case === "subscriptionResponse" ? this.onSubscriptionError && this.onSubscriptionError(s.value) : s.case === "pong" || (s.case === "pongResp" ? (this.rtt = Date.now() - Number.parseInt(s.value.lastPingTimestamp.toString()), this.resetPingTimeout(), r = !0) : s.case === "requestResponse" ? this.onRequestResponse && this.onRequestResponse(s.value) : s.case === "trackSubscribed" ? this.onLocalTrackSubscribed && this.onLocalTrackSubscribed(s.value.trackSid) : s.case === "roomMoved" ? (this.onTokenRefresh && this.onTokenRefresh(s.value.token), this.onRoomMoved && this.onRoomMoved(s.value)) : s.case === "mediaSectionsRequirement" ? this.onMediaSectionsRequirement && this.onMediaSectionsRequirement(s.value) : this.log.debug("unsupported message", Object.assign(Object.assign({}, this.logContext), {
            msgCase: s.case
        })));
        r || this.resetPingTimeout()
    }
    setReconnected() {
        for (; this.queuedRequests.length > 0;) {
            const e = this.queuedRequests.shift();
            e && this.requestQueue.run(e)
        }
    }
    handleOnClose(e) {
        return b(this, void 0, void 0, function*() {
            if (this.state === ae.DISCONNECTED) return;
            const t = this.onClose;
            yield this.close(void 0, e), this.log.debug("websocket connection closed: ".concat(e), Object.assign(Object.assign({}, this.logContext), {
                reason: e
            })), t && t(e)
        })
    }
    handleWSError(e) {
        this.log.error("websocket error", Object.assign(Object.assign({}, this.logContext), {
            error: e
        }))
    }
    resetPingTimeout() {
        if (this.clearPingTimeout(), !this.pingTimeoutDuration) {
            this.log.warn("ping timeout duration not set", this.logContext);
            return
        }
        this.pingTimeout = Te.setTimeout(() => {
            this.log.warn("ping timeout triggered. last pong received at: ".concat(new Date(Date.now() - this.pingTimeoutDuration * 1e3).toUTCString()), this.logContext), this.handleOnClose("ping timeout")
        }, this.pingTimeoutDuration * 1e3)
    }
    clearPingTimeout() {
        this.pingTimeout && Te.clearTimeout(this.pingTimeout)
    }
    startPingInterval() {
        if (this.clearPingInterval(), this.resetPingTimeout(), !this.pingIntervalDuration) {
            this.log.warn("ping interval duration not set", this.logContext);
            return
        }
        this.log.debug("start ping interval", this.logContext), this.pingInterval = Te.setInterval(() => {
            this.sendPing()
        }, this.pingIntervalDuration * 1e3)
    }
    clearPingInterval() {
        this.log.debug("clearing ping interval", this.logContext), this.clearPingTimeout(), this.pingInterval && Te.clearInterval(this.pingInterval)
    }
    handleSignalConnected(e, t, n) {
        this.state = ae.CONNECTED, clearTimeout(t), this.startPingInterval(), this.startReadingLoop(e.readable.getReader(), n)
    }
    validateFirstMessage(e, t) {
        var n, s, r, a, o;
        return ((n = e.message) === null || n === void 0 ? void 0 : n.case) === "join" ? {
            isValid: !0,
            response: e.message.value
        } : this.state === ae.RECONNECTING && ((s = e.message) === null || s === void 0 ? void 0 : s.case) !== "leave" ? ((r = e.message) === null || r === void 0 ? void 0 : r.case) === "reconnect" ? {
            isValid: !0,
            response: e.message.value
        } : (this.log.debug("declaring signal reconnected without reconnect response received", this.logContext), {
            isValid: !0,
            response: void 0,
            shouldProcessFirstMessage: !0
        }) : this.isEstablishingConnection && ((a = e.message) === null || a === void 0 ? void 0 : a.case) === "leave" ? {
            isValid: !1,
            error: $.leaveRequest("Received leave request while trying to (re)connect", e.message.value.reason)
        } : t ? {
            isValid: !1,
            error: $.internal("Unexpected first message")
        } : {
            isValid: !1,
            error: $.internal("did not receive join response, got ".concat((o = e.message) === null || o === void 0 ? void 0 : o.case, " instead"))
        }
    }
    handleConnectionError(e, t) {
        return b(this, void 0, void 0, function*() {
            try {
                const n = yield fetch(t);
                switch (n.status) {
                    case 404:
                        return $.serviceNotFound("v1 RTC path not found. Consider upgrading your LiveKit server version", "v0-rtc");
                    case 401:
                    case 403:
                        const s = yield n.text();
                        return $.notAllowed(s, n.status);
                    default:
                        break
                }
                return e instanceof $ ? e : $.internal("Encountered unknown websocket error during connection: ".concat(e), {
                    status: n.status,
                    statusText: n.statusText
                })
            } catch (n) {
                return n instanceof $ ? n : $.serverUnreachable(n instanceof Error ? n.message : "server was not reachable")
            }
        })
    }
}

