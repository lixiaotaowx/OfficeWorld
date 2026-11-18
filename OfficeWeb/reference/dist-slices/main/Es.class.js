class Es {
    equals(e) {
        return this.getType().runtime.util.equals(this.getType(), this, e)
    }
    clone() {
        return this.getType().runtime.util.clone(this)
    }
    fromBinary(e, t) {
        const n = this.getType(),
            s = n.runtime.bin,
            r = s.makeReadOptions(t);
        return s.readMessage(this, r.readerFactory(e), e.byteLength, r), this
    }
    fromJson(e, t) {
        const n = this.getType(),
            s = n.runtime.json,
            r = s.makeReadOptions(t);
        return s.readMessage(n, e, r, this), this
    }
    fromJsonString(e, t) {
        let n;
        try {
            n = JSON.parse(e)
        } catch (s) {
            throw new Error("cannot decode ".concat(this.getType().typeName, " from JSON: ").concat(s instanceof Error ? s.message : String(s)))
        }
        return this.fromJson(n, t)
    }
    toBinary(e) {
        const t = this.getType(),
            n = t.runtime.bin,
            s = n.makeWriteOptions(e),
            r = s.writerFactory();
        return n.writeMessage(this, r, s), r.finish()
    }
    toJson(e) {
        const t = this.getType(),
            n = t.runtime.json,
            s = n.makeWriteOptions(e);
        return n.writeMessage(this, s)
    }
    toJsonString(e) {
        var t;
        const n = this.toJson(e);
        return JSON.stringify(n, null, (t = e == null ? void 0 : e.prettySpaces) !== null && t !== void 0 ? t : 0)
    }
    toJSON() {
        return this.toJson({
            emitDefaultValues: !0
        })
    }
    getType() {
        return Object.getPrototypeOf(this).constructor
    }
}

