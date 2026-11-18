class zo {
    constructor(e = null) {
        this.isTextureSource = !0, Object.defineProperty(this, "id", {
            value: Id++
        }), this.uuid = hn(), this.data = e, this.dataReady = !0, this.version = 0
    }
    getSize(e) {
        const t = this.data;
        return typeof HTMLVideoElement < "u" && t instanceof HTMLVideoElement ? e.set(t.videoWidth, t.videoHeight, 0) : typeof VideoFrame < "u" && t instanceof VideoFrame ? e.set(t.displayWidth, t.displayHeight, 0) : t !== null ? e.set(t.width || 0, t.height || 0, t.depth || 0) : e.set(0, 0, 0), e
    }
    set needsUpdate(e) {
        e === !0 && this.version++
    }
    toJSON(e) {
        const t = e === void 0 || typeof e == "string";
        if (!t && e.images[this.uuid] !== void 0) return e.images[this.uuid];
        const n = {
                uuid: this.uuid,
                url: ""
            },
            i = this.data;
        if (i !== null) {
            let r;
            if (Array.isArray(i)) {
                r = [];
                for (let a = 0, o = i.length; a < o; a++) i[a].isDataTexture ? r.push(Jr(i[a].image)) : r.push(Jr(i[a]))
            } else r = Jr(i);
            n.url = r
        }
        return t || (e.images[this.uuid] = n), n
    }
}

