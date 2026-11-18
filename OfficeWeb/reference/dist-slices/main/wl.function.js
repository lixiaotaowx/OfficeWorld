function wl(i) {
    const {
        messages: e,
        contacts: t,
        people: n,
        seats: s,
        accountId: r,
        read: a,
        visitor: o,
        hidden: c
    } = i, d = new Map;
    for (const h of t) h.id !== r && d.set(h.id, h.name);
    for (const h of n) h.clientId !== r && d.set(h.clientId, h.name);
    for (const h of s) h && h.id !== r && d.set(h.id, h.name);
    for (const h of e) {
        const m = Wn(h, r);
        if (m === st || !m || d.has(m)) continue;
        const f = t.find(p => p.id === m);
        d.set(m, (f == null ? void 0 : f.name) || (h.senderId === r ? h.recipientName || "同事" : h.name))
    }
    const l = [...o ? [] : [{
            id: st,
            name: "iruler"
        }], ...[...d].map(([h, m]) => ({
            id: h,
            name: m
        }))].filter(h => !c.includes(h.id)),
        u = new Map;
    for (const h of e) {
        const m = Wn(h, r);
        u.has(m) || u.set(m, []), u.get(m).push(h)
    }
    return l.map(h => {
        const m = u.get(h.id) || [],
            f = m.at(-1);
        return {
            ...h,
            history: m,
            at: (f == null ? void 0 : f.time) || 0,
            lastFrom: f == null ? void 0 : f.senderId,
            lastName: f == null ? void 0 : f.name,
            last: f ? (f.attachment ? `[文件] ${f.attachment.name}` : f.text).replace(/\s+/g, " ").slice(0, 120) : "",
            online: h.id === st || n.some(p => p.clientId === h.id),
            unread: m.filter(p => p.senderId !== r && p.id > (a[h.id] || "")).length
        }
    }).sort((h, m) => h.id === st ? -1 : m.id === st ? 1 : m.at - h.at || h.name.localeCompare(m.name, "zh"))
}

