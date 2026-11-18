function zn(n, e) {
    return {
        async claimSeat(t) {
            const s = await new Promise(r => {
                const i = n.current;
                if (!i) return r({
                    ok: !1,
                    error: "还没连上"
                });
                i.timeout(6e3).emit("seat", t, (o, a) => {
                    r(o ? {
                        ok: !1,
                        error: "认领工位超时了"
                    } : a ?? {
                        ok: !1,
                        error: "认领工位没成功"
                    })
                })
            });
            return e(s.ok ? t === null ? "离开了工位" : `${t+1} 号工位是你的了` : s.error || "这张工位认领不了"), s.ok
        },
        async adminKick(t, s) {
            return new Promise(r => {
                const i = n.current;
                if (!i) return r({
                    ok: !1,
                    error: "还没连上"
                });
                i.timeout(6e3).emit("admin", {
                    password: s,
                    seat: t
                }, (o, a) => {
                    r(o ? {
                        ok: !1,
                        error: "管理员请求超时了"
                    } : a ?? {
                        ok: !1,
                        error: "管理员请求没成功"
                    })
                })
            })
        }
    }
}
