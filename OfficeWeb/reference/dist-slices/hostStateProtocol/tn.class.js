class tn extends be {
    get name() {
        return "webtransport"
    }
    doOpen() {
        try {
            this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name])
        } catch (e) {
            return this.emitReserved("error", e)
        }
        this._transport.closed.then(() => {
            this.onClose()
        }).catch(e => {
            this.onError("webtransport error", e)
        }), this._transport.ready.then(() => {
            this._transport.createBidirectionalStream().then(e => {
                const t = Pt(Number.MAX_SAFE_INTEGER, this.socket.binaryType),
                    s = e.readable.pipeThrough(t).getReader(),
                    r = Mt();
                r.readable.pipeTo(e.writable), this._writer = r.writable.getWriter();
                const i = () => {
                    s.read().then(({
                        done: a,
                        value: f
                    }) => {
                        a || (this.onPacket(f), i())
                    }).catch(a => {})
                };
                i();
                const o = {
                    type: "open"
                };
                this.query.sid && (o.data = `{"sid":"${this.query.sid}"}`), this._writer.write(o).then(() => this.onOpen())
            })
        })
    }
    write(e) {
        this.writable = !1;
        for (let t = 0; t < e.length; t++) {
            const s = e[t],
                r = t === e.length - 1;
            this._writer.write(s).then(() => {
                r && ae(() => {
                    this.writable = !0, this.emitReserved("drain")
                }, this.setTimeoutFn)
            })
        }
    }
    doClose() {
        var e;
        (e = this._transport) === null || e === void 0 || e.close()
    }
}
