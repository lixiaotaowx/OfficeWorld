function $a(i) {
    if (typeof i == "object" && i.RTCPeerConnection && !("getSenders" in i.RTCPeerConnection.prototype) && "createDTMFSender" in i.RTCPeerConnection.prototype) {
        const e = function(s, r) {
            return {
                track: r,
                get dtmf() {
                    return this._dtmf === void 0 && (r.kind === "audio" ? this._dtmf = s.createDTMFSender(r) : this._dtmf = null), this._dtmf
                },
                _pc: s
            }
        };
        if (!i.RTCPeerConnection.prototype.getSenders) {
            i.RTCPeerConnection.prototype.getSenders = function() {
                return this._senders = this._senders || [], this._senders.slice()
            };
            const s = i.RTCPeerConnection.prototype.addTrack;
            i.RTCPeerConnection.prototype.addTrack = function(o, c) {
                let d = s.apply(this, arguments);
                return d || (d = e(this, o), this._senders.push(d)), d
            };
            const r = i.RTCPeerConnection.prototype.removeTrack;
            i.RTCPeerConnection.prototype.removeTrack = function(o) {
                r.apply(this, arguments);
                const c = this._senders.indexOf(o);
                c !== -1 && this._senders.splice(c, 1)
            }
        }
        const t = i.RTCPeerConnection.prototype.addStream;
        i.RTCPeerConnection.prototype.addStream = function(r) {
            this._senders = this._senders || [], t.apply(this, [r]), r.getTracks().forEach(a => {
                this._senders.push(e(this, a))
            })
        };
        const n = i.RTCPeerConnection.prototype.removeStream;
        i.RTCPeerConnection.prototype.removeStream = function(r) {
            this._senders = this._senders || [], n.apply(this, [r]), r.getTracks().forEach(a => {
                const o = this._senders.find(c => c.track === a);
                o && this._senders.splice(this._senders.indexOf(o), 1)
            })
        }
    } else if (typeof i == "object" && i.RTCPeerConnection && "getSenders" in i.RTCPeerConnection.prototype && "createDTMFSender" in i.RTCPeerConnection.prototype && i.RTCRtpSender && !("dtmf" in i.RTCRtpSender.prototype)) {
        const e = i.RTCPeerConnection.prototype.getSenders;
        i.RTCPeerConnection.prototype.getSenders = function() {
            const n = e.apply(this, []);
            return n.forEach(s => s._pc = this), n
        }, Object.defineProperty(i.RTCRtpSender.prototype, "dtmf", {
            get() {
                return this._dtmf === void 0 && (this.track.kind === "audio" ? this._dtmf = this._pc.createDTMFSender(this.track) : this._dtmf = null), this._dtmf
            }
        })
    }
}

