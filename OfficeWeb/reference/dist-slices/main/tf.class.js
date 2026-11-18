class Tf extends et.EventEmitter {
    get isClosed() {
        return this._isClosed
    }
    get pendingReconnect() {
        return !!this.reconnectTimeout
    }
    constructor(e) {
        var t;
        super(), this.options = e, this.rtcConfig = {}, this.peerConnectionTimeout = zs.peerConnectionTimeout, this.fullReconnectOnNext = !1, this.latestRemoteOfferId = 0, this.subscriberPrimary = !1, this.pcState = Ae.New, this._isClosed = !0, this.pendingTrackResolvers = {}, this.reconnectAttempts = 0, this.reconnectStart = 0, this.attemptingReconnect = !1, this.joinAttempts = 0, this.maxJoinAttempts = 1, this.shouldFailNext = !1, this.log = X, this.reliableDataSequence = 1, this.reliableMessageBuffer = new ao, this.reliableReceivedState = new Vm(yf), this.lossyDataStatCurrentBytes = 0, this.lossyDataStatByterate = 0, this.lossyDataDropCount = 0, this.midToTrackId = {}, this.isWaitingForNetworkReconnect = !1, this.handleDataChannel = n => b(this, [n], void 0, function(s) {
            var r = this;
            let {
                channel: a
            } = s;
            return function*() {
                if (a) {
                    if (a.label === To) r.reliableDCSub = a;
                    else if (a.label === So) r.lossyDCSub = a;
                    else return;
                    r.log.debug("on data channel ".concat(a.id, ", ").concat(a.label), r.logContext), a.onmessage = r.handleDataMessage
                }
            }()
        }), this.handleDataMessage = n => b(this, void 0, void 0, function*() {
            var s, r, a, o, c;
            const d = yield this.dataProcessLock.lock();
            try {
                let l;
                if (n.data instanceof ArrayBuffer) l = n.data;
                else if (n.data instanceof Blob) l = yield n.data.arrayBuffer();
                else {
                    this.log.error("unsupported data type", Object.assign(Object.assign({}, this.logContext), {
                        data: n.data
                    }));
                    return
                }
                const u = Re.fromBinary(new Uint8Array(l));
                if (u.sequence > 0 && u.participantSid !== "") {
                    const h = this.reliableReceivedState.get(u.participantSid);
                    if (h && u.sequence <= h) return;
                    this.reliableReceivedState.set(u.participantSid, u.sequence)
                }
                if (((s = u.value) === null || s === void 0 ? void 0 : s.case) === "speaker") this.emit(V.ActiveSpeakersUpdate, u.value.value.speakers);
                else if (((r = u.value) === null || r === void 0 ? void 0 : r.case) === "encryptedPacket") {
                    if (!this.e2eeManager) {
                        this.log.error("Received encrypted packet but E2EE not set up", this.logContext);
                        return
                    }
                    const h = yield(a = this.e2eeManager) === null || a === void 0 ? void 0 : a.handleEncryptedData(u.value.value.encryptedValue, u.value.value.iv, u.participantIdentity, u.value.value.keyIndex), m = ga.fromBinary(h.payload), f = new Re({
                        value: m.value,
                        participantIdentity: u.participantIdentity,
                        participantSid: u.participantSid
                    });
                    ((o = f.value) === null || o === void 0 ? void 0 : o.case) === "user" && Co(f, f.value.value), this.emit(V.DataPacketReceived, f, u.value.value.encryptionType)
                } else((c = u.value) === null || c === void 0 ? void 0 : c.case) === "user" && Co(u, u.value.value), this.emit(V.DataPacketReceived, u, ge.NONE)
            } finally {
                d()
            }
        }), this.handleDataError = n => {
            const r = n.currentTarget.maxRetransmits === 0 ? "lossy" : "reliable";
            if (n instanceof ErrorEvent && n.error) {
                const {
                    error: a
                } = n.error;
                this.log.error("DataChannel error on ".concat(r, ": ").concat(n.message), Object.assign(Object.assign({}, this.logContext), {
                    error: a
                }))
            } else this.log.error("Unknown DataChannel error on ".concat(r), Object.assign(Object.assign({}, this.logContext), {
                event: n
            }))
        }, this.handleBufferedAmountLow = n => {
            const r = n.currentTarget.maxRetransmits === 0 ? ee.LOSSY : ee.RELIABLE;
            this.updateAndEmitDCBufferStatus(r)
        }, this.handleDisconnect = (n, s) => {
            if (this._isClosed) return;
            this.log.warn("".concat(n, " disconnected"), this.logContext), this.reconnectAttempts === 0 && (this.reconnectStart = Date.now());
            const r = c => {
                    this.log.warn("could not recover connection after ".concat(this.reconnectAttempts, " attempts, ").concat(c, "ms. giving up"), this.logContext), this.emit(V.Disconnected), this.close()
                },
                a = Date.now() - this.reconnectStart;
            let o = this.getNextRetryDelay({
                elapsedMs: a,
                retryCount: this.reconnectAttempts
            });
            if (o === null) {
                r(a);
                return
            }
            n === Mn && (o = 0), this.log.debug("reconnecting in ".concat(o, "ms"), this.logContext), this.clearReconnectTimeout(), this.token && this.regionUrlProvider && this.regionUrlProvider.updateToken(this.token), this.reconnectTimeout = Te.setTimeout(() => this.attemptReconnect(s).finally(() => this.reconnectTimeout = void 0), o)
        }, this.waitForRestarted = () => new Promise((n, s) => {
            this.pcState === Ae.Connected && n();
            const r = () => {
                    this.off(V.Disconnected, a), n()
                },
                a = () => {
                    this.off(V.Restarted, r), s()
                };
            this.once(V.Restarted, r), this.once(V.Disconnected, a)
        }), this.updateAndEmitDCBufferStatus = n => {
            if (n === ee.RELIABLE) {
                const r = this.dataChannelForKind(n);
                r && this.reliableMessageBuffer.alignBufferedAmount(r.bufferedAmount)
            }
            const s = this.isBufferStatusLow(n);
            typeof s < "u" && s !== this.dcBufferStatus.get(n) && (this.dcBufferStatus.set(n, s), this.emit(V.DCBufferStatusChanged, s, n))
        }, this.isBufferStatusLow = n => {
            const s = this.dataChannelForKind(n);
            if (s) return s.bufferedAmount <= s.bufferedAmountLowThreshold
        }, this.handleBrowserOnLine = () => b(this, void 0, void 0, function*() {
            !this.url || !(yield fetch(bi(this.url), {
                method: "HEAD"
            }).then(s => s.ok).catch(() => !1)) || (this.log.info("detected network reconnected"), (this.client.currentState === ae.RECONNECTING || this.isWaitingForNetworkReconnect && this.client.currentState === ae.CONNECTED) && (this.clearReconnectTimeout(), this.attemptReconnect(Pt.RR_SIGNAL_DISCONNECTED), this.isWaitingForNetworkReconnect = !1))
        }), this.handleBrowserOffline = () => b(this, void 0, void 0, function*() {
            if (this.url) try {
                yield Promise.race([fetch(bi(this.url), {
                    method: "HEAD"
                }), Ce(4e3).then(() => Promise.reject())])
            } catch {
                window.navigator.onLine === !1 && (this.log.info("detected network interruption"), this.isWaitingForNetworkReconnect = !0)
            }
        }), this.log = Ye((t = e.loggerName) !== null && t !== void 0 ? t : Ue.Engine), this.loggerOptions = {
            loggerName: e.loggerName,
            loggerContextCb: () => this.logContext
        }, this.client = new Hs(void 0, this.loggerOptions), this.client.signalLatency = this.options.expSignalLatency, this.reconnectPolicy = this.options.reconnectPolicy, this.closingLock = new _e, this.dataProcessLock = new _e, this.dcBufferStatus = new Map([
            [ee.LOSSY, !0],
            [ee.RELIABLE, !0]
        ]), this.client.onParticipantUpdate = n => this.emit(V.ParticipantUpdate, n), this.client.onConnectionQuality = n => this.emit(V.ConnectionQualityUpdate, n), this.client.onRoomUpdate = n => this.emit(V.RoomUpdate, n), this.client.onSubscriptionError = n => this.emit(V.SubscriptionError, n), this.client.onSubscriptionPermissionUpdate = n => this.emit(V.SubscriptionPermissionUpdate, n), this.client.onSpeakersChanged = n => this.emit(V.SpeakersChanged, n), this.client.onStreamStateUpdate = n => this.emit(V.StreamStateChanged, n), this.client.onRequestResponse = n => this.emit(V.SignalRequestResponse, n)
    }
    get logContext() {
        var e, t, n, s, r, a;
        return {
            room: (t = (e = this.latestJoinResponse) === null || e === void 0 ? void 0 : e.room) === null || t === void 0 ? void 0 : t.name,
            roomID: (s = (n = this.latestJoinResponse) === null || n === void 0 ? void 0 : n.room) === null || s === void 0 ? void 0 : s.sid,
            participant: (a = (r = this.latestJoinResponse) === null || r === void 0 ? void 0 : r.participant) === null || a === void 0 ? void 0 : a.identity,
            pID: this.participantSid
        }
    }
    join(e, t, n, s) {
        return b(this, arguments, void 0, function(r, a, o, c) {
            var d = this;
            let l = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : !1;
            return function*() {
                d.url = r, d.token = a, d.signalOpts = o, d.maxJoinAttempts = o.maxRetries;
                try {
                    d.joinAttempts += 1, d.setupSignalClientCallbacks();
                    const u = yield d.client.join(r, a, o, c, l);
                    return d._isClosed = !1, d.latestJoinResponse = u, d.subscriberPrimary = u.subscriberPrimary, d.pcManager || (yield d.configure(u, !l)), (!d.subscriberPrimary || u.fastPublish) && d.negotiate().catch(h => {
                        X.error(h, d.logContext)
                    }), d.registerOnLineListener(), d.clientConfiguration = u.clientConfiguration, d.emit(V.SignalConnected, u), u
                } catch (u) {
                    if (u instanceof $) {
                        if (u.reason === ce.ServerUnreachable) {
                            if (d.log.warn("Couldn't connect to server, attempt ".concat(d.joinAttempts, " of ").concat(d.maxJoinAttempts), d.logContext), d.joinAttempts < d.maxJoinAttempts) return d.join(r, a, o, c, l)
                        } else if (u.reason === ce.ServiceNotFound) return d.log.warn("Initial connection failed: ".concat(u.message, " – Retrying")), d.join(r, a, o, c, !0)
                    }
                    throw u
                }
            }()
        })
    }
    close() {
        return b(this, void 0, void 0, function*() {
            const e = yield this.closingLock.lock();
            if (this.isClosed) {
                e();
                return
            }
            try {
                this._isClosed = !0, this.joinAttempts = 0, this.emit(V.Closing), this.removeAllListeners(), this.deregisterOnLineListener(), this.clearPendingReconnect(), this.cleanupLossyDataStats(), yield this.cleanupPeerConnections(), yield this.cleanupClient()
            } finally {
                e()
            }
        })
    }
    cleanupPeerConnections() {
        return b(this, void 0, void 0, function*() {
            var e;
            yield(e = this.pcManager) === null || e === void 0 ? void 0 : e.close(), this.pcManager = void 0;
            const t = n => {
                n && (n.close(), n.onbufferedamountlow = null, n.onclose = null, n.onclosing = null, n.onerror = null, n.onmessage = null, n.onopen = null)
            };
            t(this.lossyDC), t(this.lossyDCSub), t(this.reliableDC), t(this.reliableDCSub), this.lossyDC = void 0, this.lossyDCSub = void 0, this.reliableDC = void 0, this.reliableDCSub = void 0, this.reliableMessageBuffer = new ao, this.reliableDataSequence = 1, this.reliableReceivedState.clear()
        })
    }
    cleanupLossyDataStats() {
        this.lossyDataStatByterate = 0, this.lossyDataStatCurrentBytes = 0, this.lossyDataStatInterval && (clearInterval(this.lossyDataStatInterval), this.lossyDataStatInterval = void 0), this.lossyDataDropCount = 0
    }
    cleanupClient() {
        return b(this, void 0, void 0, function*() {
            yield this.client.close(), this.client.resetCallbacks()
        })
    }
    addTrack(e) {
        if (this.pendingTrackResolvers[e.cid]) throw new ct("a track with the same ID has already been published");
        return new Promise((t, n) => {
            const s = setTimeout(() => {
                delete this.pendingTrackResolvers[e.cid], n($.timeout("publication of local track timed out, no response from server"))
            }, 1e4);
            this.pendingTrackResolvers[e.cid] = {
                resolve: r => {
                    clearTimeout(s), t(r)
                },
                reject: () => {
                    clearTimeout(s), n(new Error("Cancelled publication by calling unpublish"))
                }
            }, this.client.sendAddTrack(e)
        })
    }
    removeTrack(e) {
        if (e.track && this.pendingTrackResolvers[e.track.id]) {
            const {
                reject: t
            } = this.pendingTrackResolvers[e.track.id];
            t && t(), delete this.pendingTrackResolvers[e.track.id]
        }
        try {
            return this.pcManager.removeTrack(e), !0
        } catch (t) {
            this.log.warn("failed to remove track", Object.assign(Object.assign({}, this.logContext), {
                error: t
            }))
        }
        return !1
    }
    updateMuteStatus(e, t) {
        this.client.sendMuteTrack(e, t)
    }
    get dataSubscriberReadyState() {
        var e;
        return (e = this.reliableDCSub) === null || e === void 0 ? void 0 : e.readyState
    }
    getConnectedServerAddress() {
        return b(this, void 0, void 0, function*() {
            var e;
            return (e = this.pcManager) === null || e === void 0 ? void 0 : e.getConnectedAddress()
        })
    }
    setRegionUrlProvider(e) {
        this.regionUrlProvider = e
    }
    configure(e, t) {
        return b(this, void 0, void 0, function*() {
            var n, s;
            if (this.pcManager && this.pcManager.currentState !== le.NEW) return;
            this.participantSid = (n = e.participant) === null || n === void 0 ? void 0 : n.sid;
            const r = this.makeRTCConfiguration(e);
            this.pcManager = new Qm(r, t ? "publisher-only" : e.subscriberPrimary ? "subscriber-primary" : "publisher-primary", this.loggerOptions), this.emit(V.TransportsCreated, this.pcManager.publisher, this.pcManager.subscriber), this.pcManager.onIceCandidate = (a, o) => {
                this.client.sendIceCandidate(a, o)
            }, this.pcManager.onPublisherOffer = (a, o) => {
                this.client.sendOffer(a, o)
            }, this.pcManager.onDataChannel = this.handleDataChannel, this.pcManager.onStateChange = (a, o, c) => b(this, void 0, void 0, function*() {
                if (this.log.debug("primary PC state changed ".concat(a), this.logContext), ["closed", "disconnected", "failed"].includes(o) && (this.publisherConnectionPromise = void 0), a === le.CONNECTED) {
                    const u = this.pcState === Ae.New;
                    this.pcState = Ae.Connected, u && this.emit(V.Connected, e)
                } else a === le.FAILED && (this.pcState === Ae.Connected || this.pcState === Ae.Reconnecting) && (this.pcState = Ae.Disconnected, this.handleDisconnect("peerconnection failed", c === "failed" ? Pt.RR_SUBSCRIBER_FAILED : Pt.RR_PUBLISHER_FAILED));
                const d = this.client.isDisconnected || this.client.currentState === ae.RECONNECTING,
                    l = [le.FAILED, le.CLOSING, le.CLOSED].includes(a);
                d && l && !this._isClosed && this.emit(V.Offline)
            }), this.pcManager.onTrack = a => {
                a.streams.length !== 0 && this.emit(V.MediaTrackAdded, a.track, a.streams[0], a.receiver)
            }, Cf((s = e.serverInfo) === null || s === void 0 ? void 0 : s.protocol) || this.createDataChannels()
        })
    }
    setupSignalClientCallbacks() {
        this.client.onAnswer = (e, t, n) => b(this, void 0, void 0, function*() {
            this.pcManager && (this.log.debug("received server answer", Object.assign(Object.assign({}, this.logContext), {
                RTCSdpType: e.type,
                sdp: e.sdp,
                midToTrackId: n
            })), this.midToTrackId = n, yield this.pcManager.setPublisherAnswer(e, t))
        }), this.client.onTrickle = (e, t) => {
            this.pcManager && (this.log.debug("got ICE candidate from peer", Object.assign(Object.assign({}, this.logContext), {
                candidate: e,
                target: t
            })), this.pcManager.addIceCandidate(e, t))
        }, this.client.onOffer = (e, t, n) => b(this, void 0, void 0, function*() {
            if (this.latestRemoteOfferId = t, !this.pcManager) return;
            this.midToTrackId = n;
            const s = yield this.pcManager.createSubscriberAnswerFromOffer(e, t);
            s && this.client.sendAnswer(s, t)
        }), this.client.onLocalTrackPublished = e => {
            var t;
            if (this.log.debug("received trackPublishedResponse", Object.assign(Object.assign({}, this.logContext), {
                    cid: e.cid,
                    track: (t = e.track) === null || t === void 0 ? void 0 : t.sid
                })), !this.pendingTrackResolvers[e.cid]) {
                this.log.error("missing track resolver for ".concat(e.cid), Object.assign(Object.assign({}, this.logContext), {
                    cid: e.cid
                }));
                return
            }
            const {
                resolve: n
            } = this.pendingTrackResolvers[e.cid];
            delete this.pendingTrackResolvers[e.cid], n(e.track)
        }, this.client.onLocalTrackUnpublished = e => {
            this.emit(V.LocalTrackUnpublished, e)
        }, this.client.onLocalTrackSubscribed = e => {
            this.emit(V.LocalTrackSubscribed, e)
        }, this.client.onTokenRefresh = e => {
            var t;
            this.token = e, (t = this.regionUrlProvider) === null || t === void 0 || t.updateToken(e)
        }, this.client.onRemoteMuteChanged = (e, t) => {
            this.emit(V.RemoteMute, e, t)
        }, this.client.onSubscribedQualityUpdate = e => {
            this.emit(V.SubscribedQualityUpdate, e)
        }, this.client.onRoomMoved = e => {
            var t;
            this.participantSid = (t = e.participant) === null || t === void 0 ? void 0 : t.sid, this.latestJoinResponse && (this.latestJoinResponse.room = e.room), this.emit(V.RoomMoved, e)
        }, this.client.onMediaSectionsRequirement = e => {
            var t, n;
            const s = {
                direction: "recvonly"
            };
            for (let r = 0; r < e.numAudios; r++)(t = this.pcManager) === null || t === void 0 || t.addPublisherTransceiverOfKind("audio", s);
            for (let r = 0; r < e.numVideos; r++)(n = this.pcManager) === null || n === void 0 || n.addPublisherTransceiverOfKind("video", s);
            this.negotiate()
        }, this.client.onClose = () => {
            this.handleDisconnect("signal", Pt.RR_SIGNAL_DISCONNECTED)
        }, this.client.onLeave = e => {
            switch (this.log.debug("client leave request", Object.assign(Object.assign({}, this.logContext), {
                    reason: e == null ? void 0 : e.reason
                })), e.regions && this.regionUrlProvider && (this.log.debug("updating regions", this.logContext), this.regionUrlProvider.setServerReportedRegions({
                    updatedAtInMs: Date.now(),
                    maxAgeInMs: Mc,
                    regionSettings: e.regions
                })), e.action) {
                case qt.DISCONNECT:
                    this.emit(V.Disconnected, e == null ? void 0 : e.reason), this.close();
                    break;
                case qt.RECONNECT:
                    this.fullReconnectOnNext = !0, this.handleDisconnect(Mn);
                    break;
                case qt.RESUME:
                    this.handleDisconnect(Mn)
            }
        }
    }
    makeRTCConfiguration(e) {
        var t;
        const n = Object.assign({}, this.rtcConfig);
        if (!((t = this.signalOpts) === null || t === void 0) && t.e2eeEnabled && (this.log.debug("E2EE - setting up transports with insertable streams", this.logContext), n.encodedInsertableStreams = !0), e.iceServers && !n.iceServers) {
            const s = [];
            e.iceServers.forEach(r => {
                const a = {
                    urls: r.urls
                };
                r.username && (a.username = r.username), r.credential && (a.credential = r.credential), s.push(a)
            }), n.iceServers = s
        }
        return e.clientConfiguration && e.clientConfiguration.forceRelay === mi.ENABLED && (n.iceTransportPolicy = "relay"), n.sdpSemantics = "unified-plan", n.continualGatheringPolicy = "gather_continually", n
    }
    createDataChannels() {
        this.pcManager && (this.lossyDC && (this.lossyDC.onmessage = null, this.lossyDC.onerror = null), this.reliableDC && (this.reliableDC.onmessage = null, this.reliableDC.onerror = null), this.lossyDC = this.pcManager.createPublisherDataChannel(So, {
            ordered: !1,
            maxRetransmits: 0
        }), this.reliableDC = this.pcManager.createPublisherDataChannel(To, {
            ordered: !0
        }), this.lossyDC.onmessage = this.handleDataMessage, this.reliableDC.onmessage = this.handleDataMessage, this.lossyDC.onerror = this.handleDataError, this.reliableDC.onerror = this.handleDataError, this.lossyDC.bufferedAmountLowThreshold = 65535, this.reliableDC.bufferedAmountLowThreshold = 65535, this.lossyDC.onbufferedamountlow = this.handleBufferedAmountLow, this.reliableDC.onbufferedamountlow = this.handleBufferedAmountLow, this.cleanupLossyDataStats(), this.lossyDataStatInterval = setInterval(() => {
            this.lossyDataStatByterate = this.lossyDataStatCurrentBytes, this.lossyDataStatCurrentBytes = 0;
            const e = this.dataChannelForKind(ee.LOSSY);
            if (e) {
                const t = this.lossyDataStatByterate / 10;
                e.bufferedAmountLowThreshold = Math.min(Math.max(t, kf), Sf)
            }
        }, 1e3))
    }
    createSender(e, t, n) {
        return b(this, void 0, void 0, function*() {
            if (os()) return yield this.createTransceiverRTCRtpSender(e, t, n);
            if (as()) return this.log.warn("using add-track fallback", this.logContext), yield this.createRTCRtpSender(e.mediaStreamTrack);
            throw new fe("Required webRTC APIs not supported on this device")
        })
    }
    createSimulcastSender(e, t, n, s) {
        return b(this, void 0, void 0, function*() {
            if (os()) return this.createSimulcastTransceiverSender(e, t, n, s);
            if (as()) return this.log.debug("using add-track fallback", this.logContext), this.createRTCRtpSender(e.mediaStreamTrack);
            throw new fe("Cannot stream on this device")
        })
    }
    createTransceiverRTCRtpSender(e, t, n) {
        return b(this, void 0, void 0, function*() {
            if (!this.pcManager) throw new fe("publisher is closed");
            const s = [];
            e.mediaStream && s.push(e.mediaStream), Ct(e) && (e.codec = t.videoCodec);
            const r = {
                direction: "sendonly",
                streams: s
            };
            return n && (r.sendEncodings = n), (yield this.pcManager.addPublisherTransceiver(e.mediaStreamTrack, r)).sender
        })
    }
    createSimulcastTransceiverSender(e, t, n, s) {
        return b(this, void 0, void 0, function*() {
            if (!this.pcManager) throw new fe("publisher is closed");
            const r = {
                direction: "sendonly"
            };
            s && (r.sendEncodings = s);
            const a = yield this.pcManager.addPublisherTransceiver(t.mediaStreamTrack, r);
            if (n.videoCodec) return e.setSimulcastTrackSender(n.videoCodec, a.sender), a.sender
        })
    }
    createRTCRtpSender(e) {
        return b(this, void 0, void 0, function*() {
            if (!this.pcManager) throw new fe("publisher is closed");
            return this.pcManager.addPublisherTrack(e)
        })
    }
    attemptReconnect(e) {
        return b(this, void 0, void 0, function*() {
            var t, n, s;
            if (!this._isClosed) {
                if (this.attemptingReconnect) {
                    X.warn("already attempting reconnect, returning early", this.logContext);
                    return
                }(((t = this.clientConfiguration) === null || t === void 0 ? void 0 : t.resumeConnection) === mi.DISABLED || ((s = (n = this.pcManager) === null || n === void 0 ? void 0 : n.currentState) !== null && s !== void 0 ? s : le.NEW) === le.NEW) && (this.fullReconnectOnNext = !0);
                try {
                    this.attemptingReconnect = !0, this.fullReconnectOnNext ? yield this.restartConnection(): yield this.resumeConnection(e), this.clearPendingReconnect(), this.fullReconnectOnNext = !1
                } catch (r) {
                    this.reconnectAttempts += 1;
                    let a = !0;
                    r instanceof fe ? (this.log.debug("received unrecoverable error", Object.assign(Object.assign({}, this.logContext), {
                        error: r
                    })), a = !1) : r instanceof Ut || (this.fullReconnectOnNext = !0), a ? this.handleDisconnect("reconnect", Pt.RR_UNKNOWN) : (this.log.info("could not recover connection after ".concat(this.reconnectAttempts, " attempts, ").concat(Date.now() - this.reconnectStart, "ms. giving up"), this.logContext), this.emit(V.Disconnected), yield this.close())
                } finally {
                    this.attemptingReconnect = !1
                }
            }
        })
    }
    getNextRetryDelay(e) {
        try {
            return this.reconnectPolicy.nextRetryDelayInMs(e)
        } catch (t) {
            this.log.warn("encountered error in reconnect policy", Object.assign(Object.assign({}, this.logContext), {
                error: t
            }))
        }
        return null
    }
    restartConnection(e) {
        return b(this, void 0, void 0, function*() {
            var t, n, s;
            try {
                if (!this.url || !this.token) throw new fe("could not reconnect, url or token not saved");
                this.log.info("reconnecting, attempt: ".concat(this.reconnectAttempts), this.logContext), this.emit(V.Restarting), this.client.isDisconnected || (yield this.client.sendLeave()), yield this.cleanupPeerConnections(), yield this.cleanupClient();
                let r;
                try {
                    if (!this.signalOpts) throw this.log.warn("attempted connection restart, without signal options present", this.logContext), new Ut;
                    r = yield this.join(e ?? this.url, this.token, this.signalOpts, void 0, !this.options.singlePeerConnection)
                } catch (a) {
                    throw a instanceof $ && a.reason === ce.NotAllowed ? new fe("could not reconnect, token might be expired") : new Ut
                }
                if (this.shouldFailNext) throw this.shouldFailNext = !1, new Error("simulated failure");
                if (this.client.setReconnected(), this.emit(V.SignalRestarted, r), yield this.waitForPCReconnected(), this.client.currentState !== ae.CONNECTED) throw new Ut("Signal connection got severed during reconnect");
                (t = this.regionUrlProvider) === null || t === void 0 || t.resetAttempts(), this.emit(V.Restarted)
            } catch (r) {
                const a = yield(n = this.regionUrlProvider) === null || n === void 0 ? void 0 : n.getNextBestRegionUrl();
                if (a) {
                    yield this.restartConnection(a);
                    return
                } else throw (s = this.regionUrlProvider) === null || s === void 0 || s.resetAttempts(), r
            }
        })
    }
    resumeConnection(e) {
        return b(this, void 0, void 0, function*() {
            var t;
            if (!this.url || !this.token) throw new fe("could not reconnect, url or token not saved");
            if (!this.pcManager) throw new fe("publisher and subscriber connections unset");
            this.log.info("resuming signal connection, attempt ".concat(this.reconnectAttempts), this.logContext), this.emit(V.Resuming);
            let n;
            try {
                this.setupSignalClientCallbacks(), n = yield this.client.reconnect(this.url, this.token, this.participantSid, e)
            } catch (s) {
                let r = "";
                throw s instanceof Error && (r = s.message, this.log.error(s.message, Object.assign(Object.assign({}, this.logContext), {
                    error: s
                }))), s instanceof $ && s.reason === ce.NotAllowed ? new fe("could not reconnect, token might be expired") : s instanceof $ && s.reason === ce.LeaveRequest ? s : new Ut(r)
            }
            if (this.emit(V.SignalResumed), n) {
                const s = this.makeRTCConfiguration(n);
                this.pcManager.updateConfiguration(s), this.latestJoinResponse && (this.latestJoinResponse.serverInfo = n.serverInfo)
            } else this.log.warn("Did not receive reconnect response", this.logContext);
            if (this.shouldFailNext) throw this.shouldFailNext = !1, new Error("simulated failure");
            if (yield this.pcManager.triggerIceRestart(), yield this.waitForPCReconnected(), this.client.currentState !== ae.CONNECTED) throw new Ut("Signal connection got severed during reconnect");
            this.client.setReconnected(), ((t = this.reliableDC) === null || t === void 0 ? void 0 : t.readyState) === "open" && this.reliableDC.id === null && this.createDataChannels(), n != null && n.lastMessageSeq && this.resendReliableMessagesForResume(n.lastMessageSeq), this.emit(V.Resumed)
        })
    }
    waitForPCInitialConnection(e, t) {
        return b(this, void 0, void 0, function*() {
            if (!this.pcManager) throw new fe("PC manager is closed");
            yield this.pcManager.ensurePCTransportConnection(t, e)
        })
    }
    waitForPCReconnected() {
        return b(this, void 0, void 0, function*() {
            this.pcState = Ae.Reconnecting, this.log.debug("waiting for peer connection to reconnect", this.logContext);
            try {
                if (yield Ce(bf), !this.pcManager) throw new fe("PC manager is closed");
                yield this.pcManager.ensurePCTransportConnection(void 0, this.peerConnectionTimeout), this.pcState = Ae.Connected
            } catch (e) {
                throw this.pcState = Ae.Disconnected, $.internal("could not establish PC connection, ".concat(e.message))
            }
        })
    }
    publishRpcResponse(e, t, n, s) {
        return b(this, void 0, void 0, function*() {
            const r = new Re({
                destinationIdentities: [e],
                kind: ee.RELIABLE,
                value: {
                    case: "rpcResponse",
                    value: new Os({
                        requestId: t,
                        value: s ? {
                            case: "error",
                            value: s.toProto()
                        } : {
                            case: "payload",
                            value: n ?? ""
                        }
                    })
                }
            });
            yield this.sendDataPacket(r, ee.RELIABLE)
        })
    }
    publishRpcAck(e, t) {
        return b(this, void 0, void 0, function*() {
            const n = new Re({
                destinationIdentities: [e],
                kind: ee.RELIABLE,
                value: {
                    case: "rpcAck",
                    value: new Ms({
                        requestId: t
                    })
                }
            });
            yield this.sendDataPacket(n, ee.RELIABLE)
        })
    }
    sendDataPacket(e, t) {
        return b(this, void 0, void 0, function*() {
            if (yield this.ensurePublisherConnected(t), this.e2eeManager && this.e2eeManager.isDataChannelEncryptionEnabled) {
                const r = xm(e);
                if (r) {
                    const a = yield this.e2eeManager.encryptData(r.toBinary());
                    e.value = {
                        case: "encryptedPacket",
                        value: new pa({
                            encryptedValue: a.payload,
                            iv: a.iv,
                            keyIndex: a.keyIndex
                        })
                    }
                }
            }
            t === ee.RELIABLE && (e.sequence = this.reliableDataSequence, this.reliableDataSequence += 1);
            const n = e.toBinary(),
                s = this.dataChannelForKind(t);
            if (s) {
                if (t === ee.RELIABLE) yield this.waitForBufferStatusLow(t), this.reliableMessageBuffer.push({
                    data: n,
                    sequence: e.sequence
                });
                else {
                    if (!this.isBufferStatusLow(t)) {
                        this.lossyDataDropCount += 1, this.lossyDataDropCount % 100 === 0 && this.log.warn("dropping lossy data channel messages, total dropped: ".concat(this.lossyDataDropCount), this.logContext);
                        return
                    }
                    this.lossyDataStatCurrentBytes += n.byteLength
                }
                if (this.attemptingReconnect) return;
                s.send(n)
            }
            this.updateAndEmitDCBufferStatus(t)
        })
    }
    resendReliableMessagesForResume(e) {
        return b(this, void 0, void 0, function*() {
            yield this.ensurePublisherConnected(ee.RELIABLE);
            const t = this.dataChannelForKind(ee.RELIABLE);
            t && (this.reliableMessageBuffer.popToSequence(e), this.reliableMessageBuffer.getAll().forEach(n => {
                t.send(n.data)
            })), this.updateAndEmitDCBufferStatus(ee.RELIABLE)
        })
    }
    waitForBufferStatusLow(e) {
        return new Ee((t, n) => b(this, void 0, void 0, function*() {
            if (this.isBufferStatusLow(e)) t();
            else {
                const s = () => n(new fe("engine closed"));
                for (this.once(V.Closing, s); !this.dcBufferStatus.get(e);) yield Ce(10);
                this.off(V.Closing, s), t()
            }
        }))
    }
    ensureDataTransportConnected(e) {
        return b(this, arguments, void 0, function(t) {
            var n = this;
            let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.subscriberPrimary;
            return function*() {
                var r;
                if (!n.pcManager) throw new fe("PC manager is closed");
                const a = s ? n.pcManager.subscriber : n.pcManager.publisher,
                    o = s ? "Subscriber" : "Publisher";
                if (!a) throw $.internal("".concat(o, " connection not set"));
                let c = !1;
                !s && !n.dataChannelForKind(t, s) && (n.createDataChannels(), c = !0), !c && !s && !n.pcManager.publisher.isICEConnected && n.pcManager.publisher.getICEConnectionState() !== "checking" && (c = !0), c && n.negotiate().catch(u => {
                    X.error(u, n.logContext)
                });
                const d = n.dataChannelForKind(t, s);
                if ((d == null ? void 0 : d.readyState) === "open") return;
                const l = new Date().getTime() + n.peerConnectionTimeout;
                for (; new Date().getTime() < l;) {
                    if (a.isICEConnected && ((r = n.dataChannelForKind(t, s)) === null || r === void 0 ? void 0 : r.readyState) === "open") return;
                    yield Ce(50)
                }
                throw $.internal("could not establish ".concat(o, " connection, state: ").concat(a.getICEConnectionState()))
            }()
        })
    }
    ensurePublisherConnected(e) {
        return b(this, void 0, void 0, function*() {
            this.publisherConnectionPromise || (this.publisherConnectionPromise = this.ensureDataTransportConnected(e, !1)), yield this.publisherConnectionPromise
        })
    }
    verifyTransport() {
        return !(!this.pcManager || ![le.CONNECTING, le.CONNECTED].includes(this.pcManager.currentState) || !this.client.ws || this.client.ws.readyState === WebSocket.CLOSED)
    }
    negotiate() {
        return b(this, void 0, void 0, function*() {
            return new Ee((e, t) => b(this, void 0, void 0, function*() {
                if (!this.pcManager) {
                    t(new _t("PC manager is closed"));
                    return
                }
                this.pcManager.requirePublisher(), this.pcManager.publisher.getTransceivers().length == 0 && !this.lossyDC && !this.reliableDC && this.createDataChannels();
                const n = new AbortController,
                    s = () => {
                        n.abort(), this.log.debug("engine disconnected while negotiation was ongoing", this.logContext), e()
                    };
                this.isClosed && t(new _t("cannot negotiate on closed engine")), this.on(V.Closing, s), this.on(V.Restarting, s), this.pcManager.publisher.once(xt.RTPVideoPayloadTypes, r => {
                    const a = new Map;
                    r.forEach(o => {
                        const c = o.codec.toLowerCase();
                        mm(c) && a.set(o.payload, c)
                    }), this.emit(V.RTPVideoMapUpdate, a)
                });
                try {
                    yield this.pcManager.negotiate(n), e()
                } catch (r) {
                    if (n.signal.aborted) {
                        e();
                        return
                    }
                    r instanceof _t && (this.fullReconnectOnNext = !0), this.handleDisconnect("negotiation", Pt.RR_UNKNOWN), r instanceof Error ? t(r) : t(new Error(String(r)))
                } finally {
                    this.off(V.Closing, s), this.off(V.Restarting, s)
                }
            }))
        })
    }
    dataChannelForKind(e, t) {
        if (t) {
            if (e === ee.LOSSY) return this.lossyDCSub;
            if (e === ee.RELIABLE) return this.reliableDCSub
        } else {
            if (e === ee.LOSSY) return this.lossyDC;
            if (e === ee.RELIABLE) return this.reliableDC
        }
    }
    sendSyncState(e, t) {
        var n, s, r, a;
        if (!this.pcManager) {
            this.log.warn("sync state cannot be sent without peer connection setup", this.logContext);
            return
        }
        const o = this.pcManager.publisher.getLocalDescription(),
            c = this.pcManager.publisher.getRemoteDescription(),
            d = (n = this.pcManager.subscriber) === null || n === void 0 ? void 0 : n.getRemoteDescription(),
            l = (s = this.pcManager.subscriber) === null || s === void 0 ? void 0 : s.getLocalDescription(),
            u = (a = (r = this.signalOpts) === null || r === void 0 ? void 0 : r.autoSubscribe) !== null && a !== void 0 ? a : !0,
            h = new Array,
            m = new Array;
        e.forEach(f => {
            f.isDesired !== u && h.push(f.trackSid), f.isEnabled || m.push(f.trackSid)
        }), this.client.sendSyncState(new Us({
            answer: this.pcManager.mode === "publisher-only" ? c ? Bt({
                sdp: c.sdp,
                type: c.type
            }) : void 0 : l ? Bt({
                sdp: l.sdp,
                type: l.type
            }) : void 0,
            offer: this.pcManager.mode === "publisher-only" ? o ? Bt({
                sdp: o.sdp,
                type: o.type
            }) : void 0 : d ? Bt({
                sdp: d.sdp,
                type: d.type
            }) : void 0,
            subscription: new an({
                trackSids: h,
                subscribe: !u,
                participantTracks: []
            }),
            publishTracks: Qh(t),
            dataChannels: this.dataChannelsInfo(),
            trackSidsDisabled: m,
            datachannelReceiveStates: this.reliableReceivedState.map((f, p) => new ja({
                publisherSid: p,
                lastSeq: f
            }))
        }))
    }
    failNext() {
        this.shouldFailNext = !0
    }
    dataChannelsInfo() {
        const e = [],
            t = (n, s) => {
                (n == null ? void 0 : n.id) !== void 0 && n.id !== null && e.push(new Fa({
                    label: n.label,
                    id: n.id,
                    target: s
                }))
            };
        return t(this.dataChannelForKind(ee.LOSSY), qe.PUBLISHER), t(this.dataChannelForKind(ee.RELIABLE), qe.PUBLISHER), t(this.dataChannelForKind(ee.LOSSY, !0), qe.SUBSCRIBER), t(this.dataChannelForKind(ee.RELIABLE, !0), qe.SUBSCRIBER), e
    }
    clearReconnectTimeout() {
        this.reconnectTimeout && Te.clearTimeout(this.reconnectTimeout)
    }
    clearPendingReconnect() {
        this.clearReconnectTimeout(), this.reconnectAttempts = 0
    }
    registerOnLineListener() {
        Me() && (window.addEventListener("online", this.handleBrowserOnLine), window.addEventListener("offline", this.handleBrowserOffline))
    }
    deregisterOnLineListener() {
        Me() && (window.removeEventListener("online", this.handleBrowserOnLine), window.removeEventListener("offline", this.handleBrowserOffline))
    }
    getTrackIdForReceiver(e) {
        var t;
        const n = (t = this.pcManager) === null || t === void 0 ? void 0 : t.getMidForReceiver(e);
        if (n) {
            const s = Object.entries(this.midToTrackId).find(r => {
                let [a] = r;
                return a === n
            });
            if (s) return s[1]
        }
    }
}

