function ss(n, e, t = {
    set: (s, r) => setTimeout(s, r),
    clear: s => clearTimeout(s)
}) {
    let s = !0,
        r = 0,
        i, o = !1;
    const a = () => {
            i = void 0, !(!s || o) && (o = !0, n.get().then(d => {
                if (s)
                    for (const m of d) e.ingest(m)
            }).catch(() => {}).then(() => {
                if (o = !1, !!s) {
                    if (e.getSnapshot()) {
                        r = 0;
                        return
                    }
                    i = t.set(a, Me[Math.min(r++, Me.length - 1)])
                }
            }))
        },
        f = n.onSnapshot(d => {
            e.ingest(d), !e.getSnapshot() && !o && i === void 0 && a()
        });
    return a(), () => {
        s = !1, t.clear(i), f()
    }
}
export {
    Bn as A, qn as B, Ce as C, ns as H, mt as M, Yn as a, In as b, Fn as c, xn as d, Ln as e, Kn as f, jn as g, Un as h, Dn as i, Xn as j, Nn as k, ue as l, zn as m, $n as n, ts as o, Gn as p, Qn as q, Mn as r, Jn as s, Zn as t, es as u, Hn as v, Vn as w, Pn as x, ss as y, gt as z
};