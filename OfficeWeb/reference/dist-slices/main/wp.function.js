function wp(i) {
    let e = new Map;
    const t = new Set,
        n = () => {
            for (const s of t) s()
        };
    return {
        snapshot: s => e.get(s) || null,
        states: () => e,
        subscribe: s => (t.add(s), () => {
            t.delete(s)
        }),
        receive: s => {
            "removed" in s ? e.delete(s.tableId) : e.set(s.tableId, s), n()
        },
        replace(s) {
            e = new Map(Object.entries(s || {})), n()
        },
        act: async (s, r) => {
            const a = await i({
                kind: "billiards-action",
                tableId: s,
                command: r
            });
            if (a.ok === !1) throw Error(a.error || "球桌操作没成功")
        }
    }
}

