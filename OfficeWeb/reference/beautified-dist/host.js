import {
    r as W
} from "./chatLocal-Dk4Cw6Bt.js";
import {
    c as Y,
    a as $,
    f as x,
    d as H,
    l as z,
    b as J,
    r as _,
    e as Q,
    g as X,
    h as Z,
    w as ee,
    i as te,
    s as se,
    j as G,
    k as ne,
    m as oe,
    n as ie,
    o as re,
    p as ae,
    q as ce,
    t as le,
    u as ue
} from "./hostStateProtocol-N4HTdSBp.js";
const de = 100,
    fe = {
        state: {
            connection: "inactive",
            quality: "unknown",
            participants: []
        },
        summary: "No active meeting",
        events: [],
        tick: 0
    };

function pe() {
    return {
        attach() {},
        detach() {},
        clearShareMarks() {},
        mirror() {},
        undoOnLayer() {},
        draw() {},
        clear() {},
        undo() {},
        attachSocket() {},
        trackMeetingRoom() {}
    }
}
const V = [1e3, 3e3];

function he(e) {
    const t = {
            current: void 0
        },
        s = ne(t);
    let f, c, w, v, g = !1,
        S = !1,
        A = 0,
        h;
    const k = {
            requestBusy: !1,
            muteBusy: !1,
            sitSequence: 0,
            receivePreviews: !0,
            invitationIds: new Set,
            selectingForInvite: null
        },
        R = new Set;
    let i;
    const O = pe(),
        l = oe(t, n => y(n)),
        a = Y({
            accountId: e.id,
            notify: () => {}
        }),
        C = te({
            socket: () => t.current,
            media: () => {},
            onChange: () => d({})
        });
    a.subscribe(() => d({}));

    function y(n) {
        d({
            notice: n
        })
    }

    function L() {
        return {
            people: [],
            seats: [],
            messages: [],
            contacts: [],
            hiddenContacts: [],
            accountId: e.id,
            requests: [],
            outgoing: [],
            callAlerts: [],
            deskSensorLabel: H(!1),
            sessions: [],
            previews: {},
            motions: {},
            cat: null,
            catSpeech: null,
            billiards: s,
            videos: {},
            connected: !1,
            sharing: !1,
            previewReason: "",
            muted: !1,
            voiceStatus: "Not in a call",
            callStates: {},
            signal: fe,
            micLive: !1,
            notice: `欢迎回来，${e.name}`,
            files: x(a),
            myId: "",
            clientId: e.id,
            name: e.name,
            boardScope: void 0,
            meetings: C.view(),
            systemIdleSensor: !1
        }
    }

    function P(n) {
        var b, T, o;
        const u = {
                ...i ?? L(),
                ...n
            },
            m = C.view();
        u.meetings = m, (b = m.active) == null || b.room;
        const E = ((T = t.current) == null ? void 0 : T.id) || "",
            I = u.sessions.filter(r => {
                var M;
                return (M = r.screenOwners) == null ? void 0 : M.includes(E)
            }).map(r => r.room);
        return m.sharing && ((o = m.active) != null && o.room) && I.push(m.active.room), u.boardScope = I[0], u.files = x(a), u.deskSensorLabel = H(u.systemIdleSensor), u.accountId = e.id, u.clientId = e.id, u.name = e.name, i = u, u
    }

    function d(n) {
        const u = Object.keys(n);
        if (!(u.length && u.every(m => Object.is(i == null ? void 0 : i[m], n[m])))) {
            P(n);
            for (const m of R) m()
        }
    }

    function p() {
        if (g) return;
        g = !0;
        const n = z({
            autoConnect: !1
        });
        t.current = n, w = J(n, e.id), n.on("connect", () => {
            S = !1, A = 0, d({
                previews: {},
                connected: !0,
                myId: n.id || ""
            }), n.emit("join", {
                name: e.name,
                appearance: W(e.appearance),
                annotate: !0
            }), n.emit("preview-allowed", k.receivePreviews), C.setConnected(!0)
        });
        const u = (o, r = !1) => window.dispatchEvent(new CustomEvent("office-session-ended", {
                detail: {
                    message: o,
                    forget: r
                }
            })),
            m = () => {
                n.disconnect(), n.connect()
            },
            E = o => {
                const r = se(o);
                if (r === "reconnect") {
                    m();
                    return
                }
                if (r === "recover-once") {
                    if (!S) {
                        S = !0, m();
                        return
                    }
                    u(G(o, "登录过期了，请重新登录"));
                    return
                }
                r === "login" && u(G(o, "你的账号在别处登录了，请重新登录"))
            };
        n.on("session-replaced", () => u("你的账号在别处登录了，请重新登录")), n.on("session-code", E), n.on("connect_error", o => {
            if (o.message !== "Please sign in") {
                y("连不上，正在重试…");
                return
            }
            if (A < V.length) {
                const r = V[A++];
                clearTimeout(h), h = setTimeout(() => {
                    g && !n.connected && n.connect()
                }, r);
                return
            }
            u("登录过期了，请重新登录")
        }), n.on("disconnect", o => {
            k.invitationIds.clear(), k.selectingForInvite = null, d({
                sessions: [],
                requests: [],
                outgoing: [],
                connected: !1,
                people: [],
                previews: {},
                motions: {},
                notice: o === "io server disconnect" ? "你的账号在别的窗口登录了，或者登录过期了，请重新登录" : "断开了，正在重连…"
            }), C.setConnected(!1)
        }), n.on("people", o => {
            const r = new Set(o.map(M => M.id));
            d({
                people: o,
                previews: _(i.previews, r),
                motions: _(i.motions, r)
            })
        }), n.on("seats", o => d({
            seats: o
        }));
        const I = {};
        let b;
        n.on("cat-speech", o => d({
            catSpeech: o
        })), n.on("office-cat", o => d({
            cat: o
        })), n.on("billiards-state", s.receive), n.on("motion", o => {
            I[o.id] = o, !b && (b = setTimeout(() => {
                b = void 0, v = void 0;
                const r = {
                    ...I
                };
                for (const M of Object.keys(I)) delete I[M];
                d({
                    motions: {
                        ...i.motions,
                        ...r
                    }
                })
            }, de), v = b)
        }), n.on("notice", o => y(o)), n.on("kicked", o => u((o == null ? void 0 : o.message) || "管理员把你移出了办公室，请重新登录")), f = Q(n, e.id, o => d({
            messages: o(i.messages)
        }), o => y(o), (o, r) => d({
            contacts: o,
            hiddenContacts: r
        })), c = X(n, o => {
            const r = i.previews;
            d({
                previews: ie(r, o, {
                    selfId: n.id,
                    receiving: k.receivePreviews
                }).next
            })
        }), n.on("request", o => {
            k.invitationIds.add(o.id), d({
                requests: [...i.requests, o]
            })
        }), n.on("request-sent", o => d({
            outgoing: [...i.outgoing.filter(r => r.id !== o.id), o]
        })), n.on("request-expired", o => {
            const r = typeof o == "string" ? o : o == null ? void 0 : o.id,
                M = Z(o, i.outgoing, i.requests, j => {
                    var q;
                    return ((q = i.people.find(U => U.id === j)) == null ? void 0 : q.name) || ""
                });
            k.invitationIds.delete(r), d({
                outgoing: i.outgoing.filter(j => j.id !== r),
                requests: i.requests.filter(j => j.id !== r),
                ...M ? {
                    callAlerts: ee(i.callAlerts, M)
                } : {}
            })
        }), n.on("session", o => {
            d({
                sessions: [...i.sessions.filter(r => r.id !== o.id), o]
            })
        }), n.on("session-end", o => {
            d({
                sessions: i.sessions.filter(r => r.id !== o)
            })
        }), a.attach(n), n.connect()
    }

    function N() {
        var n;
        g && (g = !1, clearTimeout(h), v && clearTimeout(v), v = void 0, c == null || c(), w == null || w(), f == null || f.dispose(), (n = t.current) == null || n.disconnect(), C.dispose())
    }
    const F = $({
        getSnapshot: () => i,
        publish: d,
        socket: () => t.current,
        media: () => {},
        annotations: O,
        seatApi: l,
        chat: () => f,
        setNotice: y,
        flags: k
    });

    function K(n, u, m = 1e4) {
        return new Promise(E => {
            const I = t.current;
            if (!(I != null && I.connected)) return E({
                ok: !1,
                error: "通信宿主未连接"
            });
            I.timeout(m).emit(n, u, (b, T) => {
                E(b ? {
                    ok: !1,
                    error: "请求超时了"
                } : {
                    ok: !0,
                    reply: T
                })
            })
        })
    }

    function D(n, u) {
        var m;
        (m = t.current) == null || m.emit(n, ...u)
    }
    return i = P({}), {
        getSnapshot: () => i,
        subscribe(n) {
            return R.add(n), () => {
                R.delete(n)
            }
        },
        actions: F,
        start: p,
        dispose: N,
        mediaRequest: K,
        mediaEmit: D,
        socket: () => t.current,
        reconnect() {
            const n = t.current;
            !g || !n || n.connected || (A = 0, clearTimeout(h), n.connect())
        },
        setViewAttached(n) {
            n || (Object.keys(i.previews).length || Object.keys(i.motions).length) && d({
                previews: {},
                motions: {}
            })
        }
    }
}
const ve = {
    ok: !1,
    error: "这个操作还没有迁移到通信宿主"
};
async function me(e, t) {
    const s = e.actions;
    switch (t.kind) {
        case "setAppearance":
            return s.setAppearance(t.appearance), {
                ok: !0
            };
        case "sitSpot":
            return {
                ok: await s.sitSpot(t.id)
            };
        case "claimSeat":
            return {
                ok: await s.claimSeat(t.seat)
            };
        case "reportMotion":
            return s.reportMotion(t.motion), {
                ok: !0
            };
        case "setPreviewAllowed":
            return s.setPreviewAllowed(t.allowed), {
                ok: !0
            };
        case "notifyWatching":
            return s.notifyWatching(t.targetId), {
                ok: !0
            };
        case "interactCat":
            return s.interactCat(t.action);
        case "request":
            return await s.request(t.target, t.callKind, t.offer), {
                ok: !0
            };
        case "respond":
            return await s.respond(t.id, t.accept), {
                ok: !0
            };
        case "cancelRequest":
            return s.cancelRequest(t.id), {
                ok: !0
            };
        case "dismissCallAlert":
            return s.dismissCallAlert(t.id), {
                ok: !0
            };
        case "end":
            return s.end(t.id), {
                ok: !0
            };
        case "share":
            return await s.share(), {
                ok: !0
            };
        case "stopShare":
            return s.stopShare(), {
                ok: !0
            };
        case "shareInCall":
            return {
                ok: await s.shareInCall(t.id)
            };
        case "mute":
            return {
                ok: await s.mute(t.sessionId)
            };
        case "setRemoteAudioMuted":
            return s.setRemoteAudioMuted(t.room, t.muted), {
                ok: !0
            };
        case "chat":
            return {
                ok: await s.chat(t.text, t.recipientId)
            };
        case "loadChatFile":
            return {
                ok: !0, blob: await s.loadChatFile(t.attachment)
            };
        case "meeting-action":
            return await e.getSnapshot().meetings.act(t.data), {
                ok: !0
            };
        case "meeting-mute":
            return await e.getSnapshot().meetings.toggleMic(), {
                ok: !0
            };
        case "meeting-share":
            return await e.getSnapshot().meetings.toggleShare(), {
                ok: !0
            };
        case "annotation": {
            const {
                action: f,
                scope: c,
                points: w,
                done: v,
                color: g
            } = t.command;
            return f === "draw" ? s.annotation.draw(c, w || [], v === !0, g) : s.annotation[f](c), {
                ok: !0
            }
        }
        case "adminKick":
            return s.adminKick(t.seat, t.password);
        case "billiards-action":
            return await e.getSnapshot().billiards.act(t.tableId, t.command), {
                ok: !0
            };
        case "notice":
            return s.setNotice(t.message), {
                ok: !0
            };
        case "view":
            return e.setViewAttached(t.attached), {
                ok: !0
            };
        case "media-request":
            return e.mediaRequest(t.event, t.payload, t.timeoutMs);
        case "media-emit":
            return e.mediaEmit(t.event, t.args), {
                ok: !0
            };
        case "file-open":
            return e.getSnapshot().files.open(t.id), {
                ok: !0
            };
        case "file-reveal":
            return e.getSnapshot().files.reveal(t.id), {
                ok: !0
            };
        case "file-cancel":
            return e.getSnapshot().files.cancel(t.id), {
                ok: !0
            };
        case "file-dismiss":
            return e.getSnapshot().files.dismiss(t.id), {
                ok: !0
            };
        case "file-dismiss-all":
            return e.getSnapshot().files.dismissAll(), {
                ok: !0
            };
        case "file-download":
            return await e.getSnapshot().files.downloadAttachment(t.attachment), {
                ok: !0
            };
        case "file-send":
            return await e.getSnapshot().files.sendFiles(t.personId, t.paths, t.peerName || ""), {
                ok: !0
            };
        case "screen-control":
            return ve;
        case "logout":
        case "chooseRole":
            return {
                ok: !1, error: "登录暂未迁移到通信宿主（P5）"
            }
    }
}

