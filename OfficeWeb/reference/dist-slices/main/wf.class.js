class Wf extends wt {
    get description() {
        return "Can publish video"
    }
    perform() {
        return b(this, void 0, void 0, function*() {
            var e;
            const t = yield this.connect(), n = yield Df();
            yield this.checkForVideo(n.mediaStreamTrack), t.localParticipant.publishTrack(n), yield new Promise(a => setTimeout(a, 5e3));
            const s = yield(e = n.sender) === null || e === void 0 ? void 0 : e.getStats();
            if (!s) throw new Error("Could not get RTCStats");
            let r = 0;
            if (s.forEach(a => {
                    a.type === "outbound-rtp" && (a.kind === "video" || !a.kind && a.mediaType === "video") && (r += a.packetsSent)
                }), r === 0) throw new Error("Could not determine packets are sent");
            this.appendMessage("published ".concat(r, " video packets"))
        })
    }
    checkForVideo(e) {
        return b(this, void 0, void 0, function*() {
            const t = new MediaStream;
            t.addTrack(e.clone());
            const n = document.createElement("video");
            n.srcObject = t, n.muted = !0, n.autoplay = !0, n.playsInline = !0, n.setAttribute("playsinline", "true"), document.body.appendChild(n), yield new Promise(s => {
                n.onplay = () => {
                    setTimeout(() => {
                        var r, a, o, c;
                        const d = document.createElement("canvas"),
                            l = e.getSettings(),
                            u = (a = (r = l.width) !== null && r !== void 0 ? r : n.videoWidth) !== null && a !== void 0 ? a : 1280,
                            h = (c = (o = l.height) !== null && o !== void 0 ? o : n.videoHeight) !== null && c !== void 0 ? c : 720;
                        d.width = u, d.height = h;
                        const m = d.getContext("2d");
                        m.drawImage(n, 0, 0);
                        const p = m.getImageData(0, 0, d.width, d.height).data;
                        let _ = !0;
                        for (let w = 0; w < p.length; w += 4)
                            if (p[w] !== 0 || p[w + 1] !== 0 || p[w + 2] !== 0) {
                                _ = !1;
                                break
                            } _ ? this.appendError("camera appears to be producing only black frames") : this.appendMessage("received video frames"), s()
                    }, 1e3)
                }, n.play()
            }), t.getTracks().forEach(s => s.stop()), n.remove()
        })
    }
}
