function ws(s, e, t, n, i, r, a) {
    if (!s) return;
    !a && r && If(s, n, i, r);
    let o = s;
    for (; s.prev !== s.next;) {
        const l = s.prev,
            c = s.next;
        if (r ? Ef(s, n, i, r) : Tf(s)) {
            e.push(l.i, s.i, c.i), Cs(s), s = c.next, o = c.next;
            continue
        }
        if (s = c, s === o) {
            a ? a === 1 ? (s = bf(di(s), e), ws(s, e, t, n, i, r, 2)) : a === 2 && Af(s, e, t, n, i, r) : ws(di(s), e, t, n, i, r, 1);
            break
        }
    }
}

