function uv(s) {
    const e = new Set,
        t = new Set,
        n = new Set,
        i = new Set,
        r = new Set;
    s.traverse(a => {
        if (a instanceof At) {
            e.add(a.geometry);
            for (const o of Array.isArray(a.material) ? a.material : [a.material]) {
                t.add(o);
                for (const l of Object.values(o)) l instanceof vt && (n.add(l), typeof ImageBitmap < "u" && l.image instanceof ImageBitmap && i.add(l.image))
            }
            a instanceof Ah && r.add(a.skeleton)
        }
    });
    for (const a of e) a.dispose();
    for (const a of t) a.dispose();
    for (const a of n) a.dispose();
    for (const a of r) a.dispose();
    for (const a of i) a.close()
}

