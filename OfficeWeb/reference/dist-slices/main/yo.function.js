function yo(i, e, t, n, s, r, a) {
    return b(this, void 0, void 0, function*() {
        const o = yield n.lock();
        r.debug("setPublishingLayersForSender", Object.assign(Object.assign({}, a), {
            sender: i,
            qualities: t,
            senderEncodings: e
        }));
        try {
            const c = i.getParameters(),
                {
                    encodings: d
                } = c;
            if (!d) return;
            if (d.length !== e.length) {
                r.warn("cannot set publishing layers, encodings mismatch", Object.assign(Object.assign({}, a), {
                    encodings: d,
                    senderEncodings: e
                }));
                return
            }
            let l = !1;
            !1 && d[0].scalabilityMode || (s && t.some(m => m.enabled) && t.forEach(m => m.enabled = !0), d.forEach((h, m) => {
                var f;
                let p = (f = h.rid) !== null && f !== void 0 ? f : "";
                p === "" && (p = "q");
                const _ = Nc(p),
                    w = t.find(k => k.quality === _);
                w && h.active !== w.enabled && (l = !0, h.active = w.enabled, r.debug("setting layer ".concat(w.quality, " to ").concat(h.active ? "enabled" : "disabled"), a), Ot() && (w.enabled ? (h.scaleResolutionDownBy = e[m].scaleResolutionDownBy, h.maxBitrate = e[m].maxBitrate, h.maxFrameRate = e[m].maxFrameRate) : (h.scaleResolutionDownBy = 4, h.maxBitrate = 10, h.maxFrameRate = 2)))
            })), l && (c.encodings = d, r.debug("setting encodings", Object.assign(Object.assign({}, a), {
                encodings: c.encodings
            })), yield i.setParameters(c))
        } finally {
            o()
        }
    })
}

