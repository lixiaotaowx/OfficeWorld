function Ln(n, e, t, s, r = () => {}) {
    let i = !1,
        o = !1,
        a = "";
    const f = new Set;
    let d, m = [];
    const _ = new Map;
    let y = !1,
        A = !1,
        E = !1;
    const b = Ze(async () => {
        if (await B, !d || i) throw Error("本地存储用不了");
        return d
    });
    async function I() {
        if (!(y || i)) {
            y = !0;
            try {
                for (const [l, v] of _) {
                    if (i) break;
                    try {
                        await b(v), _.delete(l)
                    } catch (h) {
                        if (h instanceof it) {
                            _.delete(l);
                            continue
                        }!i && !E && (E = !0, s("有些附件还没存到这台电脑上，会自动重试；7 天内保持连接就能收到"))
                    }
                }
                _.size || (E = !1)
            } finally {
                y = !1
            }
        }
    }
    const L = () => {
        i || t(l => l.filter(v => Ee(e, v))), _.clear()
    };
    window.addEventListener("storage", L), window.addEventListener("office-chat-local", L);
    const N = l => {
            l = l.filter(v => Ee(e, v)), i || t(v => st(v, l));
            for (const v of l) {
                const h = v.attachment;
                !h || h.id.startsWith("direct-") || b.isGone(h.id) || h.size > rt || _.set(h.id, h)
            }
            I()
        },
        F = () => {
            i || s("聊天没能存在本地，检查一下浏览器的存储和权限。服务器会保留 7 天")
        },
        B = (async () => {
            var l, v;
            try {
                if (d = await et(e), i) {
                    d.close();
                    return
                }
                const h = await tt(d);
                a = h.cursor, N(h.messages), (v = (l = navigator.storage) == null ? void 0 : l.persist) == null || v.call(l).catch(() => !1)
            } catch {
                F()
            }
        })();
    async function P(l) {
        var v;
        if (await B, !i) {
            l.senderId !== e && ((v = l.mentions) != null && v.some(h => h.id === e)) && !f.has(l.id) && (f.add(l.id), f.size > 200 && f.delete(f.values().next().value), s(`${l.name}在群聊中 @ 了你`)), N([l]);
            try {
                if (!d) throw Error("存储用不了");
                await Se(d, [l])
            } catch {
                F()
            }
        }
    }
    async function S() {
        if (await B, !(i || o || !n.connected)) {
            o = !0;
            try {
                const l = await n.timeout(1e4).emitWithAck("chat-contacts");
                !i && (l != null && l.ok) && (m = l.contacts || [], r(m, Array.isArray(l.hidden) ? l.hidden : []));
                let v = a;
                do {
                    const h = await n.timeout(1e4).emitWithAck("chat-history", v);
                    if (i) return;
                    if (!h.ok) throw Error(h.error);
                    if (N(h.messages), d) try {
                        await Se(d, h.messages, h.cursor), a = h.cursor
                    } catch {
                        F();
                        return
                    }
                    if (v = h.cursor, !h.more) break
                } while (n.connected && !i)
            } catch {
                i || s("以前的消息还在取，连上后会继续")
            } finally {
                o = !1
            }
        }
    }
    n.on("chat", P), n.on("connect", S);
    const k = l => {
        i || !Array.isArray(l == null ? void 0 : l.hidden) || r(m, l.hidden)
    };
    n.on("chat-directory", k);
    const O = window.setInterval(() => {
        S(), I()
    }, 3e4);
    return {
        loadFile: b,
        async sendFile(l, v, h) {
            if (A) return s("等这个文件传完再说"), !1;
            A = !0;
            try {
                return await P(await nt(n, l, v, h)), !0
            } catch (c) {
                return n.emit("chat-file-cancel"), s(c instanceof Error ? c.message : "文件没发出去"), !1
            } finally {
                A = !1
            }
        },
        async send(l, v) {
            if (!n.connected) return s("断开了，连上再发"), !1;
            const h = {
                text: l,
                requestId: crypto.randomUUID(),
                recipientId: v
            };
            for (let c = 0; c < 2; c++) try {
                const u = await n.timeout(1e4).emitWithAck("chat", h);
                return u != null && u.ok ? (await P(u.message), !0) : (s((u == null ? void 0 : u.error) || "没发出去"), !1)
            } catch {
                if (!n.connected) break
            }
            return s("没收到送达确认，你的话还在输入框里，先看看聊天里有没有再重发"), !1
        },
        dispose() {
            i = !0, clearInterval(O), window.removeEventListener("storage", L), window.removeEventListener("office-chat-local", L), n.off("chat", P), n.off("connect", S), n.off("chat-directory", k), d == null || d.close()
        }
    }
}