function lc(i) {
    if (!(typeof i != "object" || !i.RTCPeerConnection)) {
        if ("getLocalStreams" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.getLocalStreams = function() {
                return this._localStreams || (this._localStreams = []), this._localStreams
            }), !("addStream" in i.RTCPeerConnection.prototype)) {
            const e = i.RTCPeerConnection.prototype.addTrack;
            i.RTCPeerConnection.prototype.addStream = function(n) {
                this._localStreams || (this._localStreams = []), this._localStreams.includes(n) || this._localStreams.push(n), n.getAudioTracks().forEach(s => e.call(this, s, n)), n.getVideoTracks().forEach(s => e.call(this, s, n))
            }, i.RTCPeerConnection.prototype.addTrack = function(n) {
                for (var s = arguments.length, r = new Array(s > 1 ? s - 1 : 0), a = 1; a < s; a++) r[a - 1] = arguments[a];
                return r && r.forEach(o => {
                    this._localStreams ? this._localStreams.includes(o) || this._localStreams.push(o) : this._localStreams = [o]
                }), e.apply(this, arguments)
            }
        }
        "removeStream" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.removeStream = function(t) {
            this._localStreams || (this._localStreams = []);
            const n = this._localStreams.indexOf(t);
            if (n === -1) return;
            this._localStreams.splice(n, 1);
            const s = t.getTracks();
            this.getSenders().forEach(r => {
                s.includes(r.track) && this.removeTrack(r)
            })
        })
    }
}

