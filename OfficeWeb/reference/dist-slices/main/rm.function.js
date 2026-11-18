function rm() {
    if (!("getCapabilities" in RTCRtpSender) || Ot()) return !1;
    if (Dt()) {
        const t = Oe();
        if (t != null && t.version && Ze(t.version, "16") < 0 || (t == null ? void 0 : t.os) === "iOS" && (t != null && t.osVersion) && Ze(t.osVersion, "16") < 0) return !1
    }
    const i = RTCRtpSender.getCapabilities("video");
    let e = !1;
    if (i) {
        for (const t of i.codecs)
            if (t.mimeType.toLowerCase() === "video/vp9") {
                e = !0;
                break
            }
    }
    return e
}

