function mf(i, e, t) {
    var n, s, r, a;
    if (!t.backupCodec || t.backupCodec === !0 || t.backupCodec.codec === t.videoCodec) return;
    e !== t.backupCodec.codec && X.warn("requested a different codec than specified as backup", {
        serverRequested: e,
        backup: t.backupCodec.codec
    }), t.videoCodec = e, t.videoEncoding = t.backupCodec.encoding;
    const o = i.mediaStreamTrack.getSettings(),
        c = (n = o.width) !== null && n !== void 0 ? n : (s = i.dimensions) === null || s === void 0 ? void 0 : s.width,
        d = (r = o.height) !== null && r !== void 0 ? r : (a = i.dimensions) === null || a === void 0 ? void 0 : a.height;
    return i.source === O.Source.ScreenShare && t.simulcast && (t.simulcast = !1), ms(i.source === O.Source.ScreenShare, c, d, t)
}

