function Ud(i, e = 0) {
    const t = I.useRef(!1),
        [n, s] = I.useState(!1),
        [r, a] = I.useState(""),
        o = {
            invitations: i.connected ? i.requests.map(u => ({
                id: u.id,
                personId: u.from,
                name: u.name,
                kind: u.kind,
                offer: u.offer === !0
            })) : [],
            sessions: i.sessions.filter(u => u.kind !== "meeting").map(u => {
                var h, m, f, p;
                return {
                    id: u.id,
                    name: ((h = i.people.find(_ => _.id === u.peer)) == null ? void 0 : h.name) || "Participant",
                    connected: i.connected && ((m = i.callStates[u.id]) == null ? void 0 : m.connected) === !0,
                    mic: ((f = i.callStates[u.id]) == null ? void 0 : f.voice) === "On",
                    sharing: ((p = i.callStates[u.id]) == null ? void 0 : p.sharing) === !0
                }
            }),
            busy: n,
            error: r,
            micLevel: e
        },
        c = u => {
            t.current || (t.current = !0, s(!0), a(""), u().catch(h => a(h instanceof Error ? h.message : "通话操作没成功，再试一次")).finally(() => {
                t.current = !1, s(!1)
            }))
        };
    return {
        state: o,
        command: u => {
            if (u.kind !== "private-share" && u.kind !== "private-mute") return !1;
            const h = o.sessions.find(m => m.id === u.personId);
            return !(h != null && h.connected) || i.meetings.active || c(async () => {
                if (u.kind === "private-mute") {
                    if (await i.mute(h.id) === !1) throw Error("麦克风没切过去，检查一下权限或设备")
                } else if (h.sharing) i.stopShare();
                else if (await i.shareInCall(h.id) === !1) throw Error("共享没开始，再选一次屏幕")
            }), !0
        },
        answer: (u, h) => {
            o.invitations.some(m => m.id === u) && c(() => i.respond(u, h))
        }
    }
}

