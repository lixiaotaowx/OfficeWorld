function Ni(i) {
    if (!(i.RTCPeerConnection && "createDataChannel" in i.RTCPeerConnection.prototype)) return;

    function e(n, s) {
        const r = n.send;
        n.send = function() {
            const o = arguments[0],
                c = o.length || o.size || o.byteLength;
            if (n.readyState === "open" && s.sctp && c > s.sctp.maxMessageSize) throw new TypeError("Message too large (can send a maximum of " + s.sctp.maxMessageSize + " bytes)");
            return r.apply(n, arguments)
        }
    }
    const t = i.RTCPeerConnection.prototype.createDataChannel;
    i.RTCPeerConnection.prototype.createDataChannel = function() {
        const s = t.apply(this, arguments);
        return e(s, this), s
    }, Nt(i, "datachannel", n => (e(n.channel, n.target), n))
}

