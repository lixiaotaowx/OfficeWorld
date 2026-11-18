function Vc(i, e) {
    let t, n = null,
        s = () => {},
        r, a = {
            state: Mo(),
            summary: "No active meeting",
            events: [],
            tick: 0
        };

    function o(l) {
        const u = i();
        u !== t && (s(), t = u, u ? (u.on(U.ConnectionQualityChanged, c), u.on(U.ConnectionStateChanged, c), u.on(U.ParticipantConnected, c), u.on(U.ParticipantDisconnected, c), s = () => {
            u.off(U.ConnectionQualityChanged, c), u.off(U.ConnectionStateChanged, c), u.off(U.ParticipantConnected, c), u.off(U.ParticipantDisconnected, c)
        }) : s = () => {});
        const h = {
            connection: (u == null ? void 0 : u.state) || "connecting",
            quality: (u == null ? void 0 : u.state) === "connected" ? ur(u.localParticipant.connectionQuality) : (u == null ? void 0 : u.state) === "disconnected" ? "lost" : "unknown",
            participants: u ? [u.localParticipant, ...u.remoteParticipants.values()].map(p => ({
                id: p.identity,
                name: p.name || p.identity || "Participant",
                quality: ur(p.connectionQuality)
            })) : []
        };
        if (JSON.stringify(a.state) === JSON.stringify(h)) return;
        const m = el(h),
            f = a.summary === m ? a.events : [...a.events, {
                at: Date.now(),
                message: m
            }].slice(-20);
        a = {
            state: h,
            summary: m,
            events: f,
            tick: (a.tick || 0) + 1
        }, l && e()
    }

    function c() {
        o(!0)
    }

    function d() {
        r && (clearInterval(r), r = void 0), s(), s = () => {}, t = void 0
    }
    return {
        setRoom(l) {
            if (l !== n) {
                if (n = l, d(), !l) {
                    a = {
                        state: Mo(),
                        summary: "No active meeting",
                        events: [],
                        tick: 0
                    };
                    return
                }
                o(!1), r = setInterval(c, 2e3)
            }
        },
        snapshot: () => a,
        dispose: d
    }
}

