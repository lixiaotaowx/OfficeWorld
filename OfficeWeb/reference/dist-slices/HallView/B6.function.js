function B6(r, e) {
    const s = new Uint8Array(256),
        i = new be(e),
        n = new be(r),
        o = new be;
    for (let l = 0; l < 64; l++) {
        const A = l / 63;
        o.copy(i).lerp(n, A * A * (3 - 2 * A)), s.set([Math.round(o.r * 255), Math.round(o.g * 255), Math.round(o.b * 255), 255], l * 4)
    }
    const a = new De(s, 1, 64);
    return a.colorSpace = f4, a.magFilter = a.minFilter = pe, a.needsUpdate = !0, a
}
