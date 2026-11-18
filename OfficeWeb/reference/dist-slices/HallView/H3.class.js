class H3 {
    constructor(e) {
        m(this, "plane", new ii);
        m(this, "direction", new T);
        m(this, "point", new T);
        m(this, "materials", []);
        m(this, "architecture", []);
        m(this, "ray", new M9);
        m(this, "box", new re);
        m(this, "probe", new T);
        m(this, "origin", new T);
        e.traverse(t => {
            const s = t;
            if (!s.isMesh || s.userData.ground || s.userData.keepStructure) return;
            const i = n => {
                const o = n.clone();
                return o.clippingPlanes = [this.plane], this.materials.push(o), o
            };
            s.material = Array.isArray(s.material) ? s.material.map(i) : i(s.material), this.architecture.push(s)
        })
    }
    update(e, t, s, i, n = []) {
        e.getWorldDirection(this.direction), this.point.copy(t).addScaledVector(this.direction, -Math.max(1.2, 8.7 / s)), this.plane.setFromNormalAndCoplanarPoint(this.direction, this.point);
        for (const o of this.architecture) {
            const a = o.userData.cutawaySide;
            o.visible = !i.includes(o) && (a === "back" ? e.position.z > -5 : a === "left" ? e.position.x > -7 : !0)
        }
        for (const o of n)
            if (o.visible && (this.box.setFromObject(o), !this.box.isEmpty()))
                for (const a of [.9, .55, .12]) {
                    this.box.getCenter(this.probe), this.probe.y = ve.lerp(this.box.min.y, this.box.max.y, a), this.origin.copy(this.probe).addScaledVector(this.direction, -40), this.ray.set(this.origin, this.direction), this.ray.far = 39.98;
                    for (const l of this.ray.intersectObjects(this.architecture, !1)) Qt(l) && (l.object.visible = !1)
                }
    }
    dispose() {
        for (const e of this.materials) e.dispose()
    }
}

