class Lc {
    get info() {
        return this._info
    }
    validateBytesReceived() {
        let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : !1;
        if (!(typeof this.totalByteSize != "number" || this.totalByteSize === 0)) {
            if (e && this.bytesReceived < this.totalByteSize) throw new Ne("Not enough chunk(s) received - expected ".concat(this.totalByteSize, " bytes of data total, only received ").concat(this.bytesReceived, " bytes"), Pe.Incomplete);
            if (this.bytesReceived > this.totalByteSize) throw new Ne("Extra chunk(s) received - expected ".concat(this.totalByteSize, " bytes of data total, received ").concat(this.bytesReceived, " bytes"), Pe.LengthExceeded)
        }
    }
    constructor(e, t, n, s) {
        this.reader = t, this.totalByteSize = n, this._info = e, this.bytesReceived = 0, this.outOfBandFailureRejectingFuture = s
    }
}
