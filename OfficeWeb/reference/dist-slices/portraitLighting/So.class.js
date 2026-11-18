class So extends gt {
    constructor(e, t, n) {
        super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
        const i = new Kt(wi, Ri, e, t);
        i.layers = this.layers, this.add(i);
        const r = new Kt(wi, Ri, e, t);
        r.layers = this.layers, this.add(r);
        const a = new Kt(wi, Ri, e, t);
        a.layers = this.layers, this.add(a);
        const o = new Kt(wi, Ri, e, t);
        o.layers = this.layers, this.add(o);
        const l = new Kt(wi, Ri, e, t);
        l.layers = this.layers, this.add(l);
        const c = new Kt(wi, Ri, e, t);
        c.layers = this.layers, this.add(c)
    }
    updateCoordinateSystem() {
        const e = this.coordinateSystem,
            t = this.children.concat(),
            [n, i, r, a, o, l] = t;
        for (const c of t) this.remove(c);
        if (e === cn) n.up.set(0, 1, 0), n.lookAt(1, 0, 0), i.up.set(0, 1, 0), i.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
        else if (e === Es) n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), i.up.set(0, -1, 0), i.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
        else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
        for (const c of t) this.add(c), c.updateMatrixWorld()
    }
    update(e, t) {
        this.parent === null && this.updateMatrixWorld();
        const {
            renderTarget: n,
            activeMipmapLevel: i
        } = this;
        this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
        const [r, a, o, l, c, h] = this.children, u = e.getRenderTarget(), d = e.getActiveCubeFace(), f = e.getActiveMipmapLevel(), p = e.xr.enabled;
        e.xr.enabled = !1;
        const x = n.texture.mipmapsAutoUpdate;
        n.texture.mipmapsAutoUpdate = !1;
        let m = !1;
        e.isWebGLRenderer === !0 ? m = e.state.buffers.depth.getReversed() : m = e.reversedDepthBuffer, e.setRenderTarget(n, 0, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, r), e.setRenderTarget(n, 1, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, a), e.setRenderTarget(n, 2, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, o), e.setRenderTarget(n, 3, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, l), e.setRenderTarget(n, 4, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, c), n.texture.mipmapsAutoUpdate = x, e.setRenderTarget(n, 5, i), m && e.autoClear === !1 && e.clearDepth(), e.render(t, h), e.setRenderTarget(u, d, f), e.xr.enabled = p, n.texture.needsPMREMUpdate = !0
    }
}
