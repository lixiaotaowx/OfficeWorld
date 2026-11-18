class Di {
    static area(e) {
        const t = e.length;
        let n = 0;
        for (let i = t - 1, r = 0; r < t; i = r++) n += e[i].x * e[r].y - e[r].x * e[i].y;
        return n * .5
    }
    static isClockWise(e) {
        return Di.area(e) < 0
    }
    static triangulateShape(e, t) {
        const n = [],
            i = [],
            r = [];
        oc(e), lc(n, e);
        let a = e.length;
        t.forEach(oc);
        for (let l = 0; l < t.length; l++) i.push(a), a += t[l].length, lc(n, t[l]);
        const o = zf.triangulate(n, i);
        for (let l = 0; l < o.length; l += 3) r.push(o.slice(l, l + 3));
        return r
    }
}

