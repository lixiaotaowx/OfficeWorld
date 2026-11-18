function Np(i, e) {
    return {
        active: (i == null ? void 0 : i.meetings.active) ?? null,
        invitations: (i == null ? void 0 : i.meetings.invitations) ?? [],
        huddles: (i == null ? void 0 : i.meetings.huddles) ?? [],
        status: (i == null ? void 0 : i.meetings.status) ?? "断开了，等待重连",
        mic: (i == null ? void 0 : i.meetings.mic) ?? !1,
        sharing: (i == null ? void 0 : i.meetings.sharing) ?? !1,
        act: async t => {
            const n = await e({
                kind: "meeting-action",
                data: t
            });
            if (n.ok === !1) throw Error(n.error || "会议操作没成功")
        },
        stopShare: () => void e({
            kind: "meeting-share"
        }),
        toggleMic: () => void e({
            kind: "meeting-mute"
        }),
        toggleShare: () => void e({
            kind: "meeting-share"
        })
    }
}

