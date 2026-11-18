function Ya(i) {
    i.RTCPeerConnection.prototype.getLocalStreams = function() {
        return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, Object.keys(this._shimmedLocalStreams).map(a => this._shimmedLocalStreams[a][0])
    };
    const e = i.RTCPeerConnection.prototype.addTrack;
    i.RTCPeerConnection.prototype.addTrack = function(a, o) {
        if (!o) return e.apply(this, arguments);
        this._shimmedLocalStreams = this._shimmedLocalStreams || {};
        const c = e.apply(this, arguments);
        return this._shimmedLocalStreams[o.id] ? this._shimmedLocalStreams[o.id].indexOf(c) === -1 && this._shimmedLocalStreams[o.id].push(c) : this._shimmedLocalStreams[o.id] = [o, c], c
    };
    const t = i.RTCPeerConnection.prototype.addStream;
    i.RTCPeerConnection.prototype.addStream = function(a) {
        this._shimmedLocalStreams = this._shimmedLocalStreams || {}, a.getTracks().forEach(d => {
            if (this.getSenders().find(u => u.track === d)) throw new DOMException("Track already exists.", "InvalidAccessError")
        });
        const o = this.getSenders();
        t.apply(this, arguments);
        const c = this.getSenders().filter(d => o.indexOf(d) === -1);
        this._shimmedLocalStreams[a.id] = [a].concat(c)
    };
    const n = i.RTCPeerConnection.prototype.removeStream;
    i.RTCPeerConnection.prototype.removeStream = function(a) {
        return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, delete this._shimmedLocalStreams[a.id], n.apply(this, arguments)
    };
    const s = i.RTCPeerConnection.prototype.removeTrack;
    i.RTCPeerConnection.prototype.removeTrack = function(a) {
        return this._shimmedLocalStreams = this._shimmedLocalStreams || {}, a && Object.keys(this._shimmedLocalStreams).forEach(o => {
            const c = this._shimmedLocalStreams[o].indexOf(a);
            c !== -1 && this._shimmedLocalStreams[o].splice(c, 1), this._shimmedLocalStreams[o].length === 1 && delete this._shimmedLocalStreams[o]
        }), s.apply(this, arguments)
    }
}

