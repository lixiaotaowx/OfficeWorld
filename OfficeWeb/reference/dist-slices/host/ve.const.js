const ve = {
    ok: !1,
    error: "这个操作还没有迁移到通信宿主"
};
async function me(e, t) {
    const s = e.actions;
    switch (t.kind) {
        case "setAppearance":
            return s.setAppearance(t.appearance), {
                ok: !0
            };
        case "sitSpot":
            return {
                ok: await s.sitSpot(t.id)
            };
        case "claimSeat":
            return {
                ok: await s.claimSeat(t.seat)
            };
        case "reportMotion":
            return s.reportMotion(t.motion), {
                ok: !0
            };
        case "setPreviewAllowed":
            return s.setPreviewAllowed(t.allowed), {
                ok: !0
            };
        case "notifyWatching":
            return s.notifyWatching(t.targetId), {
                ok: !0
            };
        case "interactCat":
            return s.interactCat(t.action);
        case "request":
            return await s.request(t.target, t.callKind, t.offer), {
                ok: !0
            };
        case "respond":
            return await s.respond(t.id, t.accept), {
                ok: !0
            };
        case "cancelRequest":
            return s.cancelRequest(t.id), {
                ok: !0
            };
        case "dismissCallAlert":
            return s.dismissCallAlert(t.id), {
                ok: !0
            };
        case "end":
            return s.end(t.id), {
                ok: !0
            };
        case "share":
            return await s.share(), {
                ok: !0
            };
        case "stopShare":
            return s.stopShare(), {
                ok: !0
            };
        case "shareInCall":
            return {
                ok: await s.shareInCall(t.id)
            };
        case "mute":
            return {
                ok: await s.mute(t.sessionId)
            };
        case "setRemoteAudioMuted":
            return s.setRemoteAudioMuted(t.room, t.muted), {
                ok: !0
            };
        case "chat":
            return {
                ok: await s.chat(t.text, t.recipientId)
            };
        case "loadChatFile":
            return {
                ok: !0, blob: await s.loadChatFile(t.attachment)
            };
        case "meeting-action":
            return await e.getSnapshot().meetings.act(t.data), {
                ok: !0
            };
        case "meeting-mute":
            return await e.getSnapshot().meetings.toggleMic(), {
                ok: !0
            };
        case "meeting-share":
            return await e.getSnapshot().meetings.toggleShare(), {
                ok: !0
            };
        case "annotation": {
            const {
                action: f,
                scope: c,
                points: w,
                done: v,
                color: g
            } = t.command;
            return f === "draw" ? s.annotation.draw(c, w || [], v === !0, g) : s.annotation[f](c), {
                ok: !0
            }
        }
        case "adminKick":
            return s.adminKick(t.seat, t.password);
        case "billiards-action":
            return await e.getSnapshot().billiards.act(t.tableId, t.command), {
                ok: !0
            };
        case "notice":
            return s.setNotice(t.message), {
                ok: !0
            };
        case "view":
            return e.setViewAttached(t.attached), {
                ok: !0
            };
        case "media-request":
            return e.mediaRequest(t.event, t.payload, t.timeoutMs);
        case "media-emit":
            return e.mediaEmit(t.event, t.args), {
                ok: !0
            };
        case "file-open":
            return e.getSnapshot().files.open(t.id), {
                ok: !0
            };
        case "file-reveal":
            return e.getSnapshot().files.reveal(t.id), {
                ok: !0
            };
        case "file-cancel":
            return e.getSnapshot().files.cancel(t.id), {
                ok: !0
            };
        case "file-dismiss":
            return e.getSnapshot().files.dismiss(t.id), {
                ok: !0
            };
        case "file-dismiss-all":
            return e.getSnapshot().files.dismissAll(), {
                ok: !0
            };
        case "file-download":
            return await e.getSnapshot().files.downloadAttachment(t.attachment), {
                ok: !0
            };
        case "file-send":
            return await e.getSnapshot().files.sendFiles(t.personId, t.paths, t.peerName || ""), {
                ok: !0
            };
        case "screen-control":
            return ve;
        case "logout":
        case "chooseRole":
            return {
                ok: !1, error: "登录暂未迁移到通信宿主（P5）"
            }
    }
}

