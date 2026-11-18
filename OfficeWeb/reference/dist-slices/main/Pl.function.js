function Pl(i, e, t, n, s = () => "") {
    const r = i.find(o => o.id === e),
        a = ((r == null ? void 0 : r.history) || []).slice(-120).map(o => {
            var c;
            return {
                id: o.id,
                from: o.senderId || "",
                name: o.name,
                mine: o.senderId === t,
                text: o.text,
                time: o.time,
                ...(c = o.mentions) != null && c.length ? {
                    mentions: o.mentions,
                    mentionedMe: o.senderId !== t && o.mentions.some(d => d.id === t)
                } : {},
                ...o.attachment ? {
                    file: {
                        ...o.attachment,
                        state: s(o.attachment.id)
                    }
                } : {}
            }
        });
    return {
        open: r ? e : "",
        error: n,
        messages: a,
        threads: i.map(({
            history: o,
            ...c
        }) => c)
    }
}

