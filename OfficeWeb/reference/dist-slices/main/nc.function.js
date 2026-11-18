function nc(i) {
    if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender) || i.RTCRtpSender && "getStats" in i.RTCRtpReceiver.prototype) return;
    const e = i.RTCPeerConnection.prototype.getReceivers;
    e && (i.RTCPeerConnection.prototype.getReceivers = function() {
        const n = e.apply(this, []);
        return n.forEach(s => s._pc = this), n
    }), Nt(i, "track", t => (t.receiver._pc = t.srcElement, t)), i.RTCRtpReceiver.prototype.getStats = function() {
        return this._pc.getStats(this.track)
    }
}

