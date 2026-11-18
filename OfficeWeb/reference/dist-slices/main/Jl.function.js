function Jl(i, e, t, n) {
    var s;
    const r = (s = n == null ? void 0 : n.localName) !== null && s !== void 0 ? s : e.substring(e.lastIndexOf(".") + 1),
        a = {
            [r]: function(o) {
                i.util.initFields(this), i.util.initPartial(o, this)
            }
        } [r];
    return Object.setPrototypeOf(a.prototype, new Es), Object.assign(a, {
        runtime: i,
        typeName: e,
        fields: i.util.newFieldList(t),
        fromBinary(o, c) {
            return new a().fromBinary(o, c)
        },
        fromJson(o, c) {
            return new a().fromJson(o, c)
        },
        fromJsonString(o, c) {
            return new a().fromJsonString(o, c)
        },
        equals(o, c) {
            return i.util.equals(a, o, c)
        }
    }), a
}

