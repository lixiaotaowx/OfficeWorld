class $t extends et.EventEmitter {
    get hasE2EESetup() {
        return this.e2eeManager !== void 0
    }
    constructor(e) {
        var t, n, s, r, a;
        if (super(), t = this, this.state = re.Disconnected, this.activeSpeakers = [], this.isE2EEEnabled = !1, this.audioEnabled = !0, this.isVideoPlaybackBlocked = !1, this.log = X, this.bufferedEvents = [], this.isResuming = !1, this.rpcHandlers = new Map, this.connect = (o, c, d) => b(this, void 0, void 0, function*() {
                var l;
                if (!om()) throw Xe() ? Error("WebRTC isn't detected, have you called registerGlobals?") : Error("LiveKit doesn't seem to be supported on this browser. Try to update your browser and make sure no browser extensions are disabling webRTC.");
                const u = yield this.disconnectLock.lock();
                if (this.state === re.Connected) return this.log.info("already connected to room ".concat(this.name), this.logContext), u(), Promise.resolve();
                if (this.connectFuture) return u(), this.connectFuture.promise;
                this.setAndEmitConnectionState(re.Connecting), ((l = this.regionUrlProvider) === null || l === void 0 ? void 0 : l.getServerUrl().toString()) !== _c(o) && (this.regionUrl = void 0, this.regionUrlProvider = void 0), zt(new URL(o)) && (this.regionUrlProvider === void 0 ? this.regionUrlProvider = new se(o, c) : this.regionUrlProvider.updateToken(c), this.regionUrlProvider.fetchRegionSettings().then(f => {
                    var p;
                    (p = this.regionUrlProvider) === null || p === void 0 || p.setServerReportedRegions(f)
                }).catch(f => {
                    this.log.warn("could not fetch region settings", Object.assign(Object.assign({}, this.logContext), {
                        error: f
                    }))
                }));
                const h = (f, p, _) => b(this, void 0, void 0, function*() {
                        var w, k;
                        this.abortController && this.abortController.abort();
                        const P = new AbortController;
                        this.abortController = P, u == null || u();
                        try {
                            if (yield Gt.getInstance().getBackOffPromise(o), P.signal.aborted) throw $.cancelled("Connection attempt aborted");
                            yield this.attemptConnection(_ ?? o, c, d, P), this.abortController = void 0, f()
                        } catch (y) {
                            if (this.regionUrlProvider && y instanceof $ && y.reason !== ce.Cancelled && y.reason !== ce.NotAllowed) {
                                let S = null;
                                try {
                                    this.log.debug("Fetching next region"), S = yield this.regionUrlProvider.getNextBestRegionUrl((w = this.abortController) === null || w === void 0 ? void 0 : w.signal)
                                } catch (E) {
                                    if (E instanceof $ && (E.status === 401 || E.reason === ce.Cancelled)) {
                                        this.handleDisconnect(this.options.stopLocalTrackOnUnpublish), p(E);
                                        return
                                    }
                                } [ce.InternalError, ce.ServerUnreachable, ce.Timeout].includes(y.reason) && (this.log.debug("Adding failed connection attempt to back off"), Gt.getInstance().addFailedConnectionAttempt(o)), S && !(!((k = this.abortController) === null || k === void 0) && k.signal.aborted) ? (this.log.info("Initial connection failed with ConnectionError: ".concat(y.message, ". Retrying with another region: ").concat(S), this.logContext), this.recreateEngine(), yield h(f, p, S)) : (this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, to(y)), p(y))
                            } else {
                                let S = He.UNKNOWN_REASON;
                                y instanceof $ && (S = to(y)), this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, S), p(y)
                            }
                        }
                    }),
                    m = this.regionUrl;
                return this.regionUrl = void 0, this.connectFuture = new Le((f, p) => {
                    h(f, p, m)
                }, () => {
                    this.clearConnectionFutures()
                }), this.connectFuture.promise
            }), this.connectSignal = (o, c, d, l, u, h) => b(this, void 0, void 0, function*() {
                var m, f, p;
                const _ = yield d.join(o, c, {
                    autoSubscribe: l.autoSubscribe,
                    adaptiveStream: typeof u.adaptiveStream == "object" ? !0 : u.adaptiveStream,
                    maxRetries: l.maxRetries,
                    e2eeEnabled: !!this.e2eeManager,
                    websocketTimeout: l.websocketTimeout
                }, h.signal, !u.singlePeerConnection);
                let w = _.serverInfo;
                if (w || (w = {
                        version: _.serverVersion,
                        region: _.serverRegion
                    }), this.serverInfo = w, this.log.debug("connected to Livekit Server ".concat(Object.entries(w).map(k => {
                        let [P, y] = k;
                        return "".concat(P, ": ").concat(y)
                    }).join(", ")), {
                        room: (m = _.room) === null || m === void 0 ? void 0 : m.name,
                        roomSid: (f = _.room) === null || f === void 0 ? void 0 : f.sid,
                        identity: (p = _.participant) === null || p === void 0 ? void 0 : p.identity
                    }), !w.version) throw new qh("unknown server version");
                return w.version === "0.15.1" && this.options.dynacast && (this.log.debug("disabling dynacast due to server version", this.logContext), u.dynacast = !1), _
            }), this.applyJoinResponse = o => {
                const c = o.participant;
                if (this.localParticipant.sid = c.sid, this.localParticipant.identity = c.identity, this.localParticipant.setEnabledPublishCodecs(o.enabledPublishCodecs), this.e2eeManager) try {
                    this.e2eeManager.setSifTrailer(o.sifTrailer)
                } catch (d) {
                    this.log.error(d instanceof Error ? d.message : "Could not set SifTrailer", Object.assign(Object.assign({}, this.logContext), {
                        error: d
                    }))
                }
                this.handleParticipantUpdates([c, ...o.otherParticipants]), o.room && this.handleRoomUpdate(o.room)
            }, this.attemptConnection = (o, c, d, l) => b(this, void 0, void 0, function*() {
                var u, h;
                this.state === re.Reconnecting || this.isResuming || !((u = this.engine) === null || u === void 0) && u.pendingReconnect ? (this.log.info("Reconnection attempt replaced by new connection attempt", this.logContext), this.recreateEngine()) : this.maybeCreateEngine(), !((h = this.regionUrlProvider) === null || h === void 0) && h.isCloud() && this.engine.setRegionUrlProvider(this.regionUrlProvider), this.acquireAudioContext(), this.connOptions = Object.assign(Object.assign({}, zs), d), this.connOptions.rtcConfig && (this.engine.rtcConfig = this.connOptions.rtcConfig), this.connOptions.peerConnectionTimeout && (this.engine.peerConnectionTimeout = this.connOptions.peerConnectionTimeout);
                try {
                    const m = yield this.connectSignal(o, c, this.engine, this.connOptions, this.options, l);
                    this.applyJoinResponse(m), this.setupLocalParticipantEvents(), this.emit(U.SignalConnected)
                } catch (m) {
                    yield this.engine.close(), this.recreateEngine();
                    const f = l.signal.aborted ? $.cancelled("Signal connection aborted") : $.serverUnreachable("could not establish signal connection");
                    throw m instanceof Error && (f.message = "".concat(f.message, ": ").concat(m.message)), m instanceof $ && (f.reason = m.reason, f.status = m.status), this.log.debug("error trying to establish signal connection", Object.assign(Object.assign({}, this.logContext), {
                        error: m
                    })), f
                }
                if (l.signal.aborted) throw yield this.engine.close(), this.recreateEngine(), $.cancelled("Connection attempt aborted");
                try {
                    yield this.engine.waitForPCInitialConnection(this.connOptions.peerConnectionTimeout, l)
                } catch (m) {
                    throw yield this.engine.close(), this.recreateEngine(), m
                }
                Me() && this.options.disconnectOnPageLeave && (window.addEventListener("pagehide", this.onPageLeave), window.addEventListener("beforeunload", this.onPageLeave)), Me() && window.addEventListener("freeze", this.onPageLeave), this.setAndEmitConnectionState(re.Connected), this.emit(U.Connected), Gt.getInstance().resetFailedConnectionAttempts(o), this.registerConnectionReconcile(), this.regionUrlProvider && this.regionUrlProvider.notifyConnected()
            }), this.disconnect = function() {
                for (var o = arguments.length, c = new Array(o), d = 0; d < o; d++) c[d] = arguments[d];
                return b(t, [...c], void 0, function() {
                    var l = this;
                    let u = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0;
                    return function*() {
                        var h, m, f;
                        const p = yield l.disconnectLock.lock();
                        try {
                            if (l.state === re.Disconnected) {
                                l.log.debug("already disconnected", l.logContext);
                                return
                            }
                            if (l.log.info("disconnect from room", Object.assign({}, l.logContext)), l.state === re.Connecting || l.state === re.Reconnecting || l.isResuming) {
                                const _ = "Abort connection attempt due to user initiated disconnect";
                                l.log.warn(_, l.logContext), (h = l.abortController) === null || h === void 0 || h.abort(_), (f = (m = l.connectFuture) === null || m === void 0 ? void 0 : m.reject) === null || f === void 0 || f.call(m, $.cancelled("Client initiated disconnect")), l.connectFuture = void 0
                            }
                            l.engine && (l.engine.client.isDisconnected || (yield l.engine.client.sendLeave()), yield l.engine.close()), l.handleDisconnect(u, He.CLIENT_INITIATED), l.engine = void 0
                        } finally {
                            p()
                        }
                    }()
                })
            }, this.onPageLeave = () => b(this, void 0, void 0, function*() {
                this.log.info("Page leave detected, disconnecting", this.logContext), yield this.disconnect()
            }), this.startAudio = () => b(this, void 0, void 0, function*() {
                const o = [],
                    c = Oe();
                if (c && c.os === "iOS") {
                    const d = "livekit-dummy-audio-el";
                    let l = document.getElementById(d);
                    if (!l) {
                        l = document.createElement("audio"), l.id = d, l.autoplay = !0, l.hidden = !0;
                        const u = wn();
                        u.enabled = !0;
                        const h = new MediaStream([u]);
                        l.srcObject = h, document.addEventListener("visibilitychange", () => {
                            l && (l.srcObject = document.hidden ? null : h, document.hidden || (this.log.debug("page visible again, triggering startAudio to resume playback and update playback status", this.logContext), this.startAudio()))
                        }), document.body.append(l), this.once(U.Disconnected, () => {
                            l == null || l.remove(), l = null
                        })
                    }
                    o.push(l)
                }
                this.remoteParticipants.forEach(d => {
                    d.audioTrackPublications.forEach(l => {
                        l.track && l.track.attachedElements.forEach(u => {
                            o.push(u)
                        })
                    })
                });
                try {
                    yield Promise.all([this.acquireAudioContext(), ...o.map(d => (d.muted = !1, d.play()))]), this.handleAudioPlaybackStarted()
                } catch (d) {
                    throw this.handleAudioPlaybackFailed(d), d
                }
            }), this.startVideo = () => b(this, void 0, void 0, function*() {
                const o = [];
                for (const c of this.remoteParticipants.values()) c.videoTrackPublications.forEach(d => {
                    var l;
                    (l = d.track) === null || l === void 0 || l.attachedElements.forEach(u => {
                        o.includes(u) || o.push(u)
                    })
                });
                yield Promise.all(o.map(c => c.play())).then(() => {
                    this.handleVideoPlaybackStarted()
                }).catch(c => {
                    c.name === "NotAllowedError" ? this.handleVideoPlaybackFailed() : this.log.warn("Resuming video playback failed, make sure you call `startVideo` directly in a user gesture handler", this.logContext)
                })
            }), this.handleRestarting = () => {
                this.clearConnectionReconcile(), this.isResuming = !1;
                for (const o of this.remoteParticipants.values()) this.handleParticipantDisconnected(o.identity, o);
                this.setAndEmitConnectionState(re.Reconnecting) && this.emit(U.Reconnecting)
            }, this.handleSignalRestarted = o => b(this, void 0, void 0, function*() {
                this.log.debug("signal reconnected to server, region ".concat(o.serverRegion), Object.assign(Object.assign({}, this.logContext), {
                    region: o.serverRegion
                })), this.bufferedEvents = [], this.applyJoinResponse(o);
                try {
                    yield this.localParticipant.republishAllTracks(void 0, !0)
                } catch (c) {
                    this.log.error("error trying to re-publish tracks after reconnection", Object.assign(Object.assign({}, this.logContext), {
                        error: c
                    }))
                }
                try {
                    yield this.engine.waitForRestarted(), this.log.debug("fully reconnected to server", Object.assign(Object.assign({}, this.logContext), {
                        region: o.serverRegion
                    }))
                } catch {
                    return
                }
                this.setAndEmitConnectionState(re.Connected), this.emit(U.Reconnected), this.registerConnectionReconcile(), this.emitBufferedEvents()
            }), this.handleParticipantUpdates = o => {
                o.forEach(c => {
                    var d;
                    if (c.identity === this.localParticipant.identity) {
                        this.localParticipant.updateInfo(c);
                        return
                    }
                    c.identity === "" && (c.identity = (d = this.sidToIdentity.get(c.sid)) !== null && d !== void 0 ? d : "");
                    let l = this.remoteParticipants.get(c.identity);
                    c.state === Vt.DISCONNECTED ? this.handleParticipantDisconnected(c.identity, l) : l = this.getOrCreateParticipant(c.identity, c)
                })
            }, this.handleActiveSpeakersUpdate = o => {
                const c = [],
                    d = {};
                o.forEach(l => {
                    if (d[l.sid] = !0, l.sid === this.localParticipant.sid) this.localParticipant.audioLevel = l.level, this.localParticipant.setIsSpeaking(!0), c.push(this.localParticipant);
                    else {
                        const u = this.getRemoteParticipantBySid(l.sid);
                        u && (u.audioLevel = l.level, u.setIsSpeaking(!0), c.push(u))
                    }
                }), d[this.localParticipant.sid] || (this.localParticipant.audioLevel = 0, this.localParticipant.setIsSpeaking(!1)), this.remoteParticipants.forEach(l => {
                    d[l.sid] || (l.audioLevel = 0, l.setIsSpeaking(!1))
                }), this.activeSpeakers = c, this.emitWhenConnected(U.ActiveSpeakersChanged, c)
            }, this.handleSpeakersChanged = o => {
                const c = new Map;
                this.activeSpeakers.forEach(l => {
                    const u = this.remoteParticipants.get(l.identity);
                    u && u.sid !== l.sid || c.set(l.sid, l)
                }), o.forEach(l => {
                    let u = this.getRemoteParticipantBySid(l.sid);
                    l.sid === this.localParticipant.sid && (u = this.localParticipant), u && (u.audioLevel = l.level, u.setIsSpeaking(l.active), l.active ? c.set(l.sid, u) : c.delete(l.sid))
                });
                const d = Array.from(c.values());
                d.sort((l, u) => u.audioLevel - l.audioLevel), this.activeSpeakers = d, this.emitWhenConnected(U.ActiveSpeakersChanged, d)
            }, this.handleStreamStateUpdate = o => {
                o.streamStates.forEach(c => {
                    const d = this.getRemoteParticipantBySid(c.participantSid);
                    if (!d) return;
                    const l = d.getTrackPublicationBySid(c.trackSid);
                    if (!l || !l.track) return;
                    const u = O.streamStateFromProto(c.state);
                    l.track.setStreamState(u), u !== l.track.streamState && (d.emit(W.TrackStreamStateChanged, l, l.track.streamState), this.emitWhenConnected(U.TrackStreamStateChanged, l, l.track.streamState, d))
                })
            }, this.handleSubscriptionPermissionUpdate = o => {
                const c = this.getRemoteParticipantBySid(o.participantSid);
                if (!c) return;
                const d = c.getTrackPublicationBySid(o.trackSid);
                d && d.setAllowed(o.allowed)
            }, this.handleSubscriptionError = o => {
                const c = Array.from(this.remoteParticipants.values()).find(l => l.trackPublications.has(o.trackSid));
                if (!c) return;
                const d = c.getTrackPublicationBySid(o.trackSid);
                d && d.setSubscriptionError(o.err)
            }, this.handleDataPacket = (o, c) => {
                const d = this.remoteParticipants.get(o.participantIdentity);
                if (o.value.case === "user") this.handleUserPacket(d, o.value.value, o.kind, c);
                else if (o.value.case === "transcription") this.handleTranscription(d, o.value.value);
                else if (o.value.case === "sipDtmf") this.handleSipDtmf(d, o.value.value);
                else if (o.value.case === "chatMessage") this.handleChatMessage(d, o.value.value);
                else if (o.value.case === "metrics") this.handleMetrics(o.value.value, d);
                else if (o.value.case === "streamHeader" || o.value.case === "streamChunk" || o.value.case === "streamTrailer") this.handleDataStream(o, c);
                else if (o.value.case === "rpcRequest") {
                    const l = o.value.value;
                    this.handleIncomingRpcRequest(o.participantIdentity, l.id, l.method, l.payload, l.responseTimeoutMs, l.version)
                }
            }, this.handleUserPacket = (o, c, d, l) => {
                this.emit(U.DataReceived, c.payload, o, d, c.topic, l), o == null || o.emit(W.DataReceived, c.payload, d, l)
            }, this.handleSipDtmf = (o, c) => {
                this.emit(U.SipDTMFReceived, c, o), o == null || o.emit(W.SipDTMFReceived, c)
            }, this.handleTranscription = (o, c) => {
                const d = c.transcribedParticipantIdentity === this.localParticipant.identity ? this.localParticipant : this.getParticipantByIdentity(c.transcribedParticipantIdentity),
                    l = d == null ? void 0 : d.trackPublications.get(c.trackId),
                    u = pm(c, this.transcriptionReceivedTimes);
                l == null || l.emit(B.TranscriptionReceived, u), d == null || d.emit(W.TranscriptionReceived, u, l), this.emit(U.TranscriptionReceived, u, d, l)
            }, this.handleChatMessage = (o, c) => {
                const d = gm(c);
                this.emit(U.ChatMessage, d, o)
            }, this.handleMetrics = (o, c) => {
                this.emit(U.MetricsReceived, o, c)
            }, this.handleDataStream = (o, c) => {
                this.incomingDataStreamManager.handleDataStreamPacket(o, c)
            }, this.bufferedSegments = new Map, this.handleAudioPlaybackStarted = () => {
                this.canPlaybackAudio || (this.audioEnabled = !0, this.emit(U.AudioPlaybackStatusChanged, !0))
            }, this.handleAudioPlaybackFailed = o => {
                this.log.warn("could not playback audio", Object.assign(Object.assign({}, this.logContext), {
                    error: o
                })), this.canPlaybackAudio && (this.audioEnabled = !1, this.emit(U.AudioPlaybackStatusChanged, !1))
            }, this.handleVideoPlaybackStarted = () => {
                this.isVideoPlaybackBlocked && (this.isVideoPlaybackBlocked = !1, this.emit(U.VideoPlaybackStatusChanged, !0))
            }, this.handleVideoPlaybackFailed = () => {
                this.isVideoPlaybackBlocked || (this.isVideoPlaybackBlocked = !0, this.emit(U.VideoPlaybackStatusChanged, !1))
            }, this.handleDeviceChange = () => b(this, void 0, void 0, function*() {
                var o;
                ((o = Oe()) === null || o === void 0 ? void 0 : o.os) !== "iOS" && (yield this.selectDefaultDevices()), this.emit(U.MediaDevicesChanged)
            }), this.handleRoomUpdate = o => {
                const c = this.roomInfo;
                this.roomInfo = o, c && c.metadata !== o.metadata && this.emitWhenConnected(U.RoomMetadataChanged, o.metadata), (c == null ? void 0 : c.activeRecording) !== o.activeRecording && this.emitWhenConnected(U.RecordingStatusChanged, o.activeRecording)
            }, this.handleConnectionQualityUpdate = o => {
                o.updates.forEach(c => {
                    if (c.participantSid === this.localParticipant.sid) {
                        this.localParticipant.setConnectionQuality(c.quality);
                        return
                    }
                    const d = this.getRemoteParticipantBySid(c.participantSid);
                    d && d.setConnectionQuality(c.quality)
                })
            }, this.onLocalParticipantMetadataChanged = o => {
                this.emit(U.ParticipantMetadataChanged, o, this.localParticipant)
            }, this.onLocalParticipantNameChanged = o => {
                this.emit(U.ParticipantNameChanged, o, this.localParticipant)
            }, this.onLocalAttributesChanged = o => {
                this.emit(U.ParticipantAttributesChanged, o, this.localParticipant)
            }, this.onLocalTrackMuted = o => {
                this.emit(U.TrackMuted, o, this.localParticipant)
            }, this.onLocalTrackUnmuted = o => {
                this.emit(U.TrackUnmuted, o, this.localParticipant)
            }, this.onTrackProcessorUpdate = o => {
                var c;
                (c = o == null ? void 0 : o.onPublish) === null || c === void 0 || c.call(o, this)
            }, this.onLocalTrackPublished = o => b(this, void 0, void 0, function*() {
                var c, d, l, u, h, m;
                (c = o.track) === null || c === void 0 || c.on(B.TrackProcessorUpdate, this.onTrackProcessorUpdate), (d = o.track) === null || d === void 0 || d.on(B.Restarted, this.onLocalTrackRestarted), (h = (u = (l = o.track) === null || l === void 0 ? void 0 : l.getProcessor()) === null || u === void 0 ? void 0 : u.onPublish) === null || h === void 0 || h.call(u, this), this.emit(U.LocalTrackPublished, o, this.localParticipant), it(o.track) && (yield o.track.checkForSilence()) && this.emit(U.LocalAudioSilenceDetected, o);
                const f = yield(m = o.track) === null || m === void 0 ? void 0 : m.getDeviceId(!1), p = rs(o.source);
                p && f && f !== this.localParticipant.activeDeviceMap.get(p) && (this.localParticipant.activeDeviceMap.set(p, f), this.emit(U.ActiveDeviceChanged, p, f))
            }), this.onLocalTrackUnpublished = o => {
                var c, d;
                (c = o.track) === null || c === void 0 || c.off(B.TrackProcessorUpdate, this.onTrackProcessorUpdate), (d = o.track) === null || d === void 0 || d.off(B.Restarted, this.onLocalTrackRestarted), this.emit(U.LocalTrackUnpublished, o, this.localParticipant)
            }, this.onLocalTrackRestarted = o => b(this, void 0, void 0, function*() {
                const c = yield o.getDeviceId(!1), d = rs(o.source);
                d && c && c !== this.localParticipant.activeDeviceMap.get(d) && (this.log.debug("local track restarted, setting ".concat(d, " ").concat(c, " active"), this.logContext), this.localParticipant.activeDeviceMap.set(d, c), this.emit(U.ActiveDeviceChanged, d, c))
            }), this.onLocalConnectionQualityChanged = o => {
                this.emit(U.ConnectionQualityChanged, o, this.localParticipant)
            }, this.onMediaDevicesError = (o, c) => {
                this.emit(U.MediaDevicesError, o, c)
            }, this.onLocalParticipantPermissionsChanged = o => {
                this.emit(U.ParticipantPermissionsChanged, o, this.localParticipant)
            }, this.onLocalChatMessageSent = o => {
                this.emit(U.ChatMessage, o, this.localParticipant)
            }, this.setMaxListeners(100), this.remoteParticipants = new Map, this.sidToIdentity = new Map, this.options = Object.assign(Object.assign({}, $m), e), this.log = Ye((n = this.options.loggerName) !== null && n !== void 0 ? n : Ue.Room), this.transcriptionReceivedTimes = new Map, this.options.audioCaptureDefaults = Object.assign(Object.assign({}, Ic), e == null ? void 0 : e.audioCaptureDefaults), this.options.videoCaptureDefaults = Object.assign(Object.assign({}, xc), e == null ? void 0 : e.videoCaptureDefaults), this.options.publishDefaults = Object.assign(Object.assign({}, zm), e == null ? void 0 : e.publishDefaults), this.maybeCreateEngine(), this.incomingDataStreamManager = new Pf, this.outgoingDataStreamManager = new If(this.engine, this.log), this.disconnectLock = new _e, this.localParticipant = new Uf("", "", this.engine, this.options, this.rpcHandlers, this.outgoingDataStreamManager), (this.options.e2ee || this.options.encryption) && this.setupE2EE(), this.engine.e2eeManager = this.e2eeManager, this.options.videoCaptureDefaults.deviceId && this.localParticipant.activeDeviceMap.set("videoinput", It(this.options.videoCaptureDefaults.deviceId)), this.options.audioCaptureDefaults.deviceId && this.localParticipant.activeDeviceMap.set("audioinput", It(this.options.audioCaptureDefaults.deviceId)), !((s = this.options.audioOutput) === null || s === void 0) && s.deviceId && this.switchActiveDevice("audiooutput", It(this.options.audioOutput.deviceId)).catch(o => this.log.warn("Could not set audio output: ".concat(o.message), this.logContext)), Me()) {
            const o = new AbortController;
            (a = (r = navigator.mediaDevices) === null || r === void 0 ? void 0 : r.addEventListener) === null || a === void 0 || a.call(r, "devicechange", this.handleDeviceChange, {
                signal: o.signal
            }), $t.cleanupRegistry && $t.cleanupRegistry.register(this, () => {
                o.abort()
            })
        }
    }
    registerTextStreamHandler(e, t) {
        return this.incomingDataStreamManager.registerTextStreamHandler(e, t)
    }
    unregisterTextStreamHandler(e) {
        return this.incomingDataStreamManager.unregisterTextStreamHandler(e)
    }
    registerByteStreamHandler(e, t) {
        return this.incomingDataStreamManager.registerByteStreamHandler(e, t)
    }
    unregisterByteStreamHandler(e) {
        return this.incomingDataStreamManager.unregisterByteStreamHandler(e)
    }
    registerRpcMethod(e, t) {
        if (this.rpcHandlers.has(e)) throw Error("RPC handler already registered for method ".concat(e, ", unregisterRpcMethod before trying to register again"));
        this.rpcHandlers.set(e, t)
    }
    unregisterRpcMethod(e) {
        this.rpcHandlers.delete(e)
    }
    setE2EEEnabled(e) {
        return b(this, void 0, void 0, function*() {
            if (this.e2eeManager) yield Promise.all([this.localParticipant.setE2EEEnabled(e)]), this.localParticipant.identity !== "" && this.e2eeManager.setParticipantCryptorEnabled(e, this.localParticipant.identity);
            else throw Error("e2ee not configured, please set e2ee settings within the room options")
        })
    }
    setupE2EE() {
        var e;
        const t = !!this.options.encryption,
            n = this.options.encryption || this.options.e2ee;
        n && ("e2eeManager" in n ? (this.e2eeManager = n.e2eeManager, this.e2eeManager.isDataChannelEncryptionEnabled = t) : this.e2eeManager = new Mm(n, t), this.e2eeManager.on(vt.ParticipantEncryptionStatusChanged, (s, r) => {
            bm(r) && (this.isE2EEEnabled = s), this.emit(U.ParticipantEncryptionStatusChanged, s, r)
        }), this.e2eeManager.on(vt.EncryptionError, (s, r) => {
            const a = r ? this.getParticipantByIdentity(r) : void 0;
            this.emit(U.EncryptionError, s, a)
        }), (e = this.e2eeManager) === null || e === void 0 || e.setup(this))
    }
    get logContext() {
        var e;
        return {
            room: this.name,
            roomID: (e = this.roomInfo) === null || e === void 0 ? void 0 : e.sid,
            participant: this.localParticipant.identity,
            pID: this.localParticipant.sid
        }
    }
    get isRecording() {
        var e, t;
        return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.activeRecording) !== null && t !== void 0 ? t : !1
    }
    getSid() {
        return this.state === re.Disconnected ? Ee.resolve("") : this.roomInfo && this.roomInfo.sid !== "" ? Ee.resolve(this.roomInfo.sid) : new Ee((e, t) => {
            const n = s => {
                s.sid !== "" && (this.engine.off(V.RoomUpdate, n), e(s.sid))
            };
            this.engine.on(V.RoomUpdate, n), this.once(U.Disconnected, () => {
                this.engine.off(V.RoomUpdate, n), t(new fe("Room disconnected before room server id was available"))
            })
        })
    }
    get name() {
        var e, t;
        return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.name) !== null && t !== void 0 ? t : ""
    }
    get metadata() {
        var e;
        return (e = this.roomInfo) === null || e === void 0 ? void 0 : e.metadata
    }
    get numParticipants() {
        var e, t;
        return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.numParticipants) !== null && t !== void 0 ? t : 0
    }
    get numPublishers() {
        var e, t;
        return (t = (e = this.roomInfo) === null || e === void 0 ? void 0 : e.numPublishers) !== null && t !== void 0 ? t : 0
    }
    maybeCreateEngine() {
        this.engine && !this.engine.isClosed || (this.engine = new Tf(this.options), this.engine.e2eeManager = this.e2eeManager, this.engine.on(V.ParticipantUpdate, this.handleParticipantUpdates).on(V.RoomUpdate, this.handleRoomUpdate).on(V.SpeakersChanged, this.handleSpeakersChanged).on(V.StreamStateChanged, this.handleStreamStateUpdate).on(V.ConnectionQualityUpdate, this.handleConnectionQualityUpdate).on(V.SubscriptionError, this.handleSubscriptionError).on(V.SubscriptionPermissionUpdate, this.handleSubscriptionPermissionUpdate).on(V.MediaTrackAdded, (e, t, n) => {
            this.onTrackAdded(e, t, n)
        }).on(V.Disconnected, e => {
            this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, e)
        }).on(V.ActiveSpeakersUpdate, this.handleActiveSpeakersUpdate).on(V.DataPacketReceived, this.handleDataPacket).on(V.Resuming, () => {
            this.clearConnectionReconcile(), this.isResuming = !0, this.log.info("Resuming signal connection", this.logContext), this.setAndEmitConnectionState(re.SignalReconnecting) && this.emit(U.SignalReconnecting)
        }).on(V.Resumed, () => {
            this.registerConnectionReconcile(), this.isResuming = !1, this.log.info("Resumed signal connection", this.logContext), this.updateSubscriptions(), this.emitBufferedEvents(), this.setAndEmitConnectionState(re.Connected) && this.emit(U.Reconnected)
        }).on(V.SignalResumed, () => {
            this.bufferedEvents = [], (this.state === re.Reconnecting || this.isResuming) && this.sendSyncState()
        }).on(V.Restarting, this.handleRestarting).on(V.SignalRestarted, this.handleSignalRestarted).on(V.Offline, () => {
            this.setAndEmitConnectionState(re.Reconnecting) && this.emit(U.Reconnecting)
        }).on(V.DCBufferStatusChanged, (e, t) => {
            this.emit(U.DCBufferStatusChanged, e, t)
        }).on(V.LocalTrackSubscribed, e => {
            const t = this.localParticipant.getTrackPublications().find(n => {
                let {
                    trackSid: s
                } = n;
                return s === e
            });
            if (!t) {
                this.log.warn("could not find local track subscription for subscribed event", this.logContext);
                return
            }
            this.localParticipant.emit(W.LocalTrackSubscribed, t), this.emitWhenConnected(U.LocalTrackSubscribed, t, this.localParticipant)
        }).on(V.RoomMoved, e => {
            this.log.debug("room moved", e), e.room && this.handleRoomUpdate(e.room), this.remoteParticipants.forEach((t, n) => {
                this.handleParticipantDisconnected(n, t)
            }), this.emit(U.Moved, e.room.name), e.participant ? this.handleParticipantUpdates([e.participant, ...e.otherParticipants]) : this.handleParticipantUpdates(e.otherParticipants)
        }), this.localParticipant && this.localParticipant.setupEngine(this.engine), this.e2eeManager && this.e2eeManager.setupEngine(this.engine), this.outgoingDataStreamManager && this.outgoingDataStreamManager.setupEngine(this.engine))
    }
    static getLocalDevices(e) {
        let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
        return Se.getInstance().getDevices(e, t)
    }
    prepareConnection(e, t) {
        return b(this, void 0, void 0, function*() {
            if (this.state === re.Disconnected) {
                this.log.debug("prepareConnection to ".concat(e), this.logContext);
                try {
                    if (zt(new URL(e)) && t) {
                        this.regionUrlProvider = new se(e, t);
                        const n = yield this.regionUrlProvider.getNextBestRegionUrl();
                        n && this.state === re.Disconnected && (this.regionUrl = n, yield fetch(bi(n), {
                            method: "HEAD"
                        }), this.log.debug("prepared connection to ".concat(n), this.logContext))
                    } else yield fetch(bi(e), {
                        method: "HEAD"
                    })
                } catch (n) {
                    this.log.warn("could not prepare connection", Object.assign(Object.assign({}, this.logContext), {
                        error: n
                    }))
                }
            }
        })
    }
    getParticipantByIdentity(e) {
        return this.localParticipant.identity === e ? this.localParticipant : this.remoteParticipants.get(e)
    }
    clearConnectionFutures() {
        this.connectFuture = void 0
    }
    simulateScenario(e, t) {
        return b(this, void 0, void 0, function*() {
            let n = () => b(this, void 0, void 0, function*() {}),
                s;
            switch (e) {
                case "signal-reconnect":
                    yield this.engine.client.handleOnClose("simulate disconnect");
                    break;
                case "speaker":
                    s = new ze({
                        scenario: {
                            case: "speakerUpdate",
                            value: 3
                        }
                    });
                    break;
                case "node-failure":
                    s = new ze({
                        scenario: {
                            case: "nodeFailure",
                            value: !0
                        }
                    });
                    break;
                case "server-leave":
                    s = new ze({
                        scenario: {
                            case: "serverLeave",
                            value: !0
                        }
                    });
                    break;
                case "migration":
                    s = new ze({
                        scenario: {
                            case: "migration",
                            value: !0
                        }
                    });
                    break;
                case "resume-reconnect":
                    this.engine.failNext(), yield this.engine.client.handleOnClose("simulate resume-disconnect");
                    break;
                case "disconnect-signal-on-resume":
                    n = () => b(this, void 0, void 0, function*() {
                        yield this.engine.client.handleOnClose("simulate resume-disconnect")
                    }), s = new ze({
                        scenario: {
                            case: "disconnectSignalOnResume",
                            value: !0
                        }
                    });
                    break;
                case "disconnect-signal-on-resume-no-messages":
                    n = () => b(this, void 0, void 0, function*() {
                        yield this.engine.client.handleOnClose("simulate resume-disconnect")
                    }), s = new ze({
                        scenario: {
                            case: "disconnectSignalOnResumeNoMessages",
                            value: !0
                        }
                    });
                    break;
                case "full-reconnect":
                    this.engine.fullReconnectOnNext = !0, yield this.engine.client.handleOnClose("simulate full-reconnect");
                    break;
                case "force-tcp":
                case "force-tls":
                    s = new ze({
                        scenario: {
                            case: "switchCandidateProtocol",
                            value: e === "force-tls" ? 2 : 1
                        }
                    }), n = () => b(this, void 0, void 0, function*() {
                        const r = this.engine.client.onLeave;
                        r && r(new cn({
                            reason: He.CLIENT_INITIATED,
                            action: qt.RECONNECT
                        }))
                    });
                    break;
                case "subscriber-bandwidth":
                    if (t === void 0 || typeof t != "number") throw new Error("subscriber-bandwidth requires a number as argument");
                    s = new ze({
                        scenario: {
                            case: "subscriberBandwidth",
                            value: Rt(t)
                        }
                    });
                    break;
                case "leave-full-reconnect":
                    s = new ze({
                        scenario: {
                            case: "leaveRequestFullReconnect",
                            value: !0
                        }
                    })
            }
            s && (yield this.engine.client.sendSimulateScenario(s), yield n())
        })
    }
    get canPlaybackAudio() {
        return this.audioEnabled
    }
    get canPlaybackVideo() {
        return !this.isVideoPlaybackBlocked
    }
    getActiveDevice(e) {
        return this.localParticipant.activeDeviceMap.get(e)
    }
    switchActiveDevice(e, t) {
        return b(this, arguments, void 0, function(n, s) {
            var r = this;
            let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !0;
            return function*() {
                var o, c, d, l, u, h, m;
                let f = !0,
                    p = !1;
                const _ = a ? {
                    exact: s
                } : s;
                if (n === "audioinput") {
                    p = r.localParticipant.audioTrackPublications.size === 0;
                    const w = (o = r.getActiveDevice(n)) !== null && o !== void 0 ? o : r.options.audioCaptureDefaults.deviceId;
                    r.options.audioCaptureDefaults.deviceId = _;
                    const k = Array.from(r.localParticipant.audioTrackPublications.values()).filter(y => y.source === O.Source.Microphone);
                    try {
                        f = (yield Promise.all(k.map(y => {
                            var S;
                            return (S = y.audioTrack) === null || S === void 0 ? void 0 : S.setDeviceId(_)
                        }))).every(y => y === !0)
                    } catch (y) {
                        throw r.options.audioCaptureDefaults.deviceId = w, y
                    }
                    const P = k.some(y => {
                        var S, E;
                        return (E = (S = y.track) === null || S === void 0 ? void 0 : S.isMuted) !== null && E !== void 0 ? E : !1
                    });
                    f && P && (p = !0)
                } else if (n === "videoinput") {
                    p = r.localParticipant.videoTrackPublications.size === 0;
                    const w = (c = r.getActiveDevice(n)) !== null && c !== void 0 ? c : r.options.videoCaptureDefaults.deviceId;
                    r.options.videoCaptureDefaults.deviceId = _;
                    const k = Array.from(r.localParticipant.videoTrackPublications.values()).filter(y => y.source === O.Source.Camera);
                    try {
                        f = (yield Promise.all(k.map(y => {
                            var S;
                            return (S = y.videoTrack) === null || S === void 0 ? void 0 : S.setDeviceId(_)
                        }))).every(y => y === !0)
                    } catch (y) {
                        throw r.options.videoCaptureDefaults.deviceId = w, y
                    }
                    const P = k.some(y => {
                        var S, E;
                        return (E = (S = y.track) === null || S === void 0 ? void 0 : S.isMuted) !== null && E !== void 0 ? E : !1
                    });
                    f && P && (p = !0)
                } else if (n === "audiooutput") {
                    if (p = !0, !cs() && !r.options.webAudioMix || r.options.webAudioMix && r.audioContext && !("setSinkId" in r.audioContext)) throw new Error("cannot switch audio output, the current browser does not support it");
                    r.options.webAudioMix && (s = (d = yield Se.getInstance().normalizeDeviceId("audiooutput", s)) !== null && d !== void 0 ? d : ""), (l = (m = r.options).audioOutput) !== null && l !== void 0 || (m.audioOutput = {});
                    const w = (u = r.getActiveDevice(n)) !== null && u !== void 0 ? u : r.options.audioOutput.deviceId;
                    r.options.audioOutput.deviceId = s;
                    try {
                        r.options.webAudioMix && ((h = r.audioContext) === null || h === void 0 || h.setSinkId(s)), yield Promise.all(Array.from(r.remoteParticipants.values()).map(k => k.setAudioOutput({
                            deviceId: s
                        })))
                    } catch (k) {
                        throw r.options.audioOutput.deviceId = w, k
                    }
                }
                return p && (r.localParticipant.activeDeviceMap.set(n, s), r.emit(U.ActiveDeviceChanged, n, s)), f
            }()
        })
    }
    setupLocalParticipantEvents() {
        this.localParticipant.on(W.ParticipantMetadataChanged, this.onLocalParticipantMetadataChanged).on(W.ParticipantNameChanged, this.onLocalParticipantNameChanged).on(W.AttributesChanged, this.onLocalAttributesChanged).on(W.TrackMuted, this.onLocalTrackMuted).on(W.TrackUnmuted, this.onLocalTrackUnmuted).on(W.LocalTrackPublished, this.onLocalTrackPublished).on(W.LocalTrackUnpublished, this.onLocalTrackUnpublished).on(W.ConnectionQualityChanged, this.onLocalConnectionQualityChanged).on(W.MediaDevicesError, this.onMediaDevicesError).on(W.AudioStreamAcquired, this.startAudio).on(W.ChatMessage, this.onLocalChatMessageSent).on(W.ParticipantPermissionsChanged, this.onLocalParticipantPermissionsChanged)
    }
    recreateEngine() {
        var e;
        (e = this.engine) === null || e === void 0 || e.close(), this.engine = void 0, this.isResuming = !1, this.remoteParticipants.clear(), this.sidToIdentity.clear(), this.bufferedEvents = [], this.maybeCreateEngine()
    }
    onTrackAdded(e, t, n) {
        if (this.state === re.Connecting || this.state === re.Reconnecting) {
            const u = () => {
                    this.log.debug("deferring on track for later", {
                        mediaTrackId: e.id,
                        mediaStreamId: t.id,
                        tracksInStream: t.getTracks().map(m => m.id)
                    }), this.onTrackAdded(e, t, n), h()
                },
                h = () => {
                    this.off(U.Reconnected, u), this.off(U.Connected, u), this.off(U.Disconnected, h)
                };
            this.once(U.Reconnected, u), this.once(U.Connected, u), this.once(U.Disconnected, h);
            return
        }
        if (this.state === re.Disconnected) {
            this.log.warn("skipping incoming track after Room disconnected", this.logContext);
            return
        }
        if (e.readyState === "ended") {
            this.log.info("skipping incoming track as it already ended", this.logContext);
            return
        }
        const s = nm(t.id),
            r = s[0];
        let a = s[1],
            o = e.id;
        if (a && a.startsWith("TR") && (o = a), r === this.localParticipant.sid) {
            this.log.warn("tried to create RemoteParticipant for local participant", this.logContext);
            return
        }
        const c = Array.from(this.remoteParticipants.values()).find(u => u.sid === r);
        if (!c) {
            this.log.error("Tried to add a track for a participant, that's not present. Sid: ".concat(r), this.logContext);
            return
        }
        if (!o.startsWith("TR")) {
            const u = this.engine.getTrackIdForReceiver(n);
            if (!u) {
                this.log.error("Tried to add a track whose 'sid' could not be found for a participant, that's not present. Sid: ".concat(r), this.logContext);
                return
            }
            o = u
        }
        o.startsWith("TR") || this.log.warn("Tried to add a track whose 'sid' could not be determined for a participant, that's not present. Sid: ".concat(r, ", streamId: ").concat(a, ", trackId: ").concat(o), Object.assign(Object.assign({}, this.logContext), {
            rpID: r,
            streamId: a,
            trackId: o
        }));
        let d;
        this.options.adaptiveStream && (typeof this.options.adaptiveStream == "object" ? d = this.options.adaptiveStream : d = {});
        const l = c.addSubscribedMediaTrack(e, o, t, n, d);
        l != null && l.isEncrypted && !this.e2eeManager && this.emit(U.EncryptionError, new Error("Encrypted ".concat(l.source, " track received from participant ").concat(c.sid, ", but room does not have encryption enabled!")))
    }
    handleDisconnect() {
        let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !0,
            t = arguments.length > 1 ? arguments[1] : void 0;
        var n, s;
        if (this.clearConnectionReconcile(), this.isResuming = !1, this.bufferedEvents = [], this.transcriptionReceivedTimes.clear(), this.incomingDataStreamManager.clearControllers(), this.state !== re.Disconnected) {
            this.regionUrl = void 0, this.regionUrlProvider && this.regionUrlProvider.notifyDisconnected();
            try {
                this.remoteParticipants.forEach(r => {
                    r.trackPublications.forEach(a => {
                        r.unpublishTrack(a.trackSid)
                    })
                }), this.localParticipant.trackPublications.forEach(r => {
                    var a, o, c;
                    r.track && this.localParticipant.unpublishTrack(r.track, e), e ? ((a = r.track) === null || a === void 0 || a.detach(), (o = r.track) === null || o === void 0 || o.stop()) : (c = r.track) === null || c === void 0 || c.stopMonitor()
                }), this.localParticipant.off(W.ParticipantMetadataChanged, this.onLocalParticipantMetadataChanged).off(W.ParticipantNameChanged, this.onLocalParticipantNameChanged).off(W.AttributesChanged, this.onLocalAttributesChanged).off(W.TrackMuted, this.onLocalTrackMuted).off(W.TrackUnmuted, this.onLocalTrackUnmuted).off(W.LocalTrackPublished, this.onLocalTrackPublished).off(W.LocalTrackUnpublished, this.onLocalTrackUnpublished).off(W.ConnectionQualityChanged, this.onLocalConnectionQualityChanged).off(W.MediaDevicesError, this.onMediaDevicesError).off(W.AudioStreamAcquired, this.startAudio).off(W.ChatMessage, this.onLocalChatMessageSent).off(W.ParticipantPermissionsChanged, this.onLocalParticipantPermissionsChanged), this.localParticipant.trackPublications.clear(), this.localParticipant.videoTrackPublications.clear(), this.localParticipant.audioTrackPublications.clear(), this.remoteParticipants.clear(), this.sidToIdentity.clear(), this.activeSpeakers = [], this.audioContext && typeof this.options.webAudioMix == "boolean" && (this.audioContext.close(), this.audioContext = void 0), Me() && (window.removeEventListener("beforeunload", this.onPageLeave), window.removeEventListener("pagehide", this.onPageLeave), window.removeEventListener("freeze", this.onPageLeave), (s = (n = navigator.mediaDevices) === null || n === void 0 ? void 0 : n.removeEventListener) === null || s === void 0 || s.call(n, "devicechange", this.handleDeviceChange))
            } finally {
                this.setAndEmitConnectionState(re.Disconnected), this.emit(U.Disconnected, t)
            }
        }
    }
    handleParticipantDisconnected(e, t) {
        var n;
        this.remoteParticipants.delete(e), t && (this.incomingDataStreamManager.validateParticipantHasNoActiveDataStreams(e), t.trackPublications.forEach(s => {
            t.unpublishTrack(s.trackSid, !0)
        }), this.emit(U.ParticipantDisconnected, t), t.setDisconnected(), (n = this.localParticipant) === null || n === void 0 || n.handleParticipantDisconnected(t.identity))
    }
    handleIncomingRpcRequest(e, t, n, s, r, a) {
        return b(this, void 0, void 0, function*() {
            if (yield this.engine.publishRpcAck(e, t), a !== 1) {
                yield this.engine.publishRpcResponse(e, t, null, me.builtIn("UNSUPPORTED_VERSION"));
                return
            }
            const o = this.rpcHandlers.get(n);
            if (!o) {
                yield this.engine.publishRpcResponse(e, t, null, me.builtIn("UNSUPPORTED_METHOD"));
                return
            }
            let c = null,
                d = null;
            try {
                const l = yield o({
                    requestId: t,
                    callerIdentity: e,
                    payload: s,
                    responseTimeout: r
                });
                $s(l) > Oc ? (c = me.builtIn("RESPONSE_PAYLOAD_TOO_LARGE"), this.log.warn("RPC Response payload too large for ".concat(n))) : d = l
            } catch (l) {
                l instanceof me ? c = l : (this.log.warn("Uncaught error returned by RPC handler for ".concat(n, ". Returning APPLICATION_ERROR instead."), l), c = me.builtIn("APPLICATION_ERROR"))
            }
            yield this.engine.publishRpcResponse(e, t, d, c)
        })
    }
    selectDefaultDevices() {
        return b(this, void 0, void 0, function*() {
            var e, t, n;
            const s = Se.getInstance().previousDevices,
                r = yield Se.getInstance().getDevices(void 0, !1), a = Oe();
            if ((a == null ? void 0 : a.name) === "Chrome" && a.os !== "iOS")
                for (let c of r) {
                    const d = s.find(l => l.deviceId === c.deviceId);
                    d && d.label !== "" && d.kind === c.kind && d.label !== c.label && this.getActiveDevice(c.kind) === "default" && this.emit(U.ActiveDeviceChanged, c.kind, c.deviceId)
                }
            const o = ["audiooutput", "audioinput", "videoinput"];
            for (let c of o) {
                const d = zh(c),
                    l = this.localParticipant.getTrackPublication(d);
                if (l && (!((e = l.track) === null || e === void 0) && e.isUserProvided)) continue;
                const u = r.filter(m => m.kind === c),
                    h = this.getActiveDevice(c);
                if (h === ((t = s.filter(m => m.kind === c)[0]) === null || t === void 0 ? void 0 : t.deviceId) && u.length > 0 && ((n = u[0]) === null || n === void 0 ? void 0 : n.deviceId) !== h) {
                    yield this.switchActiveDevice(c, u[0].deviceId);
                    continue
                }
                c === "audioinput" && !vi() || c === "videoinput" || u.length > 0 && !u.find(m => m.deviceId === this.getActiveDevice(c)) && (c !== "audiooutput" || !vi()) && (yield this.switchActiveDevice(c, u[0].deviceId))
            }
        })
    }
    acquireAudioContext() {
        return b(this, void 0, void 0, function*() {
            var e, t;
            if (typeof this.options.webAudioMix != "boolean" && this.options.webAudioMix.audioContext ? this.audioContext = this.options.webAudioMix.audioContext : (!this.audioContext || this.audioContext.state === "closed") && (this.audioContext = (e = Cc()) !== null && e !== void 0 ? e : void 0), this.options.webAudioMix && this.remoteParticipants.forEach(s => s.setAudioContext(this.audioContext)), this.localParticipant.setAudioContext(this.audioContext), this.audioContext && this.audioContext.state === "suspended") try {
                yield Promise.race([this.audioContext.resume(), Ce(200)])
            } catch (s) {
                this.log.warn("Could not resume audio context", Object.assign(Object.assign({}, this.logContext), {
                    error: s
                }))
            }
            const n = ((t = this.audioContext) === null || t === void 0 ? void 0 : t.state) === "running";
            n !== this.canPlaybackAudio && (this.audioEnabled = n, this.emit(U.AudioPlaybackStatusChanged, n))
        })
    }
    createParticipant(e, t) {
        var n;
        let s;
        return t ? s = Yi.fromParticipantInfo(this.engine.client, t, {
            loggerContextCb: () => this.logContext,
            loggerName: this.options.loggerName
        }) : s = new Yi(this.engine.client, "", e, void 0, void 0, void 0, {
            loggerContextCb: () => this.logContext,
            loggerName: this.options.loggerName
        }), this.options.webAudioMix && s.setAudioContext(this.audioContext), !((n = this.options.audioOutput) === null || n === void 0) && n.deviceId && s.setAudioOutput(this.options.audioOutput).catch(r => this.log.warn("Could not set audio output: ".concat(r.message), this.logContext)), s
    }
    getOrCreateParticipant(e, t) {
        if (this.remoteParticipants.has(e)) {
            const s = this.remoteParticipants.get(e);
            return t && s.updateInfo(t) && this.sidToIdentity.set(t.sid, t.identity), s
        }
        const n = this.createParticipant(e, t);
        return this.remoteParticipants.set(e, n), this.sidToIdentity.set(t.sid, t.identity), this.emitWhenConnected(U.ParticipantConnected, n), n.on(W.TrackPublished, s => {
            this.emitWhenConnected(U.TrackPublished, s, n)
        }).on(W.TrackSubscribed, (s, r) => {
            s.kind === O.Kind.Audio ? (s.on(B.AudioPlaybackStarted, this.handleAudioPlaybackStarted), s.on(B.AudioPlaybackFailed, this.handleAudioPlaybackFailed)) : s.kind === O.Kind.Video && (s.on(B.VideoPlaybackFailed, this.handleVideoPlaybackFailed), s.on(B.VideoPlaybackStarted, this.handleVideoPlaybackStarted)), this.emit(U.TrackSubscribed, s, r, n)
        }).on(W.TrackUnpublished, s => {
            this.emit(U.TrackUnpublished, s, n)
        }).on(W.TrackUnsubscribed, (s, r) => {
            this.emit(U.TrackUnsubscribed, s, r, n)
        }).on(W.TrackMuted, s => {
            this.emitWhenConnected(U.TrackMuted, s, n)
        }).on(W.TrackUnmuted, s => {
            this.emitWhenConnected(U.TrackUnmuted, s, n)
        }).on(W.ParticipantMetadataChanged, s => {
            this.emitWhenConnected(U.ParticipantMetadataChanged, s, n)
        }).on(W.ParticipantNameChanged, s => {
            this.emitWhenConnected(U.ParticipantNameChanged, s, n)
        }).on(W.AttributesChanged, s => {
            this.emitWhenConnected(U.ParticipantAttributesChanged, s, n)
        }).on(W.ConnectionQualityChanged, s => {
            this.emitWhenConnected(U.ConnectionQualityChanged, s, n)
        }).on(W.ParticipantPermissionsChanged, s => {
            this.emitWhenConnected(U.ParticipantPermissionsChanged, s, n)
        }).on(W.TrackSubscriptionStatusChanged, (s, r) => {
            this.emitWhenConnected(U.TrackSubscriptionStatusChanged, s, r, n)
        }).on(W.TrackSubscriptionFailed, (s, r) => {
            this.emit(U.TrackSubscriptionFailed, s, n, r)
        }).on(W.TrackSubscriptionPermissionChanged, (s, r) => {
            this.emitWhenConnected(U.TrackSubscriptionPermissionChanged, s, r, n)
        }).on(W.Active, () => {
            this.emitWhenConnected(U.ParticipantActive, n), n.kind === fi.AGENT && this.localParticipant.setActiveAgent(n)
        }), t && n.updateInfo(t), n
    }
    sendSyncState() {
        const e = Array.from(this.remoteParticipants.values()).reduce((n, s) => (n.push(...s.getTrackPublications()), n), []),
            t = this.localParticipant.getTrackPublications();
        this.engine.sendSyncState(e, t)
    }
    updateSubscriptions() {
        for (const e of this.remoteParticipants.values())
            for (const t of e.videoTrackPublications.values()) t.isSubscribed && vm(t) && t.emitTrackUpdate()
    }
    getRemoteParticipantBySid(e) {
        const t = this.sidToIdentity.get(e);
        if (t) return this.remoteParticipants.get(t)
    }
    registerConnectionReconcile() {
        this.clearConnectionReconcile();
        let e = 0;
        this.connectionReconcileInterval = Te.setInterval(() => {
            !this.engine || this.engine.isClosed || !this.engine.verifyTransport() ? (e++, this.log.warn("detected connection state mismatch", Object.assign(Object.assign({}, this.logContext), {
                numFailures: e,
                engine: this.engine ? {
                    closed: this.engine.isClosed,
                    transportsConnectedOrConnecting: this.engine.verifyTransport()
                } : void 0
            })), e >= 3 && (this.recreateEngine(), this.handleDisconnect(this.options.stopLocalTrackOnUnpublish, He.STATE_MISMATCH))) : e = 0
        }, Ff)
    }
    clearConnectionReconcile() {
        this.connectionReconcileInterval && Te.clearInterval(this.connectionReconcileInterval)
    }
    setAndEmitConnectionState(e) {
        return e === this.state ? !1 : (this.state = e, this.emit(U.ConnectionStateChanged, this.state), !0)
    }
    emitBufferedEvents() {
        this.bufferedEvents.forEach(e => {
            let [t, n] = e;
            this.emit(t, ...n)
        }), this.bufferedEvents = []
    }
    emitWhenConnected(e) {
        for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) n[s - 1] = arguments[s];
        if (this.state === re.Reconnecting || this.isResuming || !this.engine || this.engine.pendingReconnect) this.bufferedEvents.push([e, n]);
        else if (this.state === re.Connected) return this.emit(e, ...n);
        return !1
    }
    simulateParticipants(e) {
        return b(this, void 0, void 0, function*() {
            var t, n, s, r;
            const a = Object.assign({
                    audio: !0,
                    video: !0,
                    useRealTracks: !1
                }, e.publish),
                o = Object.assign({
                    count: 9,
                    audio: !1,
                    video: !0,
                    aspectRatios: [1.66, 1.7, 1.3]
                }, e.participants);
            if (this.handleDisconnect(), this.roomInfo = new sn({
                    sid: "RM_SIMULATED",
                    name: "simulated-room",
                    emptyTimeout: 0,
                    maxParticipants: 0,
                    creationTime: de.parse(new Date().getTime()),
                    metadata: "",
                    numParticipants: 1,
                    numPublishers: 1,
                    turnPassword: "",
                    enabledCodecs: [],
                    activeRecording: !1
                }), this.localParticipant.updateInfo(new Mt({
                    identity: "simulated-local",
                    name: "local-name"
                })), this.setupLocalParticipantEvents(), this.emit(U.SignalConnected), this.emit(U.Connected), this.setAndEmitConnectionState(re.Connected), a.video) {
                const c = new ps(O.Kind.Video, new jt({
                    source: ye.CAMERA,
                    sid: Math.floor(Math.random() * 1e4).toString(),
                    type: Ve.AUDIO,
                    name: "video-dummy"
                }), new Qi(a.useRealTracks && (!((t = window.navigator.mediaDevices) === null || t === void 0) && t.getUserMedia) ? (yield window.navigator.mediaDevices.getUserMedia({
                    video: !0
                })).getVideoTracks()[0] : eo(160 * ((n = o.aspectRatios[0]) !== null && n !== void 0 ? n : 1), 160, !0, !0), void 0, !1, {
                    loggerName: this.options.loggerName,
                    loggerContextCb: () => this.logContext
                }), {
                    loggerName: this.options.loggerName,
                    loggerContextCb: () => this.logContext
                });
                this.localParticipant.addTrackPublication(c), this.localParticipant.emit(W.LocalTrackPublished, c)
            }
            if (a.audio) {
                const c = new ps(O.Kind.Audio, new jt({
                    source: ye.MICROPHONE,
                    sid: Math.floor(Math.random() * 1e4).toString(),
                    type: Ve.AUDIO
                }), new $i(a.useRealTracks && (!((s = navigator.mediaDevices) === null || s === void 0) && s.getUserMedia) ? (yield navigator.mediaDevices.getUserMedia({
                    audio: !0
                })).getAudioTracks()[0] : wn(), void 0, !1, this.audioContext, {
                    loggerName: this.options.loggerName,
                    loggerContextCb: () => this.logContext
                }), {
                    loggerName: this.options.loggerName,
                    loggerContextCb: () => this.logContext
                });
                this.localParticipant.addTrackPublication(c), this.localParticipant.emit(W.LocalTrackPublished, c)
            }
            for (let c = 0; c < o.count - 1; c += 1) {
                let d = new Mt({
                    sid: Math.floor(Math.random() * 1e4).toString(),
                    identity: "simulated-".concat(c),
                    state: Vt.ACTIVE,
                    tracks: [],
                    joinedAt: de.parse(Date.now())
                });
                const l = this.getOrCreateParticipant(d.identity, d);
                if (o.video) {
                    const u = eo(160 * ((r = o.aspectRatios[c % o.aspectRatios.length]) !== null && r !== void 0 ? r : 1), 160, !1, !0),
                        h = new jt({
                            source: ye.CAMERA,
                            sid: Math.floor(Math.random() * 1e4).toString(),
                            type: Ve.AUDIO
                        });
                    l.addSubscribedMediaTrack(u, h.sid, new MediaStream([u]), new RTCRtpReceiver), d.tracks = [...d.tracks, h]
                }
                if (o.audio) {
                    const u = wn(),
                        h = new jt({
                            source: ye.MICROPHONE,
                            sid: Math.floor(Math.random() * 1e4).toString(),
                            type: Ve.AUDIO
                        });
                    l.addSubscribedMediaTrack(u, h.sid, new MediaStream([u]), new RTCRtpReceiver), d.tracks = [...d.tracks, h]
                }
                l.updateInfo(d)
            }
        })
    }
    emit(e) {
        for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++) n[s - 1] = arguments[s];
        if (e !== U.ActiveSpeakersChanged && e !== U.TranscriptionReceived) {
            const r = Bc(n).filter(a => a !== void 0);
            (e === U.TrackSubscribed || e === U.TrackUnsubscribed) && this.log.trace("subscribe trace: ".concat(e), Object.assign(Object.assign({}, this.logContext), {
                event: e,
                args: r
            })), this.log.debug("room event ".concat(e), Object.assign(Object.assign({}, this.logContext), {
                event: e,
                args: r
            }))
        }
        return super.emit(e, ...n)
    }
}
$t.cleanupRegistry = typeof FinalizationRegistry < "u" && new FinalizationRegistry(i => {
    i()
});

