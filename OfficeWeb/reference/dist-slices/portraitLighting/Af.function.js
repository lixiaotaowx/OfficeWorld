function Af(s, e, t, n, i, r) {
    let a = s;
    do {
        let o = a.next.next;
        for (; o !== a.prev;) {
            if (a.i !== o.i && Uf(a, o)) {
                let l = Gh(a, o);
                a = di(a, a.next), l = di(l, l.next), ws(a, e, t, n, i, r, 0), ws(l, e, t, n, i, r, 0);
                return
            }
            o = o.next
        }
        a = a.next
    } while (a !== s)
}

