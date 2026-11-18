function xn(i, e, t, n) {
    const s = [];
    if (t.forEach((r, a) => {
            if (a >= hs.length) return;
            const o = Math.min(i, e),
                d = {
                    rid: hs[a],
                    scaleResolutionDownBy: Math.max(1, o / Math.min(r.width, r.height)),
                    maxBitrate: r.encoding.maxBitrate
                },
                l = n && r.encoding.maxFramerate ? Math.min(n, r.encoding.maxFramerate) : r.encoding.maxFramerate;
            l && (d.maxFramerate = l);
            const u = Ot() || a === 0;
            r.encoding.priority && u && (d.priority = r.encoding.priority, d.networkPriority = r.encoding.priority), s.push(d)
        }), Xe() && Rc() === "ios") {
        let r;
        s.forEach(o => {
            r ? o.maxFramerate && o.maxFramerate > r && (r = o.maxFramerate) : r = o.maxFramerate
        });
        let a = !0;
        s.forEach(o => {
            var c;
            o.maxFramerate != r && (a && (a = !1, X.info("Simulcast on iOS React-Native requires all encodings to share the same framerate.")), X.info('Setting framerate of encoding "'.concat((c = o.rid) !== null && c !== void 0 ? c : "", '" to ').concat(r)), o.maxFramerate = r)
        })
    }
    return s
}

