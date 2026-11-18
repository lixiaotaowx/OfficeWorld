class h1 {
    constructor(e, t, s, i) {
        this._dataView = void 0, this._littleEndian = void 0, this._offset = void 0, this._dataView = new DataView(e.buffer, e.byteOffset + t, s), this._littleEndian = i, this._offset = 0
    }
    _nextUint8() {
        const e = this._dataView.getUint8(this._offset);
        return this._offset += 1, e
    }
    _nextUint16() {
        const e = this._dataView.getUint16(this._offset, this._littleEndian);
        return this._offset += 2, e
    }
    _nextUint32() {
        const e = this._dataView.getUint32(this._offset, this._littleEndian);
        return this._offset += 4, e
    }
    _nextUint64() {
        const e = this._dataView.getUint32(this._offset, this._littleEndian) + 4294967296 * this._dataView.getUint32(this._offset + 4, this._littleEndian);
        return this._offset += 8, e
    }
    _nextInt32() {
        const e = this._dataView.getInt32(this._offset, this._littleEndian);
        return this._offset += 4, e
    }
    _nextUint8Array(e) {
        const t = new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + this._offset, e);
        return this._offset += e, t
    }
    _skip(e) {
        return this._offset += e, this
    }
    _scan(e, t = 0) {
        const s = this._offset;
        let i = 0;
        for (; this._dataView.getUint8(this._offset) !== t && i < e;) i++, this._offset++;
        return i < e && this._offset++, new Uint8Array(this._dataView.buffer, this._dataView.byteOffset + s, i)
    }
}
