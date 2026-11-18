const bs = "这次共享没有声音。浏览器里要选能带声音的来源并勾选“共享音频”；桌面端要用支持录声音的客户端";
async function Kc() {
    const i = await Zi(() => navigator.mediaDevices.getDisplayMedia({
        video: {
            frameRate: {
                ideal: 15,
                max: 20
            }
        },
        audio: vs
    }), e => e.getTracks());
    return i.getVideoTracks().forEach(e => {
        e.contentHint = "text"
    }), i
}
async function Gc(i, e) {
    var s;
    const t = (s = i.localParticipant.getTrackPublication(O.Source.ScreenShare)) == null ? void 0 : s.track;
    if (!t) return !1;
    const n = t.mediaStreamTrack;
    return await t.replaceTrack(e), Qt(e), n && n !== e && At(n), n && n !== e && n.stop(), !0
}
async function pp(i, e = Kc) {
    const t = i.live();
    if (!(t != null && t.active)) return !1;
    const n = await e();
    if (!i.owner(t)) return n.getTracks().forEach(a => a.stop()), !1;
    const s = n.getVideoTracks()[0];
    t.getVideoTracks()[0].onended = null, i.adopt(n), hp(t.getVideoTracks()[0], s);
    let r = !1;
    for (const a of i.publishers()) {
        const o = async () => {
            if (i.live() !== n) return;
            const c = Xs(s);
            await Gc(a, c).catch(() => !1) ? (r = !0, i.live() === n && await ki(a, n.getAudioTracks()[0]).catch(() => ki(a))) : c.stop()
        };
        i.run ? await i.run(a, o).catch(() => {}) : await o()
    }
    return t.getTracks().forEach(a => a.stop()), r
}
