function Xa(i, e) {
    if (!i.RTCPeerConnection) return;
    if (i.RTCPeerConnection.prototype.addTrack && e.version >= 65) return Ya(i);
    const t = i.RTCPeerConnection.prototype.getLocalStreams;
    i.RTCPeerConnection.prototype.getLocalStreams = function() {
        const l = t.apply(this);
        return this._reverseStreams = this._reverseStreams || {}, l.map(u => this._reverseStreams[u.id])
    };
    const n = i.RTCPeerConnection.prototype.addStream;
    i.RTCPeerConnection.prototype.addStream = function(l) {
        if (this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, l.getTracks().forEach(u => {
                if (this.getSenders().find(m => m.track === u)) throw new DOMException("Track already exists.", "InvalidAccessError")
            }), !this._reverseStreams[l.id]) {
            const u = new i.MediaStream(l.getTracks());
            this._streams[l.id] = u, this._reverseStreams[u.id] = l, l = u
        }
        n.apply(this, [l])
    };
    const s = i.RTCPeerConnection.prototype.removeStream;
    i.RTCPeerConnection.prototype.removeStream = function(l) {
        this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {}, s.apply(this, [this._streams[l.id] || l]), delete this._reverseStreams[this._streams[l.id] ? this._streams[l.id].id : l.id], delete this._streams[l.id]
    }, i.RTCPeerConnection.prototype.addTrack = function(l, u) {
        if (this.signalingState === "closed") throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
        const h = [].slice.call(arguments, 1);
        if (h.length !== 1 || !h[0].getTracks().find(p => p === l)) throw new DOMException("The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.", "NotSupportedError");
        if (this.getSenders().find(p => p.track === l)) throw new DOMException("Track already exists.", "InvalidAccessError");
        this._streams = this._streams || {}, this._reverseStreams = this._reverseStreams || {};
        const f = this._streams[u.id];
        if (f) f.addTrack(l), Promise.resolve().then(() => {
            this.dispatchEvent(new Event("negotiationneeded"))
        });
        else {
            const p = new i.MediaStream([l]);
            this._streams[u.id] = p, this._reverseStreams[p.id] = u, this.addStream(p)
        }
        return this.getSenders().find(p => p.track === l)
    };

    function r(d, l) {
        let u = l.sdp;
        return Object.keys(d._reverseStreams || []).forEach(h => {
            const m = d._reverseStreams[h],
                f = d._streams[m.id];
            u = u.replace(new RegExp(f.id, "g"), m.id)
        }), new RTCSessionDescription({
            type: l.type,
            sdp: u
        })
    }

    function a(d, l) {
        let u = l.sdp;
        return Object.keys(d._reverseStreams || []).forEach(h => {
            const m = d._reverseStreams[h],
                f = d._streams[m.id];
            u = u.replace(new RegExp(m.id, "g"), f.id)
        }), new RTCSessionDescription({
            type: l.type,
            sdp: u
        })
    } ["createOffer", "createAnswer"].forEach(function(d) {
        const l = i.RTCPeerConnection.prototype[d],
            u = {
                [d]() {
                    const h = arguments;
                    return arguments.length && typeof arguments[0] == "function" ? l.apply(this, [f => {
                        const p = r(this, f);
                        h[0].apply(null, [p])
                    }, f => {
                        h[1] && h[1].apply(null, f)
                    }, arguments[2]]) : l.apply(this, arguments).then(f => r(this, f))
                }
            };
        i.RTCPeerConnection.prototype[d] = u[d]
    });
    const o = i.RTCPeerConnection.prototype.setLocalDescription;
    i.RTCPeerConnection.prototype.setLocalDescription = function() {
        return !arguments.length || !arguments[0].type ? o.apply(this, arguments) : (arguments[0] = a(this, arguments[0]), o.apply(this, arguments))
    };
    const c = Object.getOwnPropertyDescriptor(i.RTCPeerConnection.prototype, "localDescription");
    Object.defineProperty(i.RTCPeerConnection.prototype, "localDescription", {
        get() {
            const d = c.get.apply(this);
            return d.type === "" ? d : r(this, d)
        }
    }), i.RTCPeerConnection.prototype.removeTrack = function(l) {
        if (this.signalingState === "closed") throw new DOMException("The RTCPeerConnection's signalingState is 'closed'.", "InvalidStateError");
        if (!l._pc) throw new DOMException("Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.", "TypeError");
        if (!(l._pc === this)) throw new DOMException("Sender was not created by this connection.", "InvalidAccessError");
        this._streams = this._streams || {};
        let h;
        Object.keys(this._streams).forEach(m => {
            this._streams[m].getTracks().find(p => l.track === p) && (h = this._streams[m])
        }), h && (h.getTracks().length === 1 ? this.removeStream(this._reverseStreams[h.id]) : h.removeTrack(l.track), this.dispatchEvent(new Event("negotiationneeded")))
    }
}

