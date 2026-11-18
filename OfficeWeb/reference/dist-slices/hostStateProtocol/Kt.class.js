class Kt extends be {
    constructor() {
        super(...arguments), this._polling = !1
    }
    get name() {
        return "polling"
    }
    doOpen() {
        this._poll()
    }
    pause(e) {
        this.readyState = "pausing";
        const t = () => {
            this.readyState = "paused", e()
        };
        if (this._polling || !this.writable) {
            let s = 0;
            this._polling && (s++, this.once("pollComplete", function() {
                --s || t()
            })), this.writable || (s++, this.once("drain", function() {
                --s || t()
            }))
        } else t()
    }
    _poll() {
        this._polling = !0, this.doPoll(), this.emitReserved("poll")
    }
    onData(e) {
        const t = s => {
            if (this.readyState === "opening" && s.type === "open" && this.onOpen(), s.type === "close") return this.onClose({
                description: "transport closed by the server"
            }), !1;
            this.onPacket(s)
        };
        Lt(e, this.socket.binaryType).forEach(t), this.readyState !== "closed" && (this._polling = !1, this.emitReserved("pollComplete"), this.readyState === "open" && this._poll())
    }
    doClose() {
        const e = () => {
            this.write([{
                type: "close"
            }])
        };
        this.readyState === "open" ? e() : this.once("open", e)
    }
    write(e) {
        this.writable = !1, It(e, t => {
            this.doWrite(t, () => {
                this.writable = !0, this.emitReserved("drain")
            })
        })
    }
    uri() {
        const e = this.opts.secure ? "https" : "http",
            t = this.query || {};
        return this.opts.timestampRequests !== !1 && (t[this.opts.timestampParam] = We()), !this.supportsBinary && !t.sid && (t.b64 = 1), this.createUri(e, t)
    }
}
let $e = !1;
try {
    $e = typeof XMLHttpRequest < "u" && "withCredentials" in new XMLHttpRequest
} catch {}
