function Ui(i, e) {
    if (!(i.RTCPeerConnection && i.RTCPeerConnection.prototype)) return;
    const t = i.RTCPeerConnection.prototype.setLocalDescription;
    !t || t.length === 0 || (i.RTCPeerConnection.prototype.setLocalDescription = function() {
        let s = arguments[0] || {};
        if (typeof s != "object" || s.type && s.sdp) return t.apply(this, arguments);
        if (s = {
                type: s.type,
                sdp: s.sdp
            }, !s.type) switch (this.signalingState) {
            case "stable":
            case "have-local-offer":
            case "have-remote-pranswer":
                s.type = "offer";
                break;
            default:
                s.type = "answer";
                break
        }
        return s.sdp || s.type !== "offer" && s.type !== "answer" ? t.apply(this, [s]) : (s.type === "offer" ? this.createOffer : this.createAnswer).apply(this).then(a => t.apply(this, [a]))
    })
}
var Nh = Object.freeze({
    __proto__: null,
    removeExtmapAllowMixed: es,
    shimAddIceCandidateNullOrEmpty: Li,
    shimConnectionState: Zn,
    shimMaxMessageSize: Ai,
    shimParameterlessSetLocalDescription: Ui,
    shimRTCIceCandidate: Di,
    shimRTCIceCandidateRelayProtocol: Xn,
    shimSendThrowTypeError: Ni
});

