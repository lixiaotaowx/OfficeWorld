function Fd(i, e) {
    var f, p, _, w;
    const t = {},
        n = [],
        s = I.useRef(!1),
        [r, a] = I.useState(""),
        [o, c] = I.useState(""),
        [, d] = I.useState(0),
        l = (k, P, y, S, E, x) => {
            if (n.some(M => M.id === k)) return;
            const D = y == null ? void 0 : y.getVideoTracks().some(M => M.readyState === "live");
            if (!D && (E || x)) return;
            const C = i.people.find(M => M.id === P);
            D && y && (t[k] = y), n.push({
                id: k,
                personId: P,
                streamId: D && y ? y.id : "",
                sessionId: S,
                meeting: E,
                own: x,
                name: x ? "我正在共享" : `${(C==null?void 0:C.name)||"同事"}的屏幕`,
                annotatable: x || (C == null ? void 0 : C.annotate) === !0,
                busy: s.current,
                error: r
            })
        };
    for (const [k, P] of Object.entries(e)) l(k, k, P, ((f = i.meetings.active) == null ? void 0 : f.id) || "", !0, k === i.myId);
    for (const k of i.sessions.filter(P => P.kind !== "meeting")) l(k.id, k.peer, i.videos[k.id], k.id, !1, !1), (p = i.callStates[k.id]) != null && p.sharing && l("local-screen", i.myId || "", i.videos["local-screen"], k.id, !1, !0);
    jd(t);
    const u = n.find(k => k.id === o),
        h = u != null && u.meeting ? (_ = i.meetings.active) == null ? void 0 : _.room : (w = i.sessions.find(k => k.id === (u == null ? void 0 : u.sessionId))) == null ? void 0 : w.room;
    return I.useEffect(() => {
        (!u || !h) && c("")
    }, [u == null ? void 0 : u.id, h]), {
        screens: n,
        command: k => {
            var E;
            if (k.kind === "meeting-fullscreen" && n.some(x => x.id === k.personId)) return c(k.personId), !0;
            if (k.kind !== "screen-control" && k.kind !== "screen-ink") return !1;
            const P = n.find(x => x.id === k.personId);
            if (!P) return !0;
            const y = i.sessions.find(x => x.id === P.sessionId),
                S = P.meeting ? (E = i.meetings.active) == null ? void 0 : E.room : y == null ? void 0 : y.room;
            if (!S) return !0;
            if (k.kind === "screen-ink") {
                if (!P.annotatable) return !0;
                try {
                    const x = JSON.parse(k.text || "{}");
                    if (x.action === "clear") i.annotation.clear(S);
                    else if (x.action === "undo") i.annotation.undo(S);
                    else if (x.action === "draw" && !P.own && Array.isArray(x.points) && x.points.length <= 64) {
                        const D = x.points.filter(C => Array.isArray(C) && C.length === 2 && C.every(M => typeof M == "number" && Number.isFinite(M) && M >= 0 && M <= 1));
                        D.length && i.annotation.draw(S, D, x.done === !0, Fn(x.color, Bi))
                    }
                } catch {}
                return !0
            }
            return s.current || (s.current = !0, a(""), d(x => x + 1), (async () => {
                var x;
                if (k.text === "mute" && await (P.meeting ? i.meetings.toggleMic() : i.mute(P.sessionId)) === !1) throw Error("麦克风切换失败，请检查权限或设备");
                if (k.text === "share") {
                    if (P.meeting) await i.meetings.toggleShare();
                    else if ((x = i.callStates[P.sessionId]) != null && x.sharing) i.stopShare();
                    else if (await i.shareInCall(P.sessionId) === !1) throw Error("共享未开始，请检查屏幕选择和权限")
                }
                k.text === "end" && (P.meeting ? await i.meetings.act({
                    action: "leave",
                    id: P.sessionId
                }) : i.end(P.sessionId)), (k.text === "silence" || k.text === "listen") && i.setRemoteAudioMuted(S, k.text === "silence")
            })().catch(x => a(x instanceof Error ? x.message : "操作失败，请重试")).finally(() => {
                s.current = !1, d(x => x + 1)
            })), !0
        },
        view: u && h ? {
            ...u,
            scope: h,
            stream: t[u.id]
        } : null,
        closeView: () => c("")
    }
}

