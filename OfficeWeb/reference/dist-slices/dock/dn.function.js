function dn(t, s) {
    const n = JSON.stringify(t) + s;
    if (!be.has(n)) {
        const c = (async () => {
            const [r, i] = await Promise.all([nt(s), nt("away")]), o = qe(await He(await vt(t, s)), r.angle, r.cx, r.cy), d = s === "away" ? null : qe(await He(await vt(t, "away")), i.angle, i.cx, i.cy), m = await nt("focused"), h = m.box, k = Ge(), f = $e(k), b = h.x1 - h.x0, g = (h.y1 - h.y0) * .92, R = b * .07, N = rt(t.color), C = f.createLinearGradient(h.x0, 0, h.x1, 0);
            C.addColorStop(0, Ue(N, -.05)), C.addColorStop(.55, Ue(N, -.12)), C.addColorStop(1, Ue(N, -.3)), f.fillStyle = C, f.beginPath(), f.roundRect ? f.roundRect(h.x0, h.y0, b, g, R) : f.rect(h.x0, h.y0, b, g), f.fill(), f.fillStyle = "rgba(255,255,255,.16)", f.fillRect(h.x0 + R, h.y0, b - 2 * R, g * .035), f.fillStyle = Ue(N, -.5);
            for (let V = 1; V < 20; V++) {
                const W = h.y0 + g * V / 20,
                    T = (V % 5 === 0 ? .14 : .07) * b;
                f.fillRect(h.x0 + b * .035, W, T, g * .009), f.fillRect(h.x1 - b * .035 - T, W, T, g * .009)
            }
            const I = Ge(),
                j = $e(I);
            for (const V of ["hair", "hat"]) {
                const W = t.accessories[V];
                W && W !== "none" && j.drawImage(await He(`${Ke}/layers/${V}-${W}.png?v=1`), 0, 0, H, H)
            }
            const _ = qe(I, m.angle, m.cx, m.cy);
            return f.drawImage(_, 0, 0), I.width = I.height = 0, _.width = _.height = 0, {
                front: et(o, r.box),
                closed: d ? et(d, r.box) : null,
                back: et(k, h),
                geo: r,
                backBox: h
            }
        })();
        be.set(n, c), c.catch(() => {
            be.get(n) === c && be.delete(n)
        }), be.size > 32 && be.delete(be.keys().next().value)
    }
    return be.get(n)
}

