class wv extends Vd {
    constructor() {
        super(), this.name = "RoomEnvironment", this.position.y = -3.5;
        const e = new qi;
        e.deleteAttribute("uv");
        const t = new Ls({
                side: Wt
            }),
            n = new Ls,
            i = new jh(16777215, 900, 28, 2);
        i.position.set(.418, 16.199, .3), this.add(i);
        const r = new At(e, t);
        r.position.set(-.757, 13.219, .717), r.scale.set(31.713, 28.305, 28.591), this.add(r);
        const a = new wh(e, n, 6),
            o = new gt;
        o.position.set(-10.906, 2.009, 1.846), o.rotation.set(0, -.195, 0), o.scale.set(2.328, 7.905, 4.651), o.updateMatrix(), a.setMatrixAt(0, o.matrix), o.position.set(-5.607, -.754, -.758), o.rotation.set(0, .994, 0), o.scale.set(1.97, 1.534, 3.955), o.updateMatrix(), a.setMatrixAt(1, o.matrix), o.position.set(6.167, .857, 7.803), o.rotation.set(0, .561, 0), o.scale.set(3.927, 6.285, 3.687), o.updateMatrix(), a.setMatrixAt(2, o.matrix), o.position.set(-2.017, .018, 6.124), o.rotation.set(0, .333, 0), o.scale.set(2.002, 4.566, 2.064), o.updateMatrix(), a.setMatrixAt(3, o.matrix), o.position.set(2.291, -.756, -2.621), o.rotation.set(0, -.286, 0), o.scale.set(1.546, 1.552, 1.496), o.updateMatrix(), a.setMatrixAt(4, o.matrix), o.position.set(-2.193, -.369, -5.547), o.rotation.set(0, .516, 0), o.scale.set(3.875, 3.487, 2.986), o.updateMatrix(), a.setMatrixAt(5, o.matrix), this.add(a);
        const l = new At(e, Ci(50));
        l.position.set(-16.116, 14.37, 8.208), l.scale.set(.1, 2.428, 2.739), this.add(l);
        const c = new At(e, Ci(50));
        c.position.set(-16.109, 18.021, -8.207), c.scale.set(.1, 2.425, 2.751), this.add(c);
        const h = new At(e, Ci(17));
        h.position.set(14.904, 12.198, -1.832), h.scale.set(.15, 4.265, 6.331), this.add(h);
        const u = new At(e, Ci(43));
        u.position.set(-.462, 8.89, 14.52), u.scale.set(4.38, 5.441, .088), this.add(u);
        const d = new At(e, Ci(20));
        d.position.set(3.235, 11.486, -12.541), d.scale.set(2.5, 2, .1), this.add(d);
        const f = new At(e, Ci(100));
        f.position.set(0, 20, 0), f.scale.set(1, .1, 1), this.add(f)
    }
    dispose() {
        const e = new Set;
        this.traverse(t => {
            t.isMesh && (e.add(t.geometry), e.add(t.material))
        });
        for (const t of e) t.dispose()
    }
}

