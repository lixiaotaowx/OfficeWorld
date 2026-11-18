const Ln = 300,
    vp = 6e3,
    bp = .55;
async function yp(i) {
    const e = document.createElement("video");
    if (e.muted = !0, e.srcObject = i.stream, await e.play(), !i.current()) return e.srcObject = null, {
        video: null,
        stop() {}
    };
    const t = document.createElement("canvas");
    t.width = Ln, t.height = Math.round(Ln * 9 / 16);
    const n = t.getContext("2d");
    i.publicPreview && Qt(i.stream.getVideoTracks()[0]);
    const s = setInterval(() => {
        if (e.readyState < 2 || !e.videoWidth || !e.videoHeight || !n) return;
        const r = Math.min(1, Ln / Math.max(e.videoWidth, e.videoHeight));
        t.width = Math.max(1, Math.round(e.videoWidth * r)), t.height = Math.max(1, Math.round(e.videoHeight * r)), n.drawImage(e, 0, 0, t.width, t.height), i.publicPreview && i.publish(t.toDataURL("image/jpeg", bp))
    }, i.intervalMs ?? vp);
    return {
        video: e,
        stop() {
            if (clearInterval(s), i.publicPreview) {
                const r = e.srcObject;
                r == null || r.getVideoTracks().forEach(At)
            }
            e.srcObject = null
        }
    }
}

