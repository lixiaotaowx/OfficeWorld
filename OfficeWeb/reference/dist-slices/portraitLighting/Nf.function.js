function Nf(s) {
    let e, t = 1;
    do {
        let n = s,
            i;
        s = null;
        let r = null;
        for (e = 0; n;) {
            e++;
            let a = n,
                o = 0;
            for (let c = 0; c < t && (o++, a = a.nextZ, !!a); c++);
            let l = t;
            for (; o > 0 || l > 0 && a;) o !== 0 && (l === 0 || !a || n.z <= a.z) ? (i = n, n = n.nextZ, o--) : (i = a, a = a.nextZ, l--), r ? r.nextZ = i : s = i, i.prevZ = r, r = i;
            n = a
        }
        r.nextZ = null, t *= 2
    } while (e > 1);
    return s
}

