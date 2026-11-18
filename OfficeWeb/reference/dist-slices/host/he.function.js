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
