class Y3 {
    constructor(e = () => A4(() => import("./billiardsInterior-BWMPWR50.js"), __vite__mapDeps([8, 4, 2, 1, 3, 5, 6, 7]))) {
        m(this, "root", new E0);
        m(this, "geometries", new Set);
        m(this, "materials", new Set);
        m(this, "state", null);
        m(this, "interior");
        m(this, "pending");
        m(this, "loading");
        m(this, "generation", 0);
        m(this, "disposed", !1);
        m(this, "activeValue", !1);
        m(this, "canShootValue", !1);
        m(this, "powerValue", .5);
        m(this, "angleValue", 0);
        m(this, "lobbyEyeBall", {
            x: -.75,
            z: 0
        });
        this.loadInterior = e, this.root.name = "billiards-table", js.set(this.root, this);
        const t = d => (this.geometries.add(d), d),
            s = (d, g = .55) => {
                const p = new Ie({
                    color: d,
                    roughness: g
                });
                return this.materials.add(p), p
            },
            i = t(new U0(1, 1, 1)),
            n = s("#553b30"),
            o = s("#b99a61", .28),
            a = s("#286657", .95),
            l = s("#16483e"),
            A = s("#111b19"),
            c = (d, g, p, I, C, E, x, B = !0) => {
                const b = new K(i, x);
                return b.scale.set(d, g, p), b.position.set(I, C, E), b.castShadow = b.receiveShadow = !0, b.userData.solid = B, this.root.add(b), b
            };
        for (const d of [-1.375, 1.375])
            for (const g of [-.75, .75]) c(.25, .75, .25, d, .375, g, n), c(.27, .08, .27, d, .04, g, o);
        c(x0.width, .25, x0.depth, 0, .795, 0, n), c(x0.width + .01, .045, x0.depth + .01, 0, .9, 0, o), c(x0.width - .02, .09, x0.depth - .02, 0, .947, 0, n), c(x0.halfX * 2, .025, x0.halfZ * 2, 0, x0.height - .0125, 0, a);
        for (const d of [-.77, .77])
            for (const g of [-.69, .69]) c(1.02, .075, .14, g, 1.025, d, l);
        for (const d of [-1.47, 1.47]) c(.14, .075, 1.02, d, 1.025, 0, l);
        const h = t(new qe(.16, .12, .13, 32));
        for (const d of V3) {
            const g = new K(h, A);
            g.position.set(d.x, .945, d.z), this.root.add(g)
        }
        const u = t(new qe(.017, .017, .005, 12));
        for (const d of [-.94, .94])
            for (const g of [-1.05, -.7, -.35, .35, .7, 1.05]) {
                const p = new K(u, o);
                p.position.set(g, .995, d), this.root.add(p)
            }
        for (const d of [-1.6, 1.6])
            for (const g of [-.35, 0, .35]) {
                const p = new K(u, o);
                p.position.set(d, .995, g), this.root.add(p)
            }
    }
    get active() {
        var e;
        return ((e = this.interior) == null ? void 0 : e.active) ?? this.activeValue
    }
    set active(e) {
        this.activeValue = e, this.interior && (this.interior.active = e)
    }
    get canShoot() {
        var e;
        return ((e = this.interior) == null ? void 0 : e.canShoot) ?? this.canShootValue
    }
    set canShoot(e) {
        this.canShootValue = e, this.interior && (this.interior.canShoot = e)
    }
    get power() {
        var e;
        return ((e = this.interior) == null ? void 0 : e.power) ?? this.powerValue
    }
    set power(e) {
        this.powerValue = e, this.interior && (this.interior.power = e)
    }
    get angle() {
        var e;
        return ((e = this.interior) == null ? void 0 : e.angle) ?? this.angleValue
    }
    set angle(e) {
        this.angleValue = e, this.interior && (this.interior.angle = e)
    }
    get eyeBall() {
        var e;
        return ((e = this.interior) == null ? void 0 : e.eyeBall) ?? this.lobbyEyeBall
    }
    get rolling() {
        var e;
        return ((e = this.interior) == null ? void 0 : e.rolling) ?? !1
    }
    get loaded() {
        return !!this.interior
    }
    set(e) {
        var t;
        this.state = e, (t = this.interior) == null || t.set(e)
    }
    direction() {
        var e;
        return ((e = this.interior) == null ? void 0 : e.direction()) ?? {
            dx: Math.cos(this.angle),
            dz: Math.sin(this.angle)
        }
    }
    aim(e) {
        var t;
        (t = this.interior) == null || t.aim(e)
    }
    hit(e) {
        return e.intersectObject(this.root, !0).find(t => !t.object.userData.nohit)
    }
    tick(e) {
        var t;
        (t = this.interior) == null || t.tick(e)
    }
    load() {
        if (this.disposed) return Promise.resolve(!1);
        if (this.interior) return Promise.resolve(!0);
        if (this.loading) return this.loading;
        const e = ++this.generation;
        let t;
        return t = (async () => {
            let s;
            try {
                const i = await this.loadInterior();
                return this.disposed || e !== this.generation ? !1 : (s = new i.BilliardsInterior, this.pending = s, await s.ready, this.disposed || e !== this.generation || this.pending !== s ? (s.dispose(), !1) : (this.pending = void 0, this.interior = s, s.active = this.activeValue, s.canShoot = this.canShootValue, s.power = this.powerValue, s.angle = this.angleValue, this.state && s.set(this.state), this.root.add(s.root), !0))
            } catch {
                return s && s.dispose(), this.pending === s && (this.pending = void 0), !1
            }
        })().finally(() => {
            this.loading === t && (this.loading = void 0)
        }), this.loading = t, t
    }
    unload() {
        var e, t;
        this.generation++, (e = this.pending) == null || e.dispose(), this.pending = void 0, (t = this.interior) == null || t.dispose(), this.interior = void 0, this.loading = void 0, this.activeValue = !1, this.canShootValue = !1, this.powerValue = .5, this.angleValue = 0
    }
    dispose() {
        this.disposed || (this.disposed = !0, this.unload(), this.root.removeFromParent(), this.root.traverse(e => {
            e instanceof K && (Array.isArray(e.material) ? e.material : [e.material]).forEach(s => this.materials.add(s))
        }), this.geometries.forEach(e => e.dispose()), this.materials.forEach(e => e.dispose()), this.geometries.clear(), this.materials.clear(), this.state = null, this.root.clear(), js.delete(this.root))
    }
}
