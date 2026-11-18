class Hf extends wt {
    get description() {
        return "Resuming connection after interruption"
    }
    perform() {
        return b(this, void 0, void 0, function*() {
            var e;
            const t = yield this.connect();
            let n = !1,
                s = !1,
                r;
            const a = new Promise(d => {
                    setTimeout(d, 5e3), r = d
                }),
                o = () => {
                    n = !0
                };
            t.on(U.SignalReconnecting, o).on(U.Reconnecting, o).on(U.Reconnected, () => {
                s = !0, r(!0)
            }), (e = t.engine.client.ws) === null || e === void 0 || e.close();
            const c = t.engine.client.onClose;
            if (c && c(""), yield a, n) {
                if (!s || t.state !== re.Connected) throw this.appendWarning("reconnection is only possible in Redis-based configurations"), new Error("Not able to reconnect")
            } else throw new Error("Did not attempt to reconnect")
        })
    }
}
