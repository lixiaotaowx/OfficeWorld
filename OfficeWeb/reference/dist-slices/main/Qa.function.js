function Qa(i) {
    if (!(typeof i == "object" && i.RTCPeerConnection && i.RTCRtpSender && i.RTCRtpReceiver)) return;
    if (!("getStats" in i.RTCRtpSender.prototype)) {
        const t = i.RTCPeerConnection.prototype.getSenders;
        t && (i.RTCPeerConnection.prototype.getSenders = function() {
            const r = t.apply(this, []);
            return r.forEach(a => a._pc = this), r
        });
        const n = i.RTCPeerConnection.prototype.addTrack;
        n && (i.RTCPeerConnection.prototype.addTrack = function() {
            const r = n.apply(this, arguments);
            return r._pc = this, r
        }), i.RTCRtpSender.prototype.getStats = function() {
            const r = this;
            return this._pc.getStats().then(a => Fr(a, r.track, !0))
        }
    }
    if (!("getStats" in i.RTCRtpReceiver.prototype)) {
        const t = i.RTCPeerConnection.prototype.getReceivers;
        t && (i.RTCPeerConnection.prototype.getReceivers = function() {
            const s = t.apply(this, []);
            return s.forEach(r => r._pc = this), s
        }), Nt(i, "track", n => (n.receiver._pc = n.srcElement, n)), i.RTCRtpReceiver.prototype.getStats = function() {
            const s = this;
            return this._pc.getStats().then(r => Fr(r, s.track, !1))
        }
    }
    if (!("getStats" in i.RTCRtpSender.prototype && "getStats" in i.RTCRtpReceiver.prototype)) return;
    const e = i.RTCPeerConnection.prototype.getStats;
    i.RTCPeerConnection.prototype.getStats = function() {
        if (arguments.length > 0 && arguments[0] instanceof i.MediaStreamTrack) {
            const n = arguments[0];
            let s, r, a;
            return this.getSenders().forEach(o => {
                o.track === n && (s ? a = !0 : s = o)
            }), this.getReceivers().forEach(o => (o.track === n && (r ? a = !0 : r = o), o.track === n)), a || s && r ? Promise.reject(new DOMException("There are more than one sender or receiver for the track.", "InvalidAccessError")) : s ? s.getStats() : r ? r.getStats() : Promise.reject(new DOMException("There is no sender or receiver for the track.", "InvalidAccessError"))
        }
        return e.apply(this, arguments)
    }
}

