function P5(r) {
    const e = X0(r);
    if (e != null && e.arch) {
        const {
            outerRadius: n,
            springHeight: o,
            depth: a
        } = e.arch;
        return {
            min: [-n, 0, -a / 2],
            max: [n, o + n, a / 2]
        }
    }
    const t = [1 / 0, 1 / 0, 1 / 0],
        s = [-1 / 0, -1 / 0, -1 / 0],
        i = (n, o) => n.forEach((a, l) => {
            t[l] = Math.min(t[l], a - o[l]), s[l] = Math.max(s[l], a + o[l])
        });
    for (const [n, o, a, l, A, c] of(e == null ? void 0 : e.boxes) || []) i([l, A, c], [n / 2, o / 2, a / 2]);
    for (const [n, ...o] of(e == null ? void 0 : e.shapes) || []) {
        const [a, l, A, c, h] = o.map(Number);
        n === "cyl" ? i([A, c, h], [a, l / 2, a]) : i([l, A, c], [a, n === "disc" ? .025 : n === "cone" ? .13 : a, a])
    }
    return {
        min: t,
        max: s
    }
}

