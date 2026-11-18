class mp {
    constructor(e, t, n) {
        ne(this, "current", null);
        ne(this, "wanted", new Map);
        ne(this, "tail", Promise.resolve());
        this.rooms = e, this.changed = t, this.notice = n
    }
    add(e) {
        return this.wanted.has(e) ? !1 : (this.wanted.set(e, !0), !0)
    }
    intended(e) {
        return this.wanted.get(e) === !0
    }
    activate(e, t = this.intended(e)) {
        this.wanted.set(e, t);
        const n = this.current;
        this.current = e, this.changed(e), n && n !== e && this.notice(e.startsWith("meeting-") ? "Audio switched to the meeting. Private call listening and microphone are paused." : "Audio switched to this call. Listening and microphone are paused in other calls and meetings.");
        const s = this.tail.catch(() => {}).then(async () => {
            if (this.current === e) {
                for (const [r, a] of this.rooms.values()) r === e || a.state !== "connected" || await this.rooms.run(r, (o, c) => Nn(o, O.Source.Microphone, !1, c), "audio");
                this.current === e && await this.rooms.run(e, (r, a) => Nn(r, O.Source.Microphone, t, () => a() && this.current === e && this.intended(e) === t), "audio")
            }
        });
        return this.tail = s.catch(() => {}), s
    }
    async mute(e) {
        this.wanted.set(e, !1), await this.rooms.run(e, (t, n) => Nn(t, O.Source.Microphone, !1, n), "audio")
    }
    remove(e) {
        this.wanted.delete(e), this.current === e && (this.current = null, this.changed(null))
    }
}
async function Hc(i, e, t = !1) {
    const n = Date.now() + 1e4;
    for (; e() && i.state === "connected";) {
        const s = i.localParticipant.permissions;
        if (s != null && s.canPublish && (!s.canPublishSources.length || s.canPublishSources.includes(3) && (!t || s.canPublishSources.includes(4)))) return;
        if (Date.now() >= n) throw Error("Sharing permission is not ready. Please retry.");
        await new Promise(r => setTimeout(r, 40))
    }
    throw Error("Sharing was cancelled or replaced")
}
