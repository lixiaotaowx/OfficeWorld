class Ef extends Lc {
    constructor(e, t, n, s) {
        super(e, t, n, s), this.receivedChunks = new Map
    }
    handleChunkReceived(e) {
        var t;
        const n = Fi(e.chunkIndex),
            s = this.receivedChunks.get(n);
        if (s && s.version > e.version) return;
        this.receivedChunks.set(n, e), this.bytesReceived += e.content.byteLength, this.validateBytesReceived();
        const r = this.totalByteSize ? this.bytesReceived / this.totalByteSize : void 0;
        (t = this.onProgress) === null || t === void 0 || t.call(this, r)
    } [Symbol.asyncIterator]() {
        const e = this.reader.getReader(),
            t = new TextDecoder("utf-8", {
                fatal: !0
            });
        let n = new Le,
            s = null,
            r = null;
        if (this.signal) {
            const o = this.signal;
            r = () => {
                var c;
                (c = n.reject) === null || c === void 0 || c.call(n, o.reason)
            }, o.addEventListener("abort", r), s = o
        }
        const a = () => {
            e.releaseLock(), s && r && s.removeEventListener("abort", r), this.signal = void 0
        };
        return {
            next: () => b(this, void 0, void 0, function*() {
                var o, c;
                try {
                    const {
                        done: d,
                        value: l
                    } = yield Promise.race([e.read(), n.promise, (c = (o = this.outOfBandFailureRejectingFuture) === null || o === void 0 ? void 0 : o.promise) !== null && c !== void 0 ? c : new Promise(() => {})]);
                    if (d) return this.validateBytesReceived(!0), {
                        done: !0,
                        value: void 0
                    };
                    {
                        this.handleChunkReceived(l);
                        let u;
                        try {
                            u = t.decode(l.content)
                        } catch (h) {
                            throw new Ne("Cannot decode datastream chunk ".concat(l.chunkIndex, " as text: ").concat(h), Pe.DecodeFailed)
                        }
                        return {
                            done: !1,
                            value: u
                        }
                    }
                } catch (d) {
                    throw a(), d
                }
            }),
            return () {
                return b(this, void 0, void 0, function*() {
                    return a(), {
                        done: !0,
                        value: void 0
                    }
                })
            }
        }
    }
    withAbortSignal(e) {
        return this.signal = e, this
    }
    readAll() {
        return b(this, arguments, void 0, function() {
            var e = this;
            let t = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
            return function*() {
                var n, s, r, a;
                let o = "";
                const c = t.signal ? e.withAbortSignal(t.signal) : e;
                try {
                    for (var d = !0, l = at(c), u; u = yield l.next(), n = u.done, !n; d = !0) a = u.value, d = !1, o += a
                } catch (h) {
                    s = {
                        error: h
                    }
                } finally {
                    try {
                        !d && !n && (r = l.return) && (yield r.call(l))
                    } finally {
                        if (s) throw s.error
                    }
                }
                return o
            }()
        })
    }
}
