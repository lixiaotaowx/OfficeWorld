function Li(i, e) {
    if (!(i.RTCPeerConnection && i.RTCPeerConnection.prototype)) return;
    const t = i.RTCPeerConnection.prototype.addIceCandidate;
    !t || t.length === 0 || (i.RTCPeerConnection.prototype.addIceCandidate = function() {
        return arguments[0] ? (e.browser === "chrome" && e.version < 78 || e.browser === "firefox" && e.version < 68 || e.browser === "safari") && arguments[0] && arguments[0].candidate === "" ? Promise.resolve() : t.apply(this, arguments) : (arguments[1] && arguments[1].apply(null), Promise.resolve())
    })
}

