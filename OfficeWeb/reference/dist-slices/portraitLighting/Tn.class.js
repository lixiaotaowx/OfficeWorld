class Tn {
    constructor(e = 0, t = 0, n = 0, i = Tn.DEFAULT_ORDER) {
        this.isEuler = !0, this._x = e, this._y = t, this._z = n, this._order = i
    }
    get x() {
        return this._x
    }
    set x(e) {
        this._x = e, this._onChangeCallback()
    }
    get y() {
        return this._y
    }
    set y(e) {
        this._y = e, this._onChangeCallback()
    }
    get z() {
        return this._z
    }
    set z(e) {
        this._z = e, this._onChangeCallback()
    }
    get order() {
        return this._order
    }
    set order(e) {
        this._order = e, this._onChangeCallback()
    }
    set(e, t, n, i = this._order) {
        return this._x = e, this._y = t, this._z = n, this._order = i, this._onChangeCallback(), this
    }
    clone() {
        return new this.constructor(this._x, this._y, this._z, this._order)
    }
    copy(e) {
        return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this
    }
    setFromRotationMatrix(e, t = this._order, n = !0) {
        const i = e.elements,
            r = i[0],
            a = i[4],
            o = i[8],
            l = i[1],
            c = i[5],
            h = i[9],
            u = i[2],
            d = i[6],
            f = i[10];
        switch (t) {
            case "XYZ":
                this._y = Math.asin(Ke(o, -1, 1)), Math.abs(o) < .9999999 ? (this._x = Math.atan2(-h, f), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(d, c), this._z = 0);
                break;
            case "YXZ":
                this._x = Math.asin(-Ke(h, -1, 1)), Math.abs(h) < .9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-u, r), this._z = 0);
                break;
            case "ZXY":
                this._x = Math.asin(Ke(d, -1, 1)), Math.abs(d) < .9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, r));
                break;
            case "ZYX":
                this._y = Math.asin(-Ke(u, -1, 1)), Math.abs(u) < .9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(l, r)) : (this._x = 0, this._z = Math.atan2(-a, c));
                break;
            case "YZX":
                this._z = Math.asin(Ke(l, -1, 1)), Math.abs(l) < .9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-u, r)) : (this._x = 0, this._y = Math.atan2(o, f));
                break;
            case "XZY":
                this._z = Math.asin(-Ke(a, -1, 1)), Math.abs(a) < .9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-h, f), this._y = 0);
                break;
            default:
                Ce("Euler: .setFromRotationMatrix() encountered an unknown order: " + t)
        }
        return this._order = t, n === !0 && this._onChangeCallback(), this
    }
    setFromQuaternion(e, t, n) {
        return Ll.makeRotationFromQuaternion(e), this.setFromRotationMatrix(Ll, t, n)
    }
    setFromVector3(e, t = this._order) {
        return this.set(e.x, e.y, e.z, t)
    }
    reorder(e) {
        return Pl.setFromEuler(this), this.setFromQuaternion(Pl, e)
    }
    equals(e) {
        return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order
    }
    fromArray(e) {
        return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this
    }
    toArray(e = [], t = 0) {
        return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e
    }
    _onChange(e) {
        return this._onChangeCallback = e, this
    }
    _onChangeCallback() {}*[Symbol.iterator]() {
        yield this._x, yield this._y, yield this._z, yield this._order
    }
}
Tn.DEFAULT_ORDER = "XYZ";
