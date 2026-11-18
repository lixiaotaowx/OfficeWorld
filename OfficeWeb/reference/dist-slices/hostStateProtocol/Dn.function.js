function Dn(n) {
    let e = {
            active: null,
            invitations: []
        },
        t = "断开了，等待重连",
        s = !1,
        r = !1,
        i = !1,
        o = !1,
        a = null,
        f = !1,
        d, m;
    const _ = () => n.onChange();

    function y() {
        m == null || m.off("meeting-state", b), m = void 0
    }

    function A() {
        var k, O, l;
        const S = i ? ((k = e.active) == null ? void 0 : k.room) ?? null : null;
        a !== S && (a = S, r = !1, S ? (t = "正在连会议语音…", (l = n.media()) == null || l.joinMeeting(S, o).then(v => {
            var h;
            a === S && (t = v ? "进入会议了" : "语音没连上，退出再进来试试", s = !!((h = n.media()) != null && h.meetingStatus().mic), _())
        })) : ((O = n.media()) == null || O.leaveMeeting(), s = !1)), e.active && !d && (d = setInterval(E, 1e3)), !e.active && d && (clearInterval(d), d = void 0)
    }

    function E() {
        var l;
        const S = (l = n.media()) == null ? void 0 : l.meetingStatus();
        if (!S) return;
        let k = !1;
        s !== S.mic && (s = S.mic, k = !0), r !== S.sharing && (r = S.sharing, k = !0);
        const O = S.connected ? "进入会议了" : "断开了，正在重连…";
        t !== O && (t = O, k = !0), k && _()
    }

    function b(S) {
        e = S, A(), _()
    }

    function I(S) {
        if (i = S, S) {
            const k = n.socket();
            k && m !== k && (y(), m = k, k.on("meeting-state", b), k.emit("meeting-sync")), A()
        } else y(), t = "断开了，等待重连", A();
        _()
    }
    async function L(S) {
        var l;
        const k = n.socket();
        if (!(k != null && k.connected)) throw Error("断开了，等重新连上");
        (S.action === "create" || S.action === "accept" || S.action === "huddle" || S.action === "join") && (o = S.microphone === !0, o && await ((l = n.media()) == null ? void 0 : l.prepareMic()));
        const O = await new Promise(v => {
            k.timeout(8e3).emit("meeting-action", S, (h, c) => v(h ? {
                ok: !1,
                error: "会议请求超时了，先看看会议列表再重试"
            } : c))
        });
        if (!(O != null && O.ok)) throw Error((O == null ? void 0 : O.error) || "会议操作没成功")
    }
    async function N(S, k) {
        var O, l, v, h;
        if (!f) {
            f = !0;
            try {
                const c = (O = n.media()) == null ? void 0 : O.meetingStatus();
                if (S === "mic") {
                    const p = k ?? !(c != null && c.mic);
                    await ((l = n.media()) == null ? void 0 : l.meetingMicrophone(p)), o = p
                } else await ((v = n.media()) == null ? void 0 : v.meetingScreen(k ?? !(c != null && c.sharing)));
                const u = (h = n.media()) == null ? void 0 : h.meetingStatus();
                s = !!(u != null && u.mic), r = !!(u != null && u.sharing)
            } finally {
                f = !1, _()
            }
        }
    }
    const F = () => {
            N("screen", !1)
        },
        B = () => {
            N("mic")
        },
        P = () => {
            N("screen")
        };
    return {
        act: L,
        stopShare: F,
        toggleMic: B,
        toggleShare: P,
        setConnected: I,
        dispose() {
            d && (clearInterval(d), d = void 0), y()
        },
        view() {
            return {
                ...e,
                act: L,
                status: t,
                mic: s,
                sharing: r,
                stopShare: F,
                toggleMic: B,
                toggleShare: P
            }
        }
    }
}

