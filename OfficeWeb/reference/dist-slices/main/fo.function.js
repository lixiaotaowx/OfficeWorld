function fo(i, e, t) {
    const n = Js(i.mid);
    let s = 0;
    i.rtp.some(r => r.codec === "opus" ? (s = r.payload, !0) : !1), s > 0 && (i.rtcpFb || (i.rtcpFb = []), t.includes(n) && !i.rtcpFb.some(r => r.payload === s && r.type === "nack") && i.rtcpFb.push({
        payload: s,
        type: "nack"
    }), (e.includes(n) || e.length === 1 && e[0] === "all") && i.fmtp.some(r => r.payload === s ? (r.config.includes("stereo=1") || (r.config += ";stereo=1"), !0) : !1))
}

