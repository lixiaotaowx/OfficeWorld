function Sc(i, e, t) {
    var n, s, r, a;
    const {
        optionsWithoutProcessor: o,
        audioProcessor: c,
        videoProcessor: d
    } = wc(i ?? {}), l = e == null ? void 0 : e.processor, u = t == null ? void 0 : t.processor, h = o ?? {};
    return h.audio === !0 && (h.audio = {}), h.video === !0 && (h.video = {}), h.audio && (ss(h.audio, e), (n = (r = h.audio).deviceId) !== null && n !== void 0 || (r.deviceId = {
        ideal: "default"
    }), (c || l) && (h.audio.processor = c ?? l)), h.video && (ss(h.video, t), (s = (a = h.video).deviceId) !== null && s !== void 0 || (a.deviceId = {
        ideal: "default"
    }), (d || u) && (h.video.processor = d ?? u)), h
}

