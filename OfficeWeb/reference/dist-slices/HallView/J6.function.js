function J6() {
    const r = [{
            id: 0,
            x: -.75,
            z: 0,
            vx: 0,
            vz: 0,
            pocketed: !1
        }],
        e = [1, 9, 2, 10, 8, 3, 4, 11, 5, 12, 6, 13, 7, 14, 15];
    let t = 0;
    for (let s = 0; s < 5; s++)
        for (let i = 0; i <= s; i++) r.push({
            id: e[t++],
            x: .4 + s * x0.radius * Math.sqrt(3) * 1.015,
            z: (i - s / 2) * x0.radius * 2.03,
            vx: 0,
            vz: 0,
            pocketed: !1
        });
    return r.sort((s, i) => s.id - i.id)
}
