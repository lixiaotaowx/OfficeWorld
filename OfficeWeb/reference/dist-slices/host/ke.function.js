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
