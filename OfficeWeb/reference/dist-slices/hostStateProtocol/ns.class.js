class ns {
    constructor() {
        V(this, "epoch", 0);
        V(this, "seq", {
            state: 0,
            preview: 0,
            motion: 0,
            chat: 0,
            full: 0,
            "full-chunk": 0
        });
        V(this, "base", null);
        V(this, "previews", {});
        V(this, "motions", {});
        V(this, "messages", []);
        V(this, "chunks", null);
        V(this, "snapshot", null);
        V(this, "listeners", new Set);
        V(this, "getSnapshot", () => this.snapshot);
        V(this, "subscribe", e => (this.listeners.add(e), () => {
            this.listeners.delete(e)
        }))
    }
    ingest(e) {
        if (e.epoch < this.epoch) return !1;
        if (e.epoch > this.epoch) {
            const s = this.snapshot !== null;
            if (this.reset(e.epoch), s)
                for (const r of this.listeners) r()
        }
        if (e.kind === "full-chunk") return this.ingestChunk(e);
        if (e.seq <= this.seq[e.kind]) return !1;
        this.seq[e.kind] = e.seq;
        let t = !0;
        switch (e.kind) {
            case "full":
                try {
                    this.applyFull(e.snapshot)
                } catch {
                    return this.seq.full = 0, !1
                }
                this.markSeq(e.seq);
                break;
            case "state":
                if (!this.base) return !1;
                if (!Object.keys(e.patch).length) {
                    t = !1;
                    break
                }
                this.base = {
                    ...this.base,
                    ...e.patch
                };
                break;
            case "preview":
                for (const [s, r] of Object.entries(e.batch)) r ? this.previews[s] = r : delete this.previews[s];
                break;
            case "motion":
                for (const [s, r] of Object.entries(e.batch)) r ? this.motions[s] = r : delete this.motions[s];
                break;
            case "chat": {
                const s = new Map(this.messages.map(r => [r.id, r]));
                for (const r of e.upserts) s.set(r.id, r);
                for (const r of e.removed || []) s.delete(r);
                this.messages = [...s.values()].sort((r, i) => r.id.localeCompare(i.id));
                break
            }
        }
        return t && this.rebuild(), !0
    }
    ingestChunk(e) {
        var s;
        if (e.seq <= this.seq.full || ((((s = this.chunks) == null ? void 0 : s.epoch) !== e.epoch || this.chunks.seq !== e.seq) && (this.chunks = {
                epoch: e.epoch,
                seq: e.seq,
                total: e.total,
                parts: new Map
            }), this.chunks.parts.set(e.index, e.data), this.chunks.parts.size < e.total)) return !1;
        const t = [...this.chunks.parts.entries()].sort(([r], [i]) => r - i).map(([, r]) => ({
            kind: "full-chunk",
            epoch: e.epoch,
            seq: e.seq,
            index: 0,
            total: e.total,
            data: r
        }));
        this.chunks = null;
        try {
            this.applyFull(Tn(t))
        } catch {
            return !1
        }
        return this.seq.full = e.seq, this.markSeq(e.seq), this.rebuild(), !0
    }
    markSeq(e) {
        this.seq = {
            state: e,
            preview: e,
            motion: e,
            chat: e,
            full: e,
            "full-chunk": e
        }
    }
    applyFull(e) {
        const {
            previews: t,
            motions: s,
            ...r
        } = e.presence, {
            messages: i,
            ...o
        } = e.chat;
        this.base = {
            ...e,
            presence: r,
            chat: o
        }, this.previews = {
            ...t || {}
        }, this.motions = {
            ...s || {}
        }, this.messages = Array.isArray(i) ? [...i] : []
    }
    reset(e) {
        this.epoch = e, this.seq = {
            state: 0,
            preview: 0,
            motion: 0,
            chat: 0,
            full: 0,
            "full-chunk": 0
        }, this.base = null, this.previews = {}, this.motions = {}, this.messages = [], this.chunks = null, this.snapshot = null
    }
    rebuild() {
        if (!this.base) {
            this.snapshot = null;
            return
        }
        this.snapshot = {
            ...this.base,
            presence: {
                ...this.base.presence,
                previews: this.previews,
                motions: this.motions
            },
            chat: {
                ...this.base.chat,
                messages: this.messages
            },
            epoch: this.epoch,
            seq: Math.max(...Object.values(this.seq))
        };
        for (const e of this.listeners) e()
    }
}
