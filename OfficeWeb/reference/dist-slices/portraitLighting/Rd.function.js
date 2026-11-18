function Rd(s, e, t, n, i) {
    const r = Math.cos,
        a = Math.sin,
        o = r(t / 2),
        l = a(t / 2),
        c = r((e + n) / 2),
        h = a((e + n) / 2),
        u = r((e - n) / 2),
        d = a((e - n) / 2),
        f = r((n - e) / 2),
        p = a((n - e) / 2);
    switch (i) {
        case "XYX":
            s.set(o * h, l * u, l * d, o * c);
            break;
        case "YZY":
            s.set(l * d, o * h, l * u, o * c);
            break;
        case "ZXZ":
            s.set(l * u, l * d, o * h, o * c);
            break;
        case "XZX":
            s.set(o * h, l * p, l * f, o * c);
            break;
        case "YXY":
            s.set(l * f, o * h, l * p, o * c);
            break;
        case "ZYZ":
            s.set(l * p, l * f, o * h, o * c);
            break;
        default:
            Ce("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + i)
    }
}

