class Or {
    constructor(e, t, n, i = !1) {
        this.isInterleavedBufferAttribute = !0, this.name = "", this.data = e, this.itemSize = t, this.offset = n, this.normalized = i, this._normalizationScale = e !== void 0 ? Fr(e.array) : void 0
    }
    get count() {
        return this.data.count
    }
    get array() {
        return this.data.array
    }
    set needsUpdate(e) {
        this.data.needsUpdate = e
    }
    applyMatrix4(e) {
        for (let t = 0, n = this.data.count; t < n; t++) Gt.fromBufferAttribute(this, t), Gt.applyMatrix4(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
        return this
    }
    applyNormalMatrix(e) {
        for (let t = 0, n = this.count; t < n; t++) Gt.fromBufferAttribute(this, t), Gt.applyNormalMatrix(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
        return this
    }
    transformDirection(e) {
        for (let t = 0, n = this.count; t < n; t++) Gt.fromBufferAttribute(this, t), Gt.transformDirection(e), this.setXYZ(t, Gt.x, Gt.y, Gt.z);
        return this
    }
    getComponent(e, t) {
        let n = this.array[e * this.data.stride + this.offset + t];
        return this.normalized && (n = this._denormalize(n)), n
    }
    setComponent(e, t, n) {
        return this.normalized && (n = this._normalize(n)), this.data.array[e * this.data.stride + this.offset + t] = n, this
    }
    setX(e, t) {
        return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset] = t, this
    }
    setY(e, t) {
        return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset + 1] = t, this
    }
    setZ(e, t) {
        return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset + 2] = t, this
    }
    setW(e, t) {
        return this.normalized && (t = this._normalize(t)), this.data.array[e * this.data.stride + this.offset + 3] = t, this
    }
    getX(e) {
        let t = this.data.array[e * this.data.stride + this.offset];
        return this.normalized && (t = this._denormalize(t)), t
    }
    getY(e) {
        let t = this.data.array[e * this.data.stride + this.offset + 1];
        return this.normalized && (t = this._denormalize(t)), t
    }
    getZ(e) {
        let t = this.data.array[e * this.data.stride + this.offset + 2];
        return this.normalized && (t = this._denormalize(t)), t
    }
    getW(e) {
        let t = this.data.array[e * this.data.stride + this.offset + 3];
        return this.normalized && (t = this._denormalize(t)), t
    }
    setXY(e, t, n) {
        return e = e * this.data.stride + this.offset, this.normalized && (t = this._normalize(t), n = this._normalize(n)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this
    }
    setXYZ(e, t, n, i) {
        return e = e * this.data.stride + this.offset, this.normalized && (t = this._normalize(t), n = this._normalize(n), i = this._normalize(i)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this
    }
    setXYZW(e, t, n, i, r) {
        return e = e * this.data.stride + this.offset, this.normalized && (t = this._normalize(t), n = this._normalize(n), i = this._normalize(i), r = this._normalize(r)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this.data.array[e + 3] = r, this
    }
    clone(e) {
        if (e === void 0) {
            wr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
            const t = [];
            for (let n = 0; n < this.count; n++) {
                const i = n * this.data.stride + this.offset;
                for (let r = 0; r < this.itemSize; r++) t.push(this.data.array[i + r])
            }
            return new Ft(new this.array.constructor(t), this.itemSize, this.normalized)
        } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.clone(e)), new Or(e.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized)
    }
    toJSON(e) {
        if (e === void 0) {
            wr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
            const t = [];
            for (let n = 0; n < this.count; n++) {
                const i = n * this.data.stride + this.offset;
                for (let r = 0; r < this.itemSize; r++) t.push(this.data.array[i + r])
            }
            return {
                itemSize: this.itemSize,
                type: this.array.constructor.name,
                array: t,
                normalized: this.normalized
            }
        } else return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.toJSON(e)), {
            isInterleavedBufferAttribute: !0,
            itemSize: this.itemSize,
            data: this.data.uuid,
            offset: this.offset,
            normalized: this.normalized
        }
    }
    _denormalize(e) {
        const t = this._normalizationScale;
        return t !== void 0 ? Math.max(e / t, -1) : Oo(e, this.data.array)
    }
    _normalize(e) {
        const t = this._normalizationScale;
        return t !== void 0 ? Math.round(e * t) : Bo(e, this.data.array)
    }
}
