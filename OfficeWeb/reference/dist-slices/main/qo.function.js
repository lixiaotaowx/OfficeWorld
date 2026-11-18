function qo() {
    var e, t;
    if (typeof window > "u" || ((e = window.officeHost) == null ? void 0 : e.enabled) === !1) return !1;
    if (((t = window.officeHost) == null ? void 0 : t.enabled) === !0) return !0;
    const i = Od && void 0;
    if (i === "0" || i === "false") return !1;
    if (i === "1" || i === "true") return !0;
    try {
        const n = new URLSearchParams(window.location.search).get("officeCommsHost");
        return !(n === "0" || n === "false")
    } catch {
        return !0
    }
}

