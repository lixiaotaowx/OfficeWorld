class eu {
    constructor(e, t) {
        this.varint64 = zl, this.uint32 = Yl, this.buf = e, this.len = e.length, this.pos = 0, this.view = new DataView(e.buffer, e.byteOffset, e.byteLength), this.textDecoder = t ?? new TextDecoder
    }
    tag() {
        let e = this.uint32(),
            t = e >>> 3,
            n = e & 7;
        if (t <= 0 || n < 0 || n > 5) throw new Error("illegal tag: field no " + t + " wire type " + n);
        return [t, n]
    }
    skip(e, t) {
        let n = this.pos;
        switch (e) {
            case pe.Varint:
                for (; this.buf[this.pos++] & 128;);
                break;
            case pe.Bit64:
                this.pos += 4;
            case pe.Bit32:
                this.pos += 4;
                break;
            case pe.LengthDelimited:
                let s = this.uint32();
                this.pos += s;
                break;
            case pe.StartGroup:
                for (;;) {
                    const [r, a] = this.tag();
                    if (a === pe.EndGroup) {
                        if (t !== void 0 && r !== t) throw new Error("invalid end group tag");
                        break
                    }
                    this.skip(a, r)
                }
                break;
            default:
                throw new Error("cant skip wire type " + e)
        }
        return this.assertBounds(), this.buf.subarray(n, this.pos)
    }
    assertBounds() {
        if (this.pos > this.len) throw new RangeError("premature EOF")
    }
    int32() {
        return this.uint32() | 0
    }
    sint32() {
        let e = this.uint32();
        return e >>> 1 ^ -(e & 1)
    }
    int64() {
        return de.dec(...this.varint64())
    }
    uint64() {
        return de.uDec(...this.varint64())
    }
    sint64() {
        let [e, t] = this.varint64(), n = -(e & 1);
        return e = (e >>> 1 | (t & 1) << 31) ^ n, t = t >>> 1 ^ n, de.dec(e, t)
    }
    bool() {
        let [e, t] = this.varint64();
        return e !== 0 || t !== 0
    }
    fixed32() {
        return this.view.getUint32((this.pos += 4) - 4, !0)
    }
    sfixed32() {
        return this.view.getInt32((this.pos += 4) - 4, !0)
    }
    fixed64() {
        return de.uDec(this.sfixed32(), this.sfixed32())
    }
    sfixed64() {
        return de.dec(this.sfixed32(), this.sfixed32())
    }
    float() {
        return this.view.getFloat32((this.pos += 4) - 4, !0)
    }
    double() {
        return this.view.getFloat64((this.pos += 8) - 8, !0)
    }
    bytes() {
        let e = this.uint32(),
            t = this.pos;
        return this.pos += e, this.assertBounds(), this.buf.subarray(t, t + e)
    }
    string() {
        return this.textDecoder.decode(this.bytes())
    }
}

