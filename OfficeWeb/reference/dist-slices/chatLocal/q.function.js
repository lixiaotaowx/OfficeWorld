function q(e, r) {
    if (e === r) return !0;
    if (e.length !== r.length) return !1;
    for (let t = 0; t < e.length; t += 1) {
        const s = e[t],
            n = r[t];
        if (s.id !== n.id || s.attachmentId !== n.attachmentId || s.status !== n.status || s.transferred !== n.transferred || s.path !== n.path || s.folder !== n.folder || s.error !== n.error) return !1
    }
    return !0
}
