class ao {
    constructor() {
        this.buffer = [], this._totalSize = 0
    }
    push(e) {
        this.buffer.push(e), this._totalSize += e.data.byteLength
    }
    pop() {
        const e = this.buffer.shift();
        return e && (this._totalSize -= e.data.byteLength), e
    }
    getAll() {
        return this.buffer.slice()
    }
    popToSequence(e) {
        for (; this.buffer.length > 0 && this.buffer[0].sequence <= e;) this.pop()
    }
    alignBufferedAmount(e) {
        for (; this.buffer.length > 0;) {
            const t = this.buffer[0];
            if (this._totalSize - t.data.byteLength <= e) break;
            this.pop()
        }
    }
    get length() {
        return this.buffer.length
    }
}
