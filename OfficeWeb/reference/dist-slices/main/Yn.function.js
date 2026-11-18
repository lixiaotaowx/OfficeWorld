function Yn(i, e) {
    if (typeof i != "object" || !(i.RTCPeerConnection || i.mozRTCPeerConnection)) return;
    !i.RTCPeerConnection && i.mozRTCPeerConnection && (i.RTCPeerConnection = i.mozRTCPeerConnection), e.version < 53 && ["setLocalDescription", "setRemoteDescription", "addIceCandidate"].forEach(function(s) {
        const r = i.RTCPeerConnection.prototype[s],
            a = {
                [s]() {
                    return arguments[0] = new(s === "addIceCandidate" ? i.RTCIceCandidate : i.RTCSessionDescription)(arguments[0]), r.apply(this, arguments)
                }
            };
        i.RTCPeerConnection.prototype[s] = a[s]
    });
    const t = {
            inboundrtp: "inbound-rtp",
            outboundrtp: "outbound-rtp",
            candidatepair: "candidate-pair",
            localcandidate: "local-candidate",
            remotecandidate: "remote-candidate"
        },
        n = i.RTCPeerConnection.prototype.getStats;
    i.RTCPeerConnection.prototype.getStats = function() {
        const [r, a, o] = arguments;
        return n.apply(this, [r || null]).then(c => {
            if (e.version < 53 && !a) try {
                c.forEach(d => {
                    d.type = t[d.type] || d.type
                })
            } catch (d) {
                if (d.name !== "TypeError") throw d;
                c.forEach((l, u) => {
                    c.set(u, Object.assign({}, l, {
                        type: t[l.type] || l.type
                    }))
                })
            }
            return c
        }).then(a, o)
    }
}

