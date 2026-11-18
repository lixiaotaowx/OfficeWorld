const wr = .43,
    Br = .24,
    Cs = (r, e) => {
        const t = r.scale || [1, 1, 1],
            s = (r.rotation || 0) * K0,
            i = e[0] * t[0],
            n = e[1] * t[1],
            o = e[2] * t[2];
        return {
            x: r.x + i * Math.cos(s) + o * Math.sin(s),
            y: r.y + n,
            z: r.z - i * Math.sin(s) + o * Math.cos(s)
        }
    },
    n9 = (r, e, t, s) => ({
        x: r.x + Math.sin(e) * t,
        y: s,
        z: r.z + Math.cos(e) * t
    }),
    C2 = (r, e, t, s) => {
        const [i, n] = [n9(r, e, .6, t), n9(r, e, -.6, t)];
        return [...s ? [i, n] : [n, i], n9(r, e + Math.PI / 2, .6, t), n9(r, e - Math.PI / 2, .6, t)]
    };

