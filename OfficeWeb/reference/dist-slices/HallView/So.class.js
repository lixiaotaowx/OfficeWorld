class So {
    constructor(e = () => new S4({
        alpha: !0,
        antialias: !0,
        preserveDrawingBuffer: !0
    })) {
        m(this, "r", null);
        m(this, "s", new w9);
        m(this, "cam", new ri(-1, 1, 1, -1, .01, 200));
        m(this, "done", new Map);
        this.createRenderer = e, this.s.add(new M4("#ffffff", "#a8876a", .8));
        const t = new oi("#ffffff", 1.1);
        t.position.set(3, 5, 4), this.s.add(t)
    }
    of(e, t) {
        var i;
        if (this.done.has(e)) return this.done.get(e);
        const s = t();
        if (!s) return "";
        try {
            this.r || (this.r = this.createRenderer()), this.r.setSize(80, 80), this.r.outputColorSpace = oe, this.r.toneMapping = B4, this.s.add(s), s.updateMatrixWorld(!0);
            const n = new re().setFromObject(s),
                o = n.getSize(new T),
                a = n.getCenter(new T),
                l = Math.max(o.x, o.y, o.z) * .75 || 1;
            Object.assign(this.cam, {
                left: -l,
                right: l,
                top: l,
                bottom: -l,
                near: l * .01,
                far: l * 40
            }), this.cam.updateProjectionMatrix(), this.cam.position.set(a.x + l * 6, a.y + l * 5, a.z + l * 7), this.cam.lookAt(a), this.r.render(this.s, this.cam);
            const A = this.r.domElement.toDataURL();
            return this.done.set(e, A), this.done.size > 128 && this.done.delete(this.done.keys().next().value), A
        } catch {
            return ""
        } finally {
            this.s.remove(s), e === "billiards" && ((i = li(s.children[0])) == null || i.dispose())
        }
    }
    forget(e) {
        this.done.delete(e)
    }
    release() {
        this.r && (this.r.dispose(), this.r.forceContextLoss(), this.r = null)
    }
    dispose() {
        this.release(), this.done.clear()
    }
}
