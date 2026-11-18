class Zl {
    constructor(e) {
        this.stack = [], this.textEncoder = e ?? new TextEncoder, this.chunks = [], this.buf = []
    }
    finish() {
        this.chunks.push(new Uint8Array(this.buf));
        let e = 0;
        for (let s = 0; s < this.chunks.length; s++) e += this.chunks[s].length;
        let t = new Uint8Array(e),
            n = 0;
        for (let s = 0; s < this.chunks.length; s++) t.set(this.chunks[s], n), n += this.chunks[s].length;
        return this.chunks = [], t
    }
    fork() {
        return this.stack.push({
            chunks: this.chunks,
            buf: this.buf
        }), this.chunks = [], this.buf = [], this
    }
    join() {
        let e = this.finish(),
            t = this.stack.pop();
        if (!t) throw new Error("invalid state, fork stack empty");
        return this.chunks = t.chunks, this.buf = t.buf, this.uint32(e.byteLength), this.raw(e)
    }
    tag(e, t) {
        return this.uint32((e << 3 | t) >>> 0)
    }
    raw(e) {
        return this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []), this.chunks.push(e), this
    }
    uint32(e) {
        for (Hn(e); e > 127;) this.buf.push(e & 127 | 128), e = e >>> 7;
        return this.buf.push(e), this
    }
    int32(e) {
        return Ri(e), Tr(e, this.buf), this
    }
    bool(e) {
        return this.buf.push(e ? 1 : 0), this
    }
    bytes(e) {
        return this.uint32(e.byteLength), this.raw(e)
    }
    string(e) {
        let t = this.textEncoder.encode(e);
        return this.uint32(t.byteLength), this.raw(t)
    }
    float(e) {
        $o(e);
        let t = new Uint8Array(4);
        return new DataView(t.buffer).setFloat32(0, e, !0), this.raw(t)
    }
    double(e) {
        let t = new Uint8Array(8);
        return new DataView(t.buffer).setFloat64(0, e, !0), this.raw(t)
    }
    fixed32(e) {
        Hn(e);
        let t = new Uint8Array(4);
        return new DataView(t.buffer).setUint32(0, e, !0), this.raw(t)
    }
    sfixed32(e) {
        Ri(e);
        let t = new Uint8Array(4);
        return new DataView(t.buffer).setInt32(0, e, !0), this.raw(t)
    }
    sint32(e) {
        return Ri(e), e = (e << 1 ^ e >> 31) >>> 0, Tr(e, this.buf), this
    }
    sfixed64(e) {
        let t = new Uint8Array(8),
            n = new DataView(t.buffer),
            s = de.enc(e);
        return n.setInt32(0, s.lo, !0), n.setInt32(4, s.hi, !0), this.raw(t)
    }
    fixed64(e) {
        let t = new Uint8Array(8),
            n = new DataView(t.buffer),
            s = de.uEnc(e);
        return n.setInt32(0, s.lo, !0), n.setInt32(4, s.hi, !0), this.raw(t)
    }
    int64(e) {
        let t = de.enc(e);
        return pn(t.lo, t.hi, this.buf), this
    }
    sint64(e) {
        let t = de.enc(e),
            n = t.hi >> 31,
            s = t.lo << 1 ^ n,
            r = (t.hi << 1 | t.lo >>> 31) ^ n;
        return pn(s, r, this.buf), this
    }
    uint64(e) {
        let t = de.uEnc(e);
        return pn(t.lo, t.hi, this.buf), this
    }
}
