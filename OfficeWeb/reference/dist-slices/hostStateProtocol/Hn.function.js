function Hn(n, e = {}) {
    const t = e.now ?? (() => Date.now()),
        s = e.awayAfterMs ?? At,
        r = e.target ?? (typeof document > "u" ? void 0 : document),
        i = e.setInterval ?? ((k, O) => setInterval(k, O)),
        o = e.clearInterval ?? (k => clearInterval(k));
    let a = t(),
        f = !0,
        d = !1,
        m = !1;
    const _ = new Set;
    let y = 0;
    const A = () => {
            const k = Math.floor(t() / 1e3);
            _.add(k);
            for (const O of _) O <= k - 10 && _.delete(O);
            _.size >= 6 && (y = t() + 8e3)
        },
        E = () => {
            n.connected && n.emit("input-state", {
                atDesk: f,
                busy: d,
                idleMs: Math.max(0, t() - a)
            })
        },
        b = k => {
            const O = k && t() < y;
            k === f && O === d || (f = k, d = O, E())
        },
        I = () => {
            A(), a = t(), b(!0)
        },
        L = () => b(t() - a < s),
        N = e.desktopIdle ?? Ct(),
        F = () => {
            N && Promise.resolve().then(N).then(k => {
                if (m || !k) return;
                const O = Number(k.seconds),
                    l = v => {
                        a = t() - Math.max(v, s), b(!1)
                    };
                if (k.state === "locked") return l(Number.isFinite(O) ? O * 1e3 : 0);
                Number.isFinite(O) && (O * 1e3 < s ? (O < 2 && (A(), _.add(Math.floor(t() / 1e3) - 1)), a = t() - O * 1e3, b(!0)) : l(O * 1e3))
            }).catch(() => {})
        };
    for (const k of Re) r == null || r.addEventListener(k, I, {
        passive: !0,
        capture: !0
    });
    const B = () => E();
    n.on("connect", B);
    const P = i(L, Tt),
        S = N ? i(F, Ot) : void 0;
    return {
        isAtDesk: () => f,
        usesSystemIdle: () => N !== void 0,
        touch: I,
        tick: L,
        poll: F,
        stop() {
            m = !0, o(P), S !== void 0 && o(S), n.off("connect", B);
            for (const k of Re) r == null || r.removeEventListener(k, I, {
                capture: !0
            })
        }
    }
}
