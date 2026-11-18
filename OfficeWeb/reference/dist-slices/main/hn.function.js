function hn(i, e) {
    return b(this, void 0, void 0, function*() {
        i ?? (i = {});
        let t = !1;
        const {
            audioProcessor: n,
            videoProcessor: s,
            optionsWithoutProcessor: r
        } = wc(i);
        let a = r.audio,
            o = r.video;
        if (n && typeof r.audio == "object" && (r.audio.processor = n), s && typeof r.video == "object" && (r.video.processor = s), i.audio && typeof r.audio == "object" && typeof r.audio.deviceId == "string") {
            const u = r.audio.deviceId;
            r.audio.deviceId = {
                exact: u
            }, t = !0, a = Object.assign(Object.assign({}, r.audio), {
                deviceId: {
                    ideal: u
                }
            })
        }
        if (r.video && typeof r.video == "object" && typeof r.video.deviceId == "string") {
            const u = r.video.deviceId;
            r.video.deviceId = {
                exact: u
            }, t = !0, o = Object.assign(Object.assign({}, r.video), {
                deviceId: {
                    ideal: u
                }
            })
        }
        r.audio === !0 ? r.audio = {
            deviceId: "default"
        } : typeof r.audio == "object" && r.audio !== null && (r.audio = Object.assign(Object.assign({}, r.audio), {
            deviceId: r.audio.deviceId || "default"
        })), r.video === !0 ? r.video = {
            deviceId: "default"
        } : typeof r.video == "object" && !r.video.deviceId && (r.video.deviceId = "default");
        const c = Sc(r, Ic, xc),
            d = qs(c),
            l = navigator.mediaDevices.getUserMedia(d);
        r.audio && (Se.userMediaPromiseMap.set("audioinput", l), l.catch(() => Se.userMediaPromiseMap.delete("audioinput"))), r.video && (Se.userMediaPromiseMap.set("videoinput", l), l.catch(() => Se.userMediaPromiseMap.delete("videoinput")));
        try {
            const u = yield l;
            return yield Promise.all(u.getTracks().map(h => b(this, void 0, void 0, function*() {
                const m = h.kind === "audio";
                let f = m ? c.audio : c.video;
                (typeof f == "boolean" || !f) && (f = {});
                let p;
                const _ = m ? d.audio : d.video;
                typeof _ != "boolean" && (p = _);
                const w = h.getSettings().deviceId;
                p != null && p.deviceId && It(p.deviceId) !== w ? p.deviceId = w : p || (p = {
                    deviceId: w
                });
                const k = of(h, p, e);
                return k.kind === O.Kind.Video ? k.source = O.Source.Camera : k.kind === O.Kind.Audio && (k.source = O.Source.Microphone), k.mediaStream = u, Qe(k) && n ? yield k.setProcessor(n): Ct(k) && s && (yield k.setProcessor(s)), k
            })))
        } catch (u) {
            if (!t) throw u;
            return hn(Object.assign(Object.assign({}, i), {
                audio: a,
                video: o
            }), e)
        }
    })
}

