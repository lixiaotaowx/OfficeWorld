function St(n) {
    const e = `office-received-files:${n}`;
    let t = {};
    try {
        t = JSON.parse(localStorage.getItem(e) || "{}"), (!t || Array.isArray(t) || typeof t != "object") && (t = {})
    } catch {}
    return {
        get: s => t[s],
        save(s) {
            var i, o;
            let r = !1;
            for (const a of s) {
                if (a.status !== "done" || !a.path) continue;
                const f = a.attachmentId || a.id;
                ((i = t[f]) == null ? void 0 : i.path) === a.path && ((o = t[f]) == null ? void 0 : o.endedAt) === a.endedAt || (t[f] = {
                    ...a,
                    handle: "",
                    url: ""
                }, r = !0)
            }
            if (r) {
                t = Object.fromEntries(Object.entries(t).sort((a, f) => f[1].endedAt - a[1].endedAt).slice(0, 2e3));
                try {
                    localStorage.setItem(e, JSON.stringify(t))
                } catch {}
            }
        }
    }
}
