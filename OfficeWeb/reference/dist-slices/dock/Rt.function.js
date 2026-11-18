function Rt(t, s = []) {
    if (!s.length) return [{
        text: t,
        mention: !1
    }];
    const n = [...new Set(s.map(o => o.name))].filter(Boolean).sort((o, d) => d.length - o.length).map(o => o.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!n.length) return [{
        text: t,
        mention: !1
    }];
    const c = new RegExp(`(^|[\\s，。！？、：；（(])[@＠](${n.join("|")})(?=$|[\\s，。！？、：；,.!?;:）)])`, "gu"),
        r = [];
    let i = 0;
    for (const o of t.matchAll(c)) {
        const d = o.index + o[1].length,
            m = d + o[2].length + 1;
        d > i && r.push({
            text: t.slice(i, d),
            mention: !1
        }), r.push({
            text: t.slice(d, m),
            mention: !0
        }), i = m
    }
    return i < t.length && r.push({
        text: t.slice(i),
        mention: !1
    }), r
}

