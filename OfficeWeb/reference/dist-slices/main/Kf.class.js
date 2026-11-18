class Kf extends wt {
    get description() {
        return "Can connect via TURN"
    }
    perform() {
        return b(this, void 0, void 0, function*() {
            var e, t, n;
            zt(new URL(this.url)) && (this.appendMessage("Using region specific url"), this.url = (e = yield new se(this.url, this.token).getNextBestRegionUrl()) !== null && e !== void 0 ? e : this.url);
            const s = new Hs,
                r = yield s.join(this.url, this.token, {
                    autoSubscribe: !0,
                    maxRetries: 0,
                    e2eeEnabled: !1,
                    websocketTimeout: 15e3
                }, void 0, !0);
            let a = !1,
                o = !1,
                c = !1;
            for (let d of r.iceServers)
                for (let l of d.urls) l.startsWith("turn:") ? (o = !0, c = !0) : l.startsWith("turns:") && (o = !0, c = !0, a = !0), l.startsWith("stun:") && (c = !0);
            c ? o && !a && this.appendWarning("TURN is configured server side, but TURN/TLS is unavailable.") : this.appendWarning("No STUN servers configured on server side."), yield s.close(), !((n = (t = this.connectOptions) === null || t === void 0 ? void 0 : t.rtcConfig) === null || n === void 0) && n.iceServers || o ? yield this.room.connect(this.url, this.token, {
                rtcConfig: {
                    iceTransportPolicy: "relay"
                }
            }): (this.appendWarning("No TURN servers configured."), this.skip(), yield new Promise(d => setTimeout(d, 0)))
        })
    }
}
