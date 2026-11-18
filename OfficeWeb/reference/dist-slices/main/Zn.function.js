function Zn(i) {
    if (!i.RTCPeerConnection || "connectionState" in i.RTCPeerConnection.prototype) return;
    const e = i.RTCPeerConnection.prototype;
    Object.defineProperty(e, "connectionState", {
        get() {
            return {
                completed: "connected",
                checking: "connecting"
            } [this.iceConnectionState] || this.iceConnectionState
        },
        enumerable: !0,
        configurable: !0
    }), Object.defineProperty(e, "onconnectionstatechange", {
        get() {
            return this._onconnectionstatechange || null
        },
        set(t) {
            this._onconnectionstatechange && (this.removeEventListener("connectionstatechange", this._onconnectionstatechange), delete this._onconnectionstatechange), t && this.addEventListener("connectionstatechange", this._onconnectionstatechange = t)
        },
        enumerable: !0,
        configurable: !0
    }), ["setLocalDescription", "setRemoteDescription"].forEach(t => {
        const n = e[t];
        e[t] = function() {
            return this._connectionstatechangepoly || (this._connectionstatechangepoly = s => {
                const r = s.target;
                if (r._lastConnectionState !== r.connectionState) {
                    r._lastConnectionState = r.connectionState;
                    const a = new Event("connectionstatechange", s);
                    r.dispatchEvent(a)
                }
                return s
            }, this.addEventListener("iceconnectionstatechange", this._connectionstatechangepoly)), n.apply(this, arguments)
        }
    })
}

