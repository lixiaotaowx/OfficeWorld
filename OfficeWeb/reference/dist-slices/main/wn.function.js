function wn() {
    if (!ti) {
        const i = new AudioContext,
            e = i.createOscillator(),
            t = i.createGain();
        t.gain.setValueAtTime(0, 0);
        const n = i.createMediaStreamDestination();
        if (e.connect(t), t.connect(n), e.start(), [ti] = n.stream.getAudioTracks(), !ti) throw Error("Could not get empty media stream audio track");
        ti.enabled = !1
    }
    return ti.clone()
}
