function Di(i) {
    if (!i.RTCIceCandidate || i.RTCIceCandidate && "foundation" in i.RTCIceCandidate.prototype) return;
    const e = i.RTCIceCandidate;
    i.RTCIceCandidate = function(n) {
        if (typeof n == "object" && n.candidate && n.candidate.indexOf("a=") === 0 && (n = JSON.parse(JSON.stringify(n)), n.candidate = n.candidate.substring(2)), n.candidate && n.candidate.length) {
            const s = new e(n),
                r = Wt.parseCandidate(n.candidate);
            for (const a in r) a in s || Object.defineProperty(s, a, {
                value: r[a]
            });
            return s.toJSON = function() {
                return {
                    candidate: s.candidate,
                    sdpMid: s.sdpMid,
                    sdpMLineIndex: s.sdpMLineIndex,
                    usernameFragment: s.usernameFragment
                }
            }, s
        }
        return new e(n)
    }, i.RTCIceCandidate.prototype = e.prototype, Nt(i, "icecandidate", t => (t.candidate && Object.defineProperty(t, "candidate", {
        value: new i.RTCIceCandidate(t.candidate),
        writable: "false"
    }), t))
}

