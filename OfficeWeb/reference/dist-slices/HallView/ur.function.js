function ur(r, e) {
    const t = [];
    for (const i of r) {
        if (i.kind !== "ladder" || i.pitch || i.roll) continue;
        const n = i.scale || [1, 1, 1];
        n.some(o => o <= 0) || t.push({
            ids: [i.id],
            x: i.x,
            z: i.z,
            low: i.y,
            high: i.y + 2 * n[1],
            angle: i.rotation * Math.PI / 12,
            depth: .03 * n[2]
        })
    }
    for (let i = 0; i < t.length; i++)
        for (let n = i + 1; n < t.length; n++) {
            const o = t[i],
                a = t[n];
            if (!(Math.hypot(o.x - a.x, o.z - a.z) > ps || Math.abs(Math.sin(o.angle - a.angle)) > .05 || o.low > a.high + ps || a.low > o.high + ps)) {
                o.low = Math.min(o.low, a.low), o.high = Math.max(o.high, a.high), o.depth = Math.max(o.depth, a.depth), o.ids.push(...a.ids), t.splice(n, 1), i = -1;
                break
            }
        }
    const s = [];
    for (const i of t)
        for (const n of [1, -1]) {
            const o = M0 + i.depth + .1,
                a = Math.sin(i.angle) * n,
                l = Math.cos(i.angle) * n,
                A = i.x + a * o,
                c = i.z + l * o,
                h = f2(e, A, c, i.low + P0, i.ids);
            if (h === null || Math.abs(h - i.low) > P0) continue;
            const u = {
                x: A,
                y: h,
                z: c
            };
            for (const d of [.35, .6, .85])
                for (let g = 0; g < 16; g++) {
                    const p = i.angle + g * Math.PI / 8,
                        I = i.x + Math.sin(p) * d,
                        C = i.z + Math.cos(p) * d,
                        E = f2(e, I, C, i.high + P0, i.ids);
                    if (E === null || Math.abs(E - i.high) > P0) continue;
                    const x = {
                            x: I,
                            y: E,
                            z: C
                        },
                        B = Math.max(i.high, E),
                        b = Math.atan2(-a, -l),
                        v = [{
                            x: A,
                            y: B,
                            z: c
                        }, {
                            x: I,
                            y: B,
                            z: C
                        }, x].map(D => ({
                            ...D,
                            climb: i.ids,
                            face: b
                        }));
                    let L = u;
                    v.every(D => {
                        const P = D1(e, L, D, i.ids);
                        return L = D, P
                    }) && s.push({
                        ids: i.ids,
                        bottom: u,
                        top: x,
                        up: v
                    })
                }
        }
    return s
}

