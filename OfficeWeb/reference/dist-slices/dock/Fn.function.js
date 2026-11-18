function Fn(t, s = !0) {
    const n = u.useRef(null),
        [c, r] = u.useState("正在接收画面…"),
        [i, o] = u.useState(0);
    return u.useEffect(() => {
        if (!s) {
            r("");
            return
        }
        if (!t.streamId) {
            r("语音通话中，对方尚未共享屏幕");
            return
        }
        const d = n.current,
            m = window.officeDock;
        if (!d || !(m != null && m.onVideo) || !m.videoWant || typeof MediaSource > "u") {
            r("此客户端暂不支持小窗视频，请更新客户端");
            return
        }
        let h = !0,
            k = "",
            f = "",
            b, g, R = [],
            N = 0;
        const C = () => {
                R = [], N = 0, g = void 0, f && URL.revokeObjectURL(f), f = "", b = void 0
            },
            I = () => {
                h && r("画面连接中断，点击重试")
            },
            j = () => {
                if (!(!h || !g || g.updating || (b == null ? void 0 : b.readyState) !== "open")) try {
                    if (g.buffered.length && d.currentTime - g.buffered.start(0) > 12) {
                        g.remove(0, d.currentTime - 6);
                        return
                    }
                    const T = R.shift();
                    if (T && (N -= T.byteLength, g.appendBuffer(T)), d.buffered.length) {
                        const D = d.buffered.end(d.buffered.length - 1);
                        D - d.currentTime > 1.8 && (d.currentTime = Math.max(0, D - .5)), d.play().catch(I)
                    }
                } catch {
                    I()
                }
            };
        r("正在接收画面…");
        const _ = m.onVideo(T => {
                if (!(!h || T.id !== t.id)) {
                    if (T.reset) {
                        if (C(), k = T.epoch, !MediaSource.isTypeSupported(T.mime)) {
                            I();
                            return
                        }
                        const D = new MediaSource;
                        b = D, f = URL.createObjectURL(D), d.src = f, D.addEventListener("sourceopen", () => {
                            if (!(!h || b !== D)) try {
                                g = D.addSourceBuffer(T.mime), g.addEventListener("updateend", j), g.addEventListener("error", I), j()
                            } catch {
                                I()
                            }
                        }, {
                            once: !0
                        })
                    }
                    if (!(T.epoch !== k || !T.bytes)) {
                        if (N += T.bytes.byteLength, N > 12 * 1024 ** 2) {
                            C(), I();
                            return
                        }
                        R.push(T.bytes), j()
                    }
                }
            }),
            V = () => r("");
        d.addEventListener("playing", V), d.addEventListener("error", I), m.videoWant(t.id).catch(I);
        const W = setTimeout(() => {
            d.videoWidth || I()
        }, 15e3);
        return () => {
            var T;
            h = !1, _(), clearTimeout(W), d.removeEventListener("playing", V), d.removeEventListener("error", I), (T = m.videoWant) == null || T.call(m, "-" + t.id).catch(() => {}), d.pause(), d.removeAttribute("src"), d.load(), C()
        }
    }, [t.id, t.streamId, i, s]), {
        video: n,
        status: c,
        retry: () => o(d => d + 1)
    }
}

