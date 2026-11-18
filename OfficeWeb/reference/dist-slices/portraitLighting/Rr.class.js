class Rr extends Ft {
    constructor(e, t, n, i = 1) {
        super(e, t, n), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = i
    }
    copy(e) {
        return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this
    }
    toJSON() {
        const e = super.toJSON();
        return e.meshPerAttribute = this.meshPerAttribute, e.isInstancedBufferAttribute = !0, e
    }
}
