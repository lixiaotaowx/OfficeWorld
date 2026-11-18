function hc(i) {
    if (typeof i != "object" || !i.RTCPeerConnection) return;
    const e = i.RTCPeerConnection.prototype,
        t = e.createOffer,
        n = e.createAnswer,
        s = e.setLocalDescription,
        r = e.setRemoteDescription,
        a = e.addIceCandidate;
    e.createOffer = function(d, l) {
        const u = arguments.length >= 2 ? arguments[2] : arguments[0],
            h = t.apply(this, [u]);
        return l ? (h.then(d, l), Promise.resolve()) : h
    }, e.createAnswer = function(d, l) {
        const u = arguments.length >= 2 ? arguments[2] : arguments[0],
            h = n.apply(this, [u]);
        return l ? (h.then(d, l), Promise.resolve()) : h
    };
    let o = function(c, d, l) {
        const u = s.apply(this, [c]);
        return l ? (u.then(d, l), Promise.resolve()) : u
    };
    e.setLocalDescription = o, o = function(c, d, l) {
        const u = r.apply(this, [c]);
        return l ? (u.then(d, l), Promise.resolve()) : u
    }, e.setRemoteDescription = o, o = function(c, d, l) {
        const u = a.apply(this, [c]);
        return l ? (u.then(d, l), Promise.resolve()) : u
    }, e.addIceCandidate = o
}

