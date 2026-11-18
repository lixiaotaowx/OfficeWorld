class Ft extends jn {
    constructor(e, t, n = !1) {
        if (super(), Array.isArray(e)) throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
        this.isBufferAttribute = !0, Object.defineProperty(this, "id", {
            value: Yd++
        }), this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = _h, this.updateRanges = [], this.gpuType = jt, this.version = 0, this._normalizationScale = e !== void 0 ? Fr(e) : void 0
    }
    onUploadCallback() {}
    set needsUpdate(e) {
        e === !0 && this.version++
    }
    setUsage(e) {
        return this.usage = e, this
    }
    addUpdateRange(e, t) {
        this.updateRanges.push({
            start: e,
            count: t
        })
    }
    clearUpdateRanges() {
        this.updateRanges.length = 0
    }
    copy(e) {
        return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this._normalizationScale = e._normalizationScale, this
    }
    copyAt(e, t, n) {
        e *= this.itemSize, n *= t.itemSize;
        for (let i = 0, r = this.itemSize; i < r; i++) this.array[e + i] = t.array[n + i];
        return this
    }
    copyArray(e) {
        return this.array.set(e), this
    }
    applyMatrix3(e) {
        if (this.itemSize === 2)
            for (let t = 0, n = this.count; t < n; t++) Xs.fromBufferAttribute(this, t), Xs.applyMatrix3(e), this.setXY(t, Xs.x, Xs.y);
        else if (this.itemSize === 3)
            for (let t = 0, n = this.count; t < n; t++) Et.fromBufferAttribute(this, t), Et.applyMatrix3(e), this.setXYZ(t, Et.x, Et.y, Et.z);
        return this
    }
    applyMatrix4(e) {
        for (let t = 0, n = this.count; t < n; t++) Et.fromBufferAttribute(this, t), Et.applyMatrix4(e), this.setXYZ(t, Et.x, Et.y, Et.z);
        return this
    }
    applyNormalMatrix(e) {
        for (let t = 0, n = this.count; t < n; t++) Et.fromBufferAttribute(this, t), Et.applyNormalMatrix(e), this.setXYZ(t, Et.x, Et.y, Et.z);
        return this
    }
    transformDirection(e) {
        for (let t = 0, n = this.count; t < n; t++) Et.fromBufferAttribute(this, t), Et.transformDirection(e), this.setXYZ(t, Et.x, Et.y, Et.z);
        return this
    }
    set(e, t = 0) {
        return this.array.set(e, t), this
    }
    getComponent(e, t) {
        let n = this.array[e * this.itemSize + t];
        return this.normalized && (n = this._denormalize(n)), n
    }
    setComponent(e, t, n) {
        return this.normalized && (n = this._normalize(n)), this.array[e * this.itemSize + t] = n, this
    }
    getX(e) {
        let t = this.array[e * this.itemSize];
        return this.normalized && (t = this._denormalize(t)), t
    }
    setX(e, t) {
        return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize] = t, this
    }
    getY(e) {
        let t = this.array[e * this.itemSize + 1];
        return this.normalized && (t = this._denormalize(t)), t
    }
    setY(e, t) {
        return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize + 1] = t, this
    }
    getZ(e) {
        let t = this.array[e * this.itemSize + 2];
        return this.normalized && (t = this._denormalize(t)), t
    }
    setZ(e, t) {
        return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize + 2] = t, this
    }
    getW(e) {
        let t = this.array[e * this.itemSize + 3];
        return this.normalized && (t = this._denormalize(t)), t
    }
    setW(e, t) {
        return this.normalized && (t = this._normalize(t)), this.array[e * this.itemSize + 3] = t, this
    }
    setXY(e, t, n) {
        return e *= this.itemSize, this.normalized && (t = this._normalize(t), n = this._normalize(n)), this.array[e + 0] = t, this.array[e + 1] = n, this
    }
    setXYZ(e, t, n, i) {
        return e *= this.itemSize, this.normalized && (t = this._normalize(t), n = this._normalize(n), i = this._normalize(i)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this
    }
    setXYZW(e, t, n, i, r) {
        return e *= this.itemSize, this.normalized && (t = this._normalize(t), n = this._normalize(n), i = this._normalize(i), r = this._normalize(r)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = r, this
    }
    onUpload(e) {
        return this.onUploadCallback = e, this
    }
    clone() {
        return new this.constructor(this.array, this.itemSize).copy(this)
    }
    toJSON() {
        const e = {
            itemSize: this.itemSize,
            type: this.array.constructor.name,
            array: Array.from(this.array),
            normalized: this.normalized
        };
        return e.name = this.name, e.usage = this.usage, e.gpuType = this.gpuType, e
    }
    dispose() {
        this.dispatchEvent({
            type: "dispose"
        })
    }
    _denormalize(e) {
        const t = this._normalizationScale;
        return t !== void 0 ? Math.max(e / t, -1) : Oo(e, this.array)
    }
    _normalize(e) {
        const t = this._normalizationScale;
        return t !== void 0 ? Math.round(e * t) : Bo(e, this.array)
    }
}
