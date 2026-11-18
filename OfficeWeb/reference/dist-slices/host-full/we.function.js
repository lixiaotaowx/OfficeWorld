function we(e, t = () => Date.now()) {
    const s = t();
    let f = 0,
        c = null,
        w = {},
        v = {},
        g = [],
        S = 0;

    function A(h) {
        const k = ge(h);
        for (const R of re(s, ++f, k)) e.state(R);
        c = B(h), w = {
            ...h.previews
        }, v = {
            ...h.motions
        }, g = [...h.messages], S = t()
    }
    return {
        publish(h, k = !1) {
            if (!c || k) {
                A(h);
                return
            }
            const R = B(h),
                i = ae(c, R);
            Object.keys(i).length && e.state({
                kind: "state",
                epoch: s,
                seq: ++f,
                patch: i
            });
            const O = ce(w, h.previews);
            Object.keys(O).length && e.preview({
                kind: "preview",
                epoch: s,
                seq: ++f,
                batch: O
            });
            const l = le(v, h.motions);
            Object.keys(l).length && e.motion({
                kind: "motion",
                epoch: s,
                seq: ++f,
                batch: l
            });
            const a = ue(g, h.messages);
            (a.upserts.length || a.removed.length) && e.chat({
                kind: "chat",
                epoch: s,
                seq: ++f,
                upserts: a.upserts,
                removed: a.removed
            }), c = R, w = {
                ...h.previews
            }, v = {
                ...h.motions
            }, g = [...h.messages], (Object.keys(i).length || Object.keys(O).length || Object.keys(l).length || a.upserts.length || a.removed.length) && (S = t())
        },
        sendFull: A,
        heartbeat() {
            !c || t() - S < 1e3 || (e.state({
                kind: "state",
                epoch: s,
                seq: ++f,
                patch: {}
            }), S = t())
        }
    }
}

