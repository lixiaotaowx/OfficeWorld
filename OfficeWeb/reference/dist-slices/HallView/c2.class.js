class c2 extends dt {
    constructor(e, t) {
        super(), this.scene = e, this.camera = t, this.clear = !0, this.needsSwap = !1, this.inverse = !1
    }
    render(e, t, s) {
        const i = e.getContext(),
            n = e.state;
        n.buffers.color.setMask(!1), n.buffers.depth.setMask(!1), n.buffers.color.setLocked(!0), n.buffers.depth.setLocked(!0);
        let o, a;
        this.inverse ? (o = 0, a = 1) : (o = 1, a = 0), n.buffers.stencil.setTest(!0), n.buffers.stencil.setOp(i.REPLACE, i.REPLACE, i.REPLACE), n.buffers.stencil.setFunc(i.ALWAYS, o, 4294967295), n.buffers.stencil.setClear(a), n.buffers.stencil.setLocked(!0), e.setRenderTarget(s), this.clear && e.clear(), e.render(this.scene, this.camera), e.setRenderTarget(t), this.clear && e.clear(), e.render(this.scene, this.camera), n.buffers.color.setLocked(!1), n.buffers.depth.setLocked(!1), n.buffers.color.setMask(!0), n.buffers.depth.setMask(!0), n.buffers.stencil.setLocked(!1), n.buffers.stencil.setFunc(i.EQUAL, 1, 4294967295), n.buffers.stencil.setOp(i.KEEP, i.KEEP, i.KEEP), n.buffers.stencil.setLocked(!0)
    }
}
