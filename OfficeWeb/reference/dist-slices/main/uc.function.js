function uc(i) {
    if (!(typeof i != "object" || !i.RTCPeerConnection) && ("getRemoteStreams" in i.RTCPeerConnection.prototype || (i.RTCPeerConnection.prototype.getRemoteStreams = function() {
            return this._remoteStreams ? this._remoteStreams : []
        }), !("onaddstream" in i.RTCPeerConnection.prototype))) {
        Object.defineProperty(i.RTCPeerConnection.prototype, "onaddstream", {
            get() {
                return this._onaddstream
            },
            set(t) {
                this._onaddstream && (this.removeEventListener("addstream", this._onaddstream), this.removeEventListener("track", this._onaddstreampoly)), this.addEventListener("addstream", this._onaddstream = t), this.addEventListener("track", this._onaddstreampoly = n => {
                    n.streams.forEach(s => {
                        if (this._remoteStreams || (this._remoteStreams = []), this._remoteStreams.includes(s)) return;
                        this._remoteStreams.push(s);
                        const r = new Event("addstream");
                        r.stream = s, this.dispatchEvent(r)
                    })
                })
            }
        });
        const e = i.RTCPeerConnection.prototype.setRemoteDescription;
        i.RTCPeerConnection.prototype.setRemoteDescription = function() {
            const n = this;
            return this._onaddstreampoly || this.addEventListener("track", this._onaddstreampoly = function(s) {
                s.streams.forEach(r => {
                    if (n._remoteStreams || (n._remoteStreams = []), n._remoteStreams.indexOf(r) >= 0) return;
                    n._remoteStreams.push(r);
                    const a = new Event("addstream");
                    a.stream = r, n.dispatchEvent(a)
                })
            }), e.apply(n, arguments)
        }
    }
}

