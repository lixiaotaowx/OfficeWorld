class qf extends wt {
    get description() {
        return "Can publish audio"
    }
    perform() {
        return b(this, void 0, void 0, function*() {
            var e;
            const t = yield this.connect(), n = yield Af();
            if (yield Tc(n, 1e3)) throw new Error("unable to detect audio from microphone");
            this.appendMessage("detected audio from microphone"), t.localParticipant.publishTrack(n), yield new Promise(o => setTimeout(o, 3e3));
            const r = yield(e = n.sender) === null || e === void 0 ? void 0 : e.getStats();
            if (!r) throw new Error("Could not get RTCStats");
            let a = 0;
            if (r.forEach(o => {
                    o.type === "outbound-rtp" && (o.kind === "audio" || !o.kind && o.mediaType === "audio") && (a = o.packetsSent)
                }), a === 0) throw new Error("Could not determine packets are sent");
            this.appendMessage("published ".concat(a, " audio packets"))
        })
    }
}
