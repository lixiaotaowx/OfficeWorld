function L(e, r) {
    var t;
    try {
        const s = JSON.parse(localStorage.getItem(`office-chat-local:${e}`) || "{}"),
            n = r.recipientId ? r.senderId === e ? r.recipientId : r.senderId || "" : "public";
        return r.time > (((t = s[n]) == null ? void 0 : t.deletedThrough) ?? -1)
    } catch {
        return !0
    }
}
export {
    h as A, C as B, P as C, A as D, K as E, N as F, M, G as P, g as S, z as W, J as a, _ as b, V as c, k as d, Q as e, W as f, ee as g, re as h, F as i, w as j, $ as k, L as l, te as m, m as n, v as o, U as p, j as q, p as r, D as s, R as t, Y as u, q as v, Z as w, H as x, y, X as z
};