function B(e) {
    var t;
    return {
        identity: {
            myId: e.myId,
            name: e.name,
            accountId: e.clientId,
            connected: e.connected,
            appearance: (t = e.people.find(s => s.id === e.myId)) == null ? void 0 : t.appearance
        },
        presence: {
            people: e.people,
            seats: e.seats,
            cat: e.cat,
            catSpeech: e.catSpeech,
            billiards: Object.fromEntries(e.billiards.states())
        },
        calls: {
            sessions: e.sessions,
            callStates: e.callStates,
            requests: e.requests,
            outgoing: e.outgoing,
            callAlerts: e.callAlerts,
            muted: e.muted,
            voiceStatus: e.voiceStatus,
            micLive: e.micLive
        },
        meetings: {
            active: e.meetings.active,
            invitations: e.meetings.invitations,
            huddles: e.meetings.huddles || [],
            status: e.meetings.status,
            mic: e.meetings.mic,
            sharing: e.meetings.sharing
        },
        chat: {
            contacts: e.contacts,
            hiddenContacts: e.hiddenContacts
        },
        files: {
            transfers: e.files.rows
        },
        media: {
            sharing: e.sharing,
            previewReason: e.previewReason,
            boardScope: e.boardScope,
            signal: e.signal
        },
        desktop: {
            deskSensorLabel: e.deskSensorLabel,
            systemIdleSensor: e.systemIdleSensor
        },
        notice: e.notice
    }
}

