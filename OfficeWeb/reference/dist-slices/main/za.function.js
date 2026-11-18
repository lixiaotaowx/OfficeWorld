function Za(i, e) {
    Nt(i, "negotiationneeded", t => {
        const n = t.target;
        if (!((e.version < 72 || n.getConfiguration && n.getConfiguration().sdpSemantics === "plan-b") && n.signalingState !== "stable")) return t
    })
}
var Vr = Object.freeze({
    __proto__: null,
    fixNegotiationNeeded: Za,
    shimAddTrackRemoveTrack: Xa,
    shimAddTrackRemoveTrackWithNative: Ya,
    shimGetSendersWithDtmf: $a,
    shimGetUserMedia: Ga,
    shimMediaStream: Ja,
    shimOnTrack: za,
    shimPeerConnection: Qn,
    shimSenderReceiverGetStats: Qa
});

