function zo(i) {
    let e = !1,
        t = !1,
        n = !1,
        s = !0,
        r = !1,
        a, o = !1,
        c, d = !1,
        l = "";
    const u = !!window.officeDesktop,
        h = E => {
            e !== E && (e = E, i.onChange())
        },
        m = E => {
            t !== E && (t = E, i.onChange())
        },
        f = E => {
            n !== E && (n = E, i.onChange())
        },
        p = E => {
            s !== E && (s = E, i.onChange())
        },
        _ = E => p((E == null ? void 0 : E.wanted) !== !1),
        w = () => {
            const E = i.socket.current;
            !E || d || (d = !0, E.on("ambient", _))
        },
        k = () => {
            var E;
            d && (d = !1, (E = i.socket.current) == null || E.off("ambient", _))
        };

    function P() {
        o && (o = !1, c == null || c(), c = void 0)
    }

    function y() {
        var N;
        if (o) return;
        (a == null ? void 0 : a.seat) != null;
        const E = !!a && a.role !== "visitor",
            x = vr({
                desktop: u,
                connected: r,
                mayBroadcast: E
            }),
            D = window.officeDesktop,
            C = i.socket.current;
        if (!x || !D || !C) {
            h(!1), (N = D == null ? void 0 : D.setPreviewActive) == null || N.call(D, !1).catch(() => {});
            return
        }
        o = !0;
        let M = !1,
            g = !1,
            T = !1,
            A;
        async function F() {
            var Q;
            if (!(M || g)) {
                g = !0, clearTimeout(A);
                try {
                    const Z = await D.previewFrame();
                    if (M || !C.connected) return;
                    if (!Z) {
                        const ue = await ((Q = D.previewState) == null ? void 0 : Q.call(D).catch(() => {}));
                        if (ue != null && ue.paused) {
                            f(!0), h(!1), m(!1);
                            return
                        }
                        return
                    }
                    C.emit("ambient-sharing", !0), C.emit("preview", Z), h(!0), f(!1), m(!1), T = !1
                } catch {
                    M || (h(!1), m(!0), C.emit("ambient-sharing", !1), T || i.notify("Screen preview unavailable. Retrying automatically."), T = !0)
                } finally {
                    g = !1, M || (A = setTimeout(F, H()))
                }
            }
        }
        const H = () => Nl(document.hasFocus(), document.visibilityState !== "hidden");
        F(), window.addEventListener("office-display-changed", F), window.addEventListener("focus", F), c = () => {
            M = !0, clearTimeout(A), window.removeEventListener("office-display-changed", F), window.removeEventListener("focus", F), C.connected && C.emit("ambient-sharing", !1), h(!1)
        }
    }

    function S(E, x) {
        var g, T;
        r = E, a = x, (a == null ? void 0 : a.seat) != null;
        const D = !!a && a.role !== "visitor",
            C = vr({
                desktop: u,
                connected: r,
                mayBroadcast: D
            }),
            M = `${r}|${C}|${(a==null?void 0:a.id)||""}`;
        if (M !== l) {
            if (l = M, r && w(), P(), !C) {
                h(!1), (T = (g = window.officeDesktop) == null ? void 0 : g.setPreviewActive) == null || T.call(g, !1).catch(() => {});
                return
            }
            y()
        }
    }
    return {
        setContext: S,
        reason() {
            (a == null ? void 0 : a.seat) != null;
            const E = !!a && a.role !== "visitor";
            return Ll({
                active: e,
                desktop: u,
                connected: r,
                mayBroadcast: E,
                failed: t,
                watched: s,
                paused: n
            })
        },
        dispose() {
            P(), k()
        }
    }
}
var br = {};

