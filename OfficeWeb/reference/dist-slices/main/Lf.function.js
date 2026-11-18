function Lf(i) {
    var e, t, n;
    if (!i.participantSid && !i.participantIdentity) throw new Error("Invalid track permission, must provide at least one of participantIdentity and participantSid");
    return new La({
        participantIdentity: (e = i.participantIdentity) !== null && e !== void 0 ? e : "",
        participantSid: (t = i.participantSid) !== null && t !== void 0 ? t : "",
        allTracks: (n = i.allowAll) !== null && n !== void 0 ? n : !1,
        trackSids: i.allowedTrackSids || []
    })
}
