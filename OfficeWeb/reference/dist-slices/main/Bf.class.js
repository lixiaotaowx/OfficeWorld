class Bf extends wt {
    get description() {
        return "Cloud regions"
    }
    perform() {
        return b(this, void 0, void 0, function*() {
            const e = new se(this.url, this.token);
            if (!e.isCloud()) {
                this.skip();
                return
            }
            const t = [],
                n = new Set;
            for (let r = 0; r < 3; r++) {
                const a = yield e.getNextBestRegionUrl();
                if (!a) break;
                if (n.has(a)) continue;
                n.add(a);
                const o = yield this.checkCloudRegion(a);
                this.appendMessage("".concat(o.region, " RTT: ").concat(o.rtt, "ms, duration: ").concat(o.duration, "ms")), t.push(o)
            }
            t.sort((r, a) => (r.duration - a.duration) * .5 + (r.rtt - a.rtt) * .5);
            const s = t[0];
            this.bestStats = s, this.appendMessage("best Cloud region: ".concat(s.region))
        })
    }
    getInfo() {
        const e = super.getInfo();
        return e.data = this.bestStats, e
    }
    checkCloudRegion(e) {
        return b(this, void 0, void 0, function*() {
            var t, n;
            yield this.connect(e), this.options.protocol === "tcp" && (yield this.switchProtocol("tcp"));
            const s = (t = this.room.serverInfo) === null || t === void 0 ? void 0 : t.region;
            if (!s) throw new Error("Region not found");
            const r = yield this.room.localParticipant.streamText({
                topic: "test"
            }), a = 1e3, c = 1e6 / a, d = "A".repeat(a), l = Date.now();
            for (let f = 0; f < c; f++) yield r.write(d);
            yield r.close();
            const u = Date.now(),
                h = yield(n = this.room.engine.pcManager) === null || n === void 0 ? void 0 : n.publisher.getStats(), m = {
                    region: s,
                    rtt: 1e4,
                    duration: u - l
                };
            return h == null || h.forEach(f => {
                f.type === "candidate-pair" && f.nominated && (m.rtt = f.currentRoundTripTime * 1e3)
            }), yield this.disconnect(), m
        })
    }
}
