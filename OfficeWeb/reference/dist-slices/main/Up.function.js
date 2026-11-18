function Up() {
    const i = I.useMemo(() => Ss(), []),
        [e] = I.useState(() => new Id),
        t = I.useMemo(() => m => Ts(m), []),
        n = I.useRef(null),
        s = I.useMemo(() => m => {
            t({
                kind: "notice",
                message: m
            })
        }, [t]),
        r = I.useMemo(() => _p({
            bridge: Wo(),
            getHost: () => n.current,
            onEndSession: m => {
                t({
                    kind: "end",
                    id: m
                })
            },
            notify: s
        }), [t, s]),
        a = r.actions;
    I.useEffect(() => {
        if (i) return xd(i, e)
    }, [i, e]), I.useEffect(() => Dd(m => {
        m.kind === "auth-expired" && window.dispatchEvent(new CustomEvent("office-session-ended", {
            detail: {
                message: typeof m.message == "string" ? m.message : "登录过期了，请重新登录"
            }
        }))
    }), []);
    const o = I.useSyncExternalStore(e.subscribe, e.getSnapshot, e.getSnapshot),
        c = I.useSyncExternalStore(r.subscribe, r.getSnapshot, r.getSnapshot);
    I.useEffect(() => (r.start(), () => r.dispose()), [r]), I.useEffect(() => {
        n.current = o, r.sync(o)
    }, [o, r]), I.useEffect(() => (t({
        kind: "view",
        attached: !0
    }), () => {
        t({
            kind: "view",
            attached: !1
        })
    }), [t]);
    const d = I.useMemo(() => Ap(t), [t]),
        l = I.useMemo(() => ({
            ...Np(o, t),
            status: c.meetingStatus || (o == null ? void 0 : o.meetings.status) || "断开了，等待重连",
            mic: c.meetingMic,
            sharing: c.meetingSharing,
            act: async m => {
                const f = await t({
                    kind: "meeting-action",
                    data: m
                });
                if (f.ok === !1) throw Error(f.error || "会议操作没成功")
            },
            toggleMic: () => void a.meetingMic().catch(() => {}),
            toggleShare: () => void a.meetingShare().catch(() => {}),
            stopShare: () => void a.meetingShare(!1).catch(() => {})
        }), [o == null ? void 0 : o.meetings, c.meetingStatus, c.meetingMic, c.meetingSharing, t, a]),
        u = I.useMemo(() => Lp(o, t), [o == null ? void 0 : o.files.transfers, t]),
        h = I.useMemo(() => wp(t), [t]);
    return I.useEffect(() => {
        h.replace(o == null ? void 0 : o.presence.billiards)
    }, [h, o == null ? void 0 : o.presence.billiards]), I.useMemo(() => ({
        ...{
            people: (o == null ? void 0 : o.presence.people) ?? [],
            seats: (o == null ? void 0 : o.presence.seats) ?? [],
            messages: (o == null ? void 0 : o.chat.messages) ?? [],
            contacts: (o == null ? void 0 : o.chat.contacts) ?? [],
            hiddenContacts: (o == null ? void 0 : o.chat.hiddenContacts) ?? [],
            accountId: (o == null ? void 0 : o.identity.accountId) ?? "",
            requests: (o == null ? void 0 : o.calls.requests) ?? [],
            outgoing: (o == null ? void 0 : o.calls.outgoing) ?? [],
            callAlerts: (o == null ? void 0 : o.calls.callAlerts) ?? [],
            deskSensorLabel: c.deskSensorLabel || (o == null ? void 0 : o.desktop.deskSensorLabel) || "",
            sessions: (o == null ? void 0 : o.calls.sessions) ?? [],
            previews: (o == null ? void 0 : o.presence.previews) ?? {},
            motions: (o == null ? void 0 : o.presence.motions) ?? {},
            cat: (o == null ? void 0 : o.presence.cat) ?? null,
            catSpeech: (o == null ? void 0 : o.presence.catSpeech) ?? null,
            billiards: h,
            videos: c.videos,
            connected: (o == null ? void 0 : o.identity.connected) ?? !1,
            sharing: c.sharing,
            previewReason: c.previewReason || (o == null ? void 0 : o.media.previewReason) || "",
            muted: c.muted,
            voiceStatus: c.voiceStatus,
            callStates: c.callStates,
            signal: c.signal || (o == null ? void 0 : o.media.signal) || Ip,
            micLive: c.micLive,
            notice: (o == null ? void 0 : o.notice) ?? "",
            files: u,
            myId: (o == null ? void 0 : o.identity.myId) ?? "",
            clientId: (o == null ? void 0 : o.identity.accountId) ?? "",
            name: (o == null ? void 0 : o.identity.name) ?? "",
            boardScope: c.boardScope ?? (o == null ? void 0 : o.media.boardScope),
            meetings: l,
            systemIdleSensor: c.systemIdleSensor || ((o == null ? void 0 : o.desktop.systemIdleSensor) ?? !1)
        },
        ...d,
        share: a.share,
        stopShare: a.stopShare,
        shareInCall: a.shareInCall,
        mute: a.mute,
        setRemoteAudioMuted: a.setRemoteAudioMuted,
        activeMic: a.activeMic,
        annotation: a.annotation,
        respond: async (f, p) => {
            const _ = o == null ? void 0 : o.calls.requests.find(P => P.id === f);
            let w = !1;
            p && (_ == null ? void 0 : _.kind) === "screen" && !_.offer && !r.getSnapshot().sharing && (w = await a.startScreenForInvite(), w || (p = !1)), (await t({
                kind: "respond",
                id: f,
                accept: p
            })).ok === !1 && w && a.stopScreen()
        },
        request: async (f, p, _ = !1) => {
            let w = !1;
            if (_ && !r.getSnapshot().sharing && (w = await a.startScreenForInvite(), !w)) {
                t({
                    kind: "notice",
                    message: "没有屏幕权限，邀请没发出去"
                });
                return
            }(await t({
                kind: "request",
                target: f,
                callKind: p,
                offer: _
            })).ok === !1 && w && a.stopScreen()
        }
    }), [o, l, u, h, d, c, a, t, r])
}
