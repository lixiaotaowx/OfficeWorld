class zf extends wt {
    get description() {
        return "Connecting to signal connection via WebSocket"
    }
    perform() {
        return b(this, void 0, void 0, function*() {
            var e, t, n;
            (this.url.startsWith("ws:") || this.url.startsWith("http:")) && this.appendWarning("Server is insecure, clients may block connections to it");
            let s = new Hs,
                r;
            try {
                r = yield s.join(this.url, this.token, {
                    autoSubscribe: !0,
                    maxRetries: 0,
                    e2eeEnabled: !1,
                    websocketTimeout: 15e3
                }, void 0, !0)
            } catch (a) {
                if (zt(new URL(this.url))) {
                    this.appendMessage("Initial connection failed with error ".concat(a.message, ". Retrying with region fallback"));
                    const c = yield new se(this.url, this.token).getNextBestRegionUrl();
                    c && (r = yield s.join(c, this.token, {
                        autoSubscribe: !0,
                        maxRetries: 0,
                        e2eeEnabled: !1,
                        websocketTimeout: 15e3
                    }, void 0, !0), this.appendMessage("Fallback to region worked. To avoid initial connections failing, ensure you're calling room.prepareConnection() ahead of time"))
                }
            }
            r ? (this.appendMessage("Connected to server, version ".concat(r.serverVersion, ".")), ((e = r.serverInfo) === null || e === void 0 ? void 0 : e.edition) === Ta.Cloud && (!((t = r.serverInfo) === null || t === void 0) && t.region) && this.appendMessage("LiveKit Cloud: ".concat((n = r.serverInfo) === null || n === void 0 ? void 0 : n.region))) : this.appendError("Websocket connection could not be established"), yield s.close()
        })
    }
}
