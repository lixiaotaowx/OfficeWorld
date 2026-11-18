class up {
    constructor(e, t, n) {
        ne(this, "entries", new Map);
        ne(this, "closing", new Map);
        this.token = e, this.wire = t, this.notice = n
    }
    current(e, t) {
        const n = this.entries.get(e);
        return !!n && !n.cancelled && n.room === t
    }
    get(e) {
        var t;
        return (t = this.entries.get(e)) == null ? void 0 : t.room
    }
    values() {
        return [...this.entries].map(([e, t]) => [e, t.room])
    }
    join(e) {
        const t = this.entries.get(e);
        if (t) return t.ready;
        const n = new $t({
                adaptiveStream: !1,
                dynacast: !0,
                publishDefaults: {
                    screenShareEncoding: {
                        maxBitrate: 5e6,
                        maxFramerate: 15
                    },
                    screenShareSimulcastLayers: [ln.h720fps15]
                }
            }),
            s = {
                room: n,
                ready: Promise.resolve(null),
                tail: Promise.resolve(),
                audioTail: Promise.resolve(),
                cancelled: !1
            };
        return this.entries.set(e, s), this.wire(n, e), s.ready = (async () => {
            if (await this.closing.get(e), !this.current(e, n)) return null;
            try {
                const r = await this.token(e);
                if (!this.current(e, n)) return null;
                if (!r.url || !r.token) throw Error(r.error || "进不了通话房间");
                return await n.connect(r.url, r.token), this.current(e, n) ? n : null
            } catch (r) {
                return this.current(e, n) && this.notice(r instanceof Error ? r.message : "连接失败"), null
            }
        })(), s.ready
    }
    run(e, t, n = "screen") {
        const s = this.entries.get(e);
        if (!s) return Promise.reject(Error("还没连上，等它恢复"));
        const r = () => this.current(e, s.room) && s.room.state === "connected",
            a = n === "audio" ? "audioTail" : "tail",
            o = s[a].catch(() => {}).then(async () => {
                if (await s.ready, !r()) throw Error("正在恢复连接，等一下再试");
                return t(s.room, r)
            });
        return s[a] = o.catch(() => {}), o
    }
    close(e) {
        var s;
        const t = this.entries.get(e);
        if (!t) return;
        t.cancelled = !0, this.entries.delete(e), (s = t.room.localParticipant) == null || s.trackPublications.forEach(r => {
            var a;
            return (a = r.track) == null ? void 0 : a.stop()
        });
        const n = Promise.allSettled([t.ready, t.tail, t.audioTail]).then(() => t.room.disconnect()).catch(r => this.notice(`Media cleanup failed: ${String(r)}`));
        this.closing.set(e, n), n.finally(() => {
            this.closing.get(e) === n && this.closing.delete(e)
        })
    }
    dispose() {
        for (const e of this.entries.keys()) this.close(e)
    }
}
