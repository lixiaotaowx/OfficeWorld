class kv extends Rh {
    constructor(e, t = 16776960) {
        const n = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]),
            i = new Float32Array(8 * 3),
            r = new wt;
        r.setIndex(new Ft(n, 1)), r.setAttribute("position", new Ft(i, 3)), super(r, new Xo({
            color: t,
            toneMapped: !1
        })), this.object = e, this.type = "BoxHelper", this.matrixAutoUpdate = !1, this.update()
    }
    update() {
        if (this.object !== void 0 && dr.setFromObject(this.object), dr.isEmpty()) return;
        const e = dr.min,
            t = dr.max,
            n = this.geometry.attributes.position,
            i = n.array;
        i[0] = t.x, i[1] = t.y, i[2] = t.z, i[3] = e.x, i[4] = t.y, i[5] = t.z, i[6] = e.x, i[7] = e.y, i[8] = t.z, i[9] = t.x, i[10] = e.y, i[11] = t.z, i[12] = t.x, i[13] = t.y, i[14] = e.z, i[15] = e.x, i[16] = t.y, i[17] = e.z, i[18] = e.x, i[19] = e.y, i[20] = e.z, i[21] = t.x, i[22] = e.y, i[23] = e.z, n.needsUpdate = !0, this.geometry.computeBoundingSphere()
    }
    setFromObject(e) {
        return this.object = e, this.update(), this
    }
    copy(e, t) {
        return super.copy(e, t), this.object = e.object, this
    }
    dispose() {
        super.dispose(), this.geometry.dispose(), this.material.dispose()
    }
}

