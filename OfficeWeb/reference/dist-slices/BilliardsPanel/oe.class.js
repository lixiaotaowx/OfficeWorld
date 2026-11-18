class oe {
    constructor() {
        M(this, "context", null);
        M(this, "previous", null);
        M(this, "closed", !1);
        M(this, "enabled", !0);
        M(this, "lastImpact", -1 / 0)
    }
    setEnabled(r) {
        this.enabled = r
    }
    unlock() {
        try {
            if (this.closed || !this.enabled) return;
            this.context ?? (this.context = new AudioContext), this.context.resume().catch(() => {})
        } catch {}
    }
    update(r) {
        const i = se(this.previous, r);
        (!this.previous || r.seq > this.previous.seq) && (this.previous = r);
        const l = this.context;
        if (!(!l || l.state !== "running" || this.closed || !this.enabled))
            for (const a of i) try {
                const f = l.createOscillator(),
                    e = l.createGain(),
                    s = l.currentTime;
                if ((a.kind === "ball" || a.kind === "cushion") && s - this.lastImpact < .065) {
                    f.disconnect(), e.disconnect();
                    continue
                }(a.kind === "ball" || a.kind === "cushion") && (this.lastImpact = s);
                const k = a.kind === "ball" ? 950 : a.kind === "shot" ? 620 : a.kind === "cushion" ? 190 : 130,
                    p = a.kind === "pocket" ? .16 : .065;
                if (f.type = a.kind === "cushion" ? "triangle" : "sine", f.frequency.setValueAtTime(k, s), f.frequency.exponentialRampToValueAtTime(k * .48, s + p), e.gain.setValueAtTime(1e-4, s), e.gain.linearRampToValueAtTime(.035 + .07 * a.strength, s + .003), e.gain.exponentialRampToValueAtTime(1e-4, s + p), f.connect(e), e.connect(l.destination), f.onended = () => {
                        f.disconnect(), e.disconnect()
                    }, f.start(s), f.stop(s + p + .01), a.kind !== "pocket") {
                    const h = l.createBuffer(1, Math.ceil(l.sampleRate * .025), l.sampleRate),
                        w = h.getChannelData(0);
                    for (let y = 0; y < w.length; y++) w[y] = (Math.random() * 2 - 1) * Math.pow(1 - y / w.length, 4);
                    const E = l.createBufferSource(),
                        v = l.createGain();
                    E.buffer = h, v.gain.value = .02 + .04 * a.strength, E.connect(v), v.connect(l.destination), E.onended = () => {
                        E.disconnect(), v.disconnect()
                    }, E.start(s)
                }
            } catch {}
    }
    dispose() {
        this.closed = !0;
        const r = this.context;
        this.context = null, r && r.close().catch(() => {})
    }
}
