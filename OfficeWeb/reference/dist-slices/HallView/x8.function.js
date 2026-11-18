function x8(r = 5) {
    const e = Math.floor(r) % 2 === 0 ? Math.floor(r) + 1 : Math.floor(r),
        t = b8(e),
        s = t.length,
        i = new Uint8Array(s * 4);
    for (let o = 0; o < s; ++o) {
        const a = t[o],
            l = 2 * Math.PI * a / s,
            A = new T(Math.cos(l), Math.sin(l), 0).normalize();
        i[o * 4] = (A.x * .5 + .5) * 255, i[o * 4 + 1] = (A.y * .5 + .5) * 255, i[o * 4 + 2] = 127, i[o * 4 + 3] = 255
    }
    const n = new De(i, e, e);
    return n.wrapS = e1, n.wrapT = e1, n.needsUpdate = !0, n
}

