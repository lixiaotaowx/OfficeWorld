function _l(i, e, t) {
    const [n, s] = I.useState(0), r = I.useRef(i);
    return r.current = i, I.useEffect(() => {
        if (!t || !e) {
            s(0);
            return
        }
        let a = !1,
            o = null,
            c, d, l, u = 0,
            h = 0;
        const m = () => {
                d = void 0, l = void 0;
                const _ = c;
                c = void 0, _ == null || _.close().catch(() => {})
            },
            f = () => {
                const _ = r.current();
                if (_ !== o && (m(), o = _, u = 0, !!o)) try {
                    c = new AudioContext;
                    const w = c.createMediaStreamSource(new MediaStream([o]));
                    d = c.createAnalyser(), d.fftSize = 2048, d.smoothingTimeConstant = .8, w.connect(d), l = new Uint8Array(d.fftSize)
                } catch {
                    m()
                }
            };
        f();
        const p = setInterval(() => {
            if (a) return;
            r.current() !== o && f();
            let _ = 0;
            d && l && (d.getByteTimeDomainData(l), _ = hd(md(l))), u = fd(u, _);
            const w = ud(u, !!d);
            w !== h && (h = w, s(w))
        }, ld);
        return () => {
            a = !0, clearInterval(p), s(0), m()
        }
    }, [t, e]), n
}
