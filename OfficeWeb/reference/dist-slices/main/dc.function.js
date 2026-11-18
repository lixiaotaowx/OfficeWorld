function dc(i) {
    if (!(typeof i == "object" && i.RTCPeerConnection)) return;
    const e = i.RTCPeerConnection.prototype.createAnswer;
    i.RTCPeerConnection.prototype.createAnswer = function() {
        return this.setParametersPromises && this.setParametersPromises.length ? Promise.all(this.setParametersPromises).then(() => e.apply(this, arguments)).finally(() => {
            this.setParametersPromises = []
        }) : e.apply(this, arguments)
    }
}
var qr = Object.freeze({
    __proto__: null,
    shimAddTransceiver: oc,
    shimCreateAnswer: dc,
    shimCreateOffer: cc,
    shimGetDisplayMedia: Oh,
    shimGetParameters: ac,
    shimGetUserMedia: ec,
    shimOnTrack: tc,
    shimPeerConnection: Yn,
    shimRTCDataChannel: rc,
    shimReceiverGetStats: nc,
    shimRemoveStream: sc,
    shimSenderGetStats: ic
});

