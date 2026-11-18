class Nm {
    get readyState() {
        return this.ws.readyState
    }
    constructor(e) {
        let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var n, s;
        if (!((n = t.signal) === null || n === void 0) && n.aborted) throw new DOMException("This operation was aborted", "AbortError");
        this.url = e;
        const r = new WebSocket(e, (s = t.protocols) !== null && s !== void 0 ? s : []);
        r.binaryType = "arraybuffer", this.ws = r;
        const a = function() {
            let {
                closeCode: o,
                reason: c
            } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
            return r.close(o, c)
        };
        this.opened = new Ee((o, c) => {
            const d = () => {
                c($.websocket("Encountered websocket error during connection establishment"))
            };
            r.onopen = () => {
                o({
                    readable: new ReadableStream({
                        start(l) {
                            r.onmessage = u => {
                                let {
                                    data: h
                                } = u;
                                return l.enqueue(h)
                            }, r.onerror = u => l.error(u)
                        },
                        cancel: a
                    }),
                    writable: new WritableStream({
                        write(l) {
                            r.send(l)
                        },
                        abort() {
                            r.close()
                        },
                        close: a
                    }),
                    protocol: r.protocol,
                    extensions: r.extensions
                }), r.removeEventListener("error", d)
            }, r.addEventListener("error", d)
        }), this.closed = new Ee((o, c) => {
            const d = () => b(this, void 0, void 0, function*() {
                const l = new Ee(h => {
                        r.readyState !== WebSocket.CLOSED && r.addEventListener("close", m => {
                            h(m)
                        }, {
                            once: !0
                        })
                    }),
                    u = yield Ee.race([Ce(250), l]);
                u ? o(u) : c($.websocket("Encountered unspecified websocket error without a timely close event"))
            });
            r.onclose = l => {
                let {
                    code: u,
                    reason: h
                } = l;
                o({
                    closeCode: u,
                    reason: h
                }), r.removeEventListener("error", d)
            }, r.addEventListener("error", d)
        }), t.signal && (t.signal.onabort = () => r.close()), this.close = a
    }
}
