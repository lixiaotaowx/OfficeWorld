function wt(n, e) {
    const t = yt[e],
        s = [];
    for (const [r, i, o, a, f] of t.syllables) {
        const d = n.createOscillator(),
            m = n.createBiquadFilter(),
            _ = n.createGain(),
            y = n.currentTime + r,
            A = y + i;
        d.type = t.wave, d.frequency.setValueAtTime(o, y), d.frequency.exponentialRampToValueAtTime(a, y + i * .3), d.frequency.exponentialRampToValueAtTime(f, A), m.type = "lowpass", m.frequency.value = t.filter, m.Q.value = .7, _.gain.setValueAtTime(0, y), _.gain.linearRampToValueAtTime(.1, y + .015), _.gain.exponentialRampToValueAtTime(.001, A), d.connect(m), m.connect(_), _.connect(n.destination);
        let E, b;
        t.tremolo && (E = n.createOscillator(), b = n.createGain(), E.frequency.value = t.tremolo, b.gain.value = a * .045, E.connect(b), b.connect(d.frequency), E.start(y), E.stop(A)), d.onended = () => {
            d.disconnect(), m.disconnect(), _.disconnect(), E == null || E.disconnect(), b == null || b.disconnect()
        }, d.start(y), d.stop(A), s.push(() => {
            try {
                d.stop(), E == null || E.stop()
            } catch {}
        })
    }
    return () => s.forEach(r => r())
}
let Y;
async function Ce() {
    try {
        Y ?? (Y = new AudioContext);
        const n = Y.resume(),
            e = "Notification" in window && Notification.permission === "default" ? Notification.requestPermission() : Promise.resolve();
        await Promise.all([n, e])
    } catch {}
}

