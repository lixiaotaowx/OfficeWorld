class Zt extends be {
    get name() {
        return "websocket"
    }
    doOpen() {
        const e = this.uri(),
            t = this.opts.protocols,
            s = Ke ? {} : He(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
        this.opts.extraHeaders && (s.headers = this.opts.extraHeaders);
        try {
            this.ws = this.createSocket(e, t, s)
        } catch (r) {
            return this.emitReserved("error", r)
        }
        this.ws.binaryType = this.socket.binaryType, this.addEventListeners()
    }
    addEventListeners() {
        this.ws.onopen = () => {
            this.opts.autoUnref && this.ws._socket.unref(), this.onOpen()
        }, this.ws.onclose = e => this.onClose({
            description: "websocket connection closed",
            context: e
        }), this.ws.onmessage = e => this.onData(e.data), this.ws.onerror = e => this.onError("websocket error", e)
    }
    write(e) {
        this.writable = !1;
        for (let t = 0; t < e.length; t++) {
            const s = e[t],
                r = t === e.length - 1;
            we(s, this.supportsBinary, i => {
                try {
                    this.doWrite(s, i)
                } catch {}
                r && ae(() => {
                    this.writable = !0, this.emitReserved("drain")
                }, this.setTimeoutFn)
            })
        }
    }
    doClose() {
        typeof this.ws < "u" && (this.ws.onerror = () => {}, this.ws.close(), this.ws = null)
    }
    uri() {
        const e = this.opts.secure ? "wss" : "ws",
            t = this.query || {};
        return this.opts.timestampRequests && (t[this.opts.timestampParam] = We()), this.supportsBinary || (t.b64 = 1), this.createUri(e, t)
    }
}
