function te(n = !1, e = "default") {
    let t = !1,
        s, r = () => {};
    try {
        Y ?? (Y = new AudioContext);
        const i = Y;
        i.resume().then(() => {
            if (t || i.state !== "running") return;
            if (n && e !== "default") {
                r = wt(i, e);
                return
            }
            s = i.createOscillator();
            const o = i.createGain(),
                a = i.currentTime,
                f = [];
            if (n) {
                s.type = "sawtooth", s.frequency.setValueAtTime(230, a), s.frequency.linearRampToValueAtTime(280, a + .24), s.frequency.linearRampToValueAtTime(330, a + .48);
                for (const [m, _] of [
                        [500, 300],
                        [900, 2300],
                        [2400, 3e3]
                    ]) {
                    const y = i.createBiquadFilter();
                    y.type = "bandpass", y.Q.value = 5, y.frequency.setValueAtTime(m, a), y.frequency.setValueAtTime(m, a + .16), y.frequency.exponentialRampToValueAtTime(_, a + .33), s.connect(y), y.connect(o), f.push(y)
                }
            } else s.type = "sine", s.frequency.value = 660, s.connect(o);
            const d = n ? .6 : .2;
            o.gain.setValueAtTime(0, a), o.gain.linearRampToValueAtTime(n ? .16 : .12, a + .025), o.gain.setValueAtTime(n ? .16 : .12, a + (n ? .35 : .04)), o.gain.exponentialRampToValueAtTime(.001, a + d - .02), o.connect(i.destination), s.onended = () => {
                s == null || s.disconnect(), o.disconnect(), f.forEach(m => m.disconnect())
            }, s.start(a), s.stop(a + d)
        }).catch(() => {})
    } catch {}
    return () => {
        t = !0, r();
        try {
            s == null || s.stop()
        } catch {}
    }
}

