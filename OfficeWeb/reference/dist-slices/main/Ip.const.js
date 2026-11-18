const Ip = {
        state: {
            connection: "inactive",
            quality: "unknown",
            participants: []
        },
        summary: "No active meeting",
        events: [],
        tick: 0
    },
    xp = 128 * 1024;
let Un = !1;
async function Mp(i, e, t) {
    if (i.size < 0 || i.size > Zc) throw Error("每个文件要在 0 字节到 2 GB 之间");
    if (i.name.length > 200) throw Error("文件名不能超过 200 个字");
    const n = Wo();
    if (!n) throw Error("通信宿主还没准备好，先别发文件");
    if (Un) throw Error("等这个文件传完再说");
    Un = !0;
    const s = crypto.randomUUID();
    try {
        if (i.size === 0) {
            const a = await n.request({
                event: "chat-file",
                timeoutMs: 15e3,
                payload: {
                    requestId: s,
                    name: i.name,
                    size: 0,
                    offset: 0,
                    bytes: new ArrayBuffer(0),
                    recipientId: t
                }
            });
            if (!a.ok) throw Error(a.error || "文件没发出去");
            const o = a.reply;
            if (!(o != null && o.ok)) throw Error((o == null ? void 0 : o.error) || "文件没发出去");
            return e(100), !0
        }
        let r = 0;
        for (; r < i.size;) {
            const a = await i.slice(r, r + xp).arrayBuffer(),
                o = await n.request({
                    event: "chat-file",
                    timeoutMs: 15e3,
                    payload: {
                        requestId: s,
                        name: i.name,
                        size: i.size,
                        offset: r,
                        bytes: a,
                        recipientId: t
                    }
                });
            if (!o.ok) throw Error(o.error || "文件没发出去");
            const c = o.reply;
            if (!(c != null && c.ok)) throw Error((c == null ? void 0 : c.error) || "文件没发出去");
            if (c.message) return e(100), !0;
            if (!Number.isFinite(c.offset) || !c.offset || c.offset <= r) throw Error("传输进度不对");
            r = c.offset, e(Math.floor(r / i.size * 100))
        }
        throw Error("服务器还没确认文件存好了")
    } catch (r) {
        throw n.emit({
            event: "chat-file-cancel",
            args: []
        }), r
    } finally {
        Un = !1
    }
}
async function Op(i) {
    const e = await fetch(`/api/chat/files/${encodeURIComponent(i.id)}`, {
        credentials: "same-origin",
        signal: AbortSignal.timeout(Uo(i.size))
    });
    if (e.status === 404 || e.status === 410) throw new ir("服务器上的已经过期，这台电脑上也没有存");
    if (!e.ok) throw Error("文件没收到，再试一次");
    const t = await e.blob();
    if (t.size !== i.size) throw new ir("文件没收完整，可能损坏了");
    return t
}
