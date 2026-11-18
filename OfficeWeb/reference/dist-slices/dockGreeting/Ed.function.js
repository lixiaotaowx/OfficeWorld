function Ed(p, S) {
    const f = new BroadcastChannel(Ba);
    let R = !1;
    const E = z => {
        R || f.postMessage(z)
    };
    return f.onmessage = async ({
        data: z
    }) => {
        if ((z == null ? void 0 : z.account) !== p || !["upload", "load", "view", "open", "reveal"].includes(z.kind) || typeof z.id != "string") return;
        const F = M => E({
                id: z.id,
                account: p,
                kind: "progress",
                percent: M
            }),
            O = setInterval(() => F(-1), 1e4);
        try {
            const M = await S(z, F);
            E({
                id: z.id,
                account: p,
                kind: "result",
                blob: M
            })
        } catch (M) {
            E({
                id: z.id,
                account: p,
                kind: "result",
                error: M instanceof Error ? M.message : "附件处理失败，请重试"
            })
        } finally {
            clearInterval(O)
        }
    }, () => {
        R = !0, f.close()
    }
}
