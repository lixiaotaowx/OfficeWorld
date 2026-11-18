function ec(i, e) {
    const t = i && i.navigator,
        n = i && i.MediaStreamTrack;
    if (t.getUserMedia = function(s, r, a) {
            Fs("navigator.getUserMedia", "navigator.mediaDevices.getUserMedia"), t.mediaDevices.getUserMedia(s).then(r, a)
        }, !(e.version > 55 && "autoGainControl" in t.mediaDevices.getSupportedConstraints())) {
        const s = function(a, o, c) {
                o in a && !(c in a) && (a[c] = a[o], delete a[o])
            },
            r = t.mediaDevices.getUserMedia.bind(t.mediaDevices);
        if (t.mediaDevices.getUserMedia = function(a) {
                return typeof a == "object" && typeof a.audio == "object" && (a = JSON.parse(JSON.stringify(a)), s(a.audio, "autoGainControl", "mozAutoGainControl"), s(a.audio, "noiseSuppression", "mozNoiseSuppression")), r(a)
            }, n && n.prototype.getSettings) {
            const a = n.prototype.getSettings;
            n.prototype.getSettings = function() {
                const o = a.apply(this, arguments);
                return s(o, "mozAutoGainControl", "autoGainControl"), s(o, "mozNoiseSuppression", "noiseSuppression"), o
            }
        }
        if (n && n.prototype.applyConstraints) {
            const a = n.prototype.applyConstraints;
            n.prototype.applyConstraints = function(o) {
                return this.kind === "audio" && typeof o == "object" && (o = JSON.parse(JSON.stringify(o)), s(o, "autoGainControl", "mozAutoGainControl"), s(o, "noiseSuppression", "mozNoiseSuppression")), a.apply(this, [o])
            }
        }
    }
}

