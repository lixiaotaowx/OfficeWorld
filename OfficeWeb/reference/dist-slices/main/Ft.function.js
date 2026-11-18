function Ft(i, e) {
    let t;
    e.srcObject instanceof MediaStream ? t = e.srcObject : t = new MediaStream;
    let n;
    i.kind === "audio" ? n = t.getAudioTracks() : n = t.getVideoTracks(), n.includes(i) || (n.forEach(s => {
        t.removeTrack(s)
    }), t.addTrack(i)), (!Dt() || !(e instanceof HTMLVideoElement)) && (e.autoplay = !0), e.muted = t.getAudioTracks().length === 0, e instanceof HTMLVideoElement && (e.playsInline = !0), e.srcObject !== t && (e.srcObject = t, (Dt() || Ot()) && e instanceof HTMLVideoElement && setTimeout(() => {
        e.srcObject = t, e.play().catch(() => {})
    }, 0))
}

