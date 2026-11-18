function Oh(i, e) {
    i.navigator.mediaDevices && "getDisplayMedia" in i.navigator.mediaDevices || i.navigator.mediaDevices && (i.navigator.mediaDevices.getDisplayMedia = function(n) {
        if (!(n && n.video)) {
            const s = new DOMException("getDisplayMedia without video constraints is undefined");
            return s.name = "NotFoundError", s.code = 8, Promise.reject(s)
        }
        return n.video === !0 ? n.video = {
            mediaSource: e
        } : n.video.mediaSource = e, i.navigator.mediaDevices.getUserMedia(n)
    })
}

