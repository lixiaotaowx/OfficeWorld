function zc({
    office: i,
    account: e,
    onLogout: t,
    dockPublisher: n
}) {
    var P, y, S, E, x, D, C, M, g;
    Al();
    const s = Vp(),
        r = Wd(e.id),
        a = gl(),
        [o, c] = I.useState(null),
        d = _l(i.activeMic, i.micLive, i.micLive),
        l = qd(i.meetings, i.videos, i.people, i.myId, e.id, () => {}, T => c({
            id: T
        }), d);
    I.useEffect(() => {
        c(null)
    }, [(P = i.meetings.active) == null ? void 0 : P.room]);
    const u = o ? l.streams[o.id] : void 0;
    I.useEffect(() => {
        var T;
        o && !((T = i.meetings.active) != null && T.sharing) && !u && c(null)
    }, [o, (y = i.meetings.active) == null ? void 0 : y.sharing, u]);
    const h = Ud(i, d),
        m = Fd(i, l.streams);
    Ol({
        requests: i.requests,
        people: i.people,
        sharing: i.sharing,
        ringing: (l.state.invitations || []).map(T => T.id)
    });
    const f = Rl({
        messages: i.messages,
        contacts: i.contacts,
        hidden: i.hiddenContacts,
        people: i.people,
        seats: i.seats,
        accountId: e.id,
        visitor: ((S = i.people.find(T => T.id === i.myId)) == null ? void 0 : S.role) === "visitor",
        send: i.chat,
        sendFile: i.sendChatFile,
        loadFile: i.loadChatFile,
        files: i.files
    });
    Sl({
        screens: m.screens,
        onScreenCommand: m.command,
        privateCalls: h.state,
        onPrivateCommand: h.command,
        enabled: !!((E = window.officeDesktop) != null && E.dockState),
        meeting: l.state,
        statuses: r.statuses,
        onStatus: r.show,
        onStatusClear: r.clear,
        statusControl: r.control,
        onMeetingCommand: l.command,
        huddles: l.huddles,
        chat: f.chat,
        onChatCommand: f.command,
        people: i.people,
        myId: i.myId,
        previews: i.previews,
        unread: f.unread,
        missed: new Set(i.callAlerts.map(T => T.target)),
        sharing: i.sharing,
        connected: i.connected,
        onPreviewWant: i.notifyWatching,
        onAnswer: h.answer,
        onCommand: (T, A) => {
            T === "call" ? i.request(A, "voice") : i.request(A, "screen", T === "share")
        },
        onFiles: (T, A) => {
            var F;
            return void i.files.sendFiles(T, A, ((F = i.people.find(H => H.id === T)) == null ? void 0 : F.name) || "")
        },
        transfers: i.files.dockRows()
    }, n);
    const [p, _] = I.useState(() => e.appearance ? Lo(e.appearance) : ed());

    function w(T) {
        _(T), i.setAppearance(T)
    }
    const k = typeof window < "u" && window.isSecureContext === !1;
    return v.jsxs(v.Fragment, {
        children: [v.jsx("div", {
            className: "hall-window-drag",
            "aria-hidden": "true"
        }), v.jsxs("div", {
            className: "app hall-app",
            children: [r.dialog, s && v.jsx(I.Suspense, {
                fallback: null,
                children: v.jsx(jp, {
                    office: i,
                    accountId: e.id,
                    appearance: p,
                    onAppearance: w,
                    onLogout: t,
                    update: a
                })
            }), k && v.jsxs("div", {
                className: "hall-insecure",
                role: "alert",
                children: ["这个页面走的是 HTTP，浏览器不让共享屏幕和用麦克风。要用的话请打开 ", v.jsx("a", {
                    href: `https://${location.host}/`,
                    children: `https://${location.host}/`
                })]
            }), v.jsxs(al, {
                children: [v.jsx(ol, {
                    office: i,
                    dockMode: !!((x = window.officeDesktop) != null && x.screenDock)
                }), !((D = window.officeDesktop) != null && D.screenDock) && i.videos["local-screen"] && Object.values(i.callStates).some(T => T.connected && T.sharing) && !i.meetings.sharing && v.jsx(Ko, {
                    stream: i.videos["local-screen"],
                    meeting: !1,
                    onStop: i.stopShare
                })]
            }), v.jsx(bl, {
                update: a
            }), m.view && i.connected && v.jsx(hr, {
                stream: m.view.stream,
                signal: i.signal,
                scope: m.view.scope,
                annotation: i.annotation,
                selfColor: Vn(e.id),
                own: m.view.own,
                annotatable: m.view.annotatable,
                label: m.view.name,
                shareControl: {
                    sharing: m.view.meeting ? i.meetings.sharing : !!((C = i.callStates[m.view.sessionId]) != null && C.sharing),
                    busy: m.view.busy,
                    error: m.view.error,
                    onToggle: () => m.command({
                        kind: "screen-control",
                        personId: m.view.id,
                        text: "share"
                    })
                },
                onClose: () => {
                    var T, A;
                    m.closeView(), (A = (T = window.officeDesktop) == null ? void 0 : T.setFullscreen) == null || A.call(T, !1).then(() => {
                        var F, H;
                        return (H = (F = window.officeDesktop) == null ? void 0 : F.windowAction) == null ? void 0 : H.call(F, "minimize")
                    }).catch(() => {})
                }
            }, `${m.view.scope}:${m.view.id}`), !m.view && o && i.connected && i.meetings.active && v.jsx(hr, {
                stream: l.streams[o.id],
                signal: i.signal,
                scope: i.meetings.active.room,
                annotation: i.annotation,
                selfColor: Vn(e.id),
                own: o.id === i.myId,
                shareControl: {
                    sharing: l.state.sharing,
                    busy: l.state.busy,
                    error: l.state.error,
                    onToggle: () => l.command({
                        kind: "meeting-share",
                        personId: i.meetings.active.id
                    })
                },
                annotatable: ((M = i.people.find(T => T.id === o.id)) == null ? void 0 : M.annotate) === !0,
                label: `${((g=i.people.find(T=>T.id===o.id))==null?void 0:g.name)||"同事"}共享的屏幕`,
                onClose: () => c(null)
            }, `${i.meetings.active.room}:${o.id}`), s && e.lookConfirmed !== !0 && v.jsx(I.Suspense, {
                fallback: null,
                children: v.jsx(Fp, {
                    account: e,
                    appearance: p,
                    onAppearance: w
                })
            })]
        })]
    })
}

