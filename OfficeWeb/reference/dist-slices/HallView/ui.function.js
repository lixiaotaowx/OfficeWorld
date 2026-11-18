function ui(r, e, t = {}) {
    const s = $1.length,
        i = new Float32Array(r.length * s),
        n = new Int8Array(r.length * s),
        o = new Float32Array(r.length * s),
        a = new be;
    for (let c = 0; c < r.length; c++) {
        const [h, u, d, g, p, I, C] = r[c], E = c * s;
        a.set(C);
        for (let x = 0; x < s; x += 3) {
            i[E + x] = Math.fround($1[x] * h) + g, i[E + x + 1] = Math.fround($1[x + 1] * u) + p, i[E + x + 2] = Math.fround($1[x + 2] * d) + I;
            const B = ds[x],
                b = ds[x + 1],
                v = ds[x + 2];
            n[E + x] = B ? 127 * (h === 0 ? -1 : h < 0 ? -B : B) : 0, n[E + x + 1] = b ? 127 * (u === 0 ? -1 : u < 0 ? -b : b) : 0, n[E + x + 2] = v ? 127 * (d === 0 ? -1 : d < 0 ? -v : v) : 0, o[E + x] = a.r, o[E + x + 1] = a.g, o[E + x + 2] = a.b
        }
    }
    const l = new k1;
    l.setAttribute("position", new me(i, 3)), l.setAttribute("normal", new me(n, 3, !0)), l.setAttribute("color", new me(o, 3));
    const A = new K(l, ht("#ffffff", {
        vertexColors: !0
    }));
    return A.castShadow = t.cast !== !1, A.receiveShadow = !0, t.nohit ? A.userData.nohit = !0 : A.userData.solid = !0, e.add(A), A
}
let m9 = 7;
