function qt(r) {
    if (hs.has(r)) return hs.get(r);
    const e = 128,
        t = new Uint8Array(e * e * 4);
    let s = 73;
    for (let n = 0; n < e; n++)
        for (let o = 0; o < e; o++) {
            s = s * 16807 % 2147483647;
            const a = s / 2147483647,
                l = Math.sin(n * .55 + Math.sin(o * .049) * 1.6 + Math.sin(n * .13)),
                A = o / e * Math.PI * 2,
                c = n / e * Math.PI * 2,
                h = Math.sin(A * 3 + Math.sin(c * 2)) + Math.sin(c * 4 + Math.cos(A * 2)),
                u = 176 + h * 14 + 48 * Math.pow(Math.max(0, 1 - Math.abs(h) * 2), 4),
                d = r === "water" ? u : r === "wood" ? 229 + l * 13 + a * 10 : r === "fabric" ? 225 + (o + n) % 2 * 15 + a * 12 : 238 + a * 17,
                g = (n * e + o) * 4;
            t[g] = t[g + 1] = t[g + 2] = Math.round(d), t[g + 3] = 255
        }
    const i = new De(t, e, e);
    return i.wrapS = i.wrapT = e1, i.magFilter = pe, i.minFilter = T9, i.generateMipmaps = !0, i.anisotropy = 4, i.needsUpdate = !0, hs.set(r, i), i
}

