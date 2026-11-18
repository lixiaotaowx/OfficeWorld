class Uf extends Fc {
    constructor(e, t, n, s, r, a) {
        super(e, t, void 0, void 0, void 0, {
            loggerName: s.loggerName,
            loggerContextCb: () => this.engine.logContext
        }), this.pendingPublishing = new Set, this.pendingPublishPromises = new Map, this.participantTrackPermissions = [], this.allParticipantsAllowedToSubscribe = !0, this.encryptionType = ge.NONE, this.enabledPublishVideoCodecs = [], this.pendingAcks = new Map, this.pendingResponses = new Map, this.handleReconnecting = () => {
            this.reconnectFuture || (this.reconnectFuture = new Le)
        }, this.handleReconnected = () => {
            var o, c;
            (c = (o = this.reconnectFuture) === null || o === void 0 ? void 0 : o.resolve) === null || c === void 0 || c.call(o), this.reconnectFuture = void 0, this.updateTrackSubscriptionPermissions()
        }, this.handleClosing = () => {
            var o, c, d, l, u, h;
            this.reconnectFuture && (this.reconnectFuture.promise.catch(m => this.log.warn(m.message, this.logContext)), (c = (o = this.reconnectFuture) === null || o === void 0 ? void 0 : o.reject) === null || c === void 0 || c.call(o, new Error("Got disconnected during reconnection attempt")), this.reconnectFuture = void 0), this.signalConnectedFuture && ((l = (d = this.signalConnectedFuture).reject) === null || l === void 0 || l.call(d, new Error("Got disconnected without signal connected")), this.signalConnectedFuture = void 0), (h = (u = this.activeAgentFuture) === null || u === void 0 ? void 0 : u.reject) === null || h === void 0 || h.call(u, new Error("Got disconnected without active agent present")), this.activeAgentFuture = void 0, this.firstActiveAgent = void 0
        }, this.handleSignalConnected = o => {
            var c, d;
            o.participant && this.updateInfo(o.participant), this.signalConnectedFuture || (this.signalConnectedFuture = new Le), (d = (c = this.signalConnectedFuture).resolve) === null || d === void 0 || d.call(c)
        }, this.handleSignalRequestResponse = o => {
            const {
                requestId: c,
                reason: d,
                message: l
            } = o, u = this.pendingSignalRequests.get(c);
            u && (d !== js.OK && u.reject(new Gr(l, d)), this.pendingSignalRequests.delete(c))
        }, this.handleDataPacket = o => {
            switch (o.value.case) {
                case "rpcResponse":
                    let c = o.value.value,
                        d = null,
                        l = null;
                    c.value.case === "payload" ? d = c.value.value : c.value.case === "error" && (l = me.fromProto(c.value.value)), this.handleIncomingRpcResponse(c.requestId, d, l);
                    break;
                case "rpcAck":
                    let u = o.value.value;
                    this.handleIncomingRpcAck(u.requestId);
                    break
            }
        }, this.updateTrackSubscriptionPermissions = () => {
            this.log.debug("updating track subscription permissions", Object.assign(Object.assign({}, this.logContext), {
                allParticipantsAllowed: this.allParticipantsAllowedToSubscribe,
                participantTrackPermissions: this.participantTrackPermissions
            })), this.engine.client.sendUpdateSubscriptionPermissions(this.allParticipantsAllowedToSubscribe, this.participantTrackPermissions.map(o => Lf(o)))
        }, this.onTrackUnmuted = o => {
            this.onTrackMuted(o, o.isUpstreamPaused)
        }, this.onTrackMuted = (o, c) => {
            if (c === void 0 && (c = !0), !o.sid) {
                this.log.error("could not update mute status for unpublished track", Object.assign(Object.assign({}, this.logContext), te(o)));
                return
            }
            this.engine.updateMuteStatus(o.sid, c)
        }, this.onTrackUpstreamPaused = o => {
            this.log.debug("upstream paused", Object.assign(Object.assign({}, this.logContext), te(o))), this.onTrackMuted(o, !0)
        }, this.onTrackUpstreamResumed = o => {
            this.log.debug("upstream resumed", Object.assign(Object.assign({}, this.logContext), te(o))), this.onTrackMuted(o, o.isMuted)
        }, this.onTrackFeatureUpdate = o => {
            const c = this.audioTrackPublications.get(o.sid);
            if (!c) {
                this.log.warn("Could not update local audio track settings, missing publication for track ".concat(o.sid), this.logContext);
                return
            }
            this.engine.client.sendUpdateLocalAudioTrack(c.trackSid, c.getTrackFeatures())
        }, this.onTrackCpuConstrained = (o, c) => {
            this.log.debug("track cpu constrained", Object.assign(Object.assign({}, this.logContext), te(c))), this.emit(W.LocalTrackCpuConstrained, o, c)
        }, this.handleSubscribedQualityUpdate = o => b(this, void 0, void 0, function*() {
            var c, d, l, u, h;
            if (!(!((h = this.roomOptions) === null || h === void 0) && h.dynacast)) return;
            const m = this.videoTrackPublications.get(o.trackSid);
            if (!m) {
                this.log.warn("received subscribed quality update for unknown track", Object.assign(Object.assign({}, this.logContext), {
                    trackSid: o.trackSid
                }));
                return
            }
            if (!m.videoTrack) return;
            const f = yield m.videoTrack.setPublishingCodecs(o.subscribedCodecs);
            try {
                for (var p = !0, _ = at(f), w; w = yield _.next(), c = w.done, !c; p = !0) {
                    u = w.value, p = !1;
                    const k = u;
                    Jh(k) && (this.log.debug("publish ".concat(k, " for ").concat(m.videoTrack.sid), Object.assign(Object.assign({}, this.logContext), te(m))), yield this.publishAdditionalCodecForTrack(m.videoTrack, k, m.options))
                }
            } catch (k) {
                d = {
                    error: k
                }
            } finally {
                try {
                    !p && !c && (l = _.return) && (yield l.call(_))
                } finally {
                    if (d) throw d.error
                }
            }
        }), this.handleLocalTrackUnpublished = o => {
            const c = this.trackPublications.get(o.trackSid);
            if (!c) {
                this.log.warn("received unpublished event for unknown track", Object.assign(Object.assign({}, this.logContext), {
                    trackSid: o.trackSid
                }));
                return
            }
            this.unpublishTrack(c.track)
        }, this.handleTrackEnded = o => b(this, void 0, void 0, function*() {
            if (o.source === O.Source.ScreenShare || o.source === O.Source.ScreenShareAudio) this.log.debug("unpublishing local track due to TrackEnded", Object.assign(Object.assign({}, this.logContext), te(o))), this.unpublishTrack(o);
            else if (o.isUserProvided) yield o.mute();
            else if (it(o) || ht(o)) try {
                if (Me()) try {
                    const c = yield navigator == null ? void 0 : navigator.permissions.query({
                        name: o.source === O.Source.Camera ? "camera" : "microphone"
                    });
                    if (c && c.state === "denied") throw this.log.warn("user has revoked access to ".concat(o.source), Object.assign(Object.assign({}, this.logContext), te(o))), c.onchange = () => {
                        c.state !== "denied" && (o.isMuted || o.restartTrack(), c.onchange = null)
                    }, new Error("GetUserMedia Permission denied")
                } catch {}
                o.isMuted || (this.log.debug("track ended, attempting to use a different device", Object.assign(Object.assign({}, this.logContext), te(o))), it(o) ? yield o.restartTrack({
                    deviceId: "default"
                }): yield o.restartTrack())
            } catch {
                this.log.warn("could not restart track, muting instead", Object.assign(Object.assign({}, this.logContext), te(o))), yield o.mute()
            }
        }), this.audioTrackPublications = new Map, this.videoTrackPublications = new Map, this.trackPublications = new Map, this.engine = n, this.roomOptions = s, this.setupEngine(n), this.activeDeviceMap = new Map([
            ["audioinput", "default"],
            ["videoinput", "default"],
            ["audiooutput", "default"]
        ]), this.pendingSignalRequests = new Map, this.rpcHandlers = r, this.roomOutgoingDataStreamManager = a
    }
    get lastCameraError() {
        return this.cameraError
    }
    get lastMicrophoneError() {
        return this.microphoneError
    }
    get isE2EEEnabled() {
        return this.encryptionType !== ge.NONE
    }
    getTrackPublication(e) {
        const t = super.getTrackPublication(e);
        if (t) return t
    }
    getTrackPublicationByName(e) {
        const t = super.getTrackPublicationByName(e);
        if (t) return t
    }
    setupEngine(e) {
        var t;
        this.engine = e, this.engine.on(V.RemoteMute, (n, s) => {
            const r = this.trackPublications.get(n);
            !r || !r.track || (s ? r.mute() : r.unmute())
        }), !((t = this.signalConnectedFuture) === null || t === void 0) && t.isResolved && (this.signalConnectedFuture = void 0), this.engine.on(V.Connected, this.handleReconnected).on(V.SignalConnected, this.handleSignalConnected).on(V.SignalRestarted, this.handleReconnected).on(V.SignalResumed, this.handleReconnected).on(V.Restarting, this.handleReconnecting).on(V.Resuming, this.handleReconnecting).on(V.LocalTrackUnpublished, this.handleLocalTrackUnpublished).on(V.SubscribedQualityUpdate, this.handleSubscribedQualityUpdate).on(V.Closing, this.handleClosing).on(V.SignalRequestResponse, this.handleSignalRequestResponse).on(V.DataPacketReceived, this.handleDataPacket)
    }
    setMetadata(e) {
        return b(this, void 0, void 0, function*() {
            yield this.requestMetadataUpdate({
                metadata: e
            })
        })
    }
    setName(e) {
        return b(this, void 0, void 0, function*() {
            yield this.requestMetadataUpdate({
                name: e
            })
        })
    }
    setAttributes(e) {
        return b(this, void 0, void 0, function*() {
            yield this.requestMetadataUpdate({
                attributes: e
            })
        })
    }
    requestMetadataUpdate(e) {
        return b(this, arguments, void 0, function(t) {
            var n = this;
            let {
                metadata: s,
                name: r,
                attributes: a
            } = t;
            return function*() {
                return new Ee((o, c) => b(n, void 0, void 0, function*() {
                    var d, l;
                    try {
                        let u = !1;
                        const h = yield this.engine.client.sendUpdateLocalMetadata((d = s ?? this.metadata) !== null && d !== void 0 ? d : "", (l = r ?? this.name) !== null && l !== void 0 ? l : "", a), m = performance.now();
                        for (this.pendingSignalRequests.set(h, {
                                resolve: o,
                                reject: f => {
                                    c(f), u = !0
                                },
                                values: {
                                    name: r,
                                    metadata: s,
                                    attributes: a
                                }
                            }); performance.now() - m < 5e3 && !u;) {
                            if ((!r || this.name === r) && (!s || this.metadata === s) && (!a || Object.entries(a).every(f => {
                                    let [p, _] = f;
                                    return this.attributes[p] === _ || _ === "" && !this.attributes[p]
                                }))) {
                                this.pendingSignalRequests.delete(h), o();
                                return
                            }
                            yield Ce(50)
                        }
                        c(new Gr("Request to update local metadata timed out", "TimeoutError"))
                    } catch (u) {
                        u instanceof Error ? c(u) : c(new Error(String(u)))
                    }
                }))
            }()
        })
    }
    setCameraEnabled(e, t, n) {
        return this.setTrackEnabled(O.Source.Camera, e, t, n)
    }
    setMicrophoneEnabled(e, t, n) {
        return this.setTrackEnabled(O.Source.Microphone, e, t, n)
    }
    setScreenShareEnabled(e, t, n) {
        return this.setTrackEnabled(O.Source.ScreenShare, e, t, n)
    }
    setE2EEEnabled(e) {
        return b(this, void 0, void 0, function*() {
            this.encryptionType = e ? ge.GCM : ge.NONE, yield this.republishAllTracks(void 0, !1)
        })
    }
    setTrackEnabled(e, t, n, s) {
        return b(this, void 0, void 0, function*() {
            var r, a;
            this.log.debug("setTrackEnabled", Object.assign(Object.assign({}, this.logContext), {
                source: e,
                enabled: t
            })), this.republishPromise && (yield this.republishPromise);
            let o = this.getTrackPublication(e);
            if (t)
                if (o) yield o.unmute();
                else {
                    let c;
                    if (this.pendingPublishing.has(e)) {
                        const d = yield this.waitForPendingPublicationOfSource(e);
                        return d || this.log.info("waiting for pending publication promise timed out", Object.assign(Object.assign({}, this.logContext), {
                            source: e
                        })), yield d == null ? void 0 : d.unmute(), d
                    }
                    this.pendingPublishing.add(e);
                    try {
                        switch (e) {
                            case O.Source.Camera:
                                c = yield this.createTracks({
                                    video: (r = n) !== null && r !== void 0 ? r : !0
                                });
                                break;
                            case O.Source.Microphone:
                                c = yield this.createTracks({
                                    audio: (a = n) !== null && a !== void 0 ? a : !0
                                });
                                break;
                            case O.Source.ScreenShare:
                                c = yield this.createScreenTracks(Object.assign({}, n));
                                break;
                            default:
                                throw new ct(e)
                        }
                    } catch (d) {
                        throw c == null || c.forEach(l => {
                            l.stop()
                        }), d instanceof Error && this.emit(W.MediaDevicesError, d, rs(e)), this.pendingPublishing.delete(e), d
                    }
                    for (const d of c) {
                        const l = Object.assign(Object.assign({}, this.roomOptions.publishDefaults), n);
                        e === O.Source.Microphone && Qe(d) && l.preConnectBuffer && (this.log.info("starting preconnect buffer for microphone", Object.assign({}, this.logContext)), d.startPreConnectBuffer())
                    }
                    try {
                        const d = [];
                        for (const u of c) this.log.info("publishing track", Object.assign(Object.assign({}, this.logContext), te(u))), d.push(this.publishTrack(u, s));
                        [o] = yield Promise.all(d)
                    } catch (d) {
                        throw c == null || c.forEach(l => {
                            l.stop()
                        }), d
                    } finally {
                        this.pendingPublishing.delete(e)
                    }
                }
            else if (!(o != null && o.track) && this.pendingPublishing.has(e) && (o = yield this.waitForPendingPublicationOfSource(e), o || this.log.info("waiting for pending publication promise timed out", Object.assign(Object.assign({}, this.logContext), {
                    source: e
                }))), o && o.track)
                if (e === O.Source.ScreenShare) {
                    o = yield this.unpublishTrack(o.track);
                    const c = this.getTrackPublication(O.Source.ScreenShareAudio);
                    c && c.track && this.unpublishTrack(c.track)
                } else yield o.mute();
            return o
        })
    }
    enableCameraAndMicrophone() {
        return b(this, void 0, void 0, function*() {
            if (!(this.pendingPublishing.has(O.Source.Camera) || this.pendingPublishing.has(O.Source.Microphone))) {
                this.pendingPublishing.add(O.Source.Camera), this.pendingPublishing.add(O.Source.Microphone);
                try {
                    const e = yield this.createTracks({
                        audio: !0,
                        video: !0
                    });
                    yield Promise.all(e.map(t => this.publishTrack(t)))
                } finally {
                    this.pendingPublishing.delete(O.Source.Camera), this.pendingPublishing.delete(O.Source.Microphone)
                }
            }
        })
    }
    createTracks(e) {
        return b(this, void 0, void 0, function*() {
            var t, n;
            e ?? (e = {});
            const s = Sc(e, (t = this.roomOptions) === null || t === void 0 ? void 0 : t.audioCaptureDefaults, (n = this.roomOptions) === null || n === void 0 ? void 0 : n.videoCaptureDefaults);
            try {
                return (yield hn(s, {
                    loggerName: this.roomOptions.loggerName,
                    loggerContextCb: () => this.logContext
                })).map(o => (Qe(o) && (this.microphoneError = void 0, o.setAudioContext(this.audioContext), o.source = O.Source.Microphone, this.emit(W.AudioStreamAcquired)), Ct(o) && (this.cameraError = void 0, o.source = O.Source.Camera), o))
            } catch (r) {
                throw r instanceof Error && (e.audio && (this.microphoneError = r), e.video && (this.cameraError = r)), r
            }
        })
    }
    createScreenTracks(e) {
        return b(this, void 0, void 0, function*() {
            if (e === void 0 && (e = {}), navigator.mediaDevices.getDisplayMedia === void 0) throw new Vs("getDisplayMedia not supported");
            e.resolution === void 0 && !am() && (e.resolution = ln.h1080fps30.resolution);
            const t = $h(e),
                n = yield navigator.mediaDevices.getDisplayMedia(t), s = n.getVideoTracks();
            if (s.length === 0) throw new ct("no video track found");
            const r = new Qi(s[0], void 0, !1, {
                loggerName: this.roomOptions.loggerName,
                loggerContextCb: () => this.logContext
            });
            r.source = O.Source.ScreenShare, e.contentHint && (r.mediaStreamTrack.contentHint = e.contentHint);
            const a = [r];
            if (n.getAudioTracks().length > 0) {
                this.emit(W.AudioStreamAcquired);
                const o = new $i(n.getAudioTracks()[0], void 0, !1, this.audioContext, {
                    loggerName: this.roomOptions.loggerName,
                    loggerContextCb: () => this.logContext
                });
                o.source = O.Source.ScreenShareAudio, a.push(o)
            }
            return a
        })
    }
    publishTrack(e, t) {
        return b(this, void 0, void 0, function*() {
            return this.publishOrRepublishTrack(e, t)
        })
    }
    publishOrRepublishTrack(e, t) {
        return b(this, arguments, void 0, function(n, s) {
            var r = this;
            let a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : !1;
            return function*() {
                var o, c, d, l;
                it(n) && n.setAudioContext(r.audioContext), yield(o = r.reconnectFuture) === null || o === void 0 ? void 0 : o.promise, r.republishPromise && !a && (yield r.republishPromise), Kt(n) && r.pendingPublishPromises.has(n) && (yield r.pendingPublishPromises.get(n));
                let u;
                if (n instanceof MediaStreamTrack) u = n.getConstraints();
                else {
                    u = n.constraints;
                    let w;
                    switch (n.source) {
                        case O.Source.Microphone:
                            w = "audioinput";
                            break;
                        case O.Source.Camera:
                            w = "videoinput"
                    }
                    w && r.activeDeviceMap.has(w) && (u = Object.assign(Object.assign({}, u), {
                        deviceId: r.activeDeviceMap.get(w)
                    }))
                }
                if (n instanceof MediaStreamTrack) switch (n.kind) {
                    case "audio":
                        n = new $i(n, u, !0, r.audioContext, {
                            loggerName: r.roomOptions.loggerName,
                            loggerContextCb: () => r.logContext
                        });
                        break;
                    case "video":
                        n = new Qi(n, u, !0, {
                            loggerName: r.roomOptions.loggerName,
                            loggerContextCb: () => r.logContext
                        });
                        break;
                    default:
                        throw new ct("unsupported MediaStreamTrack kind ".concat(n.kind))
                } else n.updateLoggerOptions({
                    loggerName: r.roomOptions.loggerName,
                    loggerContextCb: () => r.logContext
                });
                let h;
                if (r.trackPublications.forEach(w => {
                        w.track && w.track === n && (h = w)
                    }), h) return r.log.warn("track has already been published, skipping", Object.assign(Object.assign({}, r.logContext), te(h))), h;
                const m = Object.assign(Object.assign({}, r.roomOptions.publishDefaults), s),
                    f = "channelCount" in n.mediaStreamTrack.getSettings() && n.mediaStreamTrack.getSettings().channelCount === 2 || n.mediaStreamTrack.getConstraints().channelCount === 2,
                    p = (c = m.forceStereo) !== null && c !== void 0 ? c : f;
                p && (m.dtx === void 0 && r.log.info("Opus DTX will be disabled for stereo tracks by default. Enable them explicitly to make it work.", Object.assign(Object.assign({}, r.logContext), te(n))), m.red === void 0 && r.log.info("Opus RED will be disabled for stereo tracks by default. Enable them explicitly to make it work."), (d = m.dtx) !== null && d !== void 0 || (m.dtx = !1), (l = m.red) !== null && l !== void 0 || (m.red = !1)), !dm() && r.roomOptions.e2ee && (r.log.info("End-to-end encryption is set up, simulcast publishing will be disabled on Safari versions and iOS browsers running iOS < v17.2", Object.assign({}, r.logContext)), m.simulcast = !1), m.source && (n.source = m.source);
                const _ = new Promise((w, k) => b(r, void 0, void 0, function*() {
                    try {
                        if (this.engine.client.currentState !== ae.CONNECTED) {
                            this.log.debug("deferring track publication until signal is connected", Object.assign(Object.assign({}, this.logContext), {
                                track: te(n)
                            }));
                            let P = !1;
                            const y = setTimeout(() => {
                                P = !0, n.stop(), k(new Kr("publishing rejected as engine not connected within timeout", 408))
                            }, 15e3);
                            if (yield this.waitUntilEngineConnected(), clearTimeout(y), P) return;
                            const S = yield this.publish(n, m, p);
                            w(S)
                        } else try {
                            const P = yield this.publish(n, m, p);
                            w(P)
                        } catch (P) {
                            k(P)
                        }
                    } catch (P) {
                        k(P)
                    }
                }));
                r.pendingPublishPromises.set(n, _);
                try {
                    return yield _
                } catch (w) {
                    throw w
                } finally {
                    r.pendingPublishPromises.delete(n)
                }
            }()
        })
    }
    waitUntilEngineConnected() {
        return this.signalConnectedFuture || (this.signalConnectedFuture = new Le), this.signalConnectedFuture.promise
    }
    hasPermissionsToPublish(e) {
        if (!this.permissions) return this.log.warn("no permissions present for publishing track", Object.assign(Object.assign({}, this.logContext), te(e))), !1;
        const {
            canPublish: t,
            canPublishSources: n
        } = this.permissions;
        return t && (n.length === 0 || n.map(s => Zh(s)).includes(e.source)) ? !0 : (this.log.warn("insufficient permissions to publish", Object.assign(Object.assign({}, this.logContext), te(e))), !1)
    }
    publish(e, t, n) {
        return b(this, void 0, void 0, function*() {
            var s, r, a, o, c, d, l, u, h, m;
            if (!this.hasPermissionsToPublish(e)) throw new Kr("failed to publish track, insufficient permissions", 403);
            Array.from(this.trackPublications.values()).find(C => Kt(e) && C.source === e.source) && e.source !== O.Source.Unknown && this.log.info("publishing a second track with the same source: ".concat(e.source), Object.assign(Object.assign({}, this.logContext), te(e))), t.stopMicTrackOnMute && Qe(e) && (e.stopOnMute = !0), e.source === O.Source.ScreenShare && Ot() && (t.simulcast = !1), t.videoCodec === "av1" && !sm() && (t.videoCodec = void 0), t.videoCodec === "vp9" && !rm() && (t.videoCodec = void 0), t.videoCodec === void 0 && (t.videoCodec = us), this.enabledPublishVideoCodecs.length > 0 && (this.enabledPublishVideoCodecs.some(C => t.videoCodec === li(C.mime)) || (t.videoCodec = li(this.enabledPublishVideoCodecs[0].mime)));
            const p = t.videoCodec;
            e.on(B.Muted, this.onTrackMuted), e.on(B.Unmuted, this.onTrackUnmuted), e.on(B.Ended, this.handleTrackEnded), e.on(B.UpstreamPaused, this.onTrackUpstreamPaused), e.on(B.UpstreamResumed, this.onTrackUpstreamResumed), e.on(B.AudioTrackFeatureUpdate, this.onTrackFeatureUpdate);
            const _ = [],
                w = !(!((s = t.dtx) !== null && s !== void 0) || s),
                k = e.getSourceTrackSettings();
            k.autoGainControl && _.push(ke.TF_AUTO_GAIN_CONTROL), k.echoCancellation && _.push(ke.TF_ECHO_CANCELLATION), k.noiseSuppression && _.push(ke.TF_NOISE_SUPPRESSION), k.channelCount && k.channelCount > 1 && _.push(ke.TF_STEREO), w && _.push(ke.TF_NO_DTX), it(e) && e.hasPreConnectBuffer && _.push(ke.TF_PRECONNECT_BUFFER);
            const P = new pi({
                cid: e.mediaStreamTrack.id,
                name: t.name,
                type: O.kindToProto(e.kind),
                muted: e.isMuted,
                source: O.sourceToProto(e.source),
                disableDtx: w,
                encryption: this.encryptionType,
                stereo: n,
                disableRed: this.isE2EEEnabled || !(!((r = t.red) !== null && r !== void 0) || r),
                stream: t == null ? void 0 : t.stream,
                backupCodecPolicy: t == null ? void 0 : t.backupCodecPolicy,
                audioFeatures: _
            });
            let y;
            if (e.kind === O.Kind.Video) {
                let C = {
                    width: 0,
                    height: 0
                };
                try {
                    C = yield e.waitForDimensions()
                } catch {
                    const g = (o = (a = this.roomOptions.videoCaptureDefaults) === null || a === void 0 ? void 0 : a.resolution) !== null && o !== void 0 ? o : gi.h720.resolution;
                    C = {
                        width: g.width,
                        height: g.height
                    }, this.log.error("could not determine track dimensions, using defaults", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
                        dims: C
                    }))
                }
                P.width = C.width, P.height = C.height, ht(e) && (We(p) && (e.source === O.Source.ScreenShare && (t.scalabilityMode = "L1T3", "contentHint" in e.mediaStreamTrack && (e.mediaStreamTrack.contentHint = "motion", this.log.info("forcing contentHint to motion for screenshare with SVC codecs", Object.assign(Object.assign({}, this.logContext), te(e))))), t.scalabilityMode = (c = t.scalabilityMode) !== null && c !== void 0 ? c : "L3T3_KEY"), P.simulcastCodecs = [new Jn({
                    codec: p,
                    cid: e.mediaStreamTrack.id
                })], t.backupCodec === !0 && (t.backupCodec = {
                    codec: us
                }), t.backupCodec && p !== t.backupCodec.codec && P.encryption === ge.NONE && (this.roomOptions.dynacast || (this.roomOptions.dynacast = !0), P.simulcastCodecs.push(new Jn({
                    codec: t.backupCodec.codec,
                    cid: ""
                })))), y = ms(e.source === O.Source.ScreenShare, P.width, P.height, t), P.layers = ko(P.width, P.height, y, We(t.videoCodec))
            } else e.kind === O.Kind.Audio && (y = [{
                maxBitrate: (d = t.audioPreset) === null || d === void 0 ? void 0 : d.maxBitrate,
                priority: (u = (l = t.audioPreset) === null || l === void 0 ? void 0 : l.priority) !== null && u !== void 0 ? u : "high",
                networkPriority: (m = (h = t.audioPreset) === null || h === void 0 ? void 0 : h.priority) !== null && m !== void 0 ? m : "high"
            }]);
            if (!this.engine || this.engine.isClosed) throw new fe("cannot publish track when not connected");
            const S = () => b(this, void 0, void 0, function*() {
                var C, M, g;
                if (!this.engine.pcManager) throw new fe("pcManager is not ready");
                if (e.sender = yield this.engine.createSender(e, t, y), this.emit(W.LocalSenderCreated, e.sender, e), ht(e) && ((C = t.degradationPreference) !== null && C !== void 0 || (t.degradationPreference = gf(e)), e.setDegradationPreference(t.degradationPreference)), y)
                    if (Ot() && e.kind === O.Kind.Audio) {
                        let T;
                        for (const A of this.engine.pcManager.publisher.getTransceivers())
                            if (A.sender === e.sender) {
                                T = A;
                                break
                            } T && this.engine.pcManager.publisher.setTrackCodecBitrate({
                            transceiver: T,
                            codec: "opus",
                            maxbr: !((M = y[0]) === null || M === void 0) && M.maxBitrate ? y[0].maxBitrate / 1e3 : 0
                        })
                    } else e.codec && We(e.codec) && (!((g = y[0]) === null || g === void 0) && g.maxBitrate) && this.engine.pcManager.publisher.setTrackCodecBitrate({
                        cid: P.cid,
                        codec: e.codec,
                        maxbr: y[0].maxBitrate / 1e3
                    });
                yield this.engine.negotiate()
            });
            let E;
            const x = new Promise((C, M) => b(this, void 0, void 0, function*() {
                var g;
                try {
                    E = yield this.engine.addTrack(P), C(E)
                } catch (T) {
                    e.sender && (!((g = this.engine.pcManager) === null || g === void 0) && g.publisher) && (this.engine.pcManager.publisher.removeTrack(e.sender), yield this.engine.negotiate().catch(A => {
                        this.log.error("failed to negotiate after removing track due to failed add track request", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
                            error: A
                        }))
                    })), M(T)
                }
            }));
            if (this.enabledPublishVideoCodecs.length > 0) E = (yield Promise.all([x, S()]))[0];
            else {
                E = yield x;
                let C;
                if (E.codecs.forEach(M => {
                        C === void 0 && (C = M.mimeType)
                    }), C && e.kind === O.Kind.Video) {
                    const M = li(C);
                    M !== p && (this.log.debug("falling back to server selected codec", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
                        codec: M
                    })), t.videoCodec = M, y = ms(e.source === O.Source.ScreenShare, P.width, P.height, t))
                }
                yield S()
            }
            const D = new ps(e.kind, E, e, {
                loggerName: this.roomOptions.loggerName,
                loggerContextCb: () => this.logContext
            });
            if (D.on(B.CpuConstrained, C => this.onTrackCpuConstrained(C, D)), D.options = t, e.sid = E.sid, this.log.debug("publishing ".concat(e.kind, " with encodings"), Object.assign(Object.assign({}, this.logContext), {
                    encodings: y,
                    trackInfo: E
                })), ht(e) ? e.startMonitor(this.engine.client) : it(e) && e.startMonitor(), this.addTrackPublication(D), this.emit(W.LocalTrackPublished, D), it(e) && E.audioFeatures.includes(ke.TF_PRECONNECT_BUFFER)) {
                const C = e.getPreConnectBuffer(),
                    M = e.getPreConnectBufferMimeType();
                this.on(W.LocalTrackSubscribed, g => {
                    if (g.trackSid === E.sid) {
                        if (!e.hasPreConnectBuffer) {
                            this.log.warn("subscribe event came to late, buffer already closed", this.logContext);
                            return
                        }
                        this.log.debug("finished recording preconnect buffer", Object.assign(Object.assign({}, this.logContext), te(e))), e.stopPreConnectBuffer()
                    }
                }), C && new Promise((T, A) => b(this, void 0, void 0, function*() {
                    var F, H, N, Q, Z, ue;
                    try {
                        this.log.debug("waiting for agent", Object.assign(Object.assign({}, this.logContext), te(e)));
                        const G = setTimeout(() => {
                                A(new Error("agent not active within 10 seconds"))
                            }, 1e4),
                            J = yield this.waitUntilActiveAgentPresent();
                        clearTimeout(G), this.log.debug("sending preconnect buffer", Object.assign(Object.assign({}, this.logContext), te(e)));
                        const we = yield this.streamBytes({
                            name: "preconnect-buffer",
                            mimeType: M,
                            topic: "lk.agent.pre-connect-audio-buffer",
                            destinationIdentities: [J.identity],
                            attributes: {
                                trackId: D.trackSid,
                                sampleRate: String((Z = k.sampleRate) !== null && Z !== void 0 ? Z : "48000"),
                                channels: String((ue = k.channelCount) !== null && ue !== void 0 ? ue : "1")
                            }
                        });
                        try {
                            for (var K = !0, z = at(C), j; j = yield z.next(), F = j.done, !F; K = !0) {
                                Q = j.value, K = !1;
                                const ve = Q;
                                yield we.write(ve)
                            }
                        } catch (ve) {
                            H = {
                                error: ve
                            }
                        } finally {
                            try {
                                !K && !F && (N = z.return) && (yield N.call(z))
                            } finally {
                                if (H) throw H.error
                            }
                        }
                        yield we.close(), T()
                    } catch (G) {
                        A(G)
                    }
                })).then(() => {
                    this.log.debug("preconnect buffer sent successfully", Object.assign(Object.assign({}, this.logContext), te(e)))
                }).catch(T => {
                    this.log.error("error sending preconnect buffer", Object.assign(Object.assign(Object.assign({}, this.logContext), te(e)), {
                        error: T
                    }))
                })
            }
            return D
        })
    }
    get isLocal() {
        return !0
    }
    publishAdditionalCodecForTrack(e, t, n) {
        return b(this, void 0, void 0, function*() {
            var s;
            if (this.encryptionType !== ge.NONE) return;
            let r;
            if (this.trackPublications.forEach(m => {
                    m.track && m.track === e && (r = m)
                }), !r) throw new ct("track is not published");
            if (!ht(e)) throw new ct("track is not a video track");
            const a = Object.assign(Object.assign({}, (s = this.roomOptions) === null || s === void 0 ? void 0 : s.publishDefaults), n),
                o = mf(e, t, a);
            if (!o) {
                this.log.info("backup codec has been disabled, ignoring request to add additional codec for track", Object.assign(Object.assign({}, this.logContext), te(e)));
                return
            }
            const c = e.addSimulcastTrack(t, o);
            if (!c) return;
            const d = new pi({
                cid: c.mediaStreamTrack.id,
                type: O.kindToProto(e.kind),
                muted: e.isMuted,
                source: O.sourceToProto(e.source),
                sid: e.sid,
                simulcastCodecs: [{
                    codec: a.videoCodec,
                    cid: c.mediaStreamTrack.id
                }]
            });
            if (d.layers = ko(d.width, d.height, o), !this.engine || this.engine.isClosed) throw new fe("cannot publish track when not connected");
            const l = () => b(this, void 0, void 0, function*() {
                    yield this.engine.createSimulcastSender(e, c, a, o), yield this.engine.negotiate()
                }),
                h = (yield Promise.all([this.engine.addTrack(d), l()]))[0];
            this.log.debug("published ".concat(t, " for track ").concat(e.sid), Object.assign(Object.assign({}, this.logContext), {
                encodings: o,
                trackInfo: h
            }))
        })
    }
    unpublishTrack(e, t) {
        return b(this, void 0, void 0, function*() {
            var n, s;
            if (Kt(e)) {
                const d = this.pendingPublishPromises.get(e);
                d && (this.log.info("awaiting publish promise before attempting to unpublish", Object.assign(Object.assign({}, this.logContext), te(e))), yield d)
            }
            const r = this.getPublicationForTrack(e),
                a = r ? te(r) : void 0;
            if (this.log.debug("unpublishing track", Object.assign(Object.assign({}, this.logContext), a)), !r || !r.track) {
                this.log.warn("track was not unpublished because no publication was found", Object.assign(Object.assign({}, this.logContext), a));
                return
            }
            e = r.track, e.off(B.Muted, this.onTrackMuted), e.off(B.Unmuted, this.onTrackUnmuted), e.off(B.Ended, this.handleTrackEnded), e.off(B.UpstreamPaused, this.onTrackUpstreamPaused), e.off(B.UpstreamResumed, this.onTrackUpstreamResumed), e.off(B.AudioTrackFeatureUpdate, this.onTrackFeatureUpdate), t === void 0 && (t = (s = (n = this.roomOptions) === null || n === void 0 ? void 0 : n.stopLocalTrackOnUnpublish) !== null && s !== void 0 ? s : !0), t ? e.stop() : e.stopMonitor();
            let o = !1;
            const c = e.sender;
            if (e.sender = void 0, this.engine.pcManager && this.engine.pcManager.currentState < le.FAILED && c) try {
                for (const d of this.engine.pcManager.publisher.getTransceivers()) d.sender === c && (d.direction = "inactive", o = !0);
                if (this.engine.removeTrack(c) && (o = !0), ht(e)) {
                    for (const [, d] of e.simulcastCodecs) d.sender && (this.engine.removeTrack(d.sender) && (o = !0), d.sender = void 0);
                    e.simulcastCodecs.clear()
                }
            } catch (d) {
                this.log.warn("failed to unpublish track", Object.assign(Object.assign(Object.assign({}, this.logContext), a), {
                    error: d
                }))
            }
            switch (this.trackPublications.delete(r.trackSid), r.kind) {
                case O.Kind.Audio:
                    this.audioTrackPublications.delete(r.trackSid);
                    break;
                case O.Kind.Video:
                    this.videoTrackPublications.delete(r.trackSid);
                    break
            }
            return this.emit(W.LocalTrackUnpublished, r), r.setTrack(void 0), o && (yield this.engine.negotiate()), r
        })
    }
    unpublishTracks(e) {
        return b(this, void 0, void 0, function*() {
            return (yield Promise.all(e.map(n => this.unpublishTrack(n)))).filter(n => !!n)
        })
    }
    republishAllTracks(e) {
        return b(this, arguments, void 0, function(t) {
            var n = this;
            let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : !0;
            return function*() {
                n.republishPromise && (yield n.republishPromise), n.republishPromise = new Ee((r, a) => b(n, void 0, void 0, function*() {
                    try {
                        const o = [];
                        this.trackPublications.forEach(c => {
                            c.track && (t && (c.options = Object.assign(Object.assign({}, c.options), t)), o.push(c))
                        }), yield Promise.all(o.map(c => b(this, void 0, void 0, function*() {
                            const d = c.track;
                            yield this.unpublishTrack(d, !1), s && !d.isMuted && d.source !== O.Source.ScreenShare && d.source !== O.Source.ScreenShareAudio && (it(d) || ht(d)) && !d.isUserProvided && (this.log.debug("restarting existing track", Object.assign(Object.assign({}, this.logContext), {
                                track: c.trackSid
                            })), yield d.restartTrack()), yield this.publishOrRepublishTrack(d, c.options, !0)
                        }))), r()
                    } catch (o) {
                        o instanceof Error ? a(o) : a(new Error(String(o)))
                    } finally {
                        this.republishPromise = void 0
                    }
                })), yield n.republishPromise
            }()
        })
    }
    publishData(e) {
        return b(this, arguments, void 0, function(t) {
            var n = this;
            let s = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
            return function*() {
                const r = s.reliable ? ee.RELIABLE : ee.LOSSY,
                    a = s.destinationIdentities,
                    o = s.topic;
                let c = new Is({
                    participantIdentity: n.identity,
                    payload: t,
                    destinationIdentities: a,
                    topic: o
                });
                const d = new Re({
                    kind: r,
                    value: {
                        case: "user",
                        value: c
                    }
                });
                yield n.engine.sendDataPacket(d, r)
            }()
        })
    }
    publishDtmf(e, t) {
        return b(this, void 0, void 0, function*() {
            const n = new Re({
                kind: ee.RELIABLE,
                value: {
                    case: "sipDtmf",
                    value: new ba({
                        code: e,
                        digit: t
                    })
                }
            });
            yield this.engine.sendDataPacket(n, ee.RELIABLE)
        })
    }
    sendChatMessage(e, t) {
        return b(this, void 0, void 0, function*() {
            const n = {
                    id: crypto.randomUUID(),
                    message: e,
                    timestamp: Date.now(),
                    attachedFiles: t == null ? void 0 : t.attachments
                },
                s = new Re({
                    value: {
                        case: "chatMessage",
                        value: new Hi(Object.assign(Object.assign({}, n), {
                            timestamp: de.parse(n.timestamp)
                        }))
                    }
                });
            return yield this.engine.sendDataPacket(s, ee.RELIABLE), this.emit(W.ChatMessage, n), n
        })
    }
    editChatMessage(e, t) {
        return b(this, void 0, void 0, function*() {
            const n = Object.assign(Object.assign({}, t), {
                    message: e,
                    editTimestamp: Date.now()
                }),
                s = new Re({
                    value: {
                        case: "chatMessage",
                        value: new Hi(Object.assign(Object.assign({}, n), {
                            timestamp: de.parse(n.timestamp),
                            editTimestamp: de.parse(n.editTimestamp)
                        }))
                    }
                });
            return yield this.engine.sendDataPacket(s, ee.RELIABLE), this.emit(W.ChatMessage, n), n
        })
    }
    sendText(e, t) {
        return b(this, void 0, void 0, function*() {
            return this.roomOutgoingDataStreamManager.sendText(e, t)
        })
    }
    streamText(e) {
        return b(this, void 0, void 0, function*() {
            return this.roomOutgoingDataStreamManager.streamText(e)
        })
    }
    sendFile(e, t) {
        return b(this, void 0, void 0, function*() {
            return this.roomOutgoingDataStreamManager.sendFile(e, t)
        })
    }
    streamBytes(e) {
        return b(this, void 0, void 0, function*() {
            return this.roomOutgoingDataStreamManager.streamBytes(e)
        })
    }
    performRpc(e) {
        let {
            destinationIdentity: t,
            method: n,
            payload: s,
            responseTimeout: r = 15e3
        } = e;
        const a = 7e3,
            o = a + 1e3;
        return new Ee((c, d) => b(this, void 0, void 0, function*() {
            var l, u, h, m;
            if ($s(s) > Oc) {
                d(me.builtIn("REQUEST_PAYLOAD_TOO_LARGE"));
                return
            }
            if (!((u = (l = this.engine.latestJoinResponse) === null || l === void 0 ? void 0 : l.serverInfo) === null || u === void 0) && u.version && Ze((m = (h = this.engine.latestJoinResponse) === null || h === void 0 ? void 0 : h.serverInfo) === null || m === void 0 ? void 0 : m.version, "1.8.0") < 0) {
                d(me.builtIn("UNSUPPORTED_SERVER"));
                return
            }
            const f = Math.max(r, o),
                p = crypto.randomUUID();
            yield this.publishRpcRequest(t, p, n, s, f);
            const _ = setTimeout(() => {
                this.pendingAcks.delete(p), d(me.builtIn("CONNECTION_TIMEOUT")), this.pendingResponses.delete(p), clearTimeout(w)
            }, a);
            this.pendingAcks.set(p, {
                resolve: () => {
                    clearTimeout(_)
                },
                participantIdentity: t
            });
            const w = setTimeout(() => {
                this.pendingResponses.delete(p), d(me.builtIn("RESPONSE_TIMEOUT"))
            }, r);
            this.pendingResponses.set(p, {
                resolve: (k, P) => {
                    clearTimeout(w), this.pendingAcks.has(p) && (this.log.warn("RPC response received before ack", p), this.pendingAcks.delete(p), clearTimeout(_)), P ? d(P) : c(k ?? "")
                },
                participantIdentity: t
            })
        }))
    }
    registerRpcMethod(e, t) {
        this.rpcHandlers.has(e) && this.log.warn("you're overriding the RPC handler for method ".concat(e, ", in the future this will throw an error")), this.rpcHandlers.set(e, t)
    }
    unregisterRpcMethod(e) {
        this.rpcHandlers.delete(e)
    }
    setTrackSubscriptionPermissions(e) {
        let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
        this.participantTrackPermissions = t, this.allParticipantsAllowedToSubscribe = e, this.engine.client.isDisconnected || this.updateTrackSubscriptionPermissions()
    }
    handleIncomingRpcAck(e) {
        const t = this.pendingAcks.get(e);
        t ? (t.resolve(), this.pendingAcks.delete(e)) : console.error("Ack received for unexpected RPC request", e)
    }
    handleIncomingRpcResponse(e, t, n) {
        const s = this.pendingResponses.get(e);
        s ? (s.resolve(t, n), this.pendingResponses.delete(e)) : console.error("Response received for unexpected RPC request", e)
    }
    publishRpcRequest(e, t, n, s, r) {
        return b(this, void 0, void 0, function*() {
            const a = new Re({
                destinationIdentities: [e],
                kind: ee.RELIABLE,
                value: {
                    case: "rpcRequest",
                    value: new xs({
                        id: t,
                        method: n,
                        payload: s,
                        responseTimeoutMs: r,
                        version: 1
                    })
                }
            });
            yield this.engine.sendDataPacket(a, ee.RELIABLE)
        })
    }
    handleParticipantDisconnected(e) {
        for (const [t, {
                participantIdentity: n
            }] of this.pendingAcks) n === e && this.pendingAcks.delete(t);
        for (const [t, {
                participantIdentity: n,
                resolve: s
            }] of this.pendingResponses) n === e && (s(null, me.builtIn("RECIPIENT_DISCONNECTED")), this.pendingResponses.delete(t))
    }
    setEnabledPublishCodecs(e) {
        this.enabledPublishVideoCodecs = e.filter(t => t.mime.split("/")[0].toLowerCase() === "video")
    }
    updateInfo(e) {
        return super.updateInfo(e) ? (e.tracks.forEach(t => {
            var n, s;
            const r = this.trackPublications.get(t.sid);
            if (r) {
                const a = r.isMuted || ((s = (n = r.track) === null || n === void 0 ? void 0 : n.isUpstreamPaused) !== null && s !== void 0 ? s : !1);
                a !== t.muted && (this.log.debug("updating server mute state after reconcile", Object.assign(Object.assign(Object.assign({}, this.logContext), te(r)), {
                    mutedOnServer: a
                })), this.engine.client.sendMuteTrack(t.sid, a))
            }
        }), !0) : !1
    }
    setActiveAgent(e) {
        var t, n, s, r;
        this.firstActiveAgent = e, e && !this.firstActiveAgent && (this.firstActiveAgent = e), e ? (n = (t = this.activeAgentFuture) === null || t === void 0 ? void 0 : t.resolve) === null || n === void 0 || n.call(t, e) : (r = (s = this.activeAgentFuture) === null || s === void 0 ? void 0 : s.reject) === null || r === void 0 || r.call(s, new Error("Agent disconnected")), this.activeAgentFuture = void 0
    }
    waitUntilActiveAgentPresent() {
        return this.firstActiveAgent ? Promise.resolve(this.firstActiveAgent) : (this.activeAgentFuture || (this.activeAgentFuture = new Le), this.activeAgentFuture.promise)
    }
    getPublicationForTrack(e) {
        let t;
        return this.trackPublications.forEach(n => {
            const s = n.track;
            s && (e instanceof MediaStreamTrack ? (it(s) || ht(s)) && s.mediaStreamTrack === e && (t = n) : e === s && (t = n))
        }), t
    }
    waitForPendingPublicationOfSource(e) {
        return b(this, void 0, void 0, function*() {
            const n = Date.now();
            for (; Date.now() < n + 1e4;) {
                const s = Array.from(this.pendingPublishPromises.entries()).find(r => {
                    let [a] = r;
                    return a.source === e
                });
                if (s) return s[1];
                yield Ce(20)
            }
        })
    }
}
