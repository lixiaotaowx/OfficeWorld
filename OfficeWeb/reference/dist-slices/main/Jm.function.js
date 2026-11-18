function Jm(i) {
    var e;
    const t = [],
        n = [],
        s = ft.parse((e = i.sdp) !== null && e !== void 0 ? e : "");
    let r = 0;
    return s.media.forEach(a => {
        var o;
        const c = Js(a.mid);
        a.type === "audio" && (a.rtp.some(d => d.codec === "opus" ? (r = d.payload, !0) : !1), !((o = a.rtcpFb) === null || o === void 0) && o.some(d => d.payload === r && d.type === "nack") && n.push(c), a.fmtp.some(d => d.payload === r ? (d.config.includes("sprop-stereo=1") && t.push(c), !0) : !1))
    }), {
        stereoMids: t,
        nackMids: n
    }
}

