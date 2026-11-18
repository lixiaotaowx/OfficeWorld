function y5(r, e, t) {
    var c, h;
    const s = e.officeDesktop;
    let i, n = 0,
        o = !1;
    const a = () => t(i ?? !r.hidden),
        l = (c = s == null ? void 0 : s.onMainWindowVisibility) == null ? void 0 : c.call(s, u => {
            typeof u != "boolean" || o || (n++, i = u, a())
        }),
        A = n;
    return (h = s == null ? void 0 : s.mainWindowVisible) == null || h.call(s).then(u => {
        o || n !== A || typeof u != "boolean" || (i = u, a())
    }).catch(() => {}), r.addEventListener("visibilitychange", a), e.addEventListener("pageshow", a), e.addEventListener("focus", a), a(), () => {
        o = !0, l == null || l(), r.removeEventListener("visibilitychange", a), e.removeEventListener("pageshow", a), e.removeEventListener("focus", a)
    }
}

