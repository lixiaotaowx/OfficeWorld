function Sl(i, e) {
    const t = I.useRef(i);
    t.current = i;
    const n = I.useRef(""),
        s = I.useRef(""),
        r = I.useRef(0),
        a = I.useRef();
    I.useEffect(() => {
        var c;
        (c = a.current) == null || c.call(a)
    }, [JSON.stringify(i.privateCalls)]), I.useEffect(() => {
        var c;
        (c = a.current) == null || c.call(a)
    }, [JSON.stringify(i.chat), JSON.stringify(i.huddles)]);
    const o = I.useRef(Date.now());
    I.useEffect(() => {
        o.current = Date.now()
    }, [i.people]), I.useEffect(() => {
        var c;
        return (c = e == null ? void 0 : e.subscribe) == null ? void 0 : c.call(e, () => {
            var d;
            return (d = a.current) == null ? void 0 : d.call(a)
        })
    }, [e]), I.useEffect(() => {
        const c = typeof window > "u" ? void 0 : window.officeDesktop;
        if (!(c != null && c.dockState)) return;
        const d = () => {
            var h, m;
            n.current = "", s.current = "", (m = (h = c.dockState) == null ? void 0 : h.call(c, {
                people: [],
                sharing: !1,
                missed: 0,
                hidden: !0
            })) == null || m.catch(() => {})
        };
        if (!i.enabled) {
            d();
            return
        }
        const l = () => {
            var k, P, y;
            const h = {
                    ...t.current,
                    ...(e == null ? void 0 : e.snapshot()) ?? {}
                },
                m = Date.now(),
                f = {};
            for (const S of h.people) S != null && S.id && !Cs(S) && (f[S.id] = Vd(Bd(S, o.current, m)));
            const p = rd({
                people: h.people,
                myId: h.myId,
                unread: h.unread,
                missed: h.missed,
                sharing: h.sharing,
                hidden: h.hidden,
                away: f,
                connected: h.connected,
                transfers: h.transfers
            });
            p.meeting = h.meeting, p.screens = h.screens, p.huddles = h.huddles || [], p.chat = h.chat, p.privateCalls = h.privateCalls, p.statusControl = h.statusControl;
            for (const S of p.people) {
                const E = (k = h.people.find(x => x.id === S.id)) == null ? void 0 : k.clientId;
                S.status = E && ((P = h.statuses) == null ? void 0 : P[E]) || ""
            }
            const _ = JSON.stringify(p);
            if (_ === n.current) return;
            const w = JSON.stringify({
                ...p,
                meeting: gr(p.meeting),
                privateCalls: gr(p.privateCalls)
            });
            w === s.current && Date.now() - r.current < kl || (n.current = _, s.current = w, r.current = Date.now(), (y = c.dockState) == null || y.call(c, p).catch(() => {}))
        };
        a.current = l, l();
        const u = setInterval(l, yl);
        return () => {
            a.current = void 0, clearInterval(u), d()
        }
    }, [i.enabled, e]), I.useEffect(() => {
        var p, _, w;
        const c = typeof window > "u" ? void 0 : window.officeDesktop,
            d = (_ = (p = c == null ? void 0 : c.files) == null ? void 0 : p.onDropped) == null ? void 0 : _.call(p, k => {
                var S, E;
                const P = String((k == null ? void 0 : k.personId) || ""),
                    y = ((k == null ? void 0 : k.paths) || []).filter(x => typeof x == "string" && x);
                !P || !y.length || (E = (S = t.current).onFiles) == null || E.call(S, P, y)
            });
        if (!(c != null && c.onDockPreviewWant) || !c.onDockCommand) return () => {
            d == null || d()
        };
        let l = null,
            u;
        const h = c.onDockPreviewWant(k => {
                var S, E, x, D;
                if (!k) {
                    u && clearTimeout(u), u = void 0, l = null;
                    return
                }
                const P = sd(l, k, Date.now());
                l = P.dwell, u && (clearTimeout(u), u = void 0), P.watching ? (E = (S = t.current).onPreviewWant) == null || E.call(S, k) : u = setTimeout(() => {
                    var C, M;
                    u = void 0, (l == null ? void 0 : l.id) === k && ((M = (C = t.current).onPreviewWant) == null || M.call(C, k))
                }, P.waitMs);
                const y = (x = t.current.previews) == null ? void 0 : x[k];
                y && ((D = c.dockPreview) == null || D.call(c, {
                    id: k,
                    image: y
                }).catch(() => {}))
            }),
            m = c.onDockCommand(k => {
                var S, E, x, D, C, M, g, T, A, F, H, N;
                const P = k == null ? void 0 : k.kind,
                    y = String((k == null ? void 0 : k.personId) || "");
                if (P === "status" && y === t.current.myId) {
                    (E = (S = t.current).onStatus) == null || E.call(S);
                    return
                }
                if (P === "status-clear" && y === t.current.myId) {
                    (D = (x = t.current).onStatusClear) == null || D.call(x);
                    return
                }(M = (C = t.current).onChatCommand) != null && M.call(C, k) || (T = (g = t.current).onScreenCommand) != null && T.call(g, k) || (F = (A = t.current).onMeetingCommand) != null && F.call(A, k) || (N = (H = t.current).onPrivateCommand) != null && N.call(H, k) || !y || !["watch", "share", "call"].includes(P) || t.current.onCommand(P, y)
            }),
            f = (w = c.onDockAnswer) == null ? void 0 : w.call(c, k => {
                var y, S;
                const P = String((k == null ? void 0 : k.requestId) || "");
                P && ((S = (y = t.current).onAnswer) == null || S.call(y, P, (k == null ? void 0 : k.accept) === !0))
            });
        return () => {
            u && clearTimeout(u), h == null || h(), m == null || m(), f == null || f(), d == null || d()
        }
    }, [i.enabled])
}

