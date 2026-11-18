class W3 {
    constructor(e) {
        m(this, "root", new E0);
        m(this, "body", new E0);
        m(this, "legs", []);
        m(this, "target", null);
        m(this, "geometry", new U0(1, 1, 1));
        m(this, "staticGeometry", []);
        m(this, "targetPosition", new T);
        m(this, "fur", new Ie({
            color: "#ce9261",
            roughness: .9
        }));
        m(this, "dark", new Ie({
            color: "#342b2a",
            roughness: .9
        }));
        this.root.name = "office-cat", this.root.visible = !1, this.root.add(this.body), e.add(this.root);
        const t = (i, n, o, a, l, A, c = this.fur) => {
            const h = new K(this.geometry, c);
            return h.scale.set(i, n, o), h.position.set(a, l, A), h.castShadow = !0, this.body.add(h), h
        };
        t(.28, .25, .47, 0, .3, 0), t(.3, .27, .25, 0, .43, .25);
        for (const i of [-.1, .1]) t(.08, .14, .1, i, .61, .24), t(.035, .04, .015, i, .46, .38, this.dark);
        t(.045, .03, .02, 0, .4, .39, this.dark);
        for (const i of [-.1, .1])
            for (const n of [-.16, .15]) this.legs.push(t(.065, .2, .065, i, .1, n));
        const s = t(.065, .065, .36, 0, .36, -.37);
        s.rotation.x = -.4;
        for (const i of [this.fur, this.dark]) {
            const n = this.body.children.filter(A => A instanceof K && A.material === i && !this.legs.includes(A)),
                o = n.map(A => (A.updateMatrix(), this.geometry.clone().applyMatrix4(A.matrix))),
                a = c4(o);
            if (o.forEach(A => A.dispose()), !a) continue;
            n.forEach(A => this.body.remove(A));
            const l = new K(a, i);
            l.castShadow = !0, this.body.add(l), this.staticGeometry.push(a)
        }
    }
    set(e) {
        [e.x, e.y, e.z, e.rot, e.seq].every(Number.isFinite) && (this.target || this.root.position.set(e.x, e.y, e.z), this.target = e, this.root.visible = !0)
    }
    get shadowMoving() {
        const e = this.target;
        return e ? e.moving || e.pose === "groom" || Math.abs(this.root.position.x - e.x) > .001 || Math.abs(this.root.position.y - e.y) > .001 || Math.abs(this.root.position.z - e.z) > .001 || Math.abs(Math.atan2(Math.sin(e.rot - this.root.rotation.y), Math.cos(e.rot - this.root.rotation.y))) > .001 : !1
    }
    tick(e, t) {
        const s = this.target;
        if (!s) return;
        this.root.position.lerp(this.targetPosition.set(s.x, s.y, s.z), 1 - Math.exp(-e * 12)), this.root.rotation.y += Math.atan2(Math.sin(s.rot - this.root.rotation.y), Math.cos(s.rot - this.root.rotation.y)) * (1 - Math.exp(-e * 10));
        const i = s.pose === "sleep" || s.pose === "lie";
        this.body.scale.y = i ? .5 : s.pose === "sit" ? .8 : 1, this.body.rotation.z = s.pose === "groom" ? Math.sin(t / 220) * .12 : 0, this.legs.forEach((n, o) => n.rotation.x = s.moving ? Math.sin(t / 90 + o * Math.PI) * .4 : 0)
    }
    dispose() {
        this.root.removeFromParent(), this.geometry.dispose(), this.staticGeometry.forEach(e => e.dispose()), this.fur.dispose(), this.dark.dispose()
    }
}
