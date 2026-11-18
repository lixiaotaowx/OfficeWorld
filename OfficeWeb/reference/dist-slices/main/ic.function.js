function ic(i) {
    if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender) || i.RTCRtpSender && "getStats" in i.RTCRtpSender.prototype) return;
    const e = i.RTCPeerConnection.prototype.getSenders;
    e && (i.RTCPeerConnection.prototype.getSenders = function() {
        const s = e.apply(this, []);
        return s.forEach(r => r._pc = this), s
    });
    const t = i.RTCPeerConnection.prototype.addTrack;
    t && (i.RTCPeerConnection.prototype.addTrack = function() {
        const s = t.apply(this, arguments);
        return s._pc = this, s
    }), i.RTCRtpSender.prototype.getStats = function() {
        return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map)
    }
}

