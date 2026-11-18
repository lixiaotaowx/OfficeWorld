function W(e) {
    const r = new Map,
        t = new Set;
    async function s(o) {
        const a = await e(),
            i = await new Promise((u, d) => {
                const c = a.transaction("files").objectStore("files").get(o.id);
                c.onsuccess = () => u(c.result), c.onerror = () => d(c.error)
            });
        if (i) return i;
        if (t.has(o.id)) throw new h("服务器上的已经过期，这台电脑上也没有存");
        const f = await fetch(`/api/chat/files/${encodeURIComponent(o.id)}`, {
            credentials: "same-origin",
            signal: AbortSignal.timeout(_(o.size))
        });
        if (f.status === 404 || f.status === 410) throw t.add(o.id), new h("服务器上的已经过期，这台电脑上也没有存");
        if (!f.ok) throw Error("文件没收到，再试一次");
        const l = await f.blob();
        if (l.size !== o.size) throw new h("文件没收完整，可能损坏了");
        return l.size > O || await new Promise((u, d) => {
            const c = a.transaction("files", "readwrite");
            c.objectStore("files").put(l, o.id), c.oncomplete = () => u(), c.onabort = () => d(Error("文件没存上，检查一下空间够不够")), c.onerror = () => d(Error("文件没存上，检查一下空间够不够"))
        }), l
    }
    const n = o => {
        const a = r.get(o.id);
        if (a) return a;
        const i = s(o).finally(() => r.delete(o.id));
        return r.set(o.id, i), i
    };
    return n.isGone = o => t.has(o), n
}
async function Y(e, r, t, s) {
    if (r.size < 0 || r.size > M) throw Error("每个文件要在 0 字节到 2 GB 之间");
    if (r.name.length > 200) throw Error("文件名不能超过 200 个字");
    const n = crypto.randomUUID();
    let o = 0;
    if (r.size === 0) {
        if (!e.connected) throw Error("连接断了，再发一次");
        const a = await e.timeout(15e3).emitWithAck("chat-file", {
            requestId: n,
            name: r.name,
            size: 0,
            offset: 0,
            bytes: new ArrayBuffer(0),
            recipientId: s
        });
        if (!(a != null && a.ok)) throw Error((a == null ? void 0 : a.error) || "文件没发出去");
        if (!a.message) throw Error("服务器还没确认文件存好了");
        return t(100), a.message
    }
    for (; o < r.size;) {
        const a = await r.slice(o, o + 131072).arrayBuffer();
        let i;
        for (let f = 0; f < 2; f++) {
            if (!e.connected) throw Error("连接断了，再发一次");
            try {
                i = await e.timeout(15e3).emitWithAck("chat-file", {
                    requestId: n,
                    name: r.name,
                    size: r.size,
                    offset: o,
                    bytes: a,
                    recipientId: s
                });
                break
            } catch {
                if (f === 1) throw Error("没收到送达确认，先看看聊天里有没有再重发")
            }
        }
        if (!(i != null && i.ok)) throw Error((i == null ? void 0 : i.error) || "文件没发出去");
        if (i.message) return t(100), i.message;
        if (i.offset <= o || i.offset > r.size) throw Error("传输进度不对");
        o = i.offset, t(Math.floor(o / r.size * 100))
    }
    throw Error("服务器还没确认文件存好了")
}
