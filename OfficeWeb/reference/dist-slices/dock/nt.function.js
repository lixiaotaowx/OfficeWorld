function nt(t) {
    return tt.has(t) || tt.set(t, (async () => {
        const s = Ge(),
            n = $e(s);
        n.drawImage(await He(`${Ke}/${t}.png`), 0, 0, H, H);
        const c = yt(n),
            r = jt(c),
            i = [],
            o = [];
        for (let w = Math.round(r.x0 + (r.x1 - r.x0) * .25); w <= r.x0 + (r.x1 - r.x0) * .75; w++)
            for (let E = 0; E < H - 4; E++)
                if (c[E * H + w] && c[(E + 3) * H + w]) {
                    i.push(w), o.push(E);
                    break
                } const d = i.reduce((w, E) => w + E, 0) / Math.max(1, i.length),
            m = o.reduce((w, E) => w + E, 0) / Math.max(1, o.length);
        let h = 0,
            k = 0;
        i.forEach((w, E) => {
            h += (w - d) * (o[E] - m), k += (w - d) ** 2
        });
        const f = Math.atan(k ? h / k : 0),
            b = (r.x0 + r.x1) / 2,
            g = (r.y0 + r.y1) / 2,
            R = qe(s, f, b, g),
            N = $e(R),
            C = jt(yt(N));
        let I = null;
        const j = N.getImageData(0, 0, H, H).data;
        let _ = H,
            V = H,
            W = 0,
            T = 0,
            D = 0;
        for (let w = C.y0; w < C.y0 + (C.y1 - C.y0) * .62; w++)
            for (let E = C.x0; E < C.x1; E++) {
                const L = (w * H + E) * 4,
                    U = j[L],
                    K = j[L + 1],
                    p = j[L + 2];
                j[L + 3] > 200 && U > 200 && K > 192 && p > 170 && Math.max(U, K, p) - Math.min(U, K, p) < 50 && (D++, _ = Math.min(_, E), W = Math.max(W, E), V = Math.min(V, w), T = Math.max(T, w))
            }
        if (D > 60) {
            const w = C.x1 - C.x0,
                E = C.y1 - C.y0;
            I = {
                x0: (_ - C.x0) / w,
                x1: (W - C.x0) / w,
                y0: (V - C.y0) / E,
                y1: (T - C.y0) / E
            }
        }
        return s.width = s.height = 0, R.width = R.height = 0, {
            angle: f,
            cx: b,
            cy: g,
            box: C,
            eyes: I
        }
    })()), tt.get(t)
}
