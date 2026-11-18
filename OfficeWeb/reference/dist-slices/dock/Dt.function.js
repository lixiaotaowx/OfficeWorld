function Dt(t) {
    var c, r;
    const s = {
        files: [],
        folders: 0
    };
    if (!t) return s;
    const n = Array.from(t.files || []);
    if (n.length) return s.files.push(...n), s;
    for (const i of Array.from(t.items || [])) {
        if (i != null && i.kind && i.kind !== "file") continue;
        const o = (c = i.webkitGetAsEntry) == null ? void 0 : c.call(i);
        if (o != null && o.isDirectory) {
            s.folders += 1;
            continue
        }
        const d = (r = i.getAsFile) == null ? void 0 : r.call(i);
        d && s.files.push(d)
    }
    return s
}

