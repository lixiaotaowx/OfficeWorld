class Vf extends wt {
    get description() {
        return "Connection via UDP vs TCP"
    }
    perform() {
        return b(this, void 0, void 0, function*() {
            const e = yield this.checkConnectionProtocol("udp"), t = yield this.checkConnectionProtocol("tcp");
            this.bestStats = e, e.qualityLimitationDurations.bandwidth - t.qualityLimitationDurations.bandwidth > .5 || (e.packetsLost - t.packetsLost) / e.packetsSent > .01 ? (this.appendMessage("best connection quality via tcp"), this.bestStats = t) : this.appendMessage("best connection quality via udp");
            const n = this.bestStats;
            this.appendMessage("upstream bitrate: ".concat((n.bitrateTotal / n.count / 1e3 / 1e3).toFixed(2), " mbps")), this.appendMessage("RTT: ".concat((n.rttTotal / n.count * 1e3).toFixed(2), " ms")), this.appendMessage("jitter: ".concat((n.jitterTotal / n.count * 1e3).toFixed(2), " ms")), n.packetsLost > 0 && this.appendWarning("packets lost: ".concat((n.packetsLost / n.packetsSent * 100).toFixed(2), "%")), n.qualityLimitationDurations.bandwidth > 1 && this.appendWarning("bandwidth limited ".concat((n.qualityLimitationDurations.bandwidth / (Dn / 1e3) * 100).toFixed(2), "%")), n.qualityLimitationDurations.cpu > 0 && this.appendWarning("cpu limited ".concat((n.qualityLimitationDurations.cpu / (Dn / 1e3) * 100).toFixed(2), "%"))
        })
    }
    getInfo() {
        const e = super.getInfo();
        return e.data = this.bestStats, e
    }
    checkConnectionProtocol(e) {
        return b(this, void 0, void 0, function*() {
            yield this.connect(), e === "tcp" ? yield this.switchProtocol("tcp"): yield this.switchProtocol("udp");
            const t = document.createElement("canvas");
            t.width = 1280, t.height = 720;
            const n = t.getContext("2d");
            if (!n) throw new Error("Could not get canvas context");
            let s = 0;
            const r = () => {
                s = (s + 1) % 360, n.fillStyle = "hsl(".concat(s, ", 100%, 50%)"), n.fillRect(0, 0, t.width, t.height), requestAnimationFrame(r)
            };
            r();
            const o = t.captureStream(30).getVideoTracks()[0],
                d = (yield this.room.localParticipant.publishTrack(o, {
                    simulcast: !1,
                    degradationPreference: "maintain-resolution",
                    videoEncoding: {
                        maxBitrate: 2e6
                    }
                })).track,
                l = {
                    protocol: e,
                    packetsLost: 0,
                    packetsSent: 0,
                    qualityLimitationDurations: {},
                    rttTotal: 0,
                    jitterTotal: 0,
                    bitrateTotal: 0,
                    count: 0
                },
                u = setInterval(() => b(this, void 0, void 0, function*() {
                    const h = yield d.getRTCStatsReport();
                    h == null || h.forEach(m => {
                        m.type === "outbound-rtp" ? (l.packetsSent = m.packetsSent, l.qualityLimitationDurations = m.qualityLimitationDurations, l.bitrateTotal += m.targetBitrate, l.count++) : m.type === "remote-inbound-rtp" && (l.packetsLost = m.packetsLost, l.rttTotal += m.roundTripTime, l.jitterTotal += m.jitter)
                    })
                }), 1e3);
            return yield new Promise(h => setTimeout(h, Dn)), clearInterval(u), o.stop(), t.remove(), yield this.disconnect(), l
        })
    }
}
