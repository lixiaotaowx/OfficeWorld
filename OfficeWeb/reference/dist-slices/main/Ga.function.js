function Ga(i, e) {
    const t = i && i.navigator;
    if (!t.mediaDevices) return;
    const n = function(o) {
            if (typeof o != "object" || o.mandatory || o.optional) return o;
            const c = {};
            return Object.keys(o).forEach(d => {
                if (d === "require" || d === "advanced" || d === "mediaSource") return;
                const l = typeof o[d] == "object" ? o[d] : {
                    ideal: o[d]
                };
                l.exact !== void 0 && typeof l.exact == "number" && (l.min = l.max = l.exact);
                const u = function(h, m) {
                    return h ? h + m.charAt(0).toUpperCase() + m.slice(1) : m === "deviceId" ? "sourceId" : m
                };
                if (l.ideal !== void 0) {
                    c.optional = c.optional || [];
                    let h = {};
                    typeof l.ideal == "number" ? (h[u("min", d)] = l.ideal, c.optional.push(h), h = {}, h[u("max", d)] = l.ideal, c.optional.push(h)) : (h[u("", d)] = l.ideal, c.optional.push(h))
                }
                l.exact !== void 0 && typeof l.exact != "number" ? (c.mandatory = c.mandatory || {}, c.mandatory[u("", d)] = l.exact) : ["min", "max"].forEach(h => {
                    l[h] !== void 0 && (c.mandatory = c.mandatory || {}, c.mandatory[u(h, d)] = l[h])
                })
            }), o.advanced && (c.optional = (c.optional || []).concat(o.advanced)), c
        },
        s = function(o, c) {
            if (e.version >= 61) return c(o);
            if (o = JSON.parse(JSON.stringify(o)), o && typeof o.audio == "object") {
                const d = function(l, u, h) {
                    u in l && !(h in l) && (l[h] = l[u], delete l[u])
                };
                o = JSON.parse(JSON.stringify(o)), d(o.audio, "autoGainControl", "googAutoGainControl"), d(o.audio, "noiseSuppression", "googNoiseSuppression"), o.audio = n(o.audio)
            }
            if (o && typeof o.video == "object") {
                let d = o.video.facingMode;
                d = d && (typeof d == "object" ? d : {
                    ideal: d
                });
                const l = e.version < 66;
                if (d && (d.exact === "user" || d.exact === "environment" || d.ideal === "user" || d.ideal === "environment") && !(t.mediaDevices.getSupportedConstraints && t.mediaDevices.getSupportedConstraints().facingMode && !l)) {
                    delete o.video.facingMode;
                    let u;
                    if (d.exact === "environment" || d.ideal === "environment" ? u = ["back", "rear"] : (d.exact === "user" || d.ideal === "user") && (u = ["front"]), u) return t.mediaDevices.enumerateDevices().then(h => {
                        h = h.filter(f => f.kind === "videoinput");
                        let m = h.find(f => u.some(p => f.label.toLowerCase().includes(p)));
                        return !m && h.length && u.includes("back") && (m = h[h.length - 1]), m && (o.video.deviceId = d.exact ? {
                            exact: m.deviceId
                        } : {
                            ideal: m.deviceId
                        }), o.video = n(o.video), Br("chrome: " + JSON.stringify(o)), c(o)
                    })
                }
                o.video = n(o.video)
            }
            return Br("chrome: " + JSON.stringify(o)), c(o)
        },
        r = function(o) {
            return e.version >= 64 ? o : {
                name: {
                    PermissionDeniedError: "NotAllowedError",
                    PermissionDismissedError: "NotAllowedError",
                    InvalidStateError: "NotAllowedError",
                    DevicesNotFoundError: "NotFoundError",
                    ConstraintNotSatisfiedError: "OverconstrainedError",
                    TrackStartError: "NotReadableError",
                    MediaDeviceFailedDueToShutdown: "NotAllowedError",
                    MediaDeviceKillSwitchOn: "NotAllowedError",
                    TabCaptureError: "AbortError",
                    ScreenCaptureError: "AbortError",
                    DeviceCaptureError: "AbortError"
                } [o.name] || o.name,
                message: o.message,
                constraint: o.constraint || o.constraintName,
                toString() {
                    return this.name + (this.message && ": ") + this.message
                }
            }
        },
        a = function(o, c, d) {
            s(o, l => {
                t.webkitGetUserMedia(l, c, u => {
                    d && d(r(u))
                })
            })
        };
    if (t.getUserMedia = a.bind(t), t.mediaDevices.getUserMedia) {
        const o = t.mediaDevices.getUserMedia.bind(t.mediaDevices);
        t.mediaDevices.getUserMedia = function(c) {
            return s(c, d => o(d).then(l => {
                if (d.audio && !l.getAudioTracks().length || d.video && !l.getVideoTracks().length) throw l.getTracks().forEach(u => {
                    u.stop()
                }), new DOMException("", "NotFoundError");
                return l
            }, l => Promise.reject(r(l))))
        }
    }
}

