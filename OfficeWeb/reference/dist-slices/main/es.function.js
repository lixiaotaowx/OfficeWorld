function es(i, e) {
    if (!i.RTCPeerConnection || e.browser === "chrome" && e.version >= 71 || e.browser === "safari" && e._safariVersion >= 13.1) return;
    const t = i.RTCPeerConnection.prototype.setRemoteDescription;
    i.RTCPeerConnection.prototype.setRemoteDescription = function(s) {
        if (s && s.sdp && s.sdp.indexOf(`
a=extmap-allow-mixed`) !== -1) {
            const r = s.sdp.split(`
`).filter(a => a.trim() !== "a=extmap-allow-mixed").join(`
`);
            i.RTCSessionDescription && s instanceof i.RTCSessionDescription ? arguments[0] = new i.RTCSessionDescription({
                type: s.type,
                sdp: r
            }) : s.sdp = r
        }
        return t.apply(this, arguments)
    }
}

