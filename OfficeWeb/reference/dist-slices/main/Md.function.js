function Md(i) {
    let e = !1,
        t = !1,
        n = 0,
        s, r;
    async function a(d, l) {
        r = new AbortController;
        const u = setTimeout(() => r == null ? void 0 : r.abort(), 1e4);
        try {
            return await fetch(d, {
                ...l,
                signal: r.signal
            })
        } finally {
            clearTimeout(u)
        }
    }
    async function o() {
        var d, l;
        if (!(e || t)) {
            t = !0, clearTimeout(s);
            try {
                const u = await ((d = window.officeDesktop) == null ? void 0 : d.readLogin().catch(() => null));
                if (e) return;
                let h;
                if (u) {
                    if ((l = i.credentials) == null || l.call(i, u), h = await a("/api/auth/login", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(u)
                        }), e) return;
                    if (h.status === 400 || h.status === 401 || h.status === 403) {
                        i.error("名字或密码不对，检查一下再试"), c();
                        return
                    }
                } else {
                    if (h = await a("/api/auth/me"), e) return;
                    if (h.status === 401) {
                        c();
                        return
                    }
                }
                if (!h.ok) throw Error("Offline");
                const m = await h.json();
                e || (i.user(m.user), i.error(""), c())
            } catch {
                if (!e) {
                    const u = Math.min(30, 5 * ++n);
                    i.error(`Network unavailable. Retrying in ${u} seconds…`), s = setTimeout(o, u * 1e3)
                }
            } finally {
                t = !1, i.loading(!1)
            }
        }
    }

    function c() {
        e = !0, clearTimeout(s), r == null || r.abort(), window.removeEventListener("online", o)
    }
    return window.addEventListener("online", o), o(), c
}
