const vs = {
    restrictOwnAudio: !0,
    echoCancellation: !1,
    noiseSuppression: !1,
    autoGainControl: !1
};
async function ki(i, e) {
    var r;
    const t = i.localParticipant,
        n = (r = t.getTrackPublication(O.Source.ScreenShareAudio)) == null ? void 0 : r.track;
    if (!e || e.readyState === "ended") {
        n && await t.unpublishTrack(n, !0);
        return
    }
    const s = e.clone();
    try {
        if (n) {
            const a = n.mediaStreamTrack;
            await n.replaceTrack(s), a.stop()
        } else await t.publishTrack(s, {
            source: O.Source.ScreenShareAudio,
            name: "screen-audio",
            dtx: !1,
            red: !0,
            forceStereo: !0
        })
    } catch (a) {
        throw s.stop(), a
    }
}
async function tn(i) {
    await Promise.all([O.Source.ScreenShare, O.Source.ScreenShareAudio].map(async e => {
        var n;
        const t = (n = i.localParticipant.getTrackPublication(e)) == null ? void 0 : n.track;
        t && (await i.localParticipant.unpublishTrack(t, !0), At(t.mediaStreamTrack))
    }))
}
async function fp(i, e, t, n) {
    const s = e.getVideoTracks()[0];
    if (!s || s.readyState !== "live") throw Error("屏幕共享停了");
    if (i.localParticipant.getTrackPublication(O.Source.ScreenShare)) return;
    await Hc(i, () => t() && s.readyState === "live", e.getAudioTracks().length > 0);
    const r = Xs(s);
    try {
        await i.localParticipant.publishTrack(r, {
            name: "screen",
            source: O.Source.ScreenShare
        })
    } catch (a) {
        throw r.stop(), a
    }
    Qt(r), t() && s.readyState === "live" && await ki(i, e.getAudioTracks()[0]).catch(() => n("屏幕共享了，但声音没发出去。停止共享再试")), (!t() || s.readyState !== "live") && await tn(i)
}
