class Uc {
    constructor(e, t, n) {
        this.writableStream = e, this.defaultWriter = e.getWriter(), this.onClose = n, this.info = t
    }
    write(e) {
        return this.defaultWriter.write(e)
    }
    close() {
        return b(this, void 0, void 0, function*() {
            var e;
            yield this.defaultWriter.close(), this.defaultWriter.releaseLock(), (e = this.onClose) === null || e === void 0 || e.call(this)
        })
    }
}
