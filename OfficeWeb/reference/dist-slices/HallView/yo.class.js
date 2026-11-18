class yo {
    constructor(e) {
        m(this, "revision", -1);
        m(this, "timer", 0);
        m(this, "stopped", !1);
        this.onWorld = e
    }
    take(e) {
        this.stopped || e.revision <= this.revision || (this.revision = e.revision, this.onWorld({
            removedShell: e.removedShell || [],
            revision: e.revision,
            parts: e.parts || [],
            models: e.models || []
        }))
    }
    async load() {
        this.take(await ot())
    }
    follow() {
        if (this.stopped) return;
        const e = async () => {
            if (!this.stopped) {
                try {
                    const t = await ot(`?revision=${this.revision}`);
                    "unchanged" in t || this.take(t)
                } catch {}
                this.stopped || (this.timer = window.setTimeout(e, document.hidden ? 1e4 : 2e3))
            }
        };
        this.timer = window.setTimeout(e, 2e3)
    }
    stop() {
        this.stopped = !0, clearTimeout(this.timer)
    }
    async send(e) {
        const t = await ot("", e);
        return this.take(t), t
    }
    contents(e) {
        return ot(`?chest=${encodeURIComponent(e)}`)
    }
    screen(e) {
        return ot(`?cinema=${encodeURIComponent(e)}`)
    }
    async command(e) {
        const t = await ot("", e);
        return this.take(t), t
    }
    async uploadVideo(e, t, s = () => {}) {
        if (!["video/mp4", "video/webm"].includes(t.type) || !t.size || t.size > 100 * 1024 * 1024) throw Error("选一个 100 MB 以内的 MP4 或 WebM 视频");
        let i = "";
        for (let n = 0; n < t.size;) {
            const o = new Uint8Array(await t.slice(n, n + 131072).arrayBuffer());
            let a = "";
            for (let A = 0; A < o.length; A += 32768) a += String.fromCharCode(...o.subarray(A, A + 32768));
            const l = await ot(`?cinemaUpload=${encodeURIComponent(e)}`, {
                uploadId: i,
                offset: n,
                total: t.size,
                type: t.type,
                bytes: btoa(a)
            });
            if (i = l.uploadId, n = l.offset, s(Math.round(n / t.size * 100)), l.src) return l.src
        }
        throw Error("视频没传完，再试一次")
    }
    async uploadModel(e, t = () => {}) {
        const s = new Uint8Array(e),
            i = 128 * 1024;
        let n, o = 0;
        for (; o < s.length;) {
            const a = s.subarray(o, o + i);
            let l = "";
            for (let c = 0; c < a.length; c += 32768) l += String.fromCharCode(...a.subarray(c, c + 32768));
            const A = await ot("?modelUpload=1", {
                type: "model/gltf-binary",
                total: s.length,
                offset: o,
                uploadId: n,
                bytes: btoa(l)
            });
            if (n = A.uploadId, o = A.offset, t(o / s.length), A.file) return A.file
        }
        throw Error("模型没传完，再试一次")
    }
}

