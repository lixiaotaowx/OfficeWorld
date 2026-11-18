function kn(t) {
    var r, i;
    const s = /https?:\/\/[^\s<>"“”]+|www\.[^\s<>"“”]+|["“](?:[a-z]:[\\/]|\\\\)[^\r\n"”]+["”]|(?:[a-z]:[\\/]|\\\\)[^\r\n<>"|?*]+/gi,
        n = [];
    let c = 0;
    for (const o of t.matchAll(s)) {
        const d = o.index;
        d > c && n.push({
            text: t.slice(c, d)
        });
        let m = o[0],
            h = m,
            k = /^(https?:\/\/|www\.)/i.test(m) ? "url" : "path";
        if (/^["“]/.test(m)) h = m.slice(1, -1);
        else {
            if (m = m.replace(/[\s，。；、！!？,;]+$/u, ""), k === "url")
                for (m = m.replace(/[.]+$/, ""); m.endsWith(")") && (((r = m.match(/\)/g)) == null ? void 0 : r.length) || 0) > (((i = m.match(/\(/g)) == null ? void 0 : i.length) || 0);) m = m.slice(0, -1);
            h = m
        }
        h && n.push({
            text: m,
            target: h,
            kind: k
        }), c = d + m.length
    }
    return c < t.length && n.push({
        text: t.slice(c)
    }), n
}