function ge(e) {
    const t = B(e);
    return {
        ...t,
        presence: {
            ...t.presence,
            previews: e.previews,
            motions: e.motions
        },
        chat: {
            ...t.chat,
            messages: e.messages
        }
    }
}

function we(e, t = () => Date.now()) {
    const s = t();
    let f = 0,
        c = null,
        w = {},
        v = {},
        g = [],
        S = 0;

    function A(h) {
        const k = ge(h);
        for (const R of re(s, ++f, k)) e.state(R);
        c = B(h), w = {
            ...h.previews
        }, v = {
            ...h.motions
        }, g = [...h.messages], S = t()
    }
    return {
        publish(h, k = !1) {
            if (!c || k) {
                A(h);
                return
            }
            const R = B(h),
                i = ae(c, R);
            Object.keys(i).length && e.state({
                kind: "state",
                epoch: s,
                seq: ++f,
                patch: i
            });
            const O = ce(w, h.previews);
            Object.keys(O).length && e.preview({
                kind: "preview",
                epoch: s,
                seq: ++f,
                batch: O
            });
            const l = le(v, h.motions);
            Object.keys(l).length && e.motion({
                kind: "motion",
                epoch: s,
                seq: ++f,
                batch: l
            });
            const a = ue(g, h.messages);
            (a.upserts.length || a.removed.length) && e.chat({
                kind: "chat",
                epoch: s,
                seq: ++f,
                upserts: a.upserts,
                removed: a.removed
            }), c = R, w = {
                ...h.previews
            }, v = {
                ...h.motions
            }, g = [...h.messages], (Object.keys(i).length || Object.keys(O).length || Object.keys(l).length || a.upserts.length || a.removed.length) && (S = t())
        },
        sendFull: A,
        heartbeat() {
            !c || t() - S < 1e3 || (e.state({
                kind: "state",
                epoch: s,
                seq: ++f,
                patch: {}
            }), S = t())
        }
    }
}

