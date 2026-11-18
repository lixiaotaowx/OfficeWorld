function Qn(i, e) {
    !i.RTCPeerConnection && i.webkitRTCPeerConnection && (i.RTCPeerConnection = i.webkitRTCPeerConnection), i.RTCPeerConnection && e.version < 53 && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(t) {
        const n = i.RTCPeerConnection.prototype[t],
            s = {
                [t]() {
                    return arguments[0] = new(t === "addIceCandidate" ? i.RTCIceCandidate : i.RTCSessionDescription)(arguments[0]), n.apply(this, arguments)
                }
            };
        i.RTCPeerConnection.prototype[t] = s[t]
    })
}

