function b0(s, e, t) {
    const n = s.name,
        i = n.length;
    for (Sa.lastIndex = 0;;) {
        const r = Sa.exec(n),
            a = Sa.lastIndex;
        let o = r[1];
        const l = r[2] === "]",
            c = r[3];
        if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === i) {
            Lc(t, c === void 0 ? new y0(o, s, e) : new T0(o, s, e));
            break
        } else {
            let u = t.map[o];
            u === void 0 && (u = new E0(o), Lc(t, u)), t = u
        }
    }
}
