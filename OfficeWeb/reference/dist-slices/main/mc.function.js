function mc(i) {
    const e = i && i.navigator;
    if (e.mediaDevices && e.mediaDevices.getUserMedia) {
        const t = e.mediaDevices,
            n = t.getUserMedia.bind(t);
        e.mediaDevices.getUserMedia = s => n(fc(s))
    }!e.getUserMedia && e.mediaDevices && e.mediaDevices.getUserMedia && (e.getUserMedia = (function(n, s, r) {
        e.mediaDevices.getUserMedia(n).then(s, r)
    }).bind(e))
}

