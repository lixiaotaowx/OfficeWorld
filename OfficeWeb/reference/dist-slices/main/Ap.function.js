function Ap(i) {
    const e = t => i(t);
    return {
        dismissCallAlert: t => void e({
            kind: "dismissCallAlert",
            id: t
        }),
        cancelRequest: t => void e({
            kind: "cancelRequest",
            id: t
        }),
        interactCat: async t => {
            const n = await e({
                kind: "interactCat",
                action: t
            });
            return typeof n.text == "string" ? {
                ok: n.ok === !0,
                text: n.text
            } : void 0
        },
        share: async () => {
            await e({
                kind: "share"
            })
        },
        shareInCall: async t => (await e({
            kind: "shareInCall",
            id: t
        })).ok === !0,
        stopShare: () => void e({
            kind: "stopShare"
        }),
        setRemoteAudioMuted: (t, n) => void e({
            kind: "setRemoteAudioMuted",
            room: t,
            muted: n
        }),
        annotation: {
            draw: (t, n, s, r) => void e({
                kind: "annotation",
                command: {
                    action: "draw",
                    scope: t,
                    points: n,
                    done: s,
                    color: r
                }
            }),
            clear: t => void e({
                kind: "annotation",
                command: {
                    action: "clear",
                    scope: t
                }
            }),
            undo: t => void e({
                kind: "annotation",
                command: {
                    action: "undo",
                    scope: t
                }
            })
        },
        respond: async (t, n) => {
            await e({
                kind: "respond",
                id: t,
                accept: n
            })
        },
        claimSeat: async t => (await e({
            kind: "claimSeat",
            seat: t
        })).ok === !0,
        adminKick: async (t, n) => await e({
            kind: "adminKick",
            seat: t,
            password: n
        }),
        setNotice: t => void e({
            kind: "notice",
            message: t
        }),
        sitSpot: async t => (await e({
            kind: "sitSpot",
            id: t
        })).ok === !0,
        reportMotion: t => void e({
            kind: "reportMotion",
            motion: t
        }),
        setAppearance: t => void e({
            kind: "setAppearance",
            appearance: t
        }),
        setPreviewAllowed: t => void e({
            kind: "setPreviewAllowed",
            allowed: t
        }),
        sendChatFile: (t, n, s) => Mp(t, n, s),
        loadChatFile: t => Op(t),
        chat: async (t, n) => (await e({
            kind: "chat",
            text: t,
            recipientId: n
        })).ok === !0,
        notifyWatching: t => void e({
            kind: "notifyWatching",
            targetId: t
        }),
        request: async (t, n, s = !1) => {
            await e({
                kind: "request",
                target: t,
                callKind: n,
                offer: s
            })
        },
        end: t => void e({
            kind: "end",
            id: t
        }),
        mute: async t => (await e({
            kind: "mute",
            sessionId: t
        })).ok === !0,
        activeMic: () => null
    }
}

