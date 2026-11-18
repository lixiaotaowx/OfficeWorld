function pc(i) {
    if (!i.RTCPeerConnection) return;
    const e = i.RTCPeerConnection;
    i.RTCPeerConnection = function(n, s) {
        if (n && n.iceServers) {
            const r = [];
            for (let a = 0; a < n.iceServers.length; a++) {
                let o = n.iceServers[a];
                o.urls === void 0 && o.url ? (Fs("RTCIceServer.url", "RTCIceServer.urls"), o = JSON.parse(JSON.stringify(o)), o.urls = o.url, delete o.url, r.push(o)) : r.push(n.iceServers[a])
            }
            n.iceServers = r
        }
        return new e(n, s)
    }, i.RTCPeerConnection.prototype = e.prototype, "generateCertificate" in e && Object.defineProperty(i.RTCPeerConnection, "generateCertificate", {
        get() {
            return e.generateCertificate
        }
    })
}

