function Wd(p) {
    try {
        const S = new BroadcastChannel(Wa);
        return S.onmessage = f => {
            var R;
            typeof((R = f.data) == null ? void 0 : R.id) == "string" && f.data.id && p(f.data)
        }, () => S.close()
    } catch {
        return () => {}
    }
}
export {
    Ld as A, Rd as B, zd as C, Dd as D, Hd as E, vd as F, Bd as H, Vd as M, kd as P, pd as R, Od as S, dd as _, _d as a, od as b, Sd as c, Nd as d, ad as e, ed as f, md as g, gd as h, Cd as i, X as j, hd as k, Wd as l, Td as m, Id as n, Fd as o, Md as p, $d as q, gr as r, jd as s, Ad as t, xd as u, Ud as v, yd as w, wd as x, Ed as y, Pd as z
};