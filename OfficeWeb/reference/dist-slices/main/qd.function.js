function qd(i, e, t, n, s, r, a, o = 0) {
    var P, y, S, E, x, D;
    const c = I.useRef(!1),
        [d, l] = I.useState(!1),
        [u, h] = I.useState(""),
        m = {};
    if (i.active)
        for (const [C, M] of Object.entries(e)) {
            if (!C.startsWith(i.active.room + ":") || !M.getVideoTracks().some(A => A.readyState === "live")) continue;
            const g = C.slice(i.active.room.length + 1),
                T = g === "local" ? n : (P = t.find(A => A.id === g || A.clientId === g)) == null ? void 0 : P.id;
            T && (m[T] = M)
        }
    const f = {
            active: !!i.active,
            title: ((y = i.active) == null ? void 0 : y.title) || "",
            mic: i.mic,
            id: (S = i.active) == null ? void 0 : S.id,
            host: ((E = i.active) == null ? void 0 : E.host) === s,
            members: ((x = i.active) == null ? void 0 : x.members.map(({
                id: C,
                name: M,
                status: g
            }) => ({
                id: C,
                name: M,
                status: g
            }))) || [],
            invitations: i.invitations.filter(C => {
                var M;
                return C.id !== ((M = i.active) == null ? void 0 : M.id) && C.members.some(g => g.id === s && g.status === "invited")
            }).map(C => {
                var g, T, A;
                const M = C.host || ((g = C.members.find(F => F.status === "joined")) == null ? void 0 : g.id) || "";
                return {
                    id: C.id,
                    personId: ((T = t.find(F => F.clientId === M)) == null ? void 0 : T.id) || M,
                    name: ((A = C.members.find(F => F.id === M)) == null ? void 0 : A.name) || "同事"
                }
            }),
            sharing: i.sharing,
            busy: d,
            error: u,
            micLevel: o,
            candidates: t.filter(C => C.clientId !== s).map(C => ({
                id: C.clientId,
                personId: C.id,
                name: C.name
            })),
            screens: Object.keys(m).map(C => {
                var M;
                return {
                    id: C,
                    streamId: m[C].id,
                    name: ((M = t.find(g => g.id === C)) == null ? void 0 : M.name) || "Colleague"
                }
            }),
            huddle: ((D = i.active) == null ? void 0 : D.huddle) === !0
        },
        p = (i.huddles || []).map(C => ({
            ...C,
            sharing: C.sharing || ""
        })),
        _ = new Set(p.flatMap(C => [...C.members, ...C.ringing].map(M => M.id))),
        w = t.filter(C => C.clientId !== s && C.role !== "visitor" && Cs(C) && !_.has(C.clientId)).map(C => C.clientId);
    return {
        state: f,
        command: C => {
            if (!C.kind.startsWith("meeting") && !C.kind.startsWith("huddle-") && C.kind !== "gather") return !1;
            if (C.kind === "meeting" || C.kind === "meeting-view" || C.kind === "meeting-fullscreen") {
                if (C.kind !== "meeting") {
                    const g = t.find(T => T.id === C.personId || T.clientId === C.personId);
                    i.active && g && (m[g.id] || i.active.sharing === g.clientId || i.active.sharing === g.id) ? a(g.id) : h("当前没有可查看的共享屏幕，请等对方开始共享后再试")
                }
                return !0
            }
            return c.current || (c.current = !0, l(!0), h(""), (async () => {
                var A, F;
                const g = new Set(t.map(H => H.clientId)),
                    T = (C.ids || []).filter(H => g.has(H) && H !== s);
                if (C.kind === "huddle-start") i.active ? await i.act({
                    action: "invite",
                    id: i.active.id,
                    invitees: T
                }) : await i.act({
                    action: "huddle",
                    invitees: T,
                    microphone: !0
                });
                else if (C.kind === "huddle-join") {
                    if (((A = i.active) == null ? void 0 : A.id) !== C.personId) {
                        if (i.active) throw Error("先离开现在的通话");
                        await i.act({
                            action: "join",
                            id: C.personId,
                            microphone: !0
                        })
                    }
                } else if (C.kind === "huddle-invite" && i.active) await i.act({
                    action: "invite",
                    id: i.active.id,
                    invitees: T
                });
                else if (C.kind === "gather") i.active ? w.length && await i.act({
                    action: "invite",
                    id: i.active.id,
                    invitees: w
                }) : w.length ? await i.act({
                    action: "huddle",
                    invitees: w,
                    microphone: !0
                }) : p[0] ? await i.act({
                    action: "join",
                    id: p[0].id,
                    microphone: !0
                }) : await i.act({
                    action: "huddle",
                    invitees: [],
                    microphone: !0
                });
                else if (C.kind === "meeting-create" && C.meeting && !i.active) {
                    const H = new Set(f.candidates.map(N => N.id));
                    await i.act({
                        action: "create",
                        ...C.meeting,
                        invitees: C.meeting.invitees.filter(N => H.has(N))
                    })
                } else if (i.active && C.kind === "meeting-mute") await i.toggleMic();
                else if (i.active && C.kind === "meeting-share") await i.toggleShare();
                else if (i.active && C.personId === i.active.id && C.kind === "meeting-leave") await i.act({
                    action: "leave",
                    id: i.active.id
                });
                else if (i.active && C.personId === i.active.id && C.kind === "meeting-end") {
                    if (!f.host) throw Error("只有主持人能结束会议");
                    await i.act({
                        action: "end",
                        id: i.active.id
                    })
                } else if ((F = f.invitations) != null && F.some(H => H.id === C.personId))
                    if (C.kind === "meeting-accept") {
                        if (i.active) throw Error("先退出现在的会议再接受");
                        await i.act({
                            action: "accept",
                            id: C.personId,
                            microphone: !0
                        })
                    } else C.kind === "meeting-decline" && await i.act({
                        action: "decline",
                        id: C.personId
                    })
            })().catch(g => h(g instanceof Error ? g.message : "会议操作没成功，再试一次")).finally(() => {
                c.current = !1, l(!1)
            })), !0
        },
        streams: m,
        huddles: p,
        free: w
    }
}
async function ar(i) {
    const e = await fetch("/api/presence-status", i === void 0 ? {
            cache: "no-store"
        } : {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: i
            }),
            signal: AbortSignal.timeout(8e3)
        }),
        t = await e.json();
    if (!e.ok) throw Error(t.error || "状态没存上");
    return t.statuses
}

