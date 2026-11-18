function Gr(r, e, t) {
    const s = {
        min: new Array(r.itemSize).fill(Number.POSITIVE_INFINITY),
        max: new Array(r.itemSize).fill(Number.NEGATIVE_INFINITY)
    };
    for (let i = e; i < e + t; i++)
        for (let n = 0; n < r.itemSize; n++) {
            let o;
            r.itemSize > 4 ? o = r.array[i * r.itemSize + n] : (n === 0 ? o = r.getX(i) : n === 1 ? o = r.getY(i) : n === 2 ? o = r.getZ(i) : n === 3 && (o = r.getW(i)), r.normalized === !0 && (o = ve.normalize(o, r.array))), s.min[n] = Math.min(s.min[n], o), s.max[n] = Math.max(s.max[n], o)
        }
    return s
}

