function Lf(s, e) {
    let t = e;
    const n = s.x,
        i = s.y;
    let r = -1 / 0,
        a;
    if (Wi(s, t)) return t;
    do {
        if (Wi(s, t.next)) return t.next;
        if (i <= t.y && i >= t.next.y && t.next.y !== t.y) {
            const u = t.x + (i - t.y) * (t.next.x - t.x) / (t.next.y - t.y);
            if (u <= n && u > r && (r = u, a = t.x < t.next.x ? t : t.next, u === n)) return a
        }
        t = t.next
    } while (t !== e);
    if (!a) return null;
    const o = a,
        l = a.x,
        c = a.y;
    let h = 1 / 0;
    t = a;
    do {
        if (n >= t.x && t.x >= l && n !== t.x && kh(i < c ? n : r, i, l, c, i < c ? r : n, i, t.x, t.y)) {
            const u = Math.abs(i - t.y) / (n - t.x);
            Rs(t, s) && (u < h || u === h && (t.x > a.x || t.x === a.x && Pf(a, t))) && (a = t, h = u)
        }
        t = t.next
    } while (t !== o);
    return a
}

