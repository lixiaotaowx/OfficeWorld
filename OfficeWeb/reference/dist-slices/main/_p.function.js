function _p(i) {
    let e = !1,
        t, n, s, r, a, o, c, d = null;
    const l = new Set;
    let u = "断开了，等待重连",
        h = {
            videos: {},
            callStates: {},
            voiceStatus: "Not in a call",
            muted: !1,
            micLive: !1,
            sharing: !1,
            previewReason: "",
            boardScope: void 0,
            signal: No,
            meetingStatus: u,
            meetingMic: !1,
            meetingSharing: !1,
            deskSensorLabel: ai(!1),
            systemIdleSensor: !1
        };
    const m = new Set,
        f = () => {
            h = {
                ...h
            }, k();
            for (const g of m) g()
        },
        p = g => {
            Object.keys(g).every(A => Object.is(h[A], g[A])) || (h = {
                ...h,
                ...g
            }, f())
        },
        _ = () => h,
        w = Pp(g => {
            var T, A;
            typeof window < "u" && ((A = (T = window.officeDesktop) == null ? void 0 : T.mediaActive) == null || A.call(T, g))
        }),
        k = (g = !1) => w(e && Ep({
            sessions: l.size,
            meeting: d !== null,
            sharing: h.sharing,
            meetingSharing: h.meetingSharing,
            meetingMic: h.meetingMic,
            micLive: h.micLive,
            videos: Object.keys(h.videos).length
        }), g);

    function P() {
        if (e || !i.bridge) return !1;
        e = !0, t = Rp(i.bridge, () => {
            const T = i.getHost();
            return {
                id: (T == null ? void 0 : T.identity.myId) || "",
                connected: (T == null ? void 0 : T.identity.connected) === !0
            }
        });
        const g = {
            current: t.socket
        };
        return n = new Jc(t.socket, i.notify, (T, A) => {
            const F = {
                ...h.videos
            };
            A ? F[T] = A : delete F[T], p({
                videos: F
            })
        }, T => p({
            sharing: T
        })), n.onScreenStopped = () => a == null ? void 0 : a.clearShareMarks(h.boardScope ? [h.boardScope] : []), s = zo({
            socket: g,
            notify: i.notify,
            onChange: y
        }), a = qc({
            socket: g,
            notify: i.notify,
            sharingScreen: () => {
                var T;
                return ((T = n == null ? void 0 : n.screen) == null ? void 0 : T.active) === !0 || (n == null ? void 0 : n.meetingStatus().sharing) === !0
            }
        }), a.attachSocket(t.socket), r = Vc(() => n == null ? void 0 : n.meetingConnection(), y), o = Bo(t.socket), p({
            deskSensorLabel: ai(o.usesSystemIdle()),
            systemIdleSensor: o.usesSystemIdle()
        }), t.socket.on("watched", T => {
            var F;
            const A = window.officeDesktop;
            A && ((F = A.previewGlow) == null || F.call(A, {
                sharing: h.sharing,
                fade: Fo
            }).catch(() => {}), T != null && T.from && ks({
                id: T.from,
                name: T.name,
                appearance: T.appearance,
                mode: "peek"
            }))
        }), c = setInterval(y, 500), k(!0), !0
    }

    function y() {
        var j, G;
        if (!n) return;
        const g = i.getHost(),
            T = (g == null ? void 0 : g.calls.sessions) || [],
            A = {};
        for (const J of T) A[J.id] = n.callStatus(J.id);
        const F = n.meetingStatus(),
            N = (g == null ? void 0 : g.identity.connected) === !0 && ((j = g.meetings.active) == null ? void 0 : j.room) || null ? F.connected ? "进入会议了" : u : "断开了，等待重连",
            Q = h.sharing,
            Z = window.officeDesktop || !Q ? (s == null ? void 0 : s.reason()) || "" : "正在共享（浏览器）",
            ue = F.mic,
            K = !!n.activeMic() && (ue || Object.values(A).some(J => J.voice === "On" || J.voice === "Audio paused")),
            z = T.filter(J => {
                var we;
                return (we = J.screenOwners) == null ? void 0 : we.includes((g == null ? void 0 : g.identity.myId) || "")
            }).map(J => J.room);
        if (ue || F.sharing) {
            const J = (G = g == null ? void 0 : g.meetings.active) == null ? void 0 : G.room;
            J && z.push(J)
        }
        p({
            callStates: Vo(h.callStates, A) ? h.callStates : A,
            voiceStatus: n.privateVoiceStatus(),
            muted: n.privateVoiceStatus() === "Muted",
            micLive: K,
            previewReason: Z,
            boardScope: z[0],
            signal: (r == null ? void 0 : r.snapshot()) || No,
            meetingStatus: N,
            meetingMic: ue,
            meetingSharing: F.sharing
        }), k()
    }

    function S(g) {
        var H;
        if (!e || !n) return;
        const T = (g == null ? void 0 : g.calls.sessions) || [],
            A = new Set(T.map(N => N.id));
        for (const N of T) l.has(N.id) || (l.add(N.id), n.start(N).then(Q => {
            Q || (l.delete(N.id), i.onEndSession(N.id))
        }).catch(() => {
            l.delete(N.id), i.onEndSession(N.id)
        }));
        for (const N of [...l]) A.has(N) || (l.delete(N), n.end(N));
        const F = (g == null ? void 0 : g.identity.connected) === !0 && ((H = g.meetings.active) == null ? void 0 : H.room) || null;
        F !== d && (d = F, a == null || a.trackMeetingRoom(F), F ? (u = "正在连会议语音…", n.joinMeeting(F, !0).then(N => {
            d === F && (u = N ? "进入会议了" : "语音没连上，退出再进来试试", y())
        })) : (n.leaveMeeting(), u = "断开了，等待重连")), s == null || s.setContext((g == null ? void 0 : g.identity.connected) === !0, g == null ? void 0 : g.presence.people.find(N => N.id === g.identity.myId)), y()
    }
    async function E() {
        var g;
        if (!((g = i.getHost()) != null && g.identity.connected)) {
            i.notify("等重新连上再试");
            return
        }
        if (!window.officeDesktop) {
            if (h.sharing) {
                x();
                return
            }
            try {
                await (n == null ? void 0 : n.startScreen()), a == null || a.attach()
            } catch {
                i.notify("共享没开始，再选一次窗口或屏幕")
            }
        }
    }

    function x() {
        n == null || n.stopScreen(), a == null || a.detach()
    }
    async function D(g) {
        try {
            return await (n == null ? void 0 : n.shareInCall(g)), a == null || a.attach(), !0
        } catch (T) {
            return i.notify(T instanceof Error ? T.message : "共享没开始，再试一次"), !1
        }
    }
    async function C(g) {
        const T = n;
        if (!T) return !1;
        try {
            return await T.toggleMute(T.privateVoiceStatus(g) === "On", g), y(), !0
        } catch {
            return i.notify("麦克风打不开，检查一下权限或设备再试"), !1
        }
    }

    function M() {
        c && (clearInterval(c), c = void 0), o == null || o.stop(), s == null || s.dispose(), r == null || r.dispose(), n == null || n.dispose(), a == null || a.detach(), t == null || t.dispose(), t = void 0, n = void 0, l.clear(), d = null, e = !1, k()
    }
    return {
        start: P,
        sync: S,
        dispose: M,
        subscribe: g => (m.add(g), () => {
            m.delete(g)
        }),
        getSnapshot: _,
        actions: {
            share: E,
            stopShare: x,
            shareInCall: D,
            mute: C,
            setRemoteAudioMuted: (g, T) => n == null ? void 0 : n.setRemoteAudioMuted(g, T),
            activeMic: () => (n == null ? void 0 : n.activeMic()) ?? null,
            meetingMic: async () => {
                n && (await n.meetingMicrophone(n.meetingStatus().mic !== !0), y())
            },
            meetingShare: async g => {
                n && (await n.meetingScreen(g ?? !n.meetingStatus().sharing), y())
            },
            annotation: {
                draw: (g, T, A, F) => a == null ? void 0 : a.draw(g, T, A, F),
                clear: g => a == null ? void 0 : a.clear(g),
                undo: g => a == null ? void 0 : a.undo(g)
            },
            startScreenForInvite: async () => {
                var g;
                try {
                    return await (n == null ? void 0 : n.startScreen(!1)), ((g = n == null ? void 0 : n.screen) == null ? void 0 : g.active) === !0
                } catch {
                    return !1
                }
            },
            stopScreen: () => n == null ? void 0 : n.stopScreen()
        },
        get media() {
            return n
        }
    }
}
