function jd(i) {
    const e = I.useRef(i);
    e.current = i, I.useEffect(() => {
        const t = window.officeDesktop;
        if (!(t != null && t.dockVideo) || !t.onDockVideoWant || typeof MediaRecorder > "u") return;
        const n = new Map,
            s = new Set,
            r = d => {
                var l;
                (l = n.get(d)) == null || l.stop(), n.delete(d)
            },
            a = d => {
                if (d.startsWith("-")) {
                    s.delete(d.slice(1)), r(d.slice(1));
                    return
                }
                s.add(d), r(d);
                const l = e.current[d];
                if (!(l != null && l.getVideoTracks().some(k => k.readyState === "live"))) return;
                const u = ["video/webm;codecs=vp8", "video/webm;codecs=vp9"].find(k => MediaRecorder.isTypeSupported(k));
                if (!u) return;
                const h = crypto.randomUUID();
                let m;
                try {
                    m = new MediaRecorder(new MediaStream(l.getVideoTracks()), {
                        mimeType: u,
                        videoBitsPerSecond: 25e5
                    })
                } catch {
                    return
                }
                let f = !0,
                    p = Promise.resolve();
                const _ = k => t.dockVideo(k).catch(() => !1);
                _({
                    id: d,
                    epoch: h,
                    mime: u,
                    reset: !0
                }), m.ondataavailable = k => {
                    !f || !k.data.size || (p = p.then(async () => {
                        const P = await k.data.arrayBuffer();
                        f && P.byteLength <= 2 * 1024 ** 2 && await _({
                            id: d,
                            epoch: h,
                            mime: u,
                            bytes: P
                        })
                    }).catch(() => {}))
                };
                const w = () => {
                    f = !1, m.ondataavailable = null, m.onerror = null, m.state !== "inactive" && m.stop()
                };
                m.onerror = () => {
                    f && (r(d), _({
                        id: d,
                        epoch: h,
                        mime: u,
                        reset: !0
                    }))
                }, n.set(d, {
                    stream: l,
                    stop: w
                });
                try {
                    m.start(400)
                } catch {
                    r(d)
                }
            },
            o = t.onDockVideoWant(a),
            c = setInterval(() => {
                for (const [d, l] of n)(e.current[d] !== l.stream || !l.stream.getVideoTracks().some(u => u.readyState === "live")) && r(d);
                for (const d of s) n.has(d) || a(d)
            }, 500);
        return () => {
            o(), clearInterval(c);
            for (const d of n.keys()) r(d)
        }
    }, [])
}

