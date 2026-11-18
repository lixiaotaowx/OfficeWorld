class Ru {
    constructor(e) {
        this.kind = "oneof", this.repeated = !1, this.packed = !1, this.opt = !1, this.req = !1, this.default = void 0, this.fields = [], this.name = e, this.localName = Su(e)
    }
    addField(e) {
        he(e.oneof === this, "field ".concat(e.name, " not one of ").concat(this.name)), this.fields.push(e)
    }
    findField(e) {
        if (!this._lookup) {
            this._lookup = Object.create(null);
            for (let t = 0; t < this.fields.length; t++) this._lookup[this.fields[t].localName] = this.fields[t]
        }
        return this._lookup[e]
    }
}

