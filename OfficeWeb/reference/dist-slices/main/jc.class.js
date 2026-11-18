class Jc {
    constructor(e, t, n, s) {
        ne(this, "screen", null);
        ne(this, "onScreenStopped");
        ne(this, "disposed", !1);
        ne(this, "connections", new up(e => this.token(e), (e, t) => this.wire(e, t), e => this.onNotice(e)));
        ne(this, "audioInitialized", new Set);
        ne(this, "screenPublic", !1);
        ne(this, "meetingMic", !1);
        ne(this, "recovery");
        ne(this, "screenGeneration", 0);
        ne(this, "meetingGeneration", 0);
        ne(this, "sessionRoom", new Map);
        ne(this, "voiceRooms", new Set);
        ne(this, "privateSessions", new Map);
        ne(this, "privateRecovery", new Map);
        ne(this, "remoteMuted", new Set);
        ne(this, "audioFocus", new mp(this.connections, e => {
            for (const [t, n] of this.audio) n.muted = !e || !t.startsWith(`${e}:`) || this.remoteMuted.has(e);
            this.meetingRoom && e !== this.meetingRoom && (this.meetingMic = !1)
        }, e => this.onNotice(e)));
        ne(this, "audio", new Map);
        ne(this, "previewVideo");
        ne(this, "thumbnails");
        ne(this, "meetingRoom", null);
        ne(this, "meetingVideos", new Set);
        ne(this, "meetingScreens");
        ne(this, "resumeAudio", () => {
            for (const [, e] of this.connections.values()) e.startAudio().catch(() => {})
        });
        ne(this, "activeMic", () => {
            const e = this.audioFocus.current ? this.connections.get(this.audioFocus.current) : void 0;
            return (e == null ? void 0 : e.state) === "connected" ? Ao(e) : null
        });
        this.socket = e, this.onNotice = t, this.onVideo = n, this.onSharing = s, this.meetingScreens = new gp(this.socket, this.connections, () => this.meetingRoom, r => this.onNotice(r)), this.meetingScreens.onStopped = () => {
            var r;
            return (r = this.onScreenStopped) == null ? void 0 : r.call(this)
        }, document.addEventListener("pointerdown", this.resumeAudio)
    }
    token(e) {
        return new Promise(t => {
            this.socket.timeout(8e3).emit("livekit-token", e, (n, s) => {
                t(n ? {
                    error: "取通话凭证超时了"
                } : s ?? {
                    error: "通话凭证不对"
                })
            })
        })
    }
    sessionOf(e) {
        for (const [t, n] of this.sessionRoom)
            if (n === e) return t;
        return ""
    }
    roomStillNeeded(e) {
        for (const t of this.sessionRoom.values())
            if (t === e) return !0;
        return !1
    }
    wire(e, t) {
        e.on(U.LocalTrackPublished, n => {
            var r;
            if (!this.connections.current(t, e) || !t.startsWith("meeting-") || n.source !== O.Source.ScreenShare) return;
            const s = (r = n.track) == null ? void 0 : r.mediaStreamTrack;
            if (s) {
                const a = `${t}:local`;
                this.meetingVideos.add(a), this.onVideo(a, new MediaStream([s]))
            }
        }).on(U.LocalTrackUnpublished, n => {
            if (!this.connections.current(t, e) || n.source !== O.Source.ScreenShare) return;
            const s = `${t}:local`;
            this.meetingVideos.delete(s), this.onVideo(s, null)
        }).on(U.TrackSubscribed, (n, s, r) => {
            var d;
            if (!this.connections.current(t, e)) return;
            const a = this.sessionOf(t);
            if (n.kind === O.Kind.Video) {
                const l = t.startsWith("meeting-") ? Oo(t, r, n.sid) : a;
                t.startsWith("meeting-") && this.meetingVideos.add(l), this.onVideo(l, new MediaStream([n.mediaStreamTrack]));
                return
            }
            const o = `${t}:${n.sid}`,
                c = n.attach();
            c.autoplay = !0, c.muted = this.audioFocus.current !== t || this.remoteMuted.has(t), document.body.appendChild(c), (d = c.play) == null || d.call(c).catch(() => {
                this.onNotice("浏览器挡住了自动播放，点一下恢复声音")
            }), this.audio.set(o, c)
        }).on(U.TrackUnsubscribed, (n, s, r) => {
            if (!this.connections.current(t, e)) return;
            const a = this.sessionOf(t);
            if (n.kind === O.Kind.Video) {
                const d = t.startsWith("meeting-") ? Oo(t, r, n.sid) : a;
                this.meetingVideos.delete(d), this.onVideo(d, null);
                return
            }
            const o = `${t}:${n.sid}`,
                c = this.audio.get(o);
            c && n.detach(c), c == null || c.remove(), this.audio.delete(o)
        }).on(U.Disconnected, () => {
            if (!this.connections.current(t, e)) return;
            this.connections.close(t), this.clearRoomAudio(t);
            for (const r of this.meetingVideos) r.startsWith(`${t}:`) && (this.onVideo(r, null), this.meetingVideos.delete(r));
            const n = this.sessionOf(t);
            n && this.onVideo(n, null);
            const s = [...this.privateSessions.values()].find(r => r.room === t);
            !this.disposed && s && (this.onNotice("通话断开了，正在重连"), this.retryPrivate(s)), !this.disposed && this.meetingRoom === t && (this.meetingScreens.stop(t), this.onNotice("会议断开了，正在重连；要继续共享请重新选一次屏幕"), clearTimeout(this.recovery), this.recovery = setTimeout(() => {
                this.meetingRoom === t && this.joinMeeting(t, this.meetingMic)
            }, 1500))
        })
    }
    setRemoteAudioMuted(e, t) {
        t ? this.remoteMuted.add(e) : this.remoteMuted.delete(e);
        for (const [n, s] of this.audio) n.startsWith(`${e}:`) && (s.muted = t || this.audioFocus.current !== e)
    }
    remoteAudioMuted(e) {
        return this.remoteMuted.has(e)
    }
    clearRoomAudio(e) {
        for (const [t, n] of this.audio) t.startsWith(`${e}:`) && (n.remove(), this.audio.delete(t))
    }
    join(e) {
        return this.connections.join(e)
    }
    async publishScreen(e) {
        await this.connections.run(e.name, async t => {
            const n = () => [...this.privateSessions.values()].some(r => {
                var a;
                return r.room === e.name && ((a = r.screenOwners) == null ? void 0 : a.includes(this.socket.id || ""))
            });
            if (!n()) return;
            const s = this.screen;
            if (!s) throw Error("屏幕共享停了");
            await fp(t, s, () => n() && this.screen === s, r => this.onNotice(r))
        })
    }
    retryPrivate(e) {
        clearTimeout(this.privateRecovery.get(e.id)), this.privateRecovery.set(e.id, setTimeout(() => {
            this.privateRecovery.delete(e.id);
            const t = this.privateSessions.get(e.id);
            t && !this.disposed && this.start(t)
        }, 2500))
    }
    async start(e) {
        var o, c, d, l, u;
        const t = this.privateSessions.get(e.id);
        this.privateSessions.set(e.id, e), this.sessionRoom.set(e.id, e.room), this.voiceRooms.add(e.room), this.audioFocus.add(e.room);
        const n = ((o = this.connections.get(e.room)) == null ? void 0 : o.state) !== "connected",
            s = await this.join(e.room);
        if (this.privateSessions.get(e.id) !== e) return !0;
        if (!s) return this.connections.close(e.room), this.retryPrivate(e), !0;
        let r = Promise.resolve();
        (!this.audioInitialized.has(e.room) || n && (!t || this.audioFocus.current === e.room) && !s.localParticipant.isMicrophoneEnabled && this.audioFocus.intended(e.room)) && (this.audioInitialized.add(e.room), r = this.audioFocus.activate(e.room).catch(() => this.onNotice("麦克风没打开，画面可以用。检查一下设备权限再打开试试")));
        const a = ((c = e.screenOwners) == null ? void 0 : c.includes(this.socket.id || "")) ?? (e.kind === "screen" && e.owner === this.socket.id);
        if (a && ((d = this.screen) != null && d.active)) try {
            await this.publishScreen(s)
        } catch {
            this.onNotice("屏幕没共享出去，语音还连着，再试一次")
        } else a || (await this.connections.run(e.room, async h => {
            await tn(h)
        }).catch(() => {}), (l = t == null ? void 0 : t.screenOwners) != null && l.includes(this.socket.id || "") && ((u = e.screenOwners) != null && u.length && this.onNotice("对方接过了屏幕共享，语音还连着"), !this.screenPublic && ![...this.privateSessions.values()].some(h => {
            var m;
            return (m = h.screenOwners) == null ? void 0 : m.includes(this.socket.id || "")
        }) && this.stopScreen()));
        return await r, !0
    }
    async joinMeeting(e, t = !1) {
        if (this.disposed) return !1;
        this.meetingRoom && this.meetingRoom !== e && this.leaveMeeting(), this.meetingRoom = e, this.meetingMic = t, this.audioFocus.add(e);
        const n = this.meetingGeneration,
            s = await this.join(e);
        if (this.meetingRoom !== e || n !== this.meetingGeneration) return !1;
        if (!s) return this.connections.close(e), clearTimeout(this.recovery), this.recovery = setTimeout(() => {
            this.meetingRoom === e && this.joinMeeting(e, this.meetingMic)
        }, 5e3), !1;
        try {
            await this.audioFocus.activate(e, t)
        } catch {
            this.onNotice("麦克风用不了，再打开试试")
        }
        return !0
    }
    leaveMeeting() {
        this.meetingGeneration++;
        const e = this.meetingRoom;
        if (e && this.meetingScreens.stop(e), this.meetingRoom = null, this.meetingMic = !1, clearTimeout(this.recovery), !!e) {
            this.audioFocus.remove(e), this.connections.close(e), this.clearRoomAudio(e);
            for (const t of this.meetingVideos) this.onVideo(t, null);
            this.meetingVideos.clear()
        }
    }
    async meetingMicrophone(e) {
        const t = this.meetingRoom;
        if (!t) throw Error("会议语音还没连上");
        e ? await this.audioFocus.activate(t, !0) : await this.audioFocus.mute(t), this.meetingRoom === t && (this.meetingMic = e)
    }
    async meetingScreen(e) {
        const t = this.meetingRoom;
        if (!t) throw Error("会议还没连上");
        e ? await this.meetingScreens.start(t) : this.meetingScreens.stop(t)
    }
    meetingConnection() {
        return this.meetingRoom ? this.connections.get(this.meetingRoom) : void 0
    }
    meetingStatus() {
        var t, n;
        const e = this.meetingRoom ? this.connections.get(this.meetingRoom) : void 0;
        return {
            connected: (e == null ? void 0 : e.state) === "connected",
            mic: !!(e != null && e.localParticipant.isMicrophoneEnabled) && ((n = (t = e.localParticipant.getTrackPublication(O.Source.Microphone)) == null ? void 0 : t.track) == null ? void 0 : n.mediaStreamTrack.readyState) === "live",
            sharing: !!(e != null && e.localParticipant.isScreenShareEnabled)
        }
    }
    async startScreen(e = !0) {
        this.stopScreen();
        const t = this.screenGeneration,
            n = await Kc();
        if (this.disposed || t !== this.screenGeneration) {
            n.getTracks().forEach(r => r.stop());
            return
        }
        this.screen = n, n.getAudioTracks().length || this.onNotice(bs), this.screenPublic = e, this.onVideo("local-screen", n), n.getVideoTracks()[0].onended = () => {
            this.screen === n && this.stopScreen()
        };
        const s = await yp({
            stream: n,
            current: () => this.screen === n,
            publicPreview: e,
            publish: r => this.socket.emit("preview", r)
        });
        if (s.video) {
            this.thumbnails = s, this.previewVideo = s.video, this.socket.emit("sharing", !0), this.onSharing(!0);
            for (const [r, a] of this.connections.values())[...this.privateSessions.values()].some(o => {
                var c;
                return o.room === r && (((c = o.screenOwners) == null ? void 0 : c.includes(this.socket.id || "")) ?? o.owner === this.socket.id)
            }) && await this.publishScreen(a).catch(o => this.onNotice(String(o)))
        }
    }
    cancelScreenSelection() {
        this.stopScreen()
    }
    async switchScreenDisplay() {
        var n, s;
        const e = await this.meetingScreens.switchDisplay();
        if (e)
            for (const [r, a] of this.connections.values()) {
                if (!r.startsWith("meeting-")) continue;
                const o = (s = (n = a.localParticipant.getTrackPublication(O.Source.ScreenShare)) == null ? void 0 : n.track) == null ? void 0 : s.mediaStreamTrack;
                if ((o == null ? void 0 : o.readyState) === "live") {
                    const c = `${r}:local`;
                    this.meetingVideos.add(c), this.onVideo(c, new MediaStream([o]))
                }
            }
        return await pp({
            live: () => this.screen,
            owner: r => !this.disposed && this.screen === r,
            adopt: r => {
                this.screen = r, this.onVideo("local-screen", r), r.getVideoTracks()[0].onended = () => {
                    this.screen === r && this.stopScreen()
                }, this.previewVideo && (this.previewVideo.srcObject = r, this.previewVideo.play().catch(() => {}))
            },
            publishers: () => this.connections.values().filter(([r]) => this.voiceRooms.has(r)).map(([, r]) => r),
            run: (r, a) => this.connections.run(r.name, a)
        }) || e
    }
    async shareInCall(e) {
        var n, s;
        const t = !((n = this.screen) != null && n.active);
        try {
            if (t && await this.startScreen(!1), !((s = this.screen) != null && s.active) || !this.privateSessions.has(e)) throw Error("没选屏幕，或者通话已经结束");
            const r = await this.socket.timeout(1e4).emitWithAck("private-screen", e);
            if (!(r != null && r.ok)) throw Error((r == null ? void 0 : r.error) || "屏幕没切过去")
        } catch (r) {
            throw t && this.stopScreen(), r
        }
    }
    stopScreen() {
        var t, n, s;
        this.screenGeneration++;
        for (const [r] of this.connections.values()) this.voiceRooms.has(r) && this.connections.run(r, a => tn(a)).catch(a => {
            this.disposed || this.onNotice(String(a))
        });
        const e = !!this.screen;
        (t = this.thumbnails) == null || t.stop(), this.thumbnails = void 0, (n = this.screen) == null || n.getTracks().forEach(r => r.stop()), this.screen = null, this.onVideo("local-screen", null), this.previewVideo && (this.previewVideo.srcObject = null), this.disposed || (this.socket.emit("sharing", !1), this.onSharing(!1)), e && ((s = this.onScreenStopped) == null || s.call(this))
    }
    async prepareMic() {
        (await navigator.mediaDevices.getUserMedia({
            audio: !0
        })).getTracks().forEach(t => t.stop())
    }
    async toggleMute(e, t) {
        const n = Do(this.voiceRooms, this.audioFocus.current, this.sessionRoom, t);
        if (!n) throw Error("通话还没连上");
        e ? await this.audioFocus.mute(n) : await this.audioFocus.activate(n, !0)
    }
    privateVoiceStatus(e) {
        const t = Do(this.voiceRooms, this.audioFocus.current, this.sessionRoom, e);
        if (!t) return "Not in a call";
        const n = this.connections.get(t);
        return (n == null ? void 0 : n.state) !== "connected" ? "Connecting" : kp(n, this.audioFocus.current === t, Ao(n), this.audioFocus.intended(t))
    }
    callStatus(e) {
        const t = this.sessionRoom.get(e),
            n = t ? this.connections.get(t) : void 0;
        return {
            voice: this.privateVoiceStatus(e),
            connected: (n == null ? void 0 : n.state) === "connected",
            sharing: !!(n != null && n.localParticipant.isScreenShareEnabled)
        }
    }
    signalingDisconnected() {
        this.stopScreen();
        for (const e of [...this.sessionRoom.keys()]) this.end(e)
    }
    end(e) {
        clearTimeout(this.privateRecovery.get(e)), this.privateRecovery.delete(e), this.privateSessions.delete(e);
        const t = this.sessionRoom.get(e);
        this.sessionRoom.delete(e), this.onVideo(e, null), !(!t || this.roomStillNeeded(t)) && (this.audioInitialized.delete(t), this.voiceRooms.delete(t), this.audioFocus.remove(t), this.connections.close(t), this.clearRoomAudio(t), !this.screenPublic && this.screen && ![...this.privateSessions.values()].some(n => {
            var s;
            return (s = n.screenOwners) == null ? void 0 : s.includes(this.socket.id || "")
        }) && this.stopScreen())
    }
    dispose() {
        this.disposed = !0, this.meetingScreens.dispose(), this.leaveMeeting(), this.stopScreen(), document.removeEventListener("pointerdown", this.resumeAudio), this.connections.dispose(), this.privateRecovery.forEach(e => clearTimeout(e)), this.privateRecovery.clear(), this.privateSessions.clear(), this.voiceRooms.clear(), this.sessionRoom.clear(), this.audio.forEach(e => e.remove()), this.audio.clear()
    }
}
