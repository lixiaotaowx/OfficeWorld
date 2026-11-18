function se(t, r) {
    if (!t || r.seq <= t.seq) return [];
    const i = [];
    if (r.shot === t.shot + 1 && r.phase === "rolling" && i.push({
            kind: "shot",
            strength: Math.min(1, Z(r.balls[0]) / L.maxSpeed)
        }), t.phase !== "rolling" || t.shot !== r.shot) return i;
    const l = new Map(t.balls.map(e => [e.id, e]));
    let a = 0,
        f = 0;
    for (const e of r.balls) {
        const s = l.get(e.id);
        if (!s || s.pocketed) continue;
        if (e.pocketed) {
            i.push({
                kind: "pocket",
                strength: Math.min(1, Z(s) / 2)
            });
            continue
        }
        const k = Math.hypot(e.vx - s.vx, e.vz - s.vz);
        if (!(k < .16)) {
            (Math.max(Math.abs(s.x), Math.abs(e.x)) > L.halfX - L.radius - .3 && s.vx * e.vx < 0 || Math.max(Math.abs(s.z), Math.abs(e.z)) > L.halfZ - L.radius - .3 && s.vz * e.vz < 0) && (f = Math.max(f, k));
            for (const p of r.balls) {
                if (p.id === e.id || p.pocketed) continue;
                const h = l.get(p.id);
                if (!h || h.pocketed) continue;
                Math.min(Math.hypot(s.x - h.x, s.z - h.z), Math.hypot(e.x - p.x, e.z - p.z)) < L.radius * 2 + .28 && Math.hypot(p.vx - h.vx, p.vz - h.vz) > .12 && (a = Math.max(a, k))
            }
        }
    }
    return a ? i.push({
        kind: "ball",
        strength: Math.min(1, a / 3)
    }) : f && i.push({
        kind: "cushion",
        strength: Math.min(1, f / 3)
    }), i
}
