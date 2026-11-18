function Rp(i, e) {
    var d;
    const t = new Map,
        n = (l, u) => {
            for (const h of t.get(l) || []) h(...u)
        },
        s = (d = i.onEvent) == null ? void 0 : d.call(i, l => n(l.name, l.args)),
        r = (l, u, h) => i.request({
            event: l,
            payload: u.length > 1 ? u : u[0],
            timeoutMs: h
        }),
        a = (l, ...u) => {
            const h = [...u],
                m = typeof h[h.length - 1] == "function" ? h.pop() : void 0;
            return m ? r(l, h).then(f => {
                f.ok ? m(null, f.reply) : m(Error(f.error || "请求失败"), void 0)
            }).catch(() => m(Error("请求失败"), void 0)) : i.emit({
                event: l,
                args: h
            }), c
        },
        c = {
            get id() {
                return e().id
            },
            get connected() {
                return e().connected
            },
            emit: a,
            timeout: l => ({
                emit(u, ...h) {
                    a(u, ...h)
                },
                emitWithAck(u, ...h) {
                    return r(u, h, l).then(m => {
                        if (!m.ok) throw Error(m.error || "请求失败");
                        return m.reply
                    })
                }
            }),
            on(l, u) {
                return t.has(l) || t.set(l, new Set), t.get(l).add(u), c
            },
            off(l, u) {
                var h;
                return (h = t.get(l)) == null || h.delete(u), c
            }
        };
    return {
        socket: c,
        dispose() {
            s == null || s(), t.clear()
        }
    }
}
