function pn(i, e, t) {
    for (let r = 0; r < 28; r = r + 7) {
        const a = i >>> r,
            o = !(!(a >>> 7) && e == 0),
            c = (o ? a | 128 : a) & 255;
        if (t.push(c), !o) return
    }
    const n = i >>> 28 & 15 | (e & 7) << 4,
        s = !!(e >> 3);
    if (t.push((s ? n | 128 : n) & 255), !!s) {
        for (let r = 3; r < 31; r = r + 7) {
            const a = e >>> r,
                o = !!(a >>> 7),
                c = (o ? a | 128 : a) & 255;
            if (t.push(c), !o) return
        }
        t.push(e >>> 31 & 1)
    }
}
