const hi = new Map,
    jn = new Map;
async function Dp(i) {
    var r;
    const e = hi.get(i.id);
    if ((e == null ? void 0 : e.status) === "done") return e;
    const t = jn.get(i.id);
    if (t) return t;
    const n = (r = window.officeDesktop) == null ? void 0 : r.files;
    if (!n) throw Error("收文件需要桌面客户端");
    const s = (async () => {
        const a = await n.receiveOpen({
            transferId: i.id,
            name: i.name,
            size: i.size
        });
        if (!(a != null && a.ok)) throw Error((a == null ? void 0 : a.error) || "文件没存上");
        const o = await fetch(i.url, {
            credentials: "same-origin",
            signal: AbortSignal.timeout(Uo(i.size))
        });
        if (o.status === 404 || o.status === 410) throw Error("服务器上的已经过期，让对方再发一次");
        if (!o.ok || !o.body) throw Error("文件没收到，再试一次");
        const c = o.body.getReader();
        try {
            for (;;) {
                const {
                    done: u,
                    value: h
                } = await c.read();
                if (u) break;
                const m = await n.receiveWrite(i.id, h);
                if (!(m != null && m.ok)) throw Error((m == null ? void 0 : m.error) || "写不进收文件的文件夹")
            }
            const d = await n.receiveEnd(i.id);
            if (!(d != null && d.ok)) throw Error((d == null ? void 0 : d.error) || "文件没存上");
            const l = {
                id: i.id,
                direction: "receive",
                status: "done",
                peerId: "",
                peerName: "Chat",
                name: d.savedName || i.name,
                size: i.size,
                transferred: i.size,
                path: d.path || "",
                folder: d.folder || a.folder || "",
                url: "",
                error: "",
                at: Date.now(),
                endedAt: Date.now(),
                handle: "",
                source: "chat"
            };
            return hi.set(i.id, l), l
        } catch (d) {
            throw n.receiveCancel(i.id).catch(() => {}), d
        }
    })();
    jn.set(i.id, s);
    try {
        return await s
    } finally {
        jn.delete(i.id)
    }
}

