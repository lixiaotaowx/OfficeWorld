function Tc(i) {
    return b(this, arguments, void 0, function(e) {
        let t = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 200;
        return function*() {
            const n = Cc();
            if (n) {
                const s = n.createAnalyser();
                s.fftSize = 2048;
                const r = s.frequencyBinCount,
                    a = new Uint8Array(r);
                n.createMediaStreamSource(new MediaStream([e.mediaStreamTrack])).connect(s), yield Ce(t), s.getByteTimeDomainData(a);
                const c = a.some(d => d !== 128 && d !== 0);
                return n.close(), !c
            }
            return !1
        }()
    })
}

