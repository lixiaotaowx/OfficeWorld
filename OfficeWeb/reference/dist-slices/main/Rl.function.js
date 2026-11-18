function Rl(i) {
    var C, M;
    const {
        messages: e,
        contacts: t,
        hidden: n,
        people: s,
        seats: r,
        accountId: a,
        visitor: o,
        files: c
    } = i, d = od(a), l = I.useMemo(() => e.filter(g => {
        var T;
        return g.time > (((T = d[Wn(g, a)]) == null ? void 0 : T.deletedThrough) ?? -1)
    }), [e, d, a]), u = `office-chat-read:${a}`, [h, m] = I.useState(() => {
        try {
            const g = JSON.parse(localStorage.getItem(u) || "{}");
            return g && typeof g == "object" && !Array.isArray(g) ? g : {}
        } catch {
            return {}
        }
    }), [f, p] = I.useState(""), [_, w] = I.useState(""), k = I.useMemo(() => wl({
        messages: l,
        contacts: t,
        people: s,
        seats: r,
        accountId: a,
        read: h,
        visitor: o,
        hidden: n
    }), [l, t, s, r, a, h, o, n]), P = (M = (C = k.find(g => g.id === f)) == null ? void 0 : C.history.at(-1)) == null ? void 0 : M.id;
    I.useEffect(() => {
        !f || !P || (h[f] || "") >= P || m(g => {
            const T = {
                ...g,
                [f]: P
            };
            try {
                localStorage.setItem(u, JSON.stringify(T))
            } catch {}
            return T
        })
    }, [f, P, h, u]);
    const y = g => {
            const T = c.lookup(g);
            return T ? Yc(T) : g.startsWith("direct-") ? "已送达 · 保存在接收设备" : ""
        },
        S = k.filter(g => {
            var T;
            return ((T = d[g.id]) == null ? void 0 : T.hiddenAt) == null || g.at > d[g.id].hiddenAt
        }),
        E = Pl(k, f, a, _, y);
    E.threads = E.threads.filter(g => S.some(T => T.id === g.id)), E.members = o ? [] : Tl(s, a), E.directory = o ? [] : Cl(t, a);
    const x = I.useRef({
        threads: k,
        send: i.send,
        sendFile: i.sendFile,
        loadFile: i.loadFile,
        files: c
    });
    return x.current = {
        threads: k,
        send: i.send,
        sendFile: i.sendFile,
        loadFile: i.loadFile,
        files: c
    }, I.useEffect(() => ad(a, async (g, T) => {
        var H, N;
        const A = x.current,
            F = A.threads.find(Q => Q.id === g.conversation);
        if (!F) throw Error("这个会话不可用，请重新打开聊天");
        if (g.kind !== "upload") {
            const Q = "id" in g.file ? g.file.id : "",
                Z = (H = F.history.find(K => {
                    var z;
                    return ((z = K.attachment) == null ? void 0 : z.id) === Q
                })) == null ? void 0 : H.attachment;
            if (!Z) throw Error("附件不在当前会话中");
            if (g.kind === "open" || g.kind === "reveal") {
                if (A.files.lookup(Z.id))((N = A.files.lookup(Z.id)) == null ? void 0 : N.status) === "failed" && !Z.id.startsWith("direct-") && await A.files.downloadAttachment({
                    ...Z,
                    url: `/api/chat/files/${encodeURIComponent(Z.id)}`
                });
                else {
                    if (Z.id.startsWith("direct-")) throw Error("当前设备没有这份文件，请在接收文件的电脑上打开，或让对方重新发送");
                    await A.files.downloadAttachment({
                        ...Z,
                        url: `/api/chat/files/${encodeURIComponent(Z.id)}`
                    })
                }
                await A.files.fileAction(Z.id, g.kind);
                return
            }
            const ue = () => Z.id.startsWith("direct-") ? A.files.localImage(Z.id) : A.loadFile(Z);
            if (g.kind === "view") {
                if (!dd(Z.name)) throw Error("该附件不是可预览的图片");
                const K = await ue(),
                    {
                        openImageViewer: z
                    } = await ys(async () => {
                        const {
                            openImageViewer: j
                        } = await import("./ImageViewer-DRsS_j6W.js");
                        return {
                            openImageViewer: j
                        }
                    }, __vite__mapDeps([0, 1, 2, 3, 4]));
                z(K, Z.name);
                return
            }
            return ue()
        }
        if (!(g.file instanceof File)) throw Error("没有可发送的文件");
        if (!await A.sendFile(g.file, T, g.conversation === st ? void 0 : g.conversation)) throw Error("附件未发送成功，文件仍保留，可以重试")
    }), [a]), {
        chat: E,
        command: g => {
            var H;
            if (!g.kind.startsWith("chat-")) return !1;
            const {
                threads: T,
                send: A,
                files: F
            } = x.current;
            if (g.kind === "chat-open" && (g.personId && cd(a, g.personId, {
                    hiddenAt: void 0
                }), p(T.some(N => N.id === g.personId) ? g.personId : ""), w("")), g.kind === "chat-send") {
                const N = (g.text || "").trim();
                if (!N || !T.some(Q => Q.id === g.personId)) return !0;
                w(""), A(N, g.personId === st ? void 0 : g.personId).then(Q => {
                    Q || w("没发出去，再试一次")
                })
            }
            if (g.kind === "chat-file") {
                const N = (H = T.flatMap(Z => Z.history).find(Z => {
                    var ue;
                    return ((ue = Z.attachment) == null ? void 0 : ue.id) === g.personId
                })) == null ? void 0 : H.attachment;
                if (!N) return !0;
                const Q = F.lookup(N.id);
                (Q == null ? void 0 : Q.status) === "done" ? F.fileAction(N.id, "open").catch(Z => w(Z instanceof Error ? Z.message : "无法打开文件")): N.id.startsWith("direct-") ? w("当前设备没有这份文件，请在接收电脑上查看") : (Q == null ? void 0 : Q.status) !== "receiving" && F.downloadAttachment({
                    id: N.id,
                    name: N.name,
                    size: N.size,
                    url: `/api/chat/files/${encodeURIComponent(N.id)}`
                })
            }
            return !0
        },
        unread: El(k, s)
    }
}

