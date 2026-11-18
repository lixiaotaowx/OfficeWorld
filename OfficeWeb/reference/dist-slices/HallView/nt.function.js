function nt(r, e, t, s, i, n, o) {
    const a = [],
        l = Math.max(1, Math.round((s - t) / .5)),
        A = Math.max(1, Math.round((n - i) / .45)),
        c = (s - t) / l,
        h = (n - i) / A;
    for (let u = 0; u < l; u++)
        for (let d = 0; d < A; d++) {
            const g = t + (u + .5) * c,
                p = i + (d + .5) * h,
                I = ye();
            if (a.push(e === "z" ? [c - .09, h - .09, .012, g, p, o + .007, l0.blueDark] : [.012, h - .09, c - .09, o + .007, p, g, l0.blueDark]), I < .45) {
                let C = -c / 2 + .09;
                const E = (h - .12) * (.55 + ye() * .3);
                for (let x = 0; x < 3 + Math.floor(ye() * 3); x++) {
                    const B = .04 + ye() * .02,
                        b = B9[Math.floor(ye() * B9.length)];
                    a.push(e === "z" ? [B, E, .01, g + C + B / 2, p - (h - .09) / 2 + E / 2 + .01, o + .019, b] : [.01, E, B, o + .019, p - (h - .09) / 2 + E / 2 + .01, g + C + B / 2, b]), C += B + .006
                }
            }
        }
    return ui(a, r, {
        nohit: !0,
        cast: !1
    })
}

