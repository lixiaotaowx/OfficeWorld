function qs(i) {
    var e, t, n, s;
    const r = {};
    if (i.video)
        if (typeof i.video == "object") {
            const a = {},
                o = a,
                c = i.video;
            Object.keys(c).forEach(d => {
                switch (d) {
                    case "resolution":
                        ss(o, c.resolution);
                        break;
                    default:
                        o[d] = c[d]
                }
            }), r.video = a, (e = (n = r.video).deviceId) !== null && e !== void 0 || (n.deviceId = {
                ideal: "default"
            })
        } else r.video = i.video ? {
            deviceId: {
                ideal: "default"
            }
        } : !1;
    else r.video = !1;
    return i.audio ? typeof i.audio == "object" ? (r.audio = i.audio, (t = (s = r.audio).deviceId) !== null && t !== void 0 || (s.deviceId = {
        ideal: "default"
    })) : r.audio = {
        deviceId: {
            ideal: "default"
        }
    } : r.audio = !1, r
}