function ke(e, t = {}) {
    let s, f, c, w;
    const v = [];
    let g;

    function S(l) {
        var a;
        return s && (f == null ? void 0 : f.id) === l.id ? ((a = s.reconnect) == null || a.call(s), s) : (A(), f = l, s = (t.createCore || he)(l), c = we(e ?? {
            state() {},
            preview() {},
            motion() {},
            chat() {}
        }, t.now), w = s.subscribe(() => c == null ? void 0 : c.publish(s.getSnapshot())), s.start(), c.publish(s.getSnapshot(), !0), R(), s)
    }

    function A() {
        w == null || w(), w = void 0, s == null || s.dispose(), s = void 0, c = void 0, f = void 0
    }
    async function h() {
        const l = t.restoreAccount ? await t.restoreAccount().catch(() => null) : null;
        return l && S(l), l
    }

    function k() {
        var d;
        if (!e) return () => {};
        const l = e.onStart(p => {
                S(p)
            }),
            a = e.onCommand(p => s ? me(s, p) : {
                ok: !1,
                error: "通信宿主还没准备好"
            }),
            C = e.onRequest(p => s ? Array.isArray(p == null ? void 0 : p.args) ? (s.mediaEmit(String(p.event || ""), p.args), {
                ok: !0
            }) : s.mediaRequest(String((p == null ? void 0 : p.event) || ""), p == null ? void 0 : p.payload, Number(p == null ? void 0 : p.timeoutMs) || void 0) : {
                ok: !1,
                error: "通信宿主还没准备好"
            }),
            y = e.onStateGet(() => {
                s && (s.setViewAttached(!0), c == null || c.sendFull(s.getSnapshot()))
            }),
            L = (d = e.onBackgroundPreview) == null ? void 0 : d.call(e, i);
        l && v.push(l), a && v.push(a), C && v.push(C), y && v.push(y), L && v.push(L);
        const P = p => {
            var F;
            const N = p.detail || {};
            (F = e.response) == null || F.call(e, {
                kind: "auth-expired",
                message: N.message || "登录过期了，请重新登录"
            })
        };
        return typeof window < "u" && (window.addEventListener("office-session-ended", P), v.push(() => window.removeEventListener("office-session-ended", P))), g = setInterval(() => c == null ? void 0 : c.heartbeat(), 1e3), () => {
            O()
        }
    }

    function R() {
        const l = s == null ? void 0 : s.socket();
        if (l)
            for (const a of ["connect", "disconnect", "meeting-screen-replaced", "ambient", "watched", "annotate", "annotate-clear", "annotate-undo"]) l.on(a, (...C) => {
                var y;
                e != null && e.mediaEvent ? e.mediaEvent({
                    name: a,
                    args: C
                }) : (y = e == null ? void 0 : e.response) == null || y.call(e, {
                    kind: "media-event",
                    name: a,
                    args: C
                })
            })
    }

    function i(l) {
        const a = s == null ? void 0 : s.socket();
        return !(a != null && a.connected) || !l ? !1 : (a.emit("ambient-sharing", !0), a.emit("preview", l), !0)
    }

    function O() {
        g && (clearInterval(g), g = void 0);
        for (const l of v.splice(0)) l();
        A()
    }
    return {
        mount: k,
        start(l) {
            return S(l)
        },
        restore: h,
        dispose: O,
        get client() {
            return s
        },
        get started() {
            return !!s
        },
        publishBackgroundPreview: i
    }
}
const Se = ke(window.officeHostRuntime);
Se.mount